import { Component } from '@angular/core';
import { ChatServerService } from './services/chat-server/chat-server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent 
{
  // Class Member Declaration 
  title = 'WebChat';
  private chatServer:ChatServerService; 

  constructor(chatServer:ChatServerService)
  {
    // Initialize local handle to injected singleton of the ChatServerService
    this.chatServer = chatServer;
  }

  /* Life cycle hook function called by the Angular frame work when this root 
   * componet is being instansiated and initialized. Here get a connection to 
   * the chat server, and handle any errors that occur.  */
  ngOnInit()
  {
    
    this.chatServer.connect("127.0.0.1", "90").then((srvRsp)=>
    {
      console.log(srvRsp);
    },
    (srvErr)=>
    {
      console.log(srvErr);
    });

  }
}
