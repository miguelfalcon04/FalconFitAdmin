import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MachinePage } from './machine.page';
import { MachinePageRoutingModule } from './machine-routing.module';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/components/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MachinePageRoutingModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  declarations: [MachinePage]
})
export class MachinePageModule {}
