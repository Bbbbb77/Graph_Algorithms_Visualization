import { Injectable } from '@angular/core';
//import { AlgorithmsBaseService } from './algorithmsbaseservice';

@Injectable()
export class BfsService /* extends AlgorithmsBaseService*/ {
  stepCounter: number = 0;

  constructor() {
    //super();
  }

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  *bfs(start, graph) {
    let visited = new Map();
    graph.getNodes().map((node) => {
      visited.set(node, false);
    });
    let queue = new Array();
    queue.push(start);
    visited.set(start, true);
    let adj = graph.getAdjList();

    this.stepCounter++;

    yield { startNode: start };
    while (queue.length != 0) {
      let s = queue.shift();
      var notVisited = adj.get(s).filter((node) => {
        this.stepCounter++;
        return !visited.get(node);
      });
      notVisited.forEach((node) => {
        visited.set(node, true);
        queue.push(node);
      });
      yield { current: s, newInQueue: notVisited };
    }
  }
}
