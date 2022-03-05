import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'addandeditweightededge.dialog',
  templateUrl: './addandeditweightededge.dialog.html',
  styleUrls: ['./addandeditweightededge.dialog.css'],
})
export class AddAndEditWeightedEdge implements OnInit {
  label: string;
  edgeValue: string;

  constructor(
    private dialogRef: MatDialogRef<AddAndEditWeightedEdge>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.label = data.label;
    this.edgeValue = data.edgeValue;
  }

  ngOnInit(): void {}
}
