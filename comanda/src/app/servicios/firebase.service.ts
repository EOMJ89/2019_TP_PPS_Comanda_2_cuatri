import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from '../servicios/auth.service';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import * as firebase from "firebase";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // tslint:disable: variable-name
  constructor(
    private _db: AngularFirestore,
    private _storage: AngularFireStorage,
    //private _authServ: AuthService
    ) { }

    getItems(nombreReferencia: string) {
      return new Promise<any>((resolve, reject) => {
        let ref = firebase.database().ref(nombreReferencia + '/');
        console.log(ref);
        ref.on('value', resp => {
          resolve(this.snapshotToArray(resp));
        });
      });
    }

    addItem(nombreReferencia: string, objeto: any) {
      let ref = firebase.database().ref(nombreReferencia + '/');
      let newItem = ref.push();
      newItem.set(objeto);
    }
    updateItem(nombreReferencia: string, key: string, objeto: any) {
      firebase.database().ref(nombreReferencia + '/' + key).update(objeto);
    }

    removeItem(nombreReferencia: string, key: string) {
      firebase.database().ref(nombreReferencia + '/' + key).remove();
    }

    snapshotToArray = snapshot => {
      let returnArray = [];
      snapshot.forEach(element => {
        let item = element.val();
        item.key = element.key;
        returnArray.push(item);
      });
  
      return returnArray;
    }
    
    
  public traertodos(db: string) {
    return this._db.collection(db);
  }

  public actualizar(db: string, id: string, data: any) {
    return this._db.collection(db).doc(id).update(data);
  }

  public agregar(db: string, data: any) {
    return this._db.collection(db).add(data);
  }

  public subirArchivo(picName, pictureAux) {
    const selfieRef = this._storage.storage.ref(picName);

    return selfieRef.putString(pictureAux, 'base64', { contentType: 'image/jpeg' });
  }
}

