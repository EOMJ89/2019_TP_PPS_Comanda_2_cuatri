import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Cliente } from '../../clases/cliente';
import { Anonimo } from '../../clases/anonimo';
import { Herramientas } from '../../clases/herramientas';
import { CajaSonido } from '../../clases/cajaSonido';

import * as firebase from "firebase";
import { Camera } from '@ionic-native/camera/ngx';
import { CameraOptions } from '@ionic-native/camera';
import { BarcodeScannerOptions, BarcodeScanResult, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

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
  private ocultarSeccion0: boolean = false;
  private ocultarSeccion1: boolean = true;
  private ocultarSeccion2: boolean = true;
  private ocultarSpinner: boolean = true;
  private esCliente: boolean = true;

  constructor(private auth: AuthService,
    private camera: Camera,
    public barcodeScanner: BarcodeScanner
  ) {
    this.usuario = new Cliente();
    this.anonimo = new Anonimo();
    this.clave = "";
  }

  ngOnInit() {
    this.ocultarSeccion0 = false;
    this.ocultarSeccion1 = true;
    this.ocultarSeccion2 = true;
    this.usuario = new Cliente();
    this.anonimo = new Anonimo();
    this.clave = "";
  }

  /*
    *verifica que los datos ingresados en el formulario son correctos, de serlo se muestra un selector
  */
  public ValidarRegistro() {
    var validado: boolean = true;

    if (this.usuario.correo == "") {
      validado = false;
      alert("Debe escribir un correo electronico");
    }
    else if (this.clave == "") {
      validado = false;
      alert("Debe escribir una clave");
    }
    else if (!this.herramientas.ValidarMail(this.usuario.correo)) {
      validado = false;
      alert("No es un correo electronico valido");
    } else if (!this.herramientas.ValidarNombre(this.usuario.nombre)) {
      validado = false;
      alert("No es un nombre valido");
    }
    if (this.esCliente == true) {
      if (!this.herramientas.ValidarNombre(this.usuario.apellido)) {
        validado = false;
        alert("No es un apellido valido");
      } else if (!this.herramientas.ValidarDNI(this.usuario.DNI)) {
        validado = false;
        alert("No es un DNI valido");
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
      alert("Error:" + error);
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
    *basado en las elecciones del usuario se guarda un cliente o un anonimos
  */
  Registrar() {
    if (this.esCliente == true) {
      this.RegistrarCliente();
    }
    else {
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
      this.clave = "";
      this.ocultarSeccion0 = false;
      this.ocultarSeccion1 = true;
      this.ocultarSeccion2 = true;
      alert("Usted ha sido registrado!");
    }).catch(err => {
      alert(err);
    });
  }

  /*
    *guarda un Usuario del tipo anonimo, utilizando un servicio
  */
  RegistrarAnonimo() {
    this.auth.RegistrarAnonimo(this.anonimo, this.clave).then(auth => {
      this.usuario = new Cliente();
      this.anonimo = new Anonimo();
      this.clave = "";
      this.ocultarSeccion0 = false;
      this.ocultarSeccion1 = true;
      this.ocultarSeccion2 = true;
      alert("Usted ha sido registrado!");
    }).catch(err => {
      alert(err);
    });
  }

  /*
    *borra todos los datos ingresados en el formulario
  */
  public BorrarDatos() {
    this.usuario = new Cliente();
    this.anonimo = new Anonimo();
    this.clave = "";
    this.ocultarSeccion0 = false;
    this.ocultarSeccion1 = true;
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
      alert(err);
    });
  }

  /*
    *permite seleccionar el tipo de cliete que se registrara
  */
  public ElegirCliente(tipo: string) {
    if (tipo == "anonimo") {
      this.esCliente = false;
    }
    else {
      this.esCliente = true;
    }
    this.ocultarSeccion0 = true;
    this.ocultarSeccion1 = false;
  }

}
