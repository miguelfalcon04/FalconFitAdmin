import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, lastValueFrom, Observable, filter } from 'rxjs';
import { Paginated } from 'src/app/core/models/paginated.model';
import { Userff } from 'src/app/core/models/userff.model';
import { USERFF_COLLECTION_SUBSCRIPTION_TOKEN } from 'src/app/core/repositories/repository.tokens';
import { BaseMediaService } from 'src/app/core/services/impl/base-media.service';
import { UserffService } from 'src/app/core/services/impl/userff.service';
import { CollectionChange, ICollectionSubscription } from 'src/app/core/services/interfaces/collection-subscription.interface';
import { UserFormComponent } from 'src/app/shared/components/user-form/user-form.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {
  _users: BehaviorSubject<Userff[]> = new BehaviorSubject<Userff[]>([]);
  users: Observable<Userff[]> = this._users.asObservable();

  private loadedIds: Set<string> = new Set();

  // Cambiamos searchedUser a un BehaviorSubject
  _searchedUsers: BehaviorSubject<Userff[]> = new BehaviorSubject<Userff[]>([]);
  searchedUsers: Observable<Userff[]> = this._searchedUsers.asObservable();

  // Añadimos un término de búsqueda
  searchTerm: string = '';

  constructor(
    private userSvc: UserffService,
    private mediaService: BaseMediaService,
    private modalCtrl: ModalController,
    private router: Router,
    @Inject(USERFF_COLLECTION_SUBSCRIPTION_TOKEN)
    private userSubscription: ICollectionSubscription<Userff>
  ) {
  }

  ngOnInit() {
    this.loadUsers()

    this.users.subscribe(users => {
      this._searchedUsers.next(users);
    });

    this.userSubscription.subscribe('userffs').subscribe((change: CollectionChange<Userff>) =>{
      const currentUsers = [...this._users.value];

      // Solo procesar cambios de documentos que ya tenemos cargados
      if (!this.loadedIds.has(change.id) && change.type !== 'added') {
        return;
      }
      switch(change.type) {
        case 'added':
        case 'modified':
          const index = currentUsers.findIndex(p => p.id === change.id);
          if (index >= 0) {
            currentUsers[index] = change.data!;
          }
        break;

        case 'removed':
          const removeIndex = currentUsers.findIndex(p => p.id === change.id);
          if (removeIndex >= 0) {
            currentUsers.splice(removeIndex, 1);
            this.loadedIds.delete(change.id);
          }
        break;
      }

      this._users.next(currentUsers);
    });
  }

  selectedPerson: any = null;
  isAnimating = false;
  page:number = 1;
  pageSize:number = 25;
  pages:number = 0;
  totalPages!: number;

  loadUsers(){
    this.page=1;
    this.userSvc.getAll(this.page, this.pageSize).subscribe({
      next:(response:Paginated<Userff>)=>{
        response.data.forEach(user => this.loadedIds.add(user.id))
        this._users.next([...response.data]);
        this.page++;
        this.pages = response.pages;
      }
    });
  }

  loadMoreUsers(notify:HTMLIonInfiniteScrollElement | null = null) {
    if(this.page<=this.pages){
      this.userSvc.getAll(this.page, this.pageSize).subscribe({
        next:(response:Paginated<Userff>)=>{
          response.data.forEach(machine => this.loadedIds.add(machine.id))
          this._users.next([...this._users.value, ...response.data]);
          this.page++;
          notify?.complete();
        }
      });
    }
    else{
      notify?.complete();
    }
  }

  refresh(){
    this.userSvc.getAll(1, (this.page - 1) * this.pageSize).subscribe({
      next:(response:Paginated<Userff>)=>{
        this.totalPages = response.pages;
        this._users.next(response.data);
      }
    });
  }

  async updateUserRole(user: Userff) {
        const modal = await this.modalCtrl.create({
          component: UserFormComponent,
          componentProps: {
            role: user.role,
            user: user,
            groups: await lastValueFrom(this.userSvc.getAll()),
          }
        })

        modal.onDidDismiss().then(async (data:any)=>{
          let userUpdate:Userff
          if(data.data.picture){
            // Convertir base64 a blob
            const base64Response = await fetch(data.data.picture);
            const blob = await base64Response.blob();

            // Subir imagen
            const uploadedUrls = await lastValueFrom(this.mediaService.upload(blob));
            const imageUrls = uploadedUrls.map(url => url.toString());
            userUpdate = {
              name: data.data.name,
              surname: data.data.surname,
              picture: {
                url: imageUrls[0],
                large: imageUrls[0],
                medium: imageUrls[0],
                small: imageUrls[0],
                thumbnail: imageUrls[0]
              },
              email: data.data.email,
              uuid: data.data.surname,
              role: data.data.role,
              registerDate: data.data.registerDate,
              phoneNumber: data.data.phoneNumber,
              id: ''
            }
          }else{
            userUpdate = {
              id: '',
              name: data.data.name,
              surname: data.data.surname,
              email: data.data.email,
              uuid: data.data.surname,
              role: data.data.role,
              registerDate: data.data.registerDate,
              phoneNumber: data.data.phoneNumber,
            }
          }

          this.userSvc.update(user!.id, userUpdate).subscribe({
            next:(response: Userff) => {
              this.refresh();
            }
          })
        })

        await modal.present();
  }

  searchUser(event: any) {
    // Obtengo la busqueda
    this.searchTerm = event.detail.value ? event.detail.value.toLowerCase() : '';

    this.users.subscribe(users => {
      if (!this.searchTerm) {
        // Si no hay busqueda muestro todos los usuarios
        this._searchedUsers.next(users);
      } else {
        // Cojo los usuario que en su nombre apellido o email incluya la busqueda
        const filteredUsers = users.filter(user => {
          return (
            user.name?.toLowerCase().includes(this.searchTerm) ||
            user.surname?.toLowerCase().includes(this.searchTerm) ||
            user.email?.toLowerCase().includes(this.searchTerm)
          );
        });
        this._searchedUsers.next(filteredUsers);
      }
    });
  }
}
