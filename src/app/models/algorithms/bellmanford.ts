export function* bellmanFord(startNode, Graph) {
  let adjList = Graph.getAdjList();
  let nodes = Graph.getNodes();
  let dist = new Map();
  let edges: any[] = [];

  nodes.forEach((node) => {
    dist.set(node, Number.MAX_VALUE);
    let edgeTmp = adjList.get(node);
    if (edgeTmp) {
      edgeTmp.forEach((e) => {
        edges.push({ from: node, to: e.node, weight: e.weight });
      });
    }
  });

  dist.set(startNode, 0);
  yield { startNode: startNode };

  for (let i = 1; i <= nodes.length - 1; i++) {
    for (let j = 0; j < edges.length; j++) {
      let edge = edges[j];
      if (dist.get(edge.from) + edge.weight < dist.get(edge.to)) {
        dist.set(edge.to, dist.get(edge.from) + edge.weight);
        console.table(dist);
        yield {
          current: edge.from,
          next: edge.to,
          weight: dist.get(edge.from) + edge.weight,
        };
      }
    }
  }
}
