import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

//import { timer } from 'rxjs/observable/timer';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  showSplash = true;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen 
  ) {
    this.initializeApp(); 
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();

      setTimeout(() => {
        // console.log('Desactivo la Splash Screen estÃ¡tica');
        this.splashScreen.hide();
      }, 3000);

      setTimeout(() => {
        // console.log('Desactivo la Splash Screen animada');
        this.showSplash = false;
      }, 6000);
    });
  }
}
