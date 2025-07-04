import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-mobile-forms',
  templateUrl: './mobile-forms.component.html',
  styleUrls: ['./mobile-forms.component.css']
})
export class MobileFormsComponent implements OnInit {

  data = {
    currInput: "",
  };

  constructor(public dialogRef: MatDialogRef<MobileFormsComponent>, @Inject(MAT_DIALOG_DATA) public configData: any) { }

  ngOnInit(): void {

    if (this.configData.currInput !== "") {
      this.data.currInput = this.configData.currInput;
    }
  }

  getElem(elem: string): string {
    if (elem === "Password") {
      return "password";
    } else if (elem === "Age") {
      return "number";
    } else {
      return 'text';
    }
  }

}
