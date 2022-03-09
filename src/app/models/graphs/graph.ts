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
  visited = new Map();
  hasNegativeWeight = false;

  constructor() {}

  addEdge(node_a: any, node_b: any, weight?: number) {
    if (!this.singleEdges.has(node_a)) {
      this.singleEdges.set(node_a, []);
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

    if (!this.visited.has(node_a)) {
      this.visited.set(node_a, false);
    }

    if (!this.visited.has(node_b)) {
      this.visited.set(node_b, false);
    }

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
    if (!this.singleEdges.has(node)) {
      this.singleEdges.set(node, []);
    }

    if (!this.nodes.includes(node)) {
      this.nodes.push(node);
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
    return this.hasNegativeWeight;
  }

  clear() {
    this.nodes = [];
    this.singleEdges.clear();
    this.adjList.clear();
    this.visited.clear();
  }

  resetVisited() {
    this.visited.forEach((value, key) => {
      this.visited.set(key, false);
    });
  }

  print() {
    console.log('\n\n');
    console.log('nodes', this.nodes);
    console.log('adjList', this.adjList);
    //console.log("singleEdges", this.singleEdges);
    console.log('\n\n');
  }

  save() {
    let saveStr = '[';
    this.adjList.forEach((value, key) => {
      console.log('value', value);
      value.map((node) => {
        console.log('node', node);
        if (typeof node === 'object') {
          saveStr += `{"from": ${key}, "to": ${node.node}, "weight": ${node.weight}},`;
        } else {
          saveStr += `{"from": ${key}, "to": ${node}},`;
        }
      });
    });
    saveStr = saveStr.slice(0, -1) + ']';
    console.log('save string', saveStr);
  }
}
