import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { EmpleadoKey } from 'src/app/clases/empleado';
import { ConfiguracionPage } from '../configuracion/configuracion.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage {
  private tipoUser = '';
  private user: ClienteKey | AnonimoKey | EmpleadoKey = null;
  constructor(
    private authService: AuthService,
    public router: Router,
    private firestore: AngularFirestore,
    private modalCtrl: ModalController) { }

  public cerrarSesion() {
    this.authService.Logout().then(() => {
      this.tipoUser = '';
    });
  }

  public async ionViewDidEnter() {
    await this.buscarUsuario();
  }

  private obtenerUsername() {
    return this.authService.afAuth.auth.currentUser.email;
  }

  private async traerClienteRegistrado(): Promise<null | ClienteKey> {
    return this.firestore.collection('clientes').ref.where('correo', '==', await this.obtenerUsername()).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return null;
        } else {
          const auxReturn: ClienteKey = d.docs[0].data() as ClienteKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  private async obtenerUid() {
    return this.authService.afAuth.auth.currentUser.uid;
  }

  private async traerClienteAnonimo(): Promise<null | AnonimoKey> {
    return this.firestore.collection('anonimos').doc(await this.obtenerUid()).get().toPromise()
      .then((d: DocumentSnapshot<any>) => {
        if (d.exists) {
          const auxReturn: AnonimoKey = d.data() as AnonimoKey;
          auxReturn.key = d.id;
          return auxReturn;
        } else {
          return null;
        }
      });
  }

  private async traerEmpleado(): Promise<null | EmpleadoKey> {
    return this.firestore.collection('empleados').ref.where('correo', '==', await this.obtenerUsername()).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return null;
        } else {
          const auxReturn: EmpleadoKey = d.docs[0].data() as EmpleadoKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  private async buscarUsuario() {
    this.tipoUser = '';

    // Obtengo el cliente activo en la base de clientes registrados
    const auxCliente: void | ClienteKey = await this.traerClienteRegistrado()
      .catch(err => {
        console.log(err);
      });

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxCliente !== null) {
      this.tipoUser = 'cliente';
      this.user = auxCliente as ClienteKey;
      // console.log('Hay cliente registrado', auxCliente);
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxClienteAnon: void | AnonimoKey = await this.traerClienteAnonimo()
        .catch(err => {
          console.log(err);
        });

      if (auxClienteAnon !== null) {
        this.tipoUser = 'anonimo';
        this.user = auxClienteAnon as AnonimoKey;
        // console.log('Hay usuario anonimo', auxClienteAnon);
      } else {
        const auxEmpleado: void | EmpleadoKey = await this.traerEmpleado()
          .catch(err => {
            console.log(err);
          });

        if (auxEmpleado !== null) {
          this.tipoUser = (auxEmpleado as EmpleadoKey).tipo;
          this.user = auxEmpleado as EmpleadoKey;

          // console.log('Hay empleado', auxEmpleado);
        } else {
          console.log('Error, no hay usuario idenfiticable');
          this.cerrarSesion();
        }
      }
    }
  }

  public configModal() {
    this.modalCtrl.create({
      component: ConfiguracionPage,
      componentProps: { user: this.user, type: this.tipoUser }
    }).then(modal => {
      modal.present();
    });
  }
}
