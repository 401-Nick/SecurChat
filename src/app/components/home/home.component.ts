import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from "../../services/chat.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private chatService: ChatService, private router: Router) { }
  async generateChatRoom() {
    const roomId = await this.chatService.createChatRoom();
    this.router.navigate(['/chatroom', roomId]);
  }
}
