import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphParserService } from '../../services/graphparserservice';

@Component({
  selector: 'addgraph.dialog',
  templateUrl: './addgraph.dialog.html',
  styleUrls: ['./addgraph.dialog.css'],
  providers: [GraphParserService],
})
export class AddGraphDialog implements OnInit {
  directed: boolean;
  weighted: boolean;

  graph: any;

  constructor(
    private graphParserService: GraphParserService,
    private dialogRef: MatDialogRef<AddGraphDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.directed = data.directed;
    this.weighted = data.weighted;
    this.graph = data.graph;
  }

  ngOnInit(): void {}

  draw(graphInput): void {
    this.dialogRef.close(
      this.graphParserService.parseGraph(
        this.graph,
        this.directed,
        this.weighted,
        graphInput
      )
    );
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
