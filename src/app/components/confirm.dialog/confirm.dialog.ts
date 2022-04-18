import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'confirm.dialog',
  templateUrl: './confirm.dialog.html',
  styleUrls: ['./confirm.dialog.css'],
})
export class ConfirmDialog implements OnInit {
  message: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.message = data.message;
    //dialogRef.disableClose = true;
  }

  ngOnInit(): void {}

  ok(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
