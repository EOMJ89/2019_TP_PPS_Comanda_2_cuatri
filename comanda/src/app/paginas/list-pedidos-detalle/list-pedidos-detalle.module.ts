import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ListPedidosDetallePage } from './list-pedidos-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: ListPedidosDetallePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ListPedidosDetallePage]
})
export class ListPedidosDetallePageModule {}
