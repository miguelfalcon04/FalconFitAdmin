import { Component, OnDestroy, OnInit, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonPopover } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { Machine } from 'src/app/core/models/machine.model';
import { MachineService } from 'src/app/core/services/impl/machine.service';

@Component({
  selector: 'app-machine-selectable',
  templateUrl: './machine-selectable.component.html',
  styleUrls: ['./machine-selectable.component.scss'],
  providers:[{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MachineSelectableComponent),
    multi: true
  }]
})
export class MachineSelectableComponent  implements OnDestroy {

  machineSelected:Machine | null = null;
  disabled:boolean = true;
  private _machines:BehaviorSubject<Machine[]> = new BehaviorSubject<Machine[]>([]);
  public machines$ = this._machines.asObservable();

  propagateChange = (obj: any) => {}

  @ViewChild('popover', { read: IonPopover }) popover: IonPopover | undefined;

  page:number = 1;
  pageSize:number = 25;
  pages:number = 0;

  constructor(
    public machineSvc: MachineService
  ) { }

  ngOnDestroy(): void {
    this.popover?.dismiss();
  }

  onLoadMachines(){
    this.loadMachines("")
  }

  private async loadMachines(filter:string){
    this.page = 1;
    this.machineSvc.getAll(this.page, this.pageSize).subscribe({
      next:response=>{
        this._machines.next([...response.data]);
        this.page++;
        this.pages = response.pages;
      },
      error:err=>{}
    })
  }



}
