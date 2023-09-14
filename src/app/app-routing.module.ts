import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '../app/components/chat/chat.component';
import { HomeComponent } from '../app/components/home/home.component'

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'chatroom/:roomId',  // Define the path
    component: ChatComponent  // Associate the component
  },
  {
    path: 'home',  // Define the path
    component: HomeComponent  // Associate the component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
