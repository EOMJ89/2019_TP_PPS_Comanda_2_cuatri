import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-abm-producto',
  templateUrl: './abm-producto.page.html',
  styleUrls: ['./abm-producto.page.scss'],
})
export class AbmProductoPage implements OnInit {
  private formMesas: FormGroup;
  private fotos: Array<string>;

  constructor(
    private camera: Camera,
    private alertCtrl: AlertController,
    /*  private scanner: BarcodeScanner, */
    private toastController: ToastController,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
  ) { }

  public ngOnInit() {
    this.formMesas = new FormGroup({
      nombreCtrl: new FormControl('', Validators.required),
      descCtrl: new FormControl('', Validators.required),
      tiempoCtrl: new FormControl('', Validators.required),
      precioCtrl: new FormControl('', Validators.required),
      quienPuedeverCtrl: new FormControl('', Validators.required),
    });
    this.fotos = new Array<string>();
  }

  public tomarFoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };

    this.camera.getPicture(options).then((imageData) => {
      this.fotos.unshift('data:image/jpeg;base64,' + imageData);
    }, (err) => {
      this.subidaErronea(err);
    });
  }

  public agregarMesas() {
    if (this.formMesas.value.nombreCtrl === '') {
      this.mostrarFaltanDatos('El nombre del producto es obligatorio');
      return true;
    }
    if (this.formMesas.value.descCtrl === '') {
      this.mostrarFaltanDatos('La descripción del producto es obligatorio');
      return true;
    }
    if (this.formMesas.value.tiempoCtrl === '' || this.formMesas.value.tiempoCtrl < 0) {
      this.mostrarFaltanDatos('El tiempo de preparación es invalido o incorrecto');
      return true;
    }
    if (this.formMesas.value.precioCtrl === '' || this.formMesas.value.tiempoCtrl < 0) {
      this.mostrarFaltanDatos('El precio es invalido o incorrecto');
    }
    if (this.fotos.length === 0) {
      this.mostrarFaltanDatos('Debe subir una foto');
      return true;
    }

    this.comenzarSubida();
  }

  private obtenerFotoOriginal(foto): string {
    return (foto as string).split(',', 2)[1];
  }

  private async comenzarSubida() {
    const datos: any = {
      nombre: this.formMesas.value.nombreCtrl,
      descripcion: this.formMesas.value.descCtrl,
      cantidad: 0,
      tiempo: this.formMesas.value.tiempoCtrl,
      precio: this.formMesas.value.precioCtrl,
      quienPuedever: this.formMesas.value.quienPuedeverCtrl,
      fotos: new Array<string>(),
    };
    let contador = 0;
    let errores = 0;

    for (let foto of this.fotos) {
      const filename: string = datos.nombre + '_' + contador;
      const imageRef: AngularFireStorageReference = this.storage.ref(`productos/${filename}.jpg`);
      foto = this.obtenerFotoOriginal(foto);
      await imageRef.putString(foto, 'base64', { contentType: 'image/jpeg' })
        .then(async (snapshot) => {
          datos.fotos.push(await snapshot.ref.getDownloadURL());
          contador++;
        }).catch(() => {
          this.subidaErronea(`Error al subir la foto ${contador}, se canceló el alta.`);
          errores++;
        });
    }

    if (errores === 0) {
      this.guardardatosDeProducto(datos);
    }
  }

  private guardardatosDeProducto(datos) {
    this.firestore.collection('productos').add(datos)
      .then((a) => {
        this.subidaExitosa('El alta se realizó de manera exitosa.');
      }).catch(err => {
        console.log('Error al guardarDatosDeProducto', err);
        this.subidaErronea('Error al subir a base de datos.');
      });
  }

  private async subidaExitosa(mensaje) {
    const alert = await this.alertCtrl.create({
      header: 'Alert',
      subHeader: 'Éxito',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
    // clear the previous photo data in the variable
    this.clearInputs();
  }

  private async subidaErronea(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Alert',
      subHeader: 'Error',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  private clearInputs() {
    this.formMesas.reset();
    this.fotos = new Array<string>();
  }

  public async mostrarFaltanDatos(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      color: 'danger',
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Okay',
      duration: 2000
    });
    toast.present();
  }
}
