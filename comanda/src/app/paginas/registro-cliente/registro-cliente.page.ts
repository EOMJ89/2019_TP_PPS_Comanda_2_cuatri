import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Cliente } from '../../clases/cliente';
import { Anonimo } from '../../clases/anonimo';
import { Herramientas } from '../../clases/herramientas';
import { CajaSonido } from '../../clases/cajaSonido';

import * as firebase from 'firebase';
import { Camera } from '@ionic-native/camera/ngx';
import { CameraOptions } from '@ionic-native/camera';
import { BarcodeScannerOptions, BarcodeScanResult, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registro-cliente',
  templateUrl: './registro-cliente.page.html',
  styleUrls: ['./registro-cliente.page.scss'],
})
export class RegistroClientePage implements OnInit {
  private firebase = firebase;
  private usuario: Cliente;
  private anonimo: Anonimo;

  private clave: string;
  private herramientas: Herramientas = new Herramientas();
  private cajaSonido: CajaSonido = new CajaSonido();
  private ocultarSeccion0 = false;
  private ocultarSeccion1 = true;
  private ocultarSeccion2 = true;
  private ocultarSpinner = true;
  private esCliente = true;

  constructor(
    private auth: AuthService,
    private camera: Camera,
    public barcodeScanner: BarcodeScanner,
    private alertCtrl: AlertController
  ) {
    this.usuario = new Cliente();
    this.anonimo = new Anonimo();
    this.clave = '';
  }

  ngOnInit() {
    this.ocultarSeccion0 = false;
    this.ocultarSeccion1 = true;
    this.ocultarSeccion2 = true;
    this.usuario = new Cliente();
    this.anonimo = new Anonimo();
    this.clave = '';
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
    let validado = true;

    if (this.usuario.correo === '') {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro.', 'Debe escribir un correo electrónico.');
    } else if (this.clave === '') {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro.', 'Debe escribir una clave.');
    } else if (!this.herramientas.ValidarMail(this.usuario.correo)) {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro.', 'No es un correo electronico valido.');
    } else if (!this.herramientas.ValidarNombre(this.usuario.nombre)) {
      validado = false;
      this.presentAlert('¡Error!', 'Error en el registro.', 'No es un nombre valido.');
    }
    if (this.esCliente === true) {
      if (!this.herramientas.ValidarNombre(this.usuario.apellido)) {
        validado = false;
        this.presentAlert('¡Error!', 'Error en el registro.', 'No es un apellido valido.');
      } else if (!this.herramientas.ValidarDNI(this.usuario.DNI)) {
        validado = false;
        this.presentAlert('¡Error!', 'Error en el registro.', 'No es un DNI valido.');
      }
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
    const imageName = this.usuario.correo + (this.herramientas.GenRanNum(1111111, 9999999).toString());
    try {
      const options: CameraOptions = {
        quality: 50,
        targetHeight: 600,
        targetWidth: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      };

      const result = await this.camera.getPicture(options);
      const image = `data:image/jpeg;base64,${result}`;
      const pictures = firebase.storage().ref(`fotos/${imageName}`);
      pictures.putString(image, 'data_url').then(() => {
        pictures.getDownloadURL().then((url) => {
          this.usuario.foto = (url as string);
          this.Registrar();
        });
      });

    } catch (error) {
      this.presentAlert('¡Error!', 'Error en el registro.', 'Error al subir la foto, se cancelará el proceso.');
      console.log('Error:' + error);
    }
  }

  /*
    *otorga una foto predefinida, evitando sacar una foto, es utilizada para propocitos de
    prueba o si no tenes ganas de sacar fotos.
  */
  public SinFoto() {
    // tslint:disable-next-line: max-line-length
    this.usuario.foto = 'https://firebasestorage.googleapis.com/v0/b/comanda-2019-comicon.appspot.com/o/anonimo.png?alt=media&token=72c4068d-0bb0-4d8a-adce-047df2c46e5b';
    this.Registrar();
  }

  /*
    *basado en las elecciones del usuario se guarda un cliente o un anonimos
  */
  Registrar() {
    if (this.esCliente === true) {
      this.RegistrarCliente();
    } else {
      this.anonimo.correo = this.usuario.correo;
      this.anonimo.foto = this.usuario.foto;
      this.anonimo.nombre = this.usuario.nombre;
      this.RegistrarAnonimo();
    }
  }

  /*
    *guarda un Usuario del tipo cliente, utilizando un servicio
  */
  public RegistrarCliente() {
    this.auth.RegistrarCliente(this.usuario, this.clave).then(auth => {
      this.usuario = new Cliente();
      this.anonimo = new Anonimo();
      this.clave = '';
      this.ocultarSeccion0 = false;
      this.ocultarSeccion1 = true;
      this.ocultarSeccion2 = true;
      this.presentAlert('Exito!', null, '¡Usted ha sido registrado!');
    }).catch(err => {
      this.presentAlert('¡Error!', 'Error en el registro.', 'Error en base de datos.');
      console.log(err);
    });
  }

  /*
    *guarda un Usuario del tipo anonimo, utilizando un servicio
  */
  RegistrarAnonimo() {
    this.auth.RegistrarAnonimo(this.anonimo, this.clave).then(auth => {
      this.usuario = new Cliente();
      this.anonimo = new Anonimo();
      this.clave = '';
      this.ocultarSeccion0 = false;
      this.ocultarSeccion1 = true;
      this.ocultarSeccion2 = true;
      this.presentAlert('Exito!', null, '¡Usted ha sido registrado!');
    }).catch(err => {
      this.presentAlert('¡Error!', 'Error en el registro.', 'Error en base de datos.');
      console.log(err);
    });
  }

  /*
    *borra todos los datos ingresados en el formulario
  */
  public BorrarDatos() {
    this.usuario = new Cliente();
    this.anonimo = new Anonimo();
    this.clave = '';
    this.ocultarSeccion0 = false;
    this.ocultarSeccion1 = true;
    this.ocultarSeccion2 = true;
  }

  /*
    *rellena el formulario con datos aleatorios
  */
  public RellenarDatos() {
    this.usuario.apellido = this.herramientas.AutofillApellido();
    this.usuario.nombre = this.herramientas.AutofillNombre();
    this.usuario.DNI = this.herramientas.GenRanNum(999999999, 22222222);
    this.usuario.correo = this.herramientas.AutofillMail();
  }

  /*
    *permite escanear el dni para rellenar datos del formulario
  */
  public EscanearDNI() {
    const options: BarcodeScannerOptions = { prompt: 'Escaneé el DNI', formats: 'PDF_417', resultDisplayDuration: 0 };
    this.barcodeScanner.scan(options).then((barcodeData: BarcodeScanResult) => {
      const scan = (barcodeData.text).split('@');
      this.usuario.DNI = parseInt(scan[4], 10);
      this.usuario.apellido = scan[1];
      this.usuario.nombre = scan[2];
    }, (err) => {
      this.presentAlert('¡Error!', 'Error al escanear el DNI.', 'Error desconocido.');
      console.log(err);
    });
  }

  /*
    *permite seleccionar el tipo de cliete que se registrara
  */
  public ElegirCliente(tipo: string) {
    if (tipo === 'anonimo') {
      this.esCliente = false;
    } else {
      this.esCliente = true;
    }
    this.ocultarSeccion0 = true;
    this.ocultarSeccion1 = false;
  }
}
