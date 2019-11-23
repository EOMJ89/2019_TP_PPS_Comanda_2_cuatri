import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';

import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
// clases
import { Empleado, EmpleadoKey } from '../clases/empleado';
import { Cliente, ClienteAConfirmar, ClienteKey } from '../clases/cliente';
import { Anonimo, AnonimoKey } from '../clases/anonimo';
import { CajaSonido } from '../clases/cajaSonido';
import * as firebase from 'firebase/app';


const config = {
  apiKey: 'AIzaSyB641BDR9fQ_TDKpGdQOuQa46ZNQiALoIM',
  authDomain: 'comanda-2019-comicon.firebaseapp.com',
  databaseURL: 'https://comanda-2019-comicon.firebaseio.com',
  projectId: 'comanda-2019-comicon',
  storageBucket: 'comanda-2019-comicon.appspot.com',
  messagingSenderId: '940906657827',
  appId: '1:940906657827:web:f6775954d4970b16d41996',
  measurementId: 'G-2Q085VK4YY'
};
const secondaryApp = firebase.initializeApp(config, 'Secondary');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // public user: User;
  public cajaSonido: CajaSonido = new CajaSonido();
  // tslint:disable: variable-name
  private _user: ClienteKey | AnonimoKey | EmpleadoKey = null;
  private _tipoUser = '';

  constructor(
    public afAuth: AngularFireAuth,
    public router: Router,
    private db: AngularFirestore) {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        await this.buscarUsuario();
      }
    });
    /* this.afAuth.authState.subscribe(user => {
       if (user) {
         this.user = user;
        localStorage.setItem('usuario', JSON.stringify(this.user));
      } else {
        localStorage.setItem('usuario', null);
      }
    }); */
  }

  public get user(): ClienteKey | AnonimoKey | EmpleadoKey {
    return this._user;
  }

  public get tipoUser(): string {
    // console.log(this._tipoUser);
    return this._tipoUser;
  }


  //#region ObtenerUsuario
  private obtenerUsername() {
    return this.afAuth.auth.currentUser.email;
  }

  private async traerClienteRegistrado(): Promise<null | ClienteKey> {
    return this.db.collection('clientes').ref.where('correo', '==', await this.obtenerUsername()).get()
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
    return this.afAuth.auth.currentUser.uid;
  }

  private async traerClienteAnonimo(): Promise<null | AnonimoKey> {
    return this.db.collection('anonimos').doc(await this.obtenerUid()).get().toPromise()
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
    return this.db.collection('empleados').ref.where('correo', '==', await this.obtenerUsername()).get()
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

  public async buscarUsuario() {
    this._tipoUser = '';

    // Obtengo el cliente activo en la base de clientes registrados
    const auxCliente: void | ClienteKey = await this.traerClienteRegistrado()
      .catch(err => {
        console.log(err);
      });

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxCliente !== null) {
      this._tipoUser = 'cliente';
      this._user = auxCliente as ClienteKey;
      // console.log('Hay cliente registrado', auxCliente);
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxClienteAnon: void | AnonimoKey = await this.traerClienteAnonimo()
        .catch(err => {
          console.log(err);
        });

      if (auxClienteAnon !== null) {
        this._tipoUser = 'anonimo';
        this._user = auxClienteAnon as AnonimoKey;
        // console.log('Hay usuario anonimo', auxClienteAnon);
      } else {
        const auxEmpleado: void | EmpleadoKey = await this.traerEmpleado()
          .catch(err => {
            console.log(err);
          });

        if (auxEmpleado !== null) {
          this._tipoUser = (auxEmpleado as EmpleadoKey).tipo;
          this._user = auxEmpleado as EmpleadoKey;

          // console.log('Hay empleado', auxEmpleado);
        } else {
          console.log('Error, no hay usuario idenfiticable');
          this.Logout();
        }
      }
    }

    // console.log(this.user);
    console.log(this.tipoUser);
  }
  //#endregion

  /*
    *permite guardar un usuario del tipo empleado en firebase a travez de un correo y contraseña
     guarda sus datos en bases de datos llamado 'empleados'.
    @usuario : el empleado que se quiere guardar posee correo.
    @clave : la contraseña empleada para el acceso a firebase.
  */
  RegistrarEmpleado(usuario: Empleado, clave: string) {
    return new Promise((resolve, reject) => {
      secondaryApp.auth().createUserWithEmailAndPassword(usuario.correo, clave).then(res => {
        this.db.collection('empleados').doc(res.user.uid).set({
          correo: usuario.correo,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          DNI: usuario.DNI,
          CUIL: usuario.CUIL,
          foto: usuario.foto,
          tipo: usuario.tipo
        }).then(() => {
          secondaryApp.auth().signOut();
        });
        resolve(res);
      }).catch(err => reject(err));
    });
  }

  /*
    *permite guardar un usuario del tipo cliente en firebase a travez de un correo y contraseña
     guarda sus datos en bases de datos llamado 'clientes'.
    @usuario : el cliente que se quiere guardar, posee correo.
    @clave : la contraseña empleada para el acceso a firebase.
  */
  RegistrarClienteConfirmado(usuario: Cliente, clave: string) {
    return new Promise((resolve, reject) => {
      secondaryApp.auth().createUserWithEmailAndPassword(usuario.correo, clave).then(res => {
        this.db.collection('clientes').doc(res.user.uid).set({
          correo: usuario.correo,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          DNI: usuario.DNI,
          foto: usuario.foto,
        }).then(() => {
          secondaryApp.auth().signOut();
        }).catch(err => {
          console.log(err);
        });
        resolve(res);
      }).catch(err => { reject(err); });
    });
  }

  /*
   *permite guardar un usuario del tipo cliente en una base provisional de firebase a travez de un correo y contraseña
    guarda sus datos en bases de datos llamado 'clientes-confirmar'.
   @usuario : el cliente que se quiere guardar, posee correo.
   @clave : la contraseña empleada para el acceso a firebase.
 */
  RegistrarCliente(usuario: Cliente, clave: string) {
    const d: ClienteAConfirmar = usuario as ClienteAConfirmar;
    d.clave = clave;
    return this.db.collection('clientes-confirmar').add({
      DNI: d.DNI,
      apellido: d.apellido,
      clave: d.clave,
      correo: d.correo,
      foto: d.foto,
      nombre: d.nombre,
    });
  }

  /*
    *permite guardar un usuario del tipo anonimo en firebase a travez de un correo y contraseña
     guarda sus datos en bases de datos llamado 'anonimos'.
    @usuario : el cliente que se quiere guardar, posee correo.
    @clave : la contraseña empleada para el acceso a firebase.
  */
  RegistrarAnonimo(usuario: Anonimo, clave: string) {
    return new Promise((resolve, reject) => {
      secondaryApp.auth().createUserWithEmailAndPassword(usuario.correo, clave).then(res => {
        this.db.collection('anonimos').doc(res.user.uid).set({
          correo: usuario.correo,
          nombre: usuario.nombre,
          foto: usuario.foto,
          clave,
        }).then(() => {
          secondaryApp.auth().signOut();
        });
        resolve(res);
      }).catch(err => reject(err));
    });
  }

  /*
    *permite acceder a travez de un correo y clave guardada en firebase.
    @correo : correo personal del usuario que quiere ingresar
    @clave : contraseña empleada para el asceso a firebase
  */
  async  Login(correo: string, clave: string) {
    try {
      await this.afAuth.auth.signInWithEmailAndPassword(correo, clave);
      // this.router.navigate(['inicio']);
    } catch (e) {
      console.log('Error!', e);
    }
  }

  /*
    *permite desloguearse y borra los datos en el localstorage.
  */
  async Logout() {
    this.cajaSonido.ReproducirGuardar();
    await this.afAuth.auth.signOut().then(() => {
      this._user = null;
      this._tipoUser = '';
    });
    // localStorage.removeItem('usuario');
    this.router.navigate(['login']);
  }

}
