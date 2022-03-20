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
  let adjList = graph.getSingleEdges();
  parent = new Map();

  graph.getNodes().forEach((node) => {
    parent.set(node, node);
  });
  let edges: any[] = [];

  graph.getNodes().map((node) => {
    if (adjList.get(node) != undefined) {
      adjList.get(node).map((edge) => {
        edges.push({ from: node, to: edge.node, weight: edge.weight });
      });
    }
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

/*

function find(i) {
  while (parent.get(i) != i) {
    i = parent.get(i);
  }
  return i;
}

function union(i, j) {
  var a = find(i);
  var b = find(j);
  parent.set(a, b);
}

export function kruskal(startNode, Graph) {
  var adjList = Graph.getAdjList();
  parent = new Map();

  adjList.forEach((nodePair) => {
    parent.set(nodePair.node, nodePair.node);
  });




  var minCost = 0;
  var edgeCount = 0;
  while (edgeCount < Graph.getNodes().length) {
    var min = Number.MAX_VALUE;
    var a = -1;
    var b = -1;
    adjList.forEach((value, key) => {
      value.forEach((nodePair) => {
        if (find(key) != find(nodePair.node) && nodePair.weight < min) {
          min = nodePair.weight;
          a = key;
          b = nodePair.node;
        }
      });
    });
    edgeCount++;
    console.log('connection', a, ':', b, ' ', min);
  }
}
*/
