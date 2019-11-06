import { Component, OnInit } from '@angular/core';
import { BarcodeScannerOptions, BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner/ngx';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { MesaKey, Mesa } from 'src/app/clases/mesa';
import { map } from 'rxjs/operators';
import { AlertController, ModalController } from '@ionic/angular';
import { ReservaKey } from 'src/app/clases/reserva';
import { ListaEsperaClientesKey } from 'src/app/clases/lista-espera-clientes';
import { PedidoKey } from 'src/app/clases/pedido';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-mesa',
  templateUrl: './qr-mesa.page.html',
  styleUrls: ['./qr-mesa.page.scss'],
})
export class QrMesaPage implements OnInit {
  private opt: BarcodeScannerOptions = {
    resultDisplayDuration: 0,
  };
  private mesas: MesaKey[];
  private mesaAMostrar: MesaKey;
  private esCliente = false;
  private reservas: ReservaKey[];
  private reservaAMostrar: ReservaKey;
  private listaEspera: ListaEsperaClientesKey[];
  private user: ClienteKey | AnonimoKey;
  private pedidos: PedidoKey[];
  private idPedido: string;

  constructor(
    private firestore: AngularFirestore,
    private scanner: BarcodeScanner,
    private auth: AngularFireAuth,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public router: Router,
  ) { }

  async ngOnInit() {
    this.traerMesas().subscribe((d: MesaKey[]) => {
      // console.log('Tengo las mesas', d);
      this.mesas = d;
    });

    this.traerReservas().subscribe((d: ReservaKey[]) => {
      // console.log('Tengo las mesas', d);
      this.reservas = d;
    });

    this.traerListaEspera().subscribe((d: ListaEsperaClientesKey[]) => {
      // console.log('Tengo la lista de espera', d);
      this.listaEspera = d;
    });

    this.traerPedidos().subscribe((d: PedidoKey[]) => {
      this.pedidos = d;
    });

    await this.buscarUsuario();
  }

  private async buscarUsuario() {
    // Obtengo el cliente activo en la base de clientes registrados
    const auxUser = await this.traerUsuarioRegistrado();
    /* .catch(err => {
      alert(err);
    }); */

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.user = auxUser;
      this.esCliente = true;
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo();
      /* .catch(err => {
        alert(err);
      }); */
      if (auxUserAnon) {
        this.user = auxUserAnon;
        this.esCliente = true;
        // console.log('Hay usuario anonimo', auxUserAnon);
      }
    }
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

  public traerMesas() {
    return this.firestore.collection('mesas').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as MesaKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
  }

  public traerReservas() {
    return this.firestore.collection('reservademesas').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as ReservaKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
  }

  public traerPedidos() {
    return this.firestore.collection('pedidos').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as PedidoKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
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
    return this.firestore.collection('anonimos').doc(await this.obtenerUid()).get().toPromise()
      .then((d: DocumentSnapshot<any>) => {
        if (d.exists) {
          const auxReturn: AnonimoKey = d.data() as AnonimoKey;
          auxReturn.key = d.id;
          return auxReturn;
        } else {
          return false;
        }
      });
  }

  private buscarMesa(nroMesa: number) {
    this.mesaAMostrar = this.mesas.find(m => {
      return m.nromesa === nroMesa;
    });
  }

  public doScan() {
    this.scanner.scan(this.opt)
      .then(async (data: BarcodeScanResult) => {
        // console.log('La mesa escaneada es ', data.text);
        const nroMesa: number = parseInt(data.text, 10);
        // Si el numero de mesa es valido
        if (!isNaN(nroMesa)) {
          // Busco la mesa en la db
          this.buscarMesa(nroMesa);
          // Si hay mesa
          if (this.mesaAMostrar !== undefined) {
            // Verifico el tipo de usuario
            if (this.esCliente) {
              // Reviso el estado de la mesa
              if (this.mesaAMostrar.estado === 'libre') {
                // Si la mesa está reservada y ya pasó la hora que figura en la reserva
                if (this.mesaAMostrar.reservada && this.validarHorario()) {
                  // Si el cliente escaneando el qr es el de la reserva, se le da la opción de ocupar la mesa
                  // de lo contrario, solo se informa
                  if (this.reservaAMostrar.correo === this.user.correo) {
                    this.presentAlertClienteConReserva();
                  } else {
                    this.presentAlert(
                      'Estado de mesa',
                      `Mesa: ${this.mesaAMostrar.nromesa}`,
                      `La mesa se encuentra reservada`);
                  }
                } else { // Le mesa no está reservada o está fuera del horario de reserva
                  alert('La mesa NO ESTÁ reservada');
                  if (this.estaEnLista()) { // Si el cliente está en la lista de espera
                    if (this.listaEspera.find(l => l.correo === this.user.correo && l.estado === 'esperandoMesa')) {
                      this.presentAlertCliente();
                    } else {
                      this.presentAlert('¡Error!', `Usted sigue en lista de espera.`, `Debe esperar a que el mozo lo confirme`);
                    }
                  } else { // si el cliente no esta en lista de espera
                    if (this.estaEnMesa()) { // Valido que el cliente NO esté usando otra mesa
                      this.presentAlert('¡Error!', 'Mesa ocupada', 'Usted ya se encuentra ocupando una mesa');
                    } else {
                      this.presentAlert(
                        '¡Error!',
                        'No se encuentra en lista de espera.',
                        'Debe escanear el QR de ingreso al local.');
                    }
                  }
                }
              } else { // Si la mesa esta ocupada
                if (this.mesaAMostrar.cliente === this.user.correo) {
                  // Si el que escanea es el que ocupa la mesa
                  if (this.verificarPedidoEnPreparacion()) {
                    // Si ya hizo un pedido
                    this.presentAlertConPedido();
                  } else { // Si aun no hizo un pedido
                    this.presentAlert(
                      `Mesa: ${this.mesaAMostrar.nromesa}`,
                      'Mesa sin pedido',
                      'Todavía no ha realizado ningún pedido'
                    );
                  }
                } else { // Si el que escanea no es quien ocupa la mesa
                  this.presentAlert(
                    'Estado de mesa',
                    `Mesa: ${this.mesaAMostrar.nromesa}`,
                    `La mesa se encuentra ${this.mesaAMostrar.estado}`);
                }
              }
            } else {
              this.presentAlert(
                'Estado de mesa',
                `Mesa: ${this.mesaAMostrar.nromesa}`,
                `La mesa se encuentra ${this.mesaAMostrar.estado}`);
            }
          } else {
            this.presentAlert('¡Error!', 'Error en la Mesa.', 'El número de la Mesa no es correcto.');
          }
        } else {
          this.presentAlert('¡Error!', 'Error en la Mesa.', 'El número de la Mesa no es correcto.');
        }
      }).catch(err => {
        console.log('Error al escanear el qr', err);
      });
  }

  public presentAlert(header: string, subHeader: string, message: string) {
    this.alertCtrl.create({
      header,
      subHeader,
      message,
      buttons: ['OK']
    }).then(a => { a.present(); });
  }

  public async presentAlertClienteConReserva() {
    this.alertCtrl.create({
      header: 'Estado de mesa',
      subHeader: `Mesa: ${this.mesaAMostrar.nromesa}`,
      message: '¡Bienvenido! Su reserva fue confirmada. ¿Desea ocuparla sla mesa?',
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.ocuparMesaReservada();
          }
        },
        {
          text: 'No',
          handler: () => {
            return true;
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }

  public presentAlertCliente() {
    this.alertCtrl.create({
      header: 'Estado de mesa',
      subHeader: 'Mesa: ' + this.mesaAMostrar.nromesa,
      message: 'La mesa se encuentra libre. ¿Desea ocuparla?',
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.ocuparMesa();
          }
        },
        {
          text: 'No',
          handler: () => {
            return true;
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }

  public presentAlertConPedido() {
    this.alertCtrl.create({
      header: 'Mesa: ' + this.mesaAMostrar.nromesa,
      subHeader: '¿Pedido o encuesta?',
      message: '¿Desea ver el estado de su pedido o acceder a la encuesta de satisfacción?',
      buttons: [
        {
          text: 'Pedido',
          handler: () => {
            this.verPedido();
          }
        },
        {
          text: 'Encuesta',
          handler: () => {
            this.verEncuesta();
          }
        }
      ]
    }).then(alert => { alert.present(); });
  }

  public verPedido() {
    alert('La página de pedido no está implementada');
    /* this.modalCtrl.create({
      component: ModalPedidoPage,// No tengo la página requerida
      componentProps: {
        pedido: this.idPedido,
      }
    }).then(modal => {
      modal.present();
    }); */
  }

  public verEncuesta() {
    this.router.navigate(['/encuesta-cliente']);
  }

  private removerDoc(db: string, key: string) {
    return this.firestore.collection(db).doc(key).delete();
  }

  private eliminoReserva() {
    this.removerDoc('reservademesas', this.reservaAMostrar.key);
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  public ocuparMesa() {
    // Se elimina el cliente de la lista de espera
    const listaEsperakey: string = this.listaEspera.find(l => {
      return l.correo === this.user.correo;
    }).key;
    this.removerDoc('listaEsperaClientes', listaEsperakey);

    // Cambio el estado de la mesa y la asocio al cliente
    this.mesaAMostrar.estado = 'ocupada';
    this.mesaAMostrar.cliente = this.user.correo;
    const mesaKey = this.mesaAMostrar.key;
    const data = this.mesaAMostrar as any;
    delete data.key;
    this.eliminoReserva();
    this.actualizarDoc('mesas', mesaKey, data);
  }

  private ocuparMesaReservada() {
    // Saco al cliente de lista de espera
    const listaEsperakey: string = this.listaEspera.find(l => {
      return l.correo === this.user.correo;
    }).key;
    this.removerDoc('listaEsperaClientes', listaEsperakey);

    // Cambio el estado de la mesa y la asocio al cliente

    this.mesaAMostrar.reservada = false;
    const mesaKey = this.mesaAMostrar.key;
    const data = this.mesaAMostrar as any;
    delete data.key;
    this.eliminoReserva();
    this.actualizarDoc('mesas', mesaKey, data);
  }

  public validarHorario(): boolean {
    this.reservaAMostrar = this.reservas.find(r => r.mesaSeleccionada === this.mesaAMostrar.nromesa);

    if (this.reservaAMostrar === undefined) {
      return false;
    } else {
      const dateReserva = new Date(this.reservaAMostrar.fecha);
      // alert(Date.now() > dateReserva.getTime());
      return Date.now() > dateReserva.getTime();
    }
  }

  public estaEnLista(): boolean {
    if (this.listaEspera.find(l => {
      return l.correo === this.reservaAMostrar.correo;
    })) {
      return true;
    } else {
      return false;
    }
  }

  public estaEnMesa(): boolean {
    if (this.mesas.find(m => {
      return m.cliente === this.user.correo;
    })) {
      return true;
    } else {
      return false;
    }
  }

  private verificarPedidoEnPreparacion(): boolean {
    const arr = this.pedidos.filter(p => {
      return p.mesa === this.mesaAMostrar.nromesa && p.estado !== 'cerrado';
    });

    if (arr !== undefined) {
      this.idPedido = arr[0].key;
      return true;
    } else {
      return false;
    }
  }
}
