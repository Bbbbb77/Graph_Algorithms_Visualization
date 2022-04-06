export function compareNodes(a: any, b: any) {
  return a - b;
}

export function compareWeightedNodes(a: any, b: any) {
  return a.node - b.node;
}

export class Graph {
  nodes: any[] = [];
  singleEdges = new Map();
  adjList = new Map();
  hasNegativeWeight = false;
  isNodesNumber: boolean;
  weighted: boolean;
  visited;

  constructor() {}

  isNodeInGraph(node): boolean {
    if (this.isNodesNumber) {
      return this.nodes.includes(Number(node));
    } else {
      return this.nodes.includes(node);
    }
  }

  addEdge(node_a: any, node_b: any, weight?: number) {
    //console.log('addEdge');
    if (!this.singleEdges.has(node_a)) {
      this.singleEdges.set(node_a, []);
    }

    if (this.isNodesNumber == undefined) {
      //console.log('addnode node', node_a);
      //console.log('addnode typeof', typeof node_a);
      //console.log('addnode isNaN(node)', isNaN(node_a));
      this.isNodesNumber = !isNaN(node_a);
    }

    if (
      !this.singleEdges.has(node_b) ||
      (this.singleEdges.has(node_b) &&
        !this.singleEdges.get(node_b).includes(node_a))
    ) {
      if (weight == undefined) {
        this.singleEdges.get(node_a).push(node_b);
      } else {
        this.singleEdges.get(node_a).push({ node: node_b, weight });
      }
    }

    if (!this.nodes.includes(node_a)) {
      this.nodes.push(node_a);
    }

    if (!this.nodes.includes(node_b)) {
      this.nodes.push(node_b);
    }
    /*
    if (!this.visited.has(node_a)) {
      this.visited.set(node_a, false);
    }

    if (!this.visited.has(node_b)) {
      this.visited.set(node_b, false);
    }
*/
    if (weight && weight < 0) {
      this.hasNegativeWeight = true;
    }
  }

  clearAdjList() {
    this.adjList.forEach((value, key, map) => {
      if (value.length == 0) {
        this.adjList.delete(key);
      }
    });
  }

  addNode(node: any) {
    //console.log('addnode');
    if (!this.singleEdges.has(node)) {
      this.singleEdges.set(node, []);
    }

    if (!this.adjList.has(node)) {
      this.adjList.set(node, []);
    }

    if (!this.nodes.includes(node)) {
      this.nodes.push(node);

      if (this.isNodesNumber == undefined) {
        //console.log('addnode node', node);
        //console.log('addnode typeof', typeof node);
        //console.log('addnode isNaN(node)', isNaN(node));
        this.isNodesNumber = !isNaN(node);
      }

      return true;
    } else {
      return false;
    }

    /*if (!this.adjList.has(node)) {
      this.adjList.set(node, []);
    }*/
  }

  removeNode(node: any) {
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      this.nodes.splice(index, 1);
    }
  }

  editNode(oldNode: any, newNode: any) {
    const index = this.nodes.indexOf(oldNode, 0);
    if (index > -1) {
      this.nodes.splice(index, 1);
    }
    this.nodes.push(newNode);
  }

  containsNode(node: any) {
    return this.nodes.includes(node);
  }

  getAdjList() {
    return this.adjList;
  }

  getNodes() {
    return this.nodes;
  }

  getSingleEdges() {
    return this.singleEdges;
  }

  getHasNegativeWeight() {
    if (!this.weighted) {
      return false;
    }

    let hasNegativeWeight = false;
    for (let i = 0; i < this.nodes.length; i++) {
      let edges = this.adjList.get(this.nodes[i]);
      for (let j = 0; j < edges.length; j++) {
        if (edges[j].weight < 0) {
          return true;
        }
      }
    }
    return false;
  }

  clear() {
    this.nodes = [];
    this.singleEdges.clear();
    this.adjList.clear();
    this.visited.clear();
  }
  /*
  resetVisited() {
    this.visited.forEach((value, key) => {
      this.visited.set(key, false);
    });
  }
*/
  dfs(node) {
    this.visited.set(node, true);
    for (let i = 0; i < this.adjList.get(node).length; i++) {
      if (this.weighted) {
        if (!this.visited.get(this.adjList.get(node)[i].node)) {
          this.dfs(this.adjList.get(node)[i].node);
        }
      } else {
        if (!this.visited.get(this.adjList.get(node)[i])) {
          this.dfs(this.adjList.get(node)[i]);
        }
      }
    }
  }

  isConnected(): boolean {
    this.visited = new Map();
    this.nodes.map((node) => {
      this.visited.set(node, false);
    });

    this.dfs(this.nodes[0]);

    for (let i = 0; i < this.nodes.length; i++) {
      let node = this.nodes[i];
      if (!this.visited.get(node)) {
        return false;
      }
    }
    return true;
  }

  hasNegativeCycle(sourceNode) {
    let edges: any[] = [];
    let distances = new Map();
    this.nodes.map((node) => {
      distances.set(node, false);

      let edgeTmp = this.adjList.get(node);
      if (edgeTmp) {
        edgeTmp.forEach((e) => {
          edges.push({ from: node, to: e.node, weight: e.weight });
        });
      }
    });

    distances.set(sourceNode, 0);

    for (let i = 1; i <= this.nodes.length - 1; i++) {
      for (let j = 0; j < edges.length; j++) {
        let edge = edges[j];
        if (distances.get(edge.from) + edge.weight < distances.get(edge.to)) {
          distances.set(edge.to, distances.get(edge.from) + edge.weight);
        }
      }
    }

    for (let i = 0; i < edges.length; i++) {
      let from = edges[i].from;
      let to = edges[i].to;
      let weight = edges[i].weight;

      if (
        distances[from] != Number.MAX_VALUE &&
        distances[from] + weight < distances[to]
      ) {
        return true;
      }
    }

    return false;
  }

  print() {
    console.log('\n\n');
    console.log('nodes', this.nodes);
    console.log('adjList', this.adjList);
    //console.log("singleEdges", this.singleEdges);
    console.log('\n\n');
  }

  save() {
    let saveStr = '[\n';
    this.singleEdges.forEach((value, key) => {
      value.map((node) => {
        if (typeof node === 'object') {
          saveStr += `{"from": ${key}, "to": ${node.node}, "weight": ${node.weight}},\n`;
        } else {
          saveStr += `{"from": ${key}, "to": ${node}},\n`;
        }
      });
    });
    saveStr = saveStr.slice(0, -2) + '\n]';
    return saveStr;
  }
}
