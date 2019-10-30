import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: './paginas/login/login.module#LoginPageModule'
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
    loadChildren: './paginas/inicio/inicio.module#InicioPageModule'
  },
  { path: 'abm-mesa', loadChildren: './paginas/abm-mesa/abm-mesa.module#AbmMesaPageModule' },
  { path: 'abm-producto', loadChildren: './paginas/abm-producto/abm-producto.module#AbmProductoPageModule' },
  { path: 'encuesta-cliente', loadChildren: './paginas/encuesta-cliente/encuesta-cliente.module#EncuestaClientePageModule' },
  { path: 'encuesta-empleado', loadChildren: './paginas/encuesta-empleado/encuesta-empleado.module#EncuestaEmpleadoPageModule' },
  { path: 'encuesta-sup', loadChildren: './paginas/encuesta-sup/encuesta-sup.module#EncuestaSupPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
