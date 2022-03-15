/*export function kruskal(graph) {
  let adj = graph.getSingleEdges();

  let edges = [];

  graph.getNodes().map((node) => {
    if (adj.get(node) != undefined) {
      adj.get(node).map((edge) => {
        edges.push({ from: node, to: edge.node, weight: edge.weight });
      });
    }
  });

  edges.sort(function (a, b) {
    return a.weight > b.weight;
  });

  while (edges.ength != 0) {
    let edge = edges.pop();
  }

  console.log('edges', edges);
  //yield {};
}*/

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
  parent.set(a, b);
}

export function* kruskal(startNode, Graph) {
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
