import { Component } from '@angular/core';

@Component({
  selector: 'demo-home',
  templateUrl: 'home.component.html',
})
export class HomeComponent {
  demos = [
    {
      name: 'epub-reader',
    },
    {
      name: 'nativescript-flitt',
    },
    {
      name: 'nativescript-in-app-update',
    },
    {
      name: 'pinia-persistedstate',
    },
  ];
}
