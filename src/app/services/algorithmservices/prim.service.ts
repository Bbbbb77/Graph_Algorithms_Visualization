import { Injectable } from '@angular/core';

@Injectable()
export class PrimService {
  stepCounter: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  updateEdgeList(edgeList, visited, adjList, node) {
    let neighbours = adjList.get(node);
    for (let i = 0; i < neighbours.length; i++) {
      let weight = neighbours[i].weight;
      let vertex = neighbours[i].node;
      let tmpObject = { from: node, to: vertex, weight: weight };

      let index = edgeList.findIndex(
        (obj) =>
          obj.from == tmpObject.from &&
          obj.to == tmpObject.to &&
          obj.weight == tmpObject.weight
      );

      if (!visited.get(vertex) && index == -1) {
        edgeList.push(tmpObject);
      }
    }
    edgeList.sort(function (a, b) {
      return a.weight - b.weight;
    });
  }

  *primMST(startNode, Graph) {
    let adjList = Graph.getAdjList();
    let visited = new Map();
    let value = new Map();

    Graph.getNodes().map((node) => {
      value.set(node, Number.MAX_VALUE);
      visited.set(node, false);
    });

    let edgeList: any[] = [];
    value.set(startNode, 0);
    visited.set(startNode, true);

    this.stepCounter++;
    yield { startNode: startNode };

    this.updateEdgeList(edgeList, visited, adjList, startNode);

    while (edgeList.length != 0) {
      this.stepCounter++;
      let nodePair = edgeList.shift();

      this.updateEdgeList(edgeList, visited, adjList, nodePair.to);

      if (
        !visited.get(nodePair.to) &&
        value.get(nodePair.to) > nodePair.weight
      ) {
        value.set(nodePair.to, nodePair.weight);

        yield {
          from: nodePair.from,
          to: nodePair.to,
          weight: nodePair.weight,
        };
      }
      visited.set(nodePair.to, true);
    }
  }
}
