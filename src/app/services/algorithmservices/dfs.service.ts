import { Injectable } from '@angular/core';

@Injectable()
export class DfsService {
  stepCounter: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  visited = new Map();
  counter = 0;

  *dfs(node, graph) {
    let nodes = graph.getNodes();
    nodes.map((node) => {
      this.visited.set(node, false);
    });

    let adjList = graph.getAdjList();

    this.counter = 1;

    console.log('startnode', node);
    this.stepCounter++;
    yield { startNode: node, startCounter: this.counter };
    yield* this.dfsUtil(node, adjList);

    for (let i = 0; i < nodes.length; i++) {
      if (this.visited.get(nodes[i])) {
        continue;
      }

      console.log('startnode', nodes[i]);
      this.counter++;
      yield { startNode: nodes[i], startCounter: this.counter };
      yield* this.dfsUtil(nodes[i], adjList);
    }
  }

  *dfsUtil(node, adjList) {
    this.stepCounter++;
    console.log('util node', node);
    this.visited.set(node, true);
    let visitedCounter = 0;

    for (let i = 0; i < adjList.get(node).length; i++) {
      visitedCounter += 1;
      if (!this.visited.get(adjList.get(node)[i])) {
        console.log('not visited neighbour', adjList.get(node)[i]);
        this.counter++;
        yield {
          current: node,
          next: adjList.get(node)[i],
          startCounter: this.counter,
        };
        yield* this.dfsUtil(adjList.get(node)[i], adjList);
      }
    }

    if (adjList.get(node).length == visitedCounter) {
      this.counter++;
      console.log('finished node', node);
      yield { current: node, endCounter: this.counter };
    }
  }
}
