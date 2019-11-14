import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ConfirmarEntregaMozoPage } from './confirmar-entrega-mozo.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmarEntregaMozoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ConfirmarEntregaMozoPage]
})
export class ConfirmarEntregaMozoPageModule {}
