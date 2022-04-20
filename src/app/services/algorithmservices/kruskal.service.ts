import { Injectable } from '@angular/core';

@Injectable()
export class KruskalService {
  parent;
  stepCounter: number = 0;
  minimumCost: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  getMinimumCost(): number {
    return this.minimumCost;
  }

  find(i) {
    while (this.parent.get(i) != i) {
      this.stepCounter++;
      i = this.parent.get(i);
    }
    return i;
  }

  union(i, j) {
    this.stepCounter++;
    var a = this.find(i);
    var b = this.find(j);

    if (a == b) {
      return;
    }

    if (a < b) {
      if (this.parent.get(b) != b) {
        this.union(this.parent.get(b), a);
      }
      this.parent.set(b, this.parent.get(a));
    } else {
      if (this.parent.get(a) != a) {
        this.union(this.parent.get(a), b);
      }
      this.parent.set(a, this.parent.get(b));
    }
  }

  *kruskal(graph) {
    let adjList = graph.getAdjList();
    this.parent = new Map();

    graph.getNodes().forEach((node) => {
      this.parent.set(node, node);
    });
    let edges: any[] = [];

    graph.getNodes().map((node) => {
      adjList.get(node).map((edge) => {
        edges.push({ from: node, to: edge.node, weight: edge.weight });
      });
    });

    edges.sort(function (a, b) {
      return a.weight - b.weight;
    });

    this.minimumCost = 0;

    while (edges.length != 0) {
      this.stepCounter++;
      let edge = edges.shift();
      let f1 = this.find(edge.from);
      let f2 = this.find(edge.to);
      if (this.find(edge.from) != this.find(edge.to)) {
        this.union(edge.from, edge.to);
        this.minimumCost += edge.weight;
        yield { current: edge.from, next: edge.to, weight: edge.weight };
      }
    }
  }
}
