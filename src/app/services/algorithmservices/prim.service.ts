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

  *primMST(startNode, Graph) {
    let adjList = Graph.getAdjList();
    let visited = new Map();
    let value = new Map();
    let connection = new Map();
    let pervDestNodes = new Map();

    Graph.getNodes().map((node) => {
      value.set(node, Number.MAX_VALUE);
      visited.set(node, false);
      connection.set(node, -1);
    });

    let queue: any[] = [];
    queue.push({ node: startNode, weight: 0 });
    value.set(startNode, 0);

    yield { startNode: startNode };

    while (queue.length != 0) {
      let nodePair = queue.shift();
      visited.set(nodePair.node, true);

      let neighbours = adjList.get(nodePair.node);

      for (let i = 0; i < neighbours.length; i++) {
        let weight = neighbours[i].weight;
        let vertex = neighbours[i].node;
        if (!visited.get(vertex) && value.get(vertex) > weight) {
          let newNext = value.get(vertex) != Number.MAX_VALUE;
          value.set(vertex, weight);
          connection.set(vertex, nodePair.node);
          queue.push({ node: vertex, weight: weight });
          queue.sort(function (a, b) {
            return a.weight - b.weight;
          });
          if (newNext) {
            let prev = pervDestNodes.get(vertex);
            pervDestNodes.set(vertex, nodePair.node);
            yield {
              current: nodePair.node,
              newNext: vertex,
              weight: weight,
              prevCurrent: prev,
            };
          } else {
            pervDestNodes.set(vertex, nodePair.node);
            yield { current: nodePair.node, next: vertex, weight: weight };
          }
        }
      }
    }

    console.log('connection', connection);
    console.log('value', value);
  }
}