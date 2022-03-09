export function* bfs(start, graph) {
  let visited = new Map();

  graph.getNodes().map((node) => {
    visited.set(node, false);
  });

  let queue = new Array();
  queue.push(start);

  visited.set(start, true);

  let adj = graph.getAdjList();

  //console.log("graph nodes", graph.getNodes());
  //console.log("visited map", visited);

  console.group();
  console.log('bfs visited', visited);
  console.log('bfs adj', adj);
  console.groupEnd();

  while (queue.length != 0) {
    //console.log("queue", queue);
    let s = queue.shift();
    //console.log("s", s);
    //console.log("adj.get(s)", adj.get(s));

    if (adj.get(s) != undefined) {
      var notVisited = adj.get(s).filter((node) => !visited.get(node));
      if (notVisited.length != 0) {
        for (let i = 0; i < notVisited.length; i++) {
          visited.set(notVisited[i], true);
          queue.push(notVisited[i]);
          yield { current: s, newInQueue: notVisited[i] };
        }
      } else {
        yield { current: s };
      }
      /*
      for (let i = 0; i < adj.get(s).length; i++) {
        console.log("is " + adj.get(s)[i] + " visited ", visited.get(adj.get(s)[i]))
        if (!visited.get(adj.get(s)[i])) {
          visited.set(adj.get(s)[i], true);
          queue.push(adj.get(s)[i]);
          yield { current: s, newInQueue: adj.get(s)[i] };
        }
      }*/
    } else {
      yield { current: s };
    }
    //yield { current: s, queue: queue };
  }
}
