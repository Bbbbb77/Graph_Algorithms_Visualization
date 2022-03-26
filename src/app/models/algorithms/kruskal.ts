var parent;

function find(i) {
  while (parent.get(i) != i) {
    i = parent.get(i);
  }
  return i;
}

function union(i, j) {
  var a = find(i);
  var b = find(j);

  if (a == b) {
    return;
  }

  if (a < b) {
    if (parent.get(b) != b) {
      union(parent.get(b), a);
    }
    parent.set(b, parent.get(a));
  } else {
    if (parent.get(a) != a) {
      union(parent.get(a), b);
    }
    parent.set(a, parent.get(b));
  }
}

export function* kruskal(graph) {
  let adjList = graph.getAdjList();
  parent = new Map();

  graph.getNodes().forEach((node) => {
    parent.set(node, node);
  });
  let edges: any[] = [];

  graph.getNodes().map((node) => {
    adjList.get(node).map((edge) => {
      edges.push({ from: node, to: edge.node, weight: edge.weight });
    });
  });

  edges.sort(function (a, b) {
    return a.weight - b.weight;
  });

  let ans = 0;

  while (edges.length != 0) {
    let edge = edges.shift();
    let f1 = find(edge.from);
    let f2 = find(edge.to);
    if (find(edge.from) != find(edge.to)) {
      union(edge.from, edge.to);
      ans += edge.weight;
      yield { current: edge.from, next: edge.to, weight: edge.weight };
    }
  }
  yield { ans: ans };
}
