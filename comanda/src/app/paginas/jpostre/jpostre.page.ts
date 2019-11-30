import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-jpostre',
  templateUrl: './jpostre.page.html',
  styleUrls: ['./jpostre.page.scss'],
})
export class JpostrePage implements OnInit {

  /*public card1: boolean = true;
  public card2: boolean = true;
  public card3: boolean = true;
  public myClass: boolean;

  voltear(card: number){
    
    switch (card) {
      case 1:
        this.myClass = this.card1;
        break;
      case 2:
        this.myClass = this.card2;
        break;
      case 3:
        this.myClass = this.card3;
        break;
    }

    if (this.myClass === true) {
      this.myClass = false;
    }else {
      this.myClass = true;
    }

    switch (card) {
      case 1:
        this.card1 = this.myClass;
        break;
      case 2:
        this.card2 = this.myClass;
        break;
      case 3:
        this.card3 = this.myClass;
        break;
    }
  }*/
 

  private images = [
    { id: 1, url: '/assets/juegos/cardSad.png' },
    { id: 2, url: '/assets/juegos/cardSad.png' },
    { id: 3, url: '/assets/juegos/cardFlan.png' },
    { id: 4, url: '/assets/juegos/cardAlmen.png' }
  ];
  public imagesInact = '/assets/juegos/card.png';
  public cards: Array<any>;
  private lastSelectId;
  private aciertos = 4;
  private countAciertos: number;
  public contIntentos: number;
  public msgResultado: string;

  constructor() {
  }

  ngOnInit() {
    this.IniciarJuego();
  }

  public IniciarJuego() {
    this.cards = [];
    this.lastSelectId = null;
    this.countAciertos = 0;
    this.contIntentos = 0;
    this.msgResultado = '';
    let countIndex = 0;

    for (let i = 0; i < this.aciertos * 2; i++) {
      if (countIndex === this.aciertos) {
        countIndex = 0;
      }

      const img = this.images[countIndex];

      this.cards.push({
        id: img.id,
        url: img.url,
        visible: false, // si la imagen se muestra
        active: true // seleccionable
      });
      countIndex++;
    }
    this.RandomArray(this.cards);
  }
  public intentos = 0;
  public CardSelected(idx) {
    

    if (this.intentos >= 3 ) {
      console.log("listo");
      localStorage.setItem("postre", "true");
    } else {
      this.intentos++;
      if (!this.cards[idx].active) {
        return;
      }
      this.cards[idx].visible = true;
  
      if (this.lastSelectId == null) {
        this.lastSelectId = idx;
        this.cards[idx].visible = true;
        this.cards[idx].active = false;
      } else {
        if (this.cards[this.lastSelectId].id === this.cards[idx].id && (this.cards[idx].id === 3 || this.cards[idx].id === 4) ) {
          // Si coinciden, se aumentan los aciertos
          console.log("ganaste");
          localStorage.setItem("postre", "true");
          this.countAciertos = this.countAciertos + 1;
          this.cards[idx].visible = true;
          this.cards[idx].active = false;
          this.lastSelectId = null;
        } else {
          // Si no hacen pareja, oculto las cartas luego de esperar medio segundo
          setTimeout(() => {
            this.cards[this.lastSelectId].visible = false; // Ocultar
            this.cards[this.lastSelectId].active = true; // Activar
            this.cards[idx].visible = false;
            this.lastSelectId = null;
          }, 0.5 * 1000);
  
        }
      }
      if (this.aciertos === this.countAciertos) {
        this.msgResultado = 'Juego terminado en ' + this.contIntentos + ' intento/s.';
        // console.log(this.msgResultado);
      }
      this.contIntentos++;
    }
    
  }

  RandomArray(array) {
    let currentIndex = array.length;
    let randomIndex;
    let temporaryValue;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
