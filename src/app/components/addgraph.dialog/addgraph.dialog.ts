import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MessageDialog } from '../message.dialog/message.dialog';

@Component({
  selector: 'addgraph.dialog',
  templateUrl: './addgraph.dialog.html',
  styleUrls: ['./addgraph.dialog.css'],
})
export class AddGraphDialog implements OnInit {
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AddGraphDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {}

  ngOnInit(): void {}

  draw(graphInput): void {
    var graphObject = JSON.parse(graphInput);
    var errorMessage = '';

    if (graphObject.directed == undefined) {
      errorMessage = 'Graph direction is not provided';
    } else if (typeof graphObject.directed != 'boolean') {
      errorMessage = 'Graph direction value is not boolean type';
    } else if (graphObject.weighted == undefined) {
      errorMessage = 'Graph weightings is not provided';
    } else if (typeof graphObject.weighted != 'boolean') {
      errorMessage = 'Graph weightings value is not boolean';
    } else if (graphObject.nodes == undefined) {
      errorMessage = 'Graph nodes are not provided';
    } else if (graphObject.edges == undefined) {
      errorMessage = 'Graph edges are not provided';
    } else if (graphObject.nodes.length == 0 && graphObject.edges.length != 0) {
      errorMessage = 'Graph edges are provided but nodes not';
    }

    if (errorMessage != '') {
      this.dialog.open(MessageDialog, {
        width: '300px',
        height: '200px',
        data: { title: 'Error', message: errorMessage, error: true },
      });
    } else {
      this.dialogRef.close(graphObject);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
