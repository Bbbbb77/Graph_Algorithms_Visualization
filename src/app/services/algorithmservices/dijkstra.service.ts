import { Injectable } from '@angular/core';

@Injectable()
export class DijkstraService {
  stepCounter: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  minDistance(distances, sptSet, graph) {
    let min = Number.MAX_VALUE;
    let min_index = -1;

    graph.getNodes().map((node) => {
      if (distances.get(node) < min && sptSet.get(node) == false) {
        min = distances.get(node);
        min_index = node;
      }
    });
    return min_index;
  }

  *dijkstra(start, graph) {
    let adj = graph.getAdjList();
    let distances = new Map();
    let sptSet = new Map();
    let pervDestNodes = new Map();

    graph.getNodes().map((node) => {
      distances.set(node, Number.MAX_VALUE);
      sptSet.set(node, false);
    });

    distances.set(start, 0);

    yield { startNode: start, weight: 0 };

    for (let j = 0; j < graph.getNodes().length; j++) {
      let u = this.minDistance(distances, sptSet, graph);
      let from, to, w;
      sptSet.set(u, true);

      for (let v = 0; v < adj.get(u).length; v++) {
        if (
          !sptSet.get(adj.get(u)[v].node) &&
          distances.get(u) != Number.MAX_VALUE &&
          distances.get(u) + adj.get(u)[v].weight <
            distances.get(adj.get(u)[v].node)
        ) {
          let newNext = distances.get(adj.get(u)[v].node) != Number.MAX_VALUE;

          distances.set(
            adj.get(u)[v].node,
            distances.get(u) + adj.get(u)[v].weight
          );

          from = u;
          to = adj.get(u)[v].node;
          w = adj.get(u)[v].weight;

          if (newNext) {
            let prev = pervDestNodes.get(to);
            pervDestNodes.set(to, from);
            yield {
              current: from,
              newNext: to,
              weight: distances.get(to),
              prevCurrent: prev,
            };
          } else {
            pervDestNodes.set(to, from);
            yield { current: from, next: to, weight: distances.get(to) };
          }
        }
      }
    }
  }
}
