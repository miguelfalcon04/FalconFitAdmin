import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { Userff } from 'src/app/core/models/userff.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent  implements OnInit {
  formGroup: FormGroup
  isMobile: boolean = false;

  @Input() set user(_user: Userff){
    if(_user && _user.id){
      this.formGroup.controls['name'].setValue(_user.name)
      this.formGroup.controls['surname'].setValue(_user.surname)
      this.formGroup.controls['email'].setValue(_user.email)
      this.formGroup.controls['role'].setValue(_user.role)
    }
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private platform: Platform
  ) {
    this.formGroup = this.fb.group({
      name:['', [Validators.required, Validators.minLength(3)]],
      surname:['', [Validators.required, Validators.minLength(3)]],
      email:['', [Validators.required, Validators.maxLength(500)]],
      role:['', [Validators.required, Validators.maxLength(500)]],
    })
  }

  ngOnInit() {}

  getDirtyValues(formGroup: FormGroup): any {
    const dirtyValues: any = {};

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control?.dirty) {
        dirtyValues[key] = control.value;
      }
    });

    return dirtyValues;
  }

  onSubmit(){
    if (this.formGroup.valid) {
      this.modalCtrl.dismiss(
        this.formGroup.value,
        this.getDirtyValues(this.formGroup)
      );
    } else {
      console.log('Formulario inválido');
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

}
