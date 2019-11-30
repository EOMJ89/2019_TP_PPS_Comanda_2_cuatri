import { Component, OnInit } from '@angular/core';
import { ClienteKey, ClienteAConfirmar, ClienteAConfirmarKey } from 'src/app/clases/cliente';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-list-confirmar-cliente-alta',
  templateUrl: './list-confirmar-cliente-alta.page.html',
  styleUrls: ['./list-confirmar-cliente-alta.page.scss'],
})
export class ListConfirmarClienteAltaPage implements OnInit {
  private clientes = new Array<ClienteAConfirmarKey>();

  constructor(
    private firestore: AngularFirestore,
    private toastCtrl: ToastController,
    private sendEmail: EmailComposer,
    private authServ: AuthService,
  ) { }

  public ngOnInit() {
    this.traerClientes().subscribe((d: ClienteAConfirmarKey[]) => {
      // console.log('Tengo la lista de clientes', d);
      this.clientes = d;
    });
  }

  public traerClientes() {
    return this.firestore.collection('clientes-confirmar').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as ClienteAConfirmarKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
  }

  /* private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  } */

  public async confirmarCliente(cliente: ClienteAConfirmarKey, id: string) {
    // console.log('Confirmo el cliente', cliente, 'con id', id);
    const clave: string = cliente.clave;
    const data: any = {
      DNI: cliente.DNI,
      apellido: cliente.apellido,
      correo: cliente.correo,
      foto: cliente.foto,
      nombre: cliente.nombre
    };

    await this.authServ.RegistrarClienteConfirmado(data, clave).then(async (user) => {
      await this.enviarCorreo(cliente.correo, true);
      this.presentToast('Cliente confirmado', 'success');
      await this.removerDoc('clientes-confirmar', id);
    });
  }

  private removerDoc(db, key) {
    return this.firestore.collection(db).doc(key).delete();
  }

  public async rechazarCliente(cliente: ClienteKey, id: string) {
    // console.log('Rechazo el cliente', cliente, 'con id', id);
    await this.enviarCorreo(cliente.correo, false);
    this.presentToast('Cliente rechazado', 'danger');
    this.removerDoc('clientes-confirmar', id);
  }

  private async presentToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      color,
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done',
      duration: 2000
    });
    toast.present();
  }

  private obtenerMensaje(acepta) {
    let auxReturn = `Estimado/a cliente: <br>
    Su solicitud ha sido ${(acepta === true ? 'confirmada' : 'rechazada')}.<br>`;
    if (acepta) {
      auxReturn += `Ya puede ingresar y disfrutar de los beneficios.<br>`;
    } else {
      auxReturn += `Lamentamos las molestias ocasionadas.<br>`;
    }
    auxReturn += `<br>Saludos cordiales.<br>Gerencia de Comiradix.`;
    return auxReturn;
  }

  private enviarCorreo(correo: string, acepta: boolean) {
    const email = {
      to: correo,
      subject: 'Comicon - Inscripción ' + (acepta === true ? 'Confirmada' : 'Rechazada'),
      body: this.obtenerMensaje(acepta),
      isHtml: true
    };
    // Enviar mensaje con las opciones por default
    this.sendEmail.open(email).catch(err => {
      console.log(err);
    });
  }
}
