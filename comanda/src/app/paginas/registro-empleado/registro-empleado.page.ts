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
  private listaPerfil: Array<string> = ["dueño", "supervisor", "mozo", "bartender", "candybar", "cocinero"];
  private ocultarSeccion1: boolean = false;
  private ocultarSeccion2: boolean = true;
  private ocultarSpinner: boolean = true;

  constructor(private auth: AuthService,
    private router: Router,
    private camera: Camera,
    public barcodeScanner: BarcodeScanner
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
    } else if (this.usuario.tipo == "") {
      validado = false;
      alert("Debe elegir un tipo");
    } else if (!this.herramientas.ValidarNombre(this.usuario.nombre)) {
      validado = false;
      alert("No es un nombre valido");
    } else if (!this.herramientas.ValidarNombre(this.usuario.apellido)) {
      validado = false;
      alert("No es un apellido valido");
    } else if (!this.herramientas.ValidarDNI(this.usuario.DNI)) {
      validado = false;
      alert("No es un DNI valido");
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
    *guarda un Usuario del tipo empleado, utilizando un servicio
  */
  public Registrar() {
    this.auth.RegistrarEmpleado(this.usuario, this.clave).then(auth => {
      this.usuario = new Empleado();
      this.clave = "";
      this.ocultarSeccion1 = false;
      this.ocultarSeccion2 = true;
      alert("El usuario ha sido registrado!");
    }).catch(err => {
      alert(err);
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

}

