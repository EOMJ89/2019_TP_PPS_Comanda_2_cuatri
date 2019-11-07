import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { Empleado } from '../../clases/empleado';
import { CajaSonido } from '../../clases/cajaSonido';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { ClienteKey, ClienteAConfirmarKey } from 'src/app/clases/cliente';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  correo: string;
  clave: string;
  cajaSonido: CajaSonido = new CajaSonido();

  constructor(private authService: AuthService, public router: Router, private firestore: AngularFirestore) {
    this.correo = "";
    this.clave = "";
  }

  ngOnInit() {
  }

  private traerUsuarioAConfirmar(correo: string): Promise<false | ClienteAConfirmarKey> {
    return this.firestore.collection('clientes-confirmar').ref.where('correo', '==', correo).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return false;
        } else {
          const auxReturn: ClienteAConfirmarKey = d.docs[0].data() as ClienteAConfirmarKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  async onSumitLogin() {
    const user = await this.traerUsuarioAConfirmar(this.correo);
    if (user !== false) {
      alert("El cliente no ha sido confirmado.");
      this.correo = "";
      this.clave = "";
    } else {
      this.authService.Login(this.correo, this.clave).then(async (res) => {
        this.router.navigate(['/inicio']);
        this.cajaSonido.ReproducirGuardar();
        this.correo = "";
        this.clave = "";
      }).catch(err => {
        alert("los datos son incorrectos o no existen");
      }
      );
    }
  }

  ingresoAuto(tipo: string) {
    if (tipo == "dueño") {
      this.correo = "duenio@duenio.com";
      this.clave = "000000";
    }
    else if (tipo == "supervisor") {
      this.correo = "supervisor@supervisor.com";
      this.clave = "111111";
    }
    else if (tipo == "mozo") {
      this.correo = "mozo@mozo.com";
      this.clave = "222222";
    }
    else if (tipo == "bartender") {
      this.correo = "bartender@bartender.com";
      this.clave = "333333";
    }
    else if (tipo == "candybar") {
      this.correo = "candybar@candybar.com";
      this.clave = "444444";
    }
    else if (tipo == "camarero") {
      this.correo = "camarero@camarero.com";
      this.clave = "555555";
    }
    else if (tipo == "cliente") {
      this.correo = "cliente@cliente.com";
      this.clave = "666666";
    }
    else if (tipo == "anonimo") {
      this.correo = "anonimo@anonimo.com";
      this.clave = "777777";
    }
    this.onSumitLogin();
  }

}
