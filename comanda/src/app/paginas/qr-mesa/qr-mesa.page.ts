import { Component, OnInit } from '@angular/core';
import { BarcodeScannerOptions, BarcodeScanner, BarcodeScanResult } from '@ionic-native/barcode-scanner/ngx';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { MesaKey } from 'src/app/clases/mesa';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

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

  constructor(
    private firestore: AngularFirestore,
    private scanner: BarcodeScanner,
    private auth: AngularFireAuth,
    private alertCtrl: AlertController,
  ) { }

  async ngOnInit() {
    this.traerMesas().subscribe((d: MesaKey[]) => {
      // console.log('Tengo las mesas', d);
      this.mesas = d;
    });

    await this.buscarUsuario();
  }

  private async buscarUsuario() {
    // Obtengo el cliente activo en la base de clientes registrados
    const auxUser = await this.traerUsuarioRegistrado()
      .catch(err => {
        alert(err);
      });

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.esCliente = true;
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo()
        .catch(err => {
          alert(err);
        });
      if (auxUserAnon) {
        this.esCliente = true;
        // console.log('Hay usuario anonimo', auxUserAnon);
      }
    }
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
        if (!isNaN(nroMesa)) {
          this.buscarMesa(nroMesa);
          if (this.mesaAMostrar !== undefined) {
            if (this.esCliente) {
              // Cosas del cliente
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
}
