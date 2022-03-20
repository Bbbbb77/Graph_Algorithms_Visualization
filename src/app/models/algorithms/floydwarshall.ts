export function floydWarshall(Graph) {
  let adjList = Graph.getAdjList();
  let nodes = Graph.getNodes().sort();

  let dist = new Map();

  adjList.forEach((node1) => {
    dist.set(node1, []);
    adjList.forEach((node2) => {
      if (node1 == node2) {
        dist.get(node1).push({ node: node2, weight: 0 });
      } else {
        let edge = adjList.get(node1).find((f) => f.node == node2);
        if (edge) {
          dist.get(node1).push({ node: node2, weight: edge.weight });
        } else {
          dist.get(node1).push({ node: node2, weight: Number.MAX_VALUE });
        }
      }
    });
  });

  nodes.forEach((k) => {
    nodes.forEach((i) => {
      nodes.forEach((j) => {
        let weight1 = dist.get(i).find((f) => f.node == j).weight;
        let weight2 = dist.get(i).find((f) => f.node == k).weight;
        let weight3 = dist.get(k).find((f) => f.node == j).weight;
        if (weight1 > weight2 + weight3) {
          dist.get(i).find((f) => f.node == j).weight = weight2 + weight3;
          //TODO yield cant be in object function
          //yield{nodeA:i nodeB:j};
        }
      });
    });
  });
}
