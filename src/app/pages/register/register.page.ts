import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/auth.model';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { passwordsMatchValidator, passwordValidator } from 'src/app/core/utils/validators';
import { TranslationService } from 'src/app/core/services/translate.service';
import { Userff } from 'src/app/core/models/userff.model';
import { UserffService } from 'src/app/core/services/impl/userff.service';
import { formatDate } from '@angular/common';
import { RoleManagerService } from 'src/app/core/services/role-manager.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route:ActivatedRoute,
    private authSvc:BaseAuthenticationService,
    private userffSvc: UserffService,
    private roleSvc: RoleManagerService,
    private translationService: TranslationService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authSvc.signUp(this.registerForm.value).subscribe({
        next: (user: User) => {
          // Una vez el usuario se ha registrado exitosamente nos devuelve el uuid y el username
          // Le asignamos predeterminadamente el rol de user para que un administrador busque al usuario y lo haga admin
          // El id no lo puedo ignorar
          let user2: Userff = {
            name: this.name.value,
            surname: this.surname.value,
            email: this.email.value,
            uuid: user.id,
            registerDate: formatDate(new Date(), 'dd/MM/yyyy', 'en'),
            role: 'user',
            id: ''
          }
          this.roleSvc.setRole('user')
          this.userffSvc.add(user2)

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          console.error('Error en el registro:', err);
        },
      });
    } else {
      console.log('Formulario no válido');
    }
  }

  onLogin(){
    this.registerForm.reset();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.router.navigate(['/login'], {queryParams:{ returnUrl:returnUrl}, replaceUrl:true});
  }

  changeLanguage(lang: string) {
    this.translationService.setLanguage(lang);
  }

  get name(){
    return this.registerForm.controls['name'];
  }

  get surname(){
    return this.registerForm.controls['surname'];
  }

  get email(){
    return this.registerForm.controls['email'];
  }

  get password(){
    return this.registerForm.controls['password'];
  }

  get confirmPassword(){
    return this.registerForm.controls['confirmPassword'];
  }

  // Controla la visibilidad de las contraseñas

  showPasswordFirst: boolean = false;
  togglePasswordVisibilityFirst(): void {
    this.showPasswordFirst = !this.showPasswordFirst;
  }

  showPasswordSecond: boolean = false;
  togglePasswordVisibilitySecond(): void {
    this.showPasswordSecond = !this.showPasswordSecond;
  }

}
