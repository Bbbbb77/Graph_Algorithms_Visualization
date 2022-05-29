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
    let min_node = -1;

    graph.getNodes().map((node) => {
      if (distances.get(node) < min && sptSet.get(node) == false) {
        min = distances.get(node);
        min_node = node;
      }
    });
    return min_node;
  }

  *dijkstra(start, graph) {
    let adj = graph.getAdjList();
    let distances = new Map();
    let sptSet = new Map();
    let prevDestNodes = new Map();

    graph.getNodes().map((node) => {
      distances.set(node, Number.MAX_VALUE);
      sptSet.set(node, false);
    });

    distances.set(start, 0);

    this.stepCounter++;
    yield { startNode: start, weight: 0 };

    for (let j = 0; j < graph.getNodes().length; j++) {
      this.stepCounter++;
      let u = this.minDistance(distances, sptSet, graph);
      sptSet.set(u, true);

      for (let v = 0; v < adj.get(u).length; v++) {
        this.stepCounter++;
        if (
          !sptSet.get(adj.get(u)[v].node) &&
          distances.get(u) != Number.MAX_VALUE &&
          distances.get(u) + adj.get(u)[v].weight <
            distances.get(adj.get(u)[v].node)
        ) {
          let newTo = distances.get(adj.get(u)[v].node) != Number.MAX_VALUE;

          distances.set(
            adj.get(u)[v].node,
            distances.get(u) + adj.get(u)[v].weight
          );

          let from = u;
          let to = adj.get(u)[v].node;

          if (newTo) {
            let prevFrom = prevDestNodes.get(to);
            prevDestNodes.set(to, from);
            yield {
              from: from,
              newTo: to,
              weight: distances.get(to),
              prevFrom: prevFrom,
            };
          } else {
            prevDestNodes.set(to, from);
            yield { from: from, to: to, weight: distances.get(to) };
          }
        }
      }
    }
  }
}
