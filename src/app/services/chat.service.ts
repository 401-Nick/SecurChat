import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc, arrayUnion, query, onSnapshot } from 'firebase/firestore';
import { Router } from '@angular/router';
import { app } from '../../main';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  db = getFirestore(app);
  private _messages = new BehaviorSubject<Message[]>([]);
  public messages$ = this._messages.asObservable();
  private lastChatRoomCreationTime: number | null = null;
  private alias = this.getAlias();

  constructor(private router: Router) {
  }
  private forceUserToHome(errorCode: string): void {
    this.router.navigate(['/']);
    console.log(`Error: ${errorCode}`);
  }

  private async generateToken(roomId: string): Promise<string> {
    //This is a cloud function at the end point https://us-central1-securr-chat.cloudfunctions.net/generateToken
    //It takes roomId as a query parameter and returns a token
    const response = await fetch(`https://us-central1-securr-chat.cloudfunctions.net/generateToken?roomId=${roomId}`);
    const data = await response.json();
    console.log(data);
    return data.token;
  }


  async listenForMessages(roomId: string): Promise<void> {
    const chatRoomRef = doc(this.db, 'chatRooms', roomId);
    onSnapshot(chatRoomRef, (snapshot) => this.handleSnapshot(roomId, snapshot));
  }

  private handleSnapshot(roomId: string, snapshot: any): void {
    if (!snapshot.exists()) {
      this.forceUserToHome(`No chat room found with ID ${roomId}`);
      return;
    }

    const data = snapshot.data();
    if (data && Array.isArray(data['messages'])) {
      this._messages.next(data['messages'] as Message[]);
    } else {
      console.log(`Invalid or missing 'messages' field in chat room ${roomId}`);
    }
  }


  setAlias(alias: string): void {
    //make sure alias is not empty
    if (!alias) {
      console.log('Alias is empty');
      return;
    }
    localStorage.setItem('alias', alias);
    this.alias = alias;
  }

  private getAlias(): string {
    return localStorage.getItem('alias') || 'Anonymous';
  }
  async generateLink(roomId: string): Promise<string> {
    return `https://securr-chat.web.app/chatroom/${roomId}`;
  }

  async verifyUser(roomId: string): Promise<boolean> {
    const storedToken = localStorage.getItem(`token_${roomId}`);
    if (storedToken && storedToken.length > 0) {
      const response = await fetch(`https://us-central1-securr-chat.cloudfunctions.net/verifyToken?roomId=${roomId}&token=${storedToken}`);
      const data = await response.json();
      console.log(data);
      if (data.valid) {
        return true;
      } else {
        this.forceUserToHome(`Token ${storedToken} is not valid for room ID ${roomId}`);
        return false;
      }
    } else {
      this.forceUserToHome(`You do not have permission to view room ID ${roomId}`);
      return false;
    }
  }

  async createChatRoom(): Promise<string> {
    const now = Date.now();

    if (this.lastChatRoomCreationTime && (now - this.lastChatRoomCreationTime) < 5000) {
      console.log('You must wait 5 seconds between creating chat rooms.');
      return '';
    }

    this.lastChatRoomCreationTime = now;
    const newChatroom = await addDoc(collection(this.db, 'chatRooms'), {
      messages: [],
      verifiedTokens: [],
      inviteLinks: []
    });

    const token = await this.generateToken(newChatroom.id);
    localStorage.setItem(`token_${newChatroom.id}`, token);

    // Update the verifiedTokens array in Firestore to include the new token
    const chatRoomRef = doc(this.db, 'chatRooms', newChatroom.id);
    await updateDoc(chatRoomRef, {
      verifiedTokens: arrayUnion(token)
    });

    return newChatroom.id;
  }

  async sendMessage(roomId: string, messageText: string): Promise<void> {
    if (!messageText) {
      console.log('Message is empty');
      return;
    } else {
      const message = {
        alias: this.alias,
        content: messageText
      };

      const chatRoomRef = doc(this.db, 'chatRooms', roomId);
      await updateDoc(chatRoomRef, {
        messages: arrayUnion(message)
      });
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (await this.verifyUser(roomId)) {
      const chatRoomRef = doc(this.db, 'chatRooms', roomId);
      await deleteDoc(chatRoomRef);
      this.forceUserToHome(`Room ID ${roomId} has been deleted`);
    } else {
      console.log('You are not authorized to delete this room');
    }

  }
}
