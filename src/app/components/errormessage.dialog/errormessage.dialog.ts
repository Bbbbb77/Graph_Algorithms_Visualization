import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'errormessage.dialog',
  templateUrl: './errormessage.dialog.html',
  styleUrls: ['./errormessage.dialog.css'],
})
export class ErrorMessageDialog implements OnInit {
  errorMessage: string;

  constructor(
    private dialogRef: MatDialogRef<ErrorMessageDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.errorMessage = data.errorMessage;
  }

  ngOnInit(): void {}

  ok(): void {
    this.dialogRef.close();
  }
}
