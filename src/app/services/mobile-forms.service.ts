import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MobileFormsComponent } from '../components/mobile-forms/mobile-forms.component';

@Injectable({
  providedIn: 'root'
})
export class MobileFormsService {

  constructor(public dialog: MatDialog) { }

  promptForm ( unityInstance: any, elem:string, form:string, currInput:string) { 
      
    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose=true;
    
    dialogConfig.data = {
      elem: elem,
      form: form,
      currInput: currInput
    };
    
    const dialogRef = this.dialog.open(MobileFormsComponent, dialogConfig);

    dialogRef.backdropClick().subscribe(result => {
      dialogRef.close(dialogRef.componentInstance.data);
    });
    
    dialogRef.afterClosed().subscribe(result => {
      var input = result.currInput;
      unityInstance.SendMessage('MobileController', 'Get' + elem + form, input);
    });  
       
  }
}
