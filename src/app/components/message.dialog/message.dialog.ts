import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'message.dialog',
  templateUrl: './message.dialog.html',
  styleUrls: ['./message.dialog.css'],
})
export class MessageDialog implements OnInit {
  title: string;
  message: string;
  error: boolean;

  constructor(
    private dialogRef: MatDialogRef<MessageDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.title = data.title;
    this.message = data.message;
    this.error = data.error;
  }

  ngOnInit(): void {}

  ok(): void {
    this.dialogRef.close();
  }
}
