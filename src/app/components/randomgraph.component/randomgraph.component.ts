import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MessageDialog } from '../message.dialog/message.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'randomgraph',
  templateUrl: './randomgraph.component.html',
  styleUrls: ['./randomgraph.component.css'],
})
export class RandomGraph implements OnInit {
  nodes;
  edges;

  minimumWeigth: number = -5;
  maximumWeigth: number = 5;

  edgeChance: number = 50;
  numberOfNodes: number = 8;

  @Input()
  directed?: boolean;

  @Input()
  weighted?: boolean;

  @Input()
  graph;

  @Output()
  graphFinished = new EventEmitter();

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  edgeChanceLabel(value: number) {
    return value;
  }

  numberOfNodesLabel(value: number) {
    return value;
  }

  generateGraph() {
    this.nodes = [];
    this.edges = [];
    this.graph.reset();

    if (
      (this.weighted && this.minimumWeigth == undefined) ||
      this.maximumWeigth == undefined
    ) {
      this.dialog.open(MessageDialog, {
        width: '300px',
        height: '200px',
        data: {
          title: 'Error',
          message: 'Minimum or maximum weight is undefined!',
          error: true,
        },
      });
      return;
    }

    for (let i = 0; i < this.numberOfNodes; i++) {
      for (let j = 0; j < this.numberOfNodes; j++) {
        if (i == j) continue;
        if (
          !this.directed &&
          (this.edges.find((edge) => edge.id == String(i) + String(j)) ||
            this.edges.find((edge) => edge.id == String(j) + String(i)))
        ) {
          continue;
        }

        this.graph.addNode(i);
        this.graph.addNode(j);

        if (this.nodes.find((obj) => obj.id == i) == undefined) {
          this.nodes.push({
            id: i,
            label: String(i),
          });
        }

        if (this.nodes.find((obj) => obj.id == j) == undefined) {
          this.nodes.push({
            id: j,
            label: String(j),
          });
        }

        let random = Math.random();
        if (random < this.edgeChance * 0.01) {
          let randomWeight = Math.floor(
            Math.random() * (this.maximumWeigth - this.minimumWeigth + 1) +
              this.minimumWeigth
          );
          while (randomWeight == 0) {
            randomWeight = Math.floor(
              Math.random() * (this.maximumWeigth - this.minimumWeigth + 1) +
                this.minimumWeigth
            );
          }

          if (this.weighted) {
            this.graph.addEdge(i, j, randomWeight);
          } else {
            this.graph.addEdge(i, j);
          }

          this.edges.push({
            id: String(i) + String(j),
            from: i,
            to: j,
            arrows: this.directed ? 'to' : null,
            label: this.weighted ? String(randomWeight) : null,
          });
        }
      }
    }

    this.graphFinished.emit({ nodes: this.nodes, edges: this.edges });
  }
}
