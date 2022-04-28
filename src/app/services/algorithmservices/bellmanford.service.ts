import { Injectable } from '@angular/core';

@Injectable()
export class BellmanFordService {
  stepCounter: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  *bellmanFord(startNode, Graph) {
    let adjList = Graph.getAdjList();
    let nodes = Graph.getNodes();
    let dist = new Map();
    let edges: any[] = [];
    let pervDestNodes = new Map();

    nodes.forEach((node) => {
      dist.set(node, Number.MAX_VALUE);
      let edgeTmp = adjList.get(node);
      if (edgeTmp) {
        edgeTmp.forEach((e) => {
          edges.push({ from: node, to: e.node, weight: e.weight });
        });
      }
    });

    this.stepCounter++;
    dist.set(startNode, 0);
    yield { startNode: startNode };

    for (let i = 1; i <= nodes.length - 1; i++) {
      for (let j = 0; j < edges.length; j++) {
        let edge = edges[j];
        this.stepCounter++;
        if (dist.get(edge.from) + edge.weight < dist.get(edge.to)) {
          let newTo = dist.get(edge.to) != Number.MAX_VALUE;
          dist.set(edge.to, dist.get(edge.from) + edge.weight);

          if (newTo) {
            let prevFrom = pervDestNodes.get(edge.to);
            pervDestNodes.set(edge.to, edge.from);
            yield {
              from: edge.from,
              newTo: edge.to,
              weight: dist.get(edge.from) + edge.weight,
              prevFrom: prevFrom,
            };
          } else {
            pervDestNodes.set(edge.to, edge.from);
            yield {
              from: edge.from,
              to: edge.to,
              weight: dist.get(edge.from) + edge.weight,
            };
          }
        }
      }
    }
  }
}
