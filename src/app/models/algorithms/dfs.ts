/*export function* dfs(startNode, graph) {
  let visited = new Map();
  graph.getNodes().map((node) => {
    visited.set(node, false);
  });

  let stack = [];
  stack.push(startNode);

  let adj = graph.getAdjList();

  while(stack.length != 0){
    let s = stack.pop();
    if(visited.get(s) == false){
      visited.set(s, true);
    }

    for(let node = 0; node < adj.get(s).length; node++){
      if(!visited.get(adj.get(s)[node])){
        stack.push(adj.get(s)[node])
        yield { current: node, next: adj.get(s)[node] };
      }
    }
  }
}*/

var visited = new Map();
var counter = 0;

export function* dfs(node, graph) {
  let nodes = graph.getNodes();
  nodes.map((node) => {
    visited.set(node, false);
  });

  let adjList = graph.getAdjList();

  counter = 1;

  console.log('startnode', node);
  yield { startNode: node, startCounter: counter };
  yield* dfsUtil(node, adjList);

  for (let i = 0; i < nodes.length; i++) {
    if (visited.get(nodes[i])) {
      continue;
    }

    console.log('startnode', nodes[i]);
    counter++;
    yield { startNode: nodes[i], startCounter: counter };
    yield* dfsUtil(nodes[i], adjList);
  }
}

function* dfsUtil(node, adjList) {
  console.log('util node', node);
  //yield { current: node };
  visited.set(node, true);
  let visitedCounter = 0;

  /*if (adjList.get(node) == undefined) {
    yield { current: node };
    return;
  }*/

  for (let i = 0; i < adjList.get(node).length; i++) {
    visitedCounter += 1;
    if (!visited.get(adjList.get(node)[i])) {
      console.log('not visited neighbour', adjList.get(node)[i]);
      counter++;
      yield {
        current: node,
        next: adjList.get(node)[i],
        startCounter: counter,
      };
      yield* dfsUtil(adjList.get(node)[i], adjList);
    } // else {
    //visitedCounter += 1;
    //yield { current: node };
    //}
  }

  if (adjList.get(node).length == visitedCounter) {
    counter++;
    console.log('finished node', node);
    yield { current: node, endCounter: counter };
  }
}

/*var notVisited = adjList.get(node).filter((node) => !visited.get(node));
  if (notVisited.length != 0) {
    for (let i = 0; i < notVisited.length; i++) {
      yield { current: node, next: notVisited[i] };
      yield* dfsUtil(notVisited[i], adjList);
    }
  } else {
    yield { current: node };
  }*/

/*
  for (let i = 0; i < adjList.get(node).length; i++) {
    if (!visited.get(adjList.get(node)[i])) {
      yield { current: node, next: adjList.get(node)[i]};
      yield* dfsUtil(adjList.get(node)[i], visited, adjList);
    } else{
      yield { current: node};
    }
  }
  */
