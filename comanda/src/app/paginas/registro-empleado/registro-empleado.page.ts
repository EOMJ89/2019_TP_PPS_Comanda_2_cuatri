import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';

import { Empleado } from '../../clases/empleado';
import { Herramientas } from '../../clases/herramientas';
import { CajaSonido } from '../../clases/cajaSonido';

import * as firebase from "firebase";
import { Camera } from '@ionic-native/camera/ngx';
import { CameraOptions } from '@ionic-native/camera';
import { BarcodeScannerOptions, BarcodeScanResult, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registro-empleado',
  templateUrl: './registro-empleado.page.html',
  styleUrls: ['./registro-empleado.page.scss'],
})
export class RegistroEmpleadoPage implements OnInit {
  private firebase = firebase;
  private usuario: Empleado;
  private clave: string;
  private herramientas: Herramientas = new Herramientas();
  private cajaSonido: CajaSonido = new CajaSonido();
  private listaPerfil: Array<string> = ["dueño", "supervisor", "mozo", "bartender", "candybar", "cocinero"]; // Camarero hace de cocinero
  private ocultarSeccion1: boolean = false;
  private ocultarSeccion2: boolean = true;
  private ocultarSpinner: boolean = true;

  constructor(private auth: AuthService,
    private router: Router,
    private camera: Camera,
    public barcodeScanner: BarcodeScanner,
    private alertCtrl: AlertController
  ) {
    this.usuario = new Empleado();
    this.clave = "";
  }

  ngOnInit() {
    this.ocultarSeccion1 = false;
    this.ocultarSeccion2 = true;
    this.usuario = new Empleado();
    this.clave = "";
  }

  public presentAlert(header: string, subHeader: string, message: string) {
    this.alertCtrl.create({
      header,
      subHeader,
      message,
      buttons: ['OK']
    }).then(a => { a.present(); });
  }

  /*
    *verifica que los datos ingresados en el formulario son correctos, de serlo se muestra un selector
  */
  public ValidarRegistro() {
    var validado: boolean = true;

    if (this.usuario.correo == "") {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "Debe escribir un correo electronico");
    } else if (this.clave == "") {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "Debe escribir una clave");
    } else if (!this.herramientas.ValidarMail(this.usuario.correo)) {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "No es un correo electronico valido");
    } else if (this.usuario.tipo == "") {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "Debe elegir un tipo");
    } else if (!this.herramientas.ValidarNombre(this.usuario.nombre)) {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "No es un nombre valido");
    } else if (!this.herramientas.ValidarNombre(this.usuario.apellido)) {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "No es un apellido valido");
    } else if (!this.herramientas.ValidarDNI(this.usuario.DNI)) {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro', "No es un DNI valido");
    }
    if (validado) {
      this.ocultarSeccion1 = true;
      this.ocultarSeccion2 = false;
    }
  }

  /*
    *permite sacar una foto y subirla en firebase, asi permite guardar su direcccion
  */
  async SacarFoto() {
    this.cajaSonido.ReproducirSelecionar();
    let imageName = this.usuario.correo + (this.herramientas.GenRanNum(1111111, 9999999).toString());
    try {

      let options: CameraOptions = {
        quality: 50,
        targetHeight: 600,
        targetWidth: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      };

      let result = await this.camera.getPicture(options);
      let image = `data:image/jpeg;base64,${result}`;
      let pictures = firebase.storage().ref(`fotos/${imageName}`);
      pictures.putString(image, "data_url").then(() => {
        pictures.getDownloadURL().then((url) => {
          this.usuario.foto = (url as string);
          this.Registrar();
        });
      });

    } catch (error) {
      console.log(error);
      this.presentAlert('¡Error!', 'Error en el registro', "Error:" + error);
    }
    //este spinner es necesario
    this.ActivarSpinner(5000);
  }

  /*
    *otorga una foto predefinida, evitando sacar una foto, es utilizada para propocitos de
    prueba o si no tenes ganas de sacar fotos.
  */
  public SinFoto() {
    this.usuario.foto = "https://firebasestorage.googleapis.com/v0/b/comanda-2019-comicon.appspot.com/o/anonimo.png?alt=media&token=72c4068d-0bb0-4d8a-adce-047df2c46e5b";
    this.Registrar();
  }

  /*
    *guarda un Usuario del tipo empleado, utilizando un servicio
  */
  public Registrar() {
    this.auth.RegistrarEmpleado(this.usuario, this.clave).then(auth => {
      this.usuario = new Empleado();
      this.clave = "";
      this.ocultarSeccion1 = false;
      this.ocultarSeccion2 = true;
      this.presentAlert('¡Exito!', null, "El usuario ha sido registrado!");
    }).catch(err => {
      this.presentAlert('¡Error!', 'Error en el registro', err);
    });

  }

  /*
    *borra todos los datos ingresados en el formulario
  */
  public BorrarDatos() {
    this.usuario = new Empleado();
    this.clave = "";
    this.ocultarSeccion1 = false;
    this.ocultarSeccion2 = true;
  }

  /*
    *spinner improvisado.
    @delay : tiempo en milisegundo que aparecera.
  */
  public ActivarSpinner(delay: number) {
    this.ocultarSpinner = false;
    var modelo = this;
    setTimeout(function () {
      modelo.ocultarSpinner = true;
    }, delay);

  }

  /*
    *rellena el formulario con datos aleatorios
  */
  public RellenarDatos() {
    this.usuario.apellido = this.herramientas.AutofillApellido();
    this.usuario.nombre = this.herramientas.AutofillNombre();
    this.usuario.DNI = this.herramientas.GenRanNum(999999999, 22222222);
    this.usuario.CUIL = this.herramientas.GenRanNum(999999999, 22222222).toString();
    this.usuario.correo = this.herramientas.AutofillMail();
  }

  private manejarDNI(datos: Array<string>) {
    const dni = parseInt(datos[4], 10);

    if (isNaN(dni)) {
      console.log('Es de formato 2010');
      this.usuario.DNI = parseInt(datos[1].trim(), 10);
      this.usuario.apellido = datos[4];
      this.usuario.nombre = datos[5];
    } else {
      console.log('Es de formato 2014');
      this.usuario.DNI = parseInt(datos[4], 10);
      this.usuario.apellido = datos[1];
      this.usuario.nombre = datos[2];
    }
  }

  public EscanearDNI() {
    const options: BarcodeScannerOptions = { prompt: 'Escaneé el DNI', formats: 'PDF_417', resultDisplayDuration: 0 };
    this.barcodeScanner.scan(options).then((barcodeData: BarcodeScanResult) => {
      const scan = (barcodeData.text).split('@');
      this.manejarDNI(scan);
    }, (err) => {
      this.presentAlert('¡Error!', 'Error en el registro', err);
    });
  }

}

