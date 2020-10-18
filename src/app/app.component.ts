import { Component } from '@angular/core';
import { fromEventPattern } from 'rxjs';
import { ChatServerService } from './services/chat-server/chat-server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  title = 'WebChat';
}
