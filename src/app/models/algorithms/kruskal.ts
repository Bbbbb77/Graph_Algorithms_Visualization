export function kruskal(graph) {
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
}
