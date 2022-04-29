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

    this.stepCounter++;
    yield { startNode: startNode };

    while (queue.length != 0) {
      this.stepCounter++;
      let nodePair = queue.shift();
      visited.set(nodePair.node, true);

      let neighbours = adjList.get(nodePair.node);

      for (let i = 0; i < neighbours.length; i++) {
        this.stepCounter++;
        let weight = neighbours[i].weight;
        let vertex = neighbours[i].node;
        if (!visited.get(vertex) && value.get(vertex) > weight) {
          let newTo = value.get(vertex) != Number.MAX_VALUE;
          value.set(vertex, weight);
          connection.set(vertex, nodePair.node);
          queue.push({ node: vertex, weight: weight });
          queue.sort(function (a, b) {
            return a.weight - b.weight;
          });
          if (newTo) {
            let prevFrom = pervDestNodes.get(vertex);
            pervDestNodes.set(vertex, nodePair.node);
            yield {
              from: nodePair.node,
              newTo: vertex,
              weight: weight,
              prevFrom: prevFrom,
            };
          } else {
            pervDestNodes.set(vertex, nodePair.node);
            yield { from: nodePair.node, to: vertex, weight: weight };
          }
        }
      }
    }

    console.log('connection', connection);
    console.log('value', value);
  }
}
