import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { ModalEncuestaPage } from '../modal-encuesta/modal-encuesta.page';
import { map } from 'rxjs/operators';
import { EmpleadoKey } from 'src/app/clases/empleado';
import { ClienteKey } from 'src/app/clases/cliente';

@Component({
  selector: 'app-encuesta-sup',
  templateUrl: './encuesta-sup.page.html',
  styleUrls: ['./encuesta-sup.page.scss'],
})
export class EncuestaSupPage implements OnInit {
  private empleados: any[];
  private clientes: any[];

  constructor(
    private firestore: AngularFirestore,
    public modalController: ModalController) { }

  ngOnInit() {
    this.filtrarEmpleados('empleados').subscribe((data: Array<EmpleadoKey>) => {
      this.empleados = data;
    });
    this.filtrarClientes('clientes').subscribe((data: Array<ClienteKey>) => {
      this.clientes = data;
    });
  }

  public filtrarEmpleados(db: string) {
    return this.traertodos(db).snapshotChanges().pipe(map((f) => {
      let auxChat = f.map((a) => {
        const data = a.payload.doc.data() as EmpleadoKey;
        data.key = a.payload.doc.id;
        return data;
      });

      auxChat = auxChat.filter(e => {
        if (e.tipo === 'dueño' || e.tipo === 'supervisor') {
          return false;
        } else {
          return true;
        }
      });
      return auxChat;
    }));
  }

  public filtrarClientes(db: string) {
    return this.traertodos(db).snapshotChanges().pipe(map((f) => {
      return f.map((a) => {
        const data = a.payload.doc.data() as ClienteKey;
        data.key = a.payload.doc.id;
        return data;
      });
    }));
  }

  public traertodos(db: string) {
    return this.firestore.collection(db);
  }

  public async muestraModal(key: string, tipo: string) {
    await this.modalController.create({
      component: ModalEncuestaPage,
      componentProps: {
        key,
        tipo
      }
    }).then(modal => {
      modal.present();
    });
  }
}
