import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';
import { AuthLoginGuard } from './guards/auth-login/auth-login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './paginas/login/login.module#LoginPageModule',
    canActivate: [AuthLoginGuard]
  },
  {
    path: 'registro-empleado',
    loadChildren: './paginas/registro-empleado/registro-empleado.module#RegistroEmpleadoPageModule'
  },
  {
    path: 'registro-cliente',
    loadChildren: './paginas/registro-cliente/registro-cliente.module#RegistroClientePageModule'
  },
  {
    path: 'inicio',
    loadChildren: './paginas/inicio/inicio.module#InicioPageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'abm-mesa',
    loadChildren: './paginas/abm-mesa/abm-mesa.module#AbmMesaPageModule'
  },
  {
    path: 'abm-producto',
    loadChildren: './paginas/abm-producto/abm-producto.module#AbmProductoPageModule'
  },
  {
    path: 'encuesta-cliente',
    loadChildren: './paginas/encuesta-cliente/encuesta-cliente.module#EncuestaClientePageModule'
  },
  {
    path: 'encuesta-empleado',
    loadChildren: './paginas/encuesta-empleado/encuesta-empleado.module#EncuestaEmpleadoPageModule'
  },
  {
    path: 'encuesta-sup',
    loadChildren: './paginas/encuesta-sup/encuesta-sup.module#EncuestaSupPageModule'
  },
  {
    path: 'modal-encuesta',
    loadChildren: './paginas/modal-encuesta/modal-encuesta.module#ModalEncuestaPageModule'
  },
  {
    path: 'qr-ingreso-local',
    loadChildren: './paginas/qr-ingreso-local/qr-ingreso-local.module#QrIngresoLocalPageModule'
  },
  {
    path: 'list-confirmar-cliente-mesa',
    loadChildren: './paginas/list-confirmar-cliente-mesa/list-confirmar-cliente-mesa.module#ListConfirmarClienteMesaPageModule'
  },
  {
    path: 'qr-mesa',
    loadChildren: './paginas/qr-mesa/qr-mesa.module#QrMesaPageModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'list-confirmar-cliente-alta',
    loadChildren: './paginas/list-confirmar-cliente-alta/list-confirmar-cliente-alta.module#ListConfirmarClienteAltaPageModule'
  },
  {
    path: 'generar-pedido',
    loadChildren: './paginas/generar-pedido/generar-pedido.module#GenerarPedidoPageModule'
  },
  {
    path: 'modal-pedido',
    loadChildren: './paginas/modal-pedido/modal-pedido.module#ModalPedidoPageModule'
  },
  {
    path: 'juegos',
    loadChildren: './paginas/juegos/juegos.module#JuegosPageModule'
  },
  {
    path: 'list-confirmar-pedido',
    loadChildren: './paginas/list-confirmar-pedido/list-confirmar-pedido.module#ListConfirmarPedidoPageModule'
  },
  {
    path: 'confirmar-entrega',
    loadChildren: './paginas/confirmar-entrega/confirmar-entrega.module#ConfirmarEntregaPageModule'
  },
  {
    path: 'confirmar-cierre-mesa',
    loadChildren: './paginas/confirmar-cierre-mesa/confirmar-cierre-mesa.module#ConfirmarCierreMesaPageModule'
  },
  {
    path: 'confirmar-entrega-mozo',
    loadChildren: './paginas/confirmar-entrega-mozo/confirmar-entrega-mozo.module#ConfirmarEntregaMozoPageModule'
  },
  {
    path: 'modal-cliente',
    loadChildren: './paginas/modal-cliente/modal-cliente.module#ModalClientePageModule'
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
