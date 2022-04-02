import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'randomgraph',
  templateUrl: './randomgraph.component.html',
  styleUrls: ['./randomgraph.component.css'],
})
export class RandomGraph implements OnInit {
  nodes;
  edges;

  edgeChance: number = 1;

  @Input()
  directed?: boolean;

  @Input()
  weighted?: boolean;

  @Input()
  graph;

  constructor() {}

  ngOnInit(): void {}

  formatLabel(value: number) {
    return value;
  }

  generateGraph(size: number) {
    this.nodes = [];
    this.edges = [];

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i == j) continue;
        if (
          !this.directed &&
          (this.edges.find((edge) => edge.id == String(i) + String(j)) ||
            this.edges.find((edge) => edge.id == String(j) + String(i)))
        ) {
          continue;
        }

        let random = Math.random();
        if (random < this.edgeChance * 0.01) {
          let randomWeight = Math.floor(Math.random() * 20);
          if (randomWeight == 0) randomWeight += 1;

          /* if (this.weighted) {
            graph.addEdge(i, j, randomWeight);
          } else {
            graph.addEdge(i, j);
          }*/

          this.edges.push({
            id: String(i) + String(j),
            from: i,
            to: j,
            arrows: this.directed ? 'to' : null,
            label: this.weighted ? String(randomWeight) : null,
          });
        }

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
      }
    }
  }
}
