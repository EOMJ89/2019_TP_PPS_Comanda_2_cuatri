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
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
