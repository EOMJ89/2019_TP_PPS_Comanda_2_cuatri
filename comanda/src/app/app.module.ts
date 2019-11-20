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
import { EmailComposer } from '@ionic-native/email-composer/ngx';

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

// Modales
import { ModalEncuestaPageModule } from './paginas/modal-encuesta/modal-encuesta.module';
import { ModalPedidoPageModule } from './paginas/modal-pedido/modal-pedido.module';
import { ModalClientePageModule } from './paginas/modal-cliente/modal-cliente.module';
import { EncuestaClientePageModule } from './paginas/encuesta-cliente/encuesta-cliente.module';
import { ConfiguracionPageModule } from './paginas/configuracion/configuracion.module';
// Servicios
import { AuthService } from './servicios/auth.service';
import { FirebaseService } from './servicios/firebase.service';

import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [AppComponent
  ],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    // Paginas
    InicioPageModule,
    LoginPageModule,
    RegistroEmpleadoPageModule,
    RegistroClientePageModule,
    // Modal para encuesta de Supervisor
    ModalEncuestaPageModule,
    EncuestaClientePageModule,
    // Pedido
    // GenerarPedidoPage,
    ModalPedidoPageModule,
    ModalClientePageModule,
    ConfiguracionPageModule,

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
    HttpModule,
    // Servicios
    AuthService,
    FirebaseService,
    // Modulos Extra
    Camera,
    BarcodeScanner,
    EmailComposer,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
