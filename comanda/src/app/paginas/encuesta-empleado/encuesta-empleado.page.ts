import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-encuesta-empleado',
  templateUrl: './encuesta-empleado.page.html',
  styleUrls: ['./encuesta-empleado.page.scss'],
})
export class EncuestaEmpleadoPage implements OnInit {
  private formEncuesta: FormGroup;
  private fotos: Array<string>;

  constructor(
    private toastController: ToastController,
    private auth: AngularFireAuth,
    private camera: Camera,
    private alertCtrl: AlertController,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore) { }

  ngOnInit() {
    this.formEncuesta = new FormGroup({
      horarioEncuestaCtrl: new FormControl('', Validators.required),
      limpiezaCtrl: new FormControl('limpio', Validators.required),
      ordenCtrl: new FormControl(5, Validators.required),
      puestoTrabajoCtrl: new FormControl(false),
      comunicacionCtrl: new FormControl(false),
      companerismoCtrl: new FormControl(false),
      horariosFlexiblesCtrl: new FormControl(false),
      satisfaccionCtrl: new FormControl('', Validators.required),
      comentarioCtrl: new FormControl('', Validators.required),
    });

    this.fotos = new Array<string>();
  }

  public mapHorarioRadioToFormValue(e: any) {
    const auxBool = e.detail.value === 'true' ? true : false;
    this.formEncuesta.patchValue({ horarioEncuestaCtrl: auxBool });
  }

  public mapRadioToFormValue(e: any) {
    const auxBool = e.detail.value === 'true' ? true : false;
    this.formEncuesta.patchValue({ satisfaccionCtrl: auxBool });
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
  }

  private clearInputs() {
    this.formEncuesta.reset({
      horarioEncuestaCtrl: '',
      limpiezaCtrl: 'limpio',
      ordenCtrl: 5,
      puestoTrabajoCtrl: false,
      comunicacionCtrl: false,
      companerismoCtrl: false,
      horariosFlexiblesCtrl: false,
      satisfaccionCtrl: '',
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
    if (this.formEncuesta.value.horarioEncuestaCtrl === '') {
      this.mostrarFaltanDatos('Falta determinar el horario de la encuesta.');
      return true;
    }
    if (this.formEncuesta.value.satisfaccionCtrl === '') {
      this.mostrarFaltanDatos('Falta determinar la satisfacción.');
      return true;
    }
    if (this.fotos.length === 0) {
      this.mostrarFaltanDatos('La foto es obligatoria.');
      return true;
    }

    this.comenzarSubida();
  }

  private obtenerFotoOriginal(foto): string {
    return (foto as string).split(',', 2)[1];
  }

  private obtenerDestacados() {
    const dest: {
      puestoTrabajo: boolean,
      comunicacion: boolean,
      companerismo: boolean,
      horariosFlexibles: boolean,
    } = {
      puestoTrabajo: this.formEncuesta.value.puestoTrabajoCtrl,
      comunicacion: this.formEncuesta.value.comunicacionCtrl,
      companerismo: this.formEncuesta.value.companerismoCtrl,
      horariosFlexibles: this.formEncuesta.value.horariosFlexiblesCtrl,
    };

    return dest;
  }

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  private async comenzarSubida() {
    const dateA = new Date();
    const datos: any = {
      horarioEncuesta: this.formEncuesta.value.horarioEncuestaCtrl,
      limpieza: this.formEncuesta.value.limpiezaCtrl,
      orden: this.formEncuesta.value.ordenCtrl,
      destacado: this.obtenerDestacados(),
      satisfaccion: this.formEncuesta.value.satisfaccionCtrl,
      comentarioCtrl: this.formEncuesta.value.comentarioCtrl,
      usuario: this.obtenerUsername(),
      fotos: new Array<string>(),
      fecha: dateA.getTime(),
    };
    let contador = 0;
    let errores = 0;

    for (let foto of this.fotos) {
      const filename: string = datos.usuario + '_' + datos.fecha + '_' + contador;
      const imageRef: AngularFireStorageReference = this.storage.ref(`encuestas-empleado/${filename}.jpg`);
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
    this.firestore.collection('encuestas-empleado').add(datos)
      .then((a) => {
        this.subidaExitosa('El alta se realizó de manera exitosa.');
      }).catch(err => {
        console.log('Error al guardarDatosDeEncuesta', err);
        this.subidaErronea('Error al subir a base de datos.');
      });
  }
}
