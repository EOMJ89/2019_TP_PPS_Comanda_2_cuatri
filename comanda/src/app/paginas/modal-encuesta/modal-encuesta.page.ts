import { Component, OnInit } from '@angular/core';
import { ClienteKey } from 'src/app/clases/cliente';
import { EmpleadoKey } from 'src/app/clases/empleado';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';


@Component({
  selector: 'app-modal-encuesta',
  templateUrl: './modal-encuesta.page.html',
  styleUrls: ['./modal-encuesta.page.scss'],
})
export class ModalEncuestaPage implements OnInit {
  private key: string;
  private tipo: string;
  private user: ClienteKey | EmpleadoKey;
  public formEncuesta: FormGroup;

  constructor(
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private auth: AngularFireAuth) { }

  ngOnInit() {
    let auxDB: AngularFirestoreCollection<unknown> = null;
    if (this.tipo === 'empleado') {
      auxDB = this.traertodos('empleados');
    } else {
      auxDB = this.traertodos('clientes');
    }

    auxDB.doc(this.key).get().subscribe((d) => {
      if (this.tipo === 'empleado') {
        this.user = d.data() as EmpleadoKey;
      } else {
        this.user = d.data() as ClienteKey;
      }
      this.user.key = d.id;
    });

    this.formEncuesta = new FormGroup({
      puntualidadCtrl: new FormControl(this.tipo === 'empleado' ? 'puntual' : false, Validators.required),
      cantComensalesCtrl: new FormControl(this.tipo === 'cliente' ? 1 : false, Validators.required),
      valoracionCtrl: new FormControl(5, Validators.required),
      comentarioCtrl: new FormControl('', Validators.required),
      recomendacionCtrl: new FormControl(this.tipo === 'empleado' ? '' : false, Validators.required),
      frequenciaCtrl: new FormControl(this.tipo === 'cliente' ? '' : false, Validators.required),
    });
  }

  public traertodos(db: string) {
    return this.firestore.collection(db);
  }

  public mapRadioToFormValueRecomendacion(e: any) {
    const auxBool = e.detail.value === 'true' ? true : false;
    this.formEncuesta.patchValue({ recomendacionCtrl: auxBool });
  }

  public mapRadioToFormValueFrequencia(e: any) {
    const auxBool = e.detail.value === 'true' ? true : false;
    this.formEncuesta.patchValue({ frequenciaCtrl: auxBool });
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

  public enviarEncuesta() {
    if (this.formEncuesta.value.comentarioCtrl === '') {
      this.mostrarFaltanDatos('El comentario es requerido.');
      return true;
    }
    if (this.formEncuesta.value.recomendacionCtrl === '') {
      this.mostrarFaltanDatos('Falta determinar la recomendación.');
      return true;
    }
    if (this.formEncuesta.value.frequenciaCtrl === '') {
      this.mostrarFaltanDatos('Falta determinar la frequencia.');
      return true;
    }

    this.comenzarSubida();
  }

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  private obtenerDatos() {
    const dateA = new Date();
    const auxRetorno: {
      valoracion: number,
      comentario: string,
      supervisor: string,
      empleado: string,
      fecha: number,
    } = {
      valoracion: this.formEncuesta.value.valoracionCtrl,
      comentario: this.formEncuesta.value.comentarioCtrl,
      supervisor: this.obtenerUsername(),
      empleado: this.key,
      fecha: dateA.getTime(),
    };
    return auxRetorno;
  }

  private obtenerDatosEmpleado() {
    const auxRetorno: any = this.obtenerDatos();
    auxRetorno.puntualidad = this.formEncuesta.value.puntualidadCtrl as string;
    auxRetorno.recomendacion = this.formEncuesta.value.recomendacionCtrl as boolean;
    return auxRetorno;
  }

  private obtenerDatosCliente() {
    const auxRetorno: any = this.obtenerDatos();
    auxRetorno.cantComensales = this.formEncuesta.value.cantComensalesCtrl as number;
    auxRetorno.frequencia = this.formEncuesta.value.frequenciaCtrl as boolean;
    return auxRetorno;
  }

  private comenzarSubida() {
    const datos: any = this.tipo === 'empleado' ? this.obtenerDatosEmpleado() : this.obtenerDatosCliente();

    this.guardardatosDeEncuesta(datos);
  }

  private guardardatosDeEncuesta(datos) {
    this.firestore.collection(`encuestas-sup-${this.tipo}`).add(datos)
      .then((a) => {
        this.subidaExitosa('El alta se realizó de manera exitosa.');
      }).catch(err => {
        console.log('Error al guardarDatosDeEncuesta', err);
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
    this.cerrarModal();
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
    this.formEncuesta.reset({
      puntualidadCtrl: this.tipo === 'empleado' ? 'puntual' : false,
      cantComensalesCtrl: this.tipo === 'cliente' ? 1 : false,
      valoracionCtrl: 5,
      comentarioCtrl: '',
      recomendacionCtrl: this.tipo === 'empleado' ? '' : false,
      frequenciaCtrl: this.tipo === 'cliente' ? '' : false,
    });
  }

  public cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
