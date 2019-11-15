import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, BarcodeScanResult, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { MesaKey } from 'src/app/clases/mesa';
import { map } from 'rxjs/operators';
import { ListaEsperaClientesKey, ListaEsperaClientes } from 'src/app/clases/lista-espera-clientes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-ingreso-local',
  templateUrl: './qr-ingreso-local.page.html',
  styleUrls: ['./qr-ingreso-local.page.scss'],
})
export class QrIngresoLocalPage implements OnInit {
  private opt: BarcodeScannerOptions = {
    resultDisplayDuration: 0,
  };

  private mesas = new Array<MesaKey>();
  private listaEspera = new Array<ListaEsperaClientesKey>();

  constructor(
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router,
  ) { }

  ngOnInit() {
    this.traerMesas().subscribe((d: MesaKey[]) => {
      // console.log('Tengo las mesas', d);
      this.mesas = d;
    });
    this.traerListaEspera().subscribe((d: ListaEsperaClientesKey[]) => {
      // console.log('Tengo la lista de espera', d);
      this.listaEspera = d;
    });
  }

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  private traerUsuarioRegistrado(): Promise<false | ClienteKey> {
    return this.firestore.collection('clientes').ref.where('correo', '==', this.obtenerUsername()).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return false;
        } else {
          const auxReturn: ClienteKey = d.docs[0].data() as ClienteKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  private obtenerUid() {
    return this.auth.auth.currentUser.uid;
  }

  private async traerUsuarioAnonimo(): Promise<false | AnonimoKey> {
    return this.firestore.collection('anonimos').doc(await this.obtenerUid()).get().toPromise().then((d: DocumentSnapshot<any>) => {
      if (d.exists) {
        const auxReturn: AnonimoKey = d.data() as AnonimoKey;
        auxReturn.key = d.id;
        return auxReturn;
      } else {
        return false;
      }
    });
  }

  public doScan() {
    this.scanner.scan(this.opt)
      .then(async (data: BarcodeScanResult) => {
        // console.log('Lo escaneado es', data.text);
        if (data.text === 'IngresoLocal') {
          await this.manejarQR();
        } else {
          this.presentAlert('QR Erroneo', 'El QR no pertenece al de ingreso al local.', 'Por favor, apunte al código de Ingreso al Local');
        }
      }).catch(async (err) => {
        console.log('Error al escanear el qr', err);
        await this.manejarQR();
      });
  }

  private async manejarQR() {
    // Obtengo el cliente activo en la base de clientes registrados
    const auxUser = await this.traerUsuarioRegistrado();

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.buscarMesa(auxUser, true);
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo();
      if (auxUserAnon) {
        this.buscarMesa(auxUserAnon, false);
        // console.log('Hay usuario anonimo', auxUserAnon);
      } else {
        // Si no encuentro cliente anonimo, significa que soy un empleado y supervisor
        console.log('No hay cliente, se enviará a las estadisticas de clientes');
        this.presentAlert(null, 'No hay usuario', 'Se enviará a las estadisticas de clientes.');
        // this.router.navigate(['/est-satisfaccion']); // Sin implementar
      }
    }
  }

  public presentAlert(header: string, subHeader: string, message: string) {
    this.alertCtrl.create({
      header,
      subHeader,
      message,
      buttons: ['OK']
    }).then(a => { a.present(); });
  }

  private buscarMesa(usuario: ClienteKey | AnonimoKey, esRegistrado: boolean) {
    let nroMesa = -1;

    // Recorro las mesas buscando si ya tiene una asignada
    for (const mesa of this.mesas) {
      if (mesa.cliente === usuario.correo) {
        nroMesa = mesa.nromesa;
        break;
      }
    }

    // Si hay una mesa asignada, se avisa
    if (nroMesa !== -1) {
      this.presentAlert(null, 'Ya tiene mesa asignada.', `Su mesa asignada es la ${nroMesa}.`);
    } else {
      let estaEnListaEspera = false;

      // De lo contrario verifico si se encuentra en la lista de espera
      for (const turnoEspera of this.listaEspera) {
        if (turnoEspera.correo === usuario.correo) {
          estaEnListaEspera = true;
          break;
        }
      }

      // Si ya se encuentra en la lista de espera, se avisa
      if (estaEnListaEspera) {
        this.presentAlert(null, 'Ya está en la lista', 'Usted ya se encuentra en la lista de espera.');
      } else {
        const d = new Date();
        // De lo contrario, se lo agrega a la lista de espera
        const datos: any = {
          correo: usuario.correo,
          perfil: esRegistrado === true ? 'cliente' : 'clienteAnonimo',
          estado: 'confirmacionMozo',
          fecha: d.getTime(),
        };

        this.enviarDatos(datos).then(docRef => {
          this.router.navigate(['/list-confirmar-cliente-mesa']); // Aún sin implementar
        })
          .catch(err => {
            this.presentAlert('¡Error!', 'No se ha podido agregar a la lista.', 'Error en la base de datos.');
          });
      }
    }
  }

  private enviarDatos(d: any) {
    return this.firestore.collection('listaEsperaClientes').add(d);
  }

  public traerMesas() {
    return this.firestore.collection('mesas').snapshotChanges().pipe(map((f) => {
      return f.map((a) => {
        const data = a.payload.doc.data() as MesaKey;
        data.key = a.payload.doc.id;
        return data;
      });
    }));
  }

  public traerListaEspera() {
    return this.firestore.collection('listaEsperaClientes').snapshotChanges().pipe(map((f) => {
      return f.map((a) => {
        const data = a.payload.doc.data() as ListaEsperaClientesKey;
        data.key = a.payload.doc.id;
        return data;
      });
    }));
  }
}
