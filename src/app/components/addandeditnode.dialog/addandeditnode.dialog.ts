import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'addandeditnode.dialog',
  templateUrl: './addandeditnode.dialog.html',
  styleUrls: ['./addandeditnode.dialog.css'],
})
export class AddAndEditNodeDialog implements OnInit {
  label: string;
  nodeValue: string;

  constructor(
    private dialogRef: MatDialogRef<AddAndEditNodeDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.label = data.label;
    this.nodeValue = data.nodeValue;
  }

  ngOnInit(): void {}
}
