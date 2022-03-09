import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'addgraph.dialog',
  templateUrl: './addgraph.dialog.html',
  styleUrls: ['./addgraph.dialog.css'],
})
export class AddGraphDialog implements OnInit {
  nodesFromJson;
  edgesFromJson;

  directed: boolean;
  weighted: boolean;

  graphText: string;

  constructor(
    private dialogRef: MatDialogRef<AddGraphDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.directed = data.directed;
    this.weighted = data.weighted;
  }

  ngOnInit(): void {}

  draw(): void {
    let rawJson = this.graphText.replace(/\n/g, '').replace(' ', '');
    let valuesJson = JSON.parse(rawJson);

    this.nodesFromJson = [];
    this.edgesFromJson = [];

    for (let v in valuesJson) {
      if (!this.weighted) {
        //graph.addEdge(valuesJson[v].from, valuesJson[v].to);
        if (this.directed) {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            arrows: 'to',
          });
        } else {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
          });
        }
      } else {
        //graph.addEdge(valuesJson[v].from, valuesJson[v].to, valuesJson[v].weight);
        if (this.directed) {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            arrows: 'to',
            label: String(valuesJson[v].weight),
          });
        } else {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            label: String(valuesJson[v].weight),
          });
        }
      }

      if (
        this.nodesFromJson.find((obj) => obj.id == valuesJson[v].from) ==
        undefined
      ) {
        this.nodesFromJson.push({
          id: valuesJson[v].from,
          label: String(valuesJson[v].from),
        });
      }

      if (
        this.nodesFromJson.find((obj) => obj.id == valuesJson[v].to) ==
        undefined
      ) {
        this.nodesFromJson.push({
          id: valuesJson[v].to,
          label: String(valuesJson[v].to),
        });
      }
      this.dialogRef.close({
        nodes: this.nodesFromJson,
        edges: this.edgesFromJson,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
