import { NgModule } from '@angular/core';

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

const MaterialModules = [
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatButtonToggleModule,
  MatProgressSpinnerModule,
]

@NgModule({
  imports: MaterialModules,
  exports: MaterialModules
})
export class MaterialModule {}
