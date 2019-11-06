import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorageReference, AngularFireStorage } from '@angular/fire/storage';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.page.html',
  styleUrls: ['./encuesta-cliente.page.scss'],
})
export class EncuestaClientePage implements OnInit {
  private formEncuesta: FormGroup;
  private fotos: Array<string>;

  constructor(
    private toastController: ToastController,
    private auth: AngularFireAuth,
    private camera: Camera,
    private alertCtrl: AlertController,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private router: Router) { }

  ngOnInit() {
    this.formEncuesta = new FormGroup({
      conformidadCtrl: new FormControl(5, Validators.required),
      servicioCtrl: new FormControl(false),
      comidaCtrl: new FormControl(false),
      bebidaCtrl: new FormControl(false),
      instalacionesCtrl: new FormControl(false),
      personalCtrl: new FormControl(false),
      recomendariaCtrl: new FormControl('', Validators.required),
      limpiezaCtrl: new FormControl('limpio', Validators.required),
      comentarioCtrl: new FormControl('', Validators.required),
    });

    this.fotos = new Array<string>();
  }

  public mapRadioToFormValue(e: any) {
    const auxBool = e.detail.value === 'true' ? true : false;
    this.formEncuesta.patchValue({ recomendariaCtrl: auxBool });
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
    this.router.navigate(['/qr-mesa']);
  }

  private clearInputs() {
    this.formEncuesta.reset({
      conformidadCtrl: 5,
      servicioCtrl: false,
      comidaCtrl: false,
      bebidaCtrl: false,
      instalacionesCtrl: false,
      personalCtrl: false,
      recomendariaCtrl: '',
      limpiezaCtrl: 'limpio',
      comentarioCtrl: '',
    });
    this.fotos = new Array<string>();
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

  public enviarEncuesta() {
    if (this.formEncuesta.value.comentarioCtrl === '') {
      this.mostrarFaltanDatos('El comentario es requerido.');
      return true;
    }
    if (this.formEncuesta.value.recomendariaCtrl === '') {
      this.mostrarFaltanDatos('El determinar la recomendación.');
      return true;
    }

    this.comenzarSubida();
  }

  private obtenerFotoOriginal(foto): string {
    return (foto as string).split(',', 2)[1];
  }

  private obtenerDestacados() {
    const dest: {
      servicio: boolean,
      comida: boolean,
      bebida: boolean,
      instalaciones: boolean,
      atencion: boolean
    } = {
      servicio: this.formEncuesta.value.servicioCtrl,
      comida: this.formEncuesta.value.comidaCtrl,
      bebida: this.formEncuesta.value.bebidaCtrl,
      instalaciones: this.formEncuesta.value.instalacionesCtrl,
      atencion: this.formEncuesta.value.personalCtrl
    };

    return dest;
  }

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  private async comenzarSubida() {
    const dateA = new Date();
    const datos: any = {
      conformidad: this.formEncuesta.value.conformidadCtrl,
      destacado: this.obtenerDestacados(),
      recomienda: this.formEncuesta.value.recomendariaCtrl,
      limpieza: this.formEncuesta.value.limpiezaCtrl,
      comentarios: this.formEncuesta.value.comentarioCtrl,
      usuario: this.obtenerUsername(),
      fotos: new Array<string>(),
      fecha: dateA.getTime(),
    };
    let contador = 0;
    let errores = 0;

    for (let foto of this.fotos) {
      const filename: string = datos.usuario + '_' + datos.fecha + '_' + contador;
      const imageRef: AngularFireStorageReference = this.storage.ref(`encuestas-cliente/${filename}.jpg`);
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
      this.guardardatosDeEncuesta(datos);
    }
  }

  private guardardatosDeEncuesta(datos) {
    this.firestore.collection('encuestas-cliente').add(datos)
      .then((a) => {
        this.subidaExitosa('El alta se realizó de manera exitosa.');
      }).catch(err => {
        console.log('Error al guardarDatosDeEncuesta', err);
        this.subidaErronea('Error al subir a base de datos.');
      });
  }
}
