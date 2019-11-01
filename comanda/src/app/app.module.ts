import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Ionic Native Addons
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

// Modulos de Firebase
// import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { environment } from 'src/environments/environment';

// Paginas
import { InicioPageModule } from './paginas/inicio/inicio.module';
import { LoginPageModule } from './paginas/login/login.module';
import { RegistroEmpleadoPageModule } from './paginas/registro-empleado/registro-empleado.module';
import { RegistroClientePageModule } from './paginas/registro-cliente/registro-cliente.module';
import { ModalEncuestaPageModule } from './paginas/modal-encuesta/modal-encuesta.module';

// Servicios
import { AuthService } from './servicios/auth.service';

@NgModule({
  declarations: [AppComponent
  ],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    // paginas
    InicioPageModule,
    LoginPageModule,
    RegistroEmpleadoPageModule,
    RegistroClientePageModule,
    // Modal para encuesta de Supervisor
    ModalEncuestaPageModule,
    // AngularFire
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Servicios
    AuthService,
    // Modulos Extra
    Camera,
    BarcodeScanner,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
