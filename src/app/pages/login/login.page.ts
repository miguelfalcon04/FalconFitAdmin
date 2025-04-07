import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseAuthenticationService } from 'src/app/core/services/impl/base-authentication.service';
import { UserffService } from 'src/app/core/services/impl/userff.service';
import { TranslationService } from 'src/app/core/services/translate.service';
import { Userff } from '../../core/models/userff.model';
import { User } from 'src/app/core/models/auth.model';
import { RoleManagerService } from '../../core/services/impl/role-manager.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route:ActivatedRoute,
    private authSvc:BaseAuthenticationService,
    private userffSvc: UserffService,
    private translationService: TranslationService,
    private roleSvc: RoleManagerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authSvc.signIn(this.loginForm.value).subscribe({
        next: (user: User)=>{
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

          let user3 = this.userffSvc.getByUuid(user.id).subscribe({
            next: (userffDoc: Userff|null) => {
              if(userffDoc){
                this.roleSvc.setRole(userffDoc.role)
                console.log("Rol de usuario", userffDoc.role)
              }
            }
          })

          this.router.navigateByUrl(returnUrl); // Redirige a la página solicitada
        },
        error: err=>{
          console.log(err);
        }
      });

    } else {
      console.log('Formulario no válido');
    }
  }

  changeLanguage(lang: string) {
    this.translationService.setLanguage(lang);
  }

  onRegister(){
    this.loginForm.reset();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.router.navigate(['/register'], {queryParams:{ returnUrl:returnUrl}, replaceUrl:true});
  }

  get email(){
    return this.loginForm.controls['email'];
  }

  get password(){
    return this.loginForm.controls['password'];
  }

  // Controla la visibilidad de la contraseñas
  showPasswordFirst: boolean = false;
  togglePasswordVisibilityFirst(): void {
    this.showPasswordFirst = !this.showPasswordFirst;
  }
}
