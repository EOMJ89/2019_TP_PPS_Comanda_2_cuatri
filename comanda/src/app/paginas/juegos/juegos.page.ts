import { Component, OnInit } from '@angular/core';
//import { ModalService } from "../../servicios/modal.service";
//import { Jugador } from '../../clases/jugador';
//import { PptService } from '../../servicios/ppt.service';
import { map } from 'rxjs/operators';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

declare var $: any;

@Component({
  selector: 'app-juegos',
  templateUrl: './juegos.page.html',
  styleUrls: ['./juegos.page.scss'],
})
export class JuegosPage implements OnInit {

  elecJug: string = "vacio.png";
  elecCPU: string = "ppt.gif";

  //Para guardar puntaje #PUNTAJE
  submitted = false;
  perdidas: number;
  ganadas: number;
  jugadores: any;
  lista: any;
  array: any[];

  marcaJ: number = 0;
  marcaCPU: number = 0;

  resultado: string = "";

  modalText: string;

  constructor() { }

  ngOnInit() {
  
    
  }

  

  openModal(id: string) {
    //this.modalService.open(id);
  }

  closeModal(id: string) {
    //this.modalService.close(id);
  }

  playAgain(){
    //location.href = "/ppt";
  }

  irAHome(){
    //location.href = "/home";
  }

  verPuntajes(){
    //location.href = "/puntaje";
  }

  Elegir(x){
    //this.updateJugador('-LpOTyoLSldlZeqKsIIK', { ganadas: 0 })
    document.getElementById("empate").style.display = "none";
    //var fileName = "";
    
    if (x == 1) {
      this.elecJug = "piedra1.png";
    } else if (x == 2) {
      this.elecJug = "papel1.png";
    } else {
      this.elecJug = "tijera1.png";
    }
     
    var y = Math.floor(Math.random() * (4 - 1) + 1);
    console.log(y);
    if (y == 1) {
      this.elecCPU = "piedra1.png";
    } else if (y == 2) {
      this.elecCPU = "papel1.png";
    } else {
      this.elecCPU = "tijera1.png";
    }

    if ( (x == 1 && y == 2) || (x == 2 && y == 3) || (x == 3 && y == 1) ) {
      //document.getElementById("")
      this.marcaCPU ++;
    } else if ((y == 1 && x == 2) || (y == 2 && x == 3) || (y == 3 && x == 1)) {
      this.marcaJ ++;
    } else {
      document.getElementById("empate").style.display = "block";
    }

    if (this.marcaJ == 5) {
      
      this.modalText = "GANASTE!!";
      this.openModal('custom-modal-1');
      //this.ganadas ++;//#PUNTAJE
      //this.newJugador();
      //this.save();
      //var lista = this.getJugadoresList();
      //console.log(lala);
      //this.getJugadores();
      //this.existe("admin1@gmail.com"); 


      

    } else if(this.marcaCPU == 5) {

      //this.modalText = "PERDISTE!!";
      //this.openModal('custom-modal-1');
      //this.perdidas ++;//#PUNTAJE
      //this.newJugador();
      //this.save();
      //var lista = this.getJugadoresList();
      //console.log(lala);
      //this.getJugadores();  SE INTENTA HACE ANTES
      //this.existe("admin1@gmail.com"); 
    }

  }//fin Elegir
  
 
 
  onSubmit() {
    this.submitted = true;
    //this.save();
  }
}
