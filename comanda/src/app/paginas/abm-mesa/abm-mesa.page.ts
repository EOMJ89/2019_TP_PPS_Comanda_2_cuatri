import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { MesaKey } from 'src/app/clases/mesa';

@Component({
  selector: 'app-abm-mesa',
  templateUrl: './abm-mesa.page.html',
  styleUrls: ['./abm-mesa.page.scss'],
})
export class AbmMesaPage implements OnInit {
  private formMesas: FormGroup;
  private foto: string | boolean = false;

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
      nromesaCtrl: new FormControl('', Validators.required),
      cantcomenCtrl: new FormControl('', Validators.required),
      tmesaCtrl: new FormControl('', Validators.required)
    });
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
      this.foto = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      this.subidaErronea(err);
    });
  }

  public agregarMesas() {
    if (this.formMesas.value.nromesaCtrl === '') {
      this.mostrarFaltanDatos('El nro. de mesa es obligatorio');
      return true;
    }
    if (this.formMesas.value.cantcomenCtrl === '') {
      this.mostrarFaltanDatos('El nro. de personas es obligatorio');
      return true;
    }
    if (this.formMesas.value.tmesaCtrl === '') {
      this.mostrarFaltanDatos('El tipo de mesa es obligatorio');
      return true;
    }
    if (this.foto === false) {
      this.mostrarFaltanDatos('Debe subir una foto');
      return true;
    }

    this.comenzarSubida();
  }

  private obtenerFotoOriginal(): string {
    return (this.foto as string).split(',', 2)[1];
  }

  private async comenzarSubida() {
    const filename: string = this.formMesas.value.tmesaCtrl + this.formMesas.value.nromesaCtrl + '_0';
    const imageRef: AngularFireStorageReference = this.storage.ref(`mesas/${filename}.jpg`);

    const datos: any = {
      nromesa: this.formMesas.value.nromesaCtrl,
      cantcomen: this.formMesas.value.cantcomenCtrl,
      tmesa: this.formMesas.value.tmesaCtrl,
      estado: 'libre',
      cliente: '',
      foto: '',
      reservada: false,
    };


    const auxFoto = this.obtenerFotoOriginal();

    await imageRef.putString(auxFoto, 'base64', { contentType: 'image/jpeg' })
      .then(async (snapshot) => {
        datos.foto = await snapshot.ref.getDownloadURL();
        this.guardardatosDeProducto(datos);
      })
      .catch(() => {
        this.subidaErronea('Error al subir la foto, se canceló el alta.');
      });
  }

  private guardardatosDeProducto(datos) {
    this.firestore.collection('mesas').add(datos)
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
    this.foto = false;
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
