function minDistance(distances, sptSet, graph) {
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

export function* dijkstra(start, graph) {
  let adj = graph.getAdjList();
  let distances = new Map();
  let sptSet = new Map();
  let prevNode = start;

  graph.getNodes().map((node) => {
    distances.set(node, Number.MAX_VALUE);
    sptSet.set(node, false);
  });

  distances.set(start, 0);

  for (let j = 0; j < graph.getNodes().length; j++) {
    let u = minDistance(distances, sptSet, graph);

    //yield { current: prevNode, next: u, weight: distances.get(u) };

    sptSet.set(u, true);

    //console.log('u', u);
    //console.log('adj.get(u)', adj.get(u));
    if (adj.get(u) != undefined) {
      for (let v = 0; v < adj.get(u).length; v++) {
        if (
          !sptSet.get(adj.get(u)[v].node) &&
          distances.get(u) != Number.MAX_VALUE &&
          distances.get(u) + adj.get(u)[v].weight <
            distances.get(adj.get(u)[v].node)
        ) {
          distances.set(
            adj.get(u)[v].node,
            distances.get(u) + adj.get(u)[v].weight
          );
        }
      }
    }
    prevNode = u;
    yield { current: u, weight: distances.get(u) };
  }
}
