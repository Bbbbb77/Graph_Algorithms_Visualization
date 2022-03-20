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

export function* dfs(node, graph) {
  //console.log("adj list", graph.getAdjList());

  graph.getNodes().map((node) => {
    visited.set(node, false);
  });

  let adjList = graph.getAdjList();

  yield* dfsUtil(node, /*visited,*/ adjList);
}

function* dfsUtil(node, /*visited,*/ adjList) {
  //yield { current: node };
  //console.log('node', node);
  visited.set(node, true);
  //console.log('visited', visited);

  let visitedCounter = 0;

  if (adjList.get(node) == undefined) {
    yield { current: node };
    return;
  }

  for (let i = 0; i < adjList.get(node).length; i++) {
    if (!visited.get(adjList.get(node)[i])) {
      yield { current: node, next: adjList.get(node)[i] };
      yield* dfsUtil(adjList.get(node)[i], adjList);
    } else {
      visitedCounter += 1;
      //yield { current: node };
    }
  }

  if (adjList.get(node).length == visitedCounter) {
    yield { current: node };
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
}

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
