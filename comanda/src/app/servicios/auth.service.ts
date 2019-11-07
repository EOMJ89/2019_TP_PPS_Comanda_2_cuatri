import { Injectable } from  '@angular/core';
import { Router } from  "@angular/router";
import { AngularFireAuth } from  "@angular/fire/auth";
import { User } from  'firebase';

import { AngularFirestore }  from '@angular/fire/firestore';

//clases
import { Empleado } from '../clases/empleado';
import { Cliente } from '../clases/cliente';
import { Anonimo } from '../clases/anonimo';
import { CajaSonido } from '../clases/cajaSonido';
import * as firebase from "firebase/app";


var config = {apiKey: "AIzaSyB641BDR9fQ_TDKpGdQOuQa46ZNQiALoIM",
    authDomain: "comanda-2019-comicon.firebaseapp.com",
    databaseURL: "https://comanda-2019-comicon.firebaseio.com"};
var secondaryApp = firebase.initializeApp(config, "Secondary");

@Injectable({
    providedIn:  'root'
})
export  class  AuthService
{
  user: User;
  public cajaSonido:CajaSonido = new CajaSonido();
  
  constructor(public  afAuth:AngularFireAuth, public  router:  Router, private db:AngularFirestore)
  {
    this.afAuth.authState.subscribe(user => {
      if (user)
      {
        this.user = user;
        localStorage.setItem('usuario', JSON.stringify(this.user));
      } else {
        localStorage.setItem('usuario', null);
      }
    })
  }

  /*
    *permite guardar un usuario del tipo empleado en firebase a travez de un correo y contraseña
     guarda sus datos en bases de datos llamado 'empleados'.
    @usuario : el empleado que se quiere guardar posee correo.
    @clave : la contraseña empleada para el acceso a firebase.
  */
  RegistrarEmpleado(usuario:Empleado,clave:string)
  {
    return new Promise ((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(usuario.correo,clave).then(res =>{
        const uid = res.user.uid;
        this.db.collection('empleados').doc(res.user.uid).set({
          correo: usuario.correo,
          nombre : usuario.nombre,
          apellido : usuario.apellido,
          DNI : usuario.DNI,
          CUIL : usuario.CUIL,
          foto : usuario.foto,
          tipo : usuario.tipo
        })
        resolve(res)
      }).catch( err => reject(err))
    })
  }

  /*
    *permite guardar un usuario del tipo cliente en firebase a travez de un correo y contraseña
     guarda sus datos en bases de datos llamado 'clientes'.
    @usuario : el cliente que se quiere guardar, posee correo.
    @clave : la contraseña empleada para el acceso a firebase.
  */
  RegistrarCliente(usuario:Cliente,clave:string)
  {
    return new Promise ((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(usuario.correo,clave).then(res =>{
        const uid = res.user.uid;
        this.db.collection('clientes').doc(res.user.uid).set({
          correo: usuario.correo,
          nombre : usuario.nombre,
          apellido : usuario.apellido,
          DNI : usuario.DNI,
          foto : usuario.foto,
          confirmado : usuario.confirmado
        })
        resolve(res)
      }).catch( err => reject(err))
    })
  }

  /*
    *permite guardar un usuario del tipo anonimo en firebase a travez de un correo y contraseña
     guarda sus datos en bases de datos llamado 'anonimos'.
    @usuario : el cliente que se quiere guardar, posee correo.
    @clave : la contraseña empleada para el acceso a firebase.
  */
  RegistrarAnonimo(usuario:Anonimo,clave:string)
  {
    return new Promise ((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(usuario.correo,clave).then(res =>{
        const uid = res.user.uid;
        this.db.collection('anonimos').doc(res.user.uid).set({
          correo: usuario.correo,
          nombre : usuario.nombre,
          foto : usuario.foto
        })
        resolve(res)
      }).catch( err => reject(err))
    })
  }

  /*
    *permite acceder a travez de un correo y clave guardada en firebase.
    @correo : correo personal del usuario que quiere ingresar
    @clave : contraseña empleada para el asceso a firebase
  */
  async  Login(correo:string,clave:string)
  {
    try
   {
        await this.afAuth.auth.signInWithEmailAndPassword(correo, clave);
        // this.router.navigate(['inicio']);
    } catch (e)
    {
        alert("Error!"  +  e.message);
    }
  }

  /*
    *permite desloguearse y borra los datos en el localstorage.
  */
  async Logout()
  {
    this.cajaSonido.ReproducirGuardar();
    await this.afAuth.auth.signOut();
    localStorage.removeItem('usuario');
    this.router.navigate(['login']);
  }

}
