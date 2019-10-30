import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AlertController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';

@Component({
  selector: 'app-abm-mesa',
  templateUrl: './abm-mesa.page.html',
  styleUrls: ['./abm-mesa.page.scss'],
})
export class AbmMesaPage implements OnInit {
  private formMesas: FormGroup;
  private captureDataUrl: Array<string>;
  private hayFotos = false;
  private datos: any;

  constructor(
    private camera: Camera,
    private alertCtrl: AlertController,
    /*  private scanner: BarcodeScanner, */
    private toastController: ToastController,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.formMesas = new FormGroup({
      nromesaCtrl: new FormControl('', Validators.required),
      cantcomenCtrl: new FormControl('', Validators.required),
      tmesaCtrl: new FormControl('', Validators.required)
    });
    this.captureDataUrl = new Array<string>();
  }

  tomarFoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };

    this.camera.getPicture(options).then((imageData) => {
      this.captureDataUrl.push('data:image/jpeg;base64,' + imageData);
      this.hayFotos = true;
    }, (err) => {
      this.presentAlert(err);
    });
  }

  private async presentAlert(err) {
    const alert = await this.alertCtrl.create({
      header: 'Alerta',
      subHeader: '¡Error!',
      message: err,
      buttons: ['OK']
    });

    await alert.present();
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
    if (this.hayFotos === false) {
      this.mostrarFaltanDatos('Debe subir una foto');
      return true;
    }

    this.captureDataUrl.forEach(async (foto) => {
      const filename: string = this.formMesas.value.tmesaCtrl + this.formMesas.value.nromesaCtrl + '_0';
      const imageRef: AngularFireStorageReference = this.storage.ref(`mesas/${filename}.jpg`);

      const datos: any = {
        nromesa: this.formMesas.value.nromesaCtrl,
        cantcomen: this.formMesas.value.cantcomenCtrl,
        tmesa: this.formMesas.value.tmesaCtrl,
        estado: 'libre',
        cliente: ' ',
        foto: ''
      };

      await imageRef.putString(foto, firebase.storage.StringFormat.DATA_URL)
        .then(async (snapshot) => {
          datos.foto = await snapshot.ref.getDownloadURL();
          this.guardardatosDeProducto(datos);
        })
        .catch(() => {
          this.subidaErronea('Error al realizar el alta.');
        });
    });
  }

  private guardardatosDeProducto(datos) {
    this.firestore.collection('mesas').add(datos)
      .then((a) => {
        this.subidaExitosa('El alta se realizó de manera exitosa.');
      }).catch(err => {
        this.subidaErronea('Error al subir a base de datos.');
      });
  }

  async subidaExitosa(mensaje) {
    const alert = await this.alertCtrl.create({
      header: 'Alert',
      subHeader: 'Éxito',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
    // clear the previous photo data in the variable
    this.captureDataUrl.length = 0;

    this.clearInputs();
  }

  async subidaErronea(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Alert',
      subHeader: 'Error',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  clearInputs() {
    this.formMesas.get('nromesaCtrl').setValue('');
    this.formMesas.get('cantcomenCtrl').setValue('');
    this.formMesas.get('tmesaCtrl').setValue('');
  }

  async mostrarFaltanDatos(mensaje: string) {
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
