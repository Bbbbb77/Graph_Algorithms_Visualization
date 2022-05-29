import { Injectable } from '@angular/core';

@Injectable()
export class DfsService {
  stepCounter: number = 0;
  visited = new Map();
  counter = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  *dfs(node, graph) {
    let nodes = graph.getNodes();
    nodes.map((node) => {
      this.visited.set(node, false);
    });

    let adjList = graph.getAdjList();

    this.counter = 1;

    this.stepCounter++;
    yield { startNode: node, startCounter: this.counter };
    yield* this.dfsUtil(node, adjList);

    for (let i = 0; i < nodes.length; i++) {
      if (this.visited.get(nodes[i])) {
        continue;
      }

      this.counter++;
      this.stepCounter++;
      yield { startNode: nodes[i], startCounter: this.counter };
      yield* this.dfsUtil(nodes[i], adjList);
    }
  }

  *dfsUtil(node, adjList) {
    this.stepCounter++;
    this.visited.set(node, true);
    let neighbours = adjList.get(node);

    for (let i = 0; i < neighbours.length; i++) {
      if (!this.visited.get(neighbours[i])) {
        this.counter++;
        this.stepCounter++;
        yield {
          current: node,
          next: neighbours[i],
          startCounter: this.counter,
        };
        yield* this.dfsUtil(neighbours[i], adjList);
      }
    }

    this.counter++;
    this.stepCounter++;
    yield { current: node, endCounter: this.counter };
  }
}
