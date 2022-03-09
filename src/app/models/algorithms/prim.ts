function minKey(key, mstSet, Graph) {
  let min = Number.MAX_VALUE;
  let min_index;

  for (let v = 0; v < Graph.getNodes().size; v++)
    if (mstSet.get(v) == false && key.get(v) < min) {
      min = key.get(v);
      min_index = v;
    }

  return min_index;
}

export function* primMST(Graph, startNode) {
  let adjList = Graph.getAdjList();
  let parent = new Map();
  let key = new Map();
  let mstSet = new Map();

  Graph.getNodes().map((node) => {
    key.set(node, Number.MAX_VALUE);
    mstSet.set(node, false);
  });

  key.set(startNode, 0);
  parent.set(startNode, -1);

  Graph.nodes.map((node) => {
    key.set(node, Number.MAX_VALUE);
    mstSet.set(node, false);
  });

  for (let count = 0; count < Graph.getNodes().size - 1; count++) {
    let u = minKey(key, mstSet, Graph);

    mstSet.set(u, true);

    for (let v = 0; v < Graph.getNodes().size; v++)
      if (mstSet.get(v) == false && adjList.get(u)[v].weight < key.get(v)) {
        parent.set(v, u);
        key.set(v, adjList.get(u)[v].weight);
      }
  }
}
