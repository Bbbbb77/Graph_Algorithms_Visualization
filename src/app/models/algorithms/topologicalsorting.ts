var stack: any[] = [];
var visited = new Map();

function topologicalSortingUtil(v, adjList) {
  visited.set(v, true);

  let list = adjList.get(v);
  if (list) {
    list.forEach((node) => {
      if (!visited.get(node)) {
        topologicalSortingUtil(node, adjList);
      }
    });
  }
  stack.push(v);
}

export function topologicalSorting(Graph) {
  let nodes = Graph.getNodes();
  let adjList = Graph.getAdjList();

  nodes.forEach((node) => {
    visited.set(node, false);
  });

  nodes.forEach((node) => {
    if (!visited.get(node)) {
      topologicalSortingUtil(node, adjList);
    }
  });

  console.log('Stack', stack);
}
