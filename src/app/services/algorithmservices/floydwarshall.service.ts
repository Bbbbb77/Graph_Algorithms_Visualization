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

    this.stepCounter++;
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
          if (
            weight1 > weight2 + weight3 &&
            weight2 != Number.MAX_VALUE &&
            weight2 != Number.MAX_VALUE
          ) {
            let index = dist.get(nodes[i]).findIndex((f) => f.node == nodes[j]);
            dist.get(nodes[i])[index].weight = weight2 + weight3;
            yield {
              distances: new Map(JSON.parse(JSON.stringify(Array.from(dist)))),
            };
          }
        }
      }
    }
  }
}
