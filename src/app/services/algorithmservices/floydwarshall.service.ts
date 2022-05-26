import { Injectable } from '@angular/core';

@Injectable()
export class FloydWarshallService {
  stepCounter: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  *floydWarshall(Graph) {
    let adjList = Graph.getAdjList();
    let nodes = Graph.getNodes().sort();

    let dist = new Map();

    nodes.forEach((node1) => {
      dist.set(node1, []);
      nodes.forEach((node2) => {
        if (node1 == node2) {
          console.log('node 1 2', node1, node2);
          dist.get(node1).push({ node: node2, weight: 0 });
        } else {
          let edge = adjList.get(node1).find((f) => f.node == node2);
          if (edge) {
            dist.get(node1).push({ node: node2, weight: edge.weight });
          } else {
            dist.get(node1).push({ node: node2, weight: Number.MAX_VALUE });
          }
        }
      });
    });

    console.log('dist');
    console.table(dist);

    yield { distances: new Map(JSON.parse(JSON.stringify(Array.from(dist)))) };

    for (let k = 0; k < nodes.length; k++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          this.stepCounter++;
          let weight1 = dist
            .get(nodes[i])
            .find((f) => f.node == nodes[j]).weight;
          let weight2 = dist
            .get(nodes[i])
            .find((f) => f.node == nodes[k]).weight;
          let weight3 = dist
            .get(nodes[k])
            .find((f) => f.node == nodes[j]).weight;
          if (weight1 > weight2 + weight3) {
            dist.get(nodes[i]).find((f) => f.node == nodes[j]).weight =
              weight2 + weight3;
            console.table(dist);
            yield {
              /* current: nodes[i], next: nodes[j],*/ distances: new Map(
                JSON.parse(JSON.stringify(Array.from(dist)))
              ),
            };
          }
        }
      }
    }
  }
}
