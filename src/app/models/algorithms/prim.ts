function minKey(key, mstSet, Graph) {
  let min = Number.MAX_VALUE;
  let min_index;

  /*
  for (let v = 0; v < Graph.getNodes().length; v++) {
    if (mstSet.get(v) == false && key.get(v) < min) {
      min = key.get(v);
      min_index = v;
    }
  }*/

  Graph.getNodes().forEach((node) => {
    if (mstSet.get(node) == false && key.get(node) < min) {
      min = key.get(node);
      min_index = node;
    }
  });

  return min_index;
}
/*
export function* primMST(startNode, Graph) {
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

  for (let count = 0; count < Graph.getNodes().length - 1; count++) {
    let u = minKey(key, mstSet, Graph);

    mstSet.set(u, true);

    for (let v = 0; v < Graph.getNodes().length; v++) {
      console.group();
      console.groupEnd();
      if (
        adjList.get(u)[v] &&
        mstSet.get(v) == false &&
        adjList.get(u)[v].weight < key.get(v)
      ) {
        parent.set(v, u);
        key.set(v, adjList.get(u)[v].weight);
        yield { current: v, weight: adjList.get(u)[v].weight };
      }
    }
  }
}*/

export function* primMST(startNode, Graph) {
  let adjList = Graph.getAdjList();
  let visited = new Map();
  let value = new Map();
  let connection = new Map();

  Graph.getNodes().map((node) => {
    value.set(node, Number.MAX_VALUE);
    visited.set(node, false);
    connection.set(node, -1);
  });

  let queue: any[] = [];
  queue.push({ node: startNode, weight: 0 });
  value.set(startNode, 0);

  while (queue.length != 0) {
    let nodePair = queue.shift(); //queue[0].node;
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
          yield { current: nodePair.node, newNext: vertex, weight: weight };
        } else {
          yield { current: nodePair.node, next: vertex, weight: weight };
        }
      }
    }
  }

  console.log('connection', connection);
  console.log('value', value);
}
