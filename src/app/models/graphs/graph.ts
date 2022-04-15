export function compareNodes(a: number, b: number) {
  return a - b;
}

export function compareWeightedNodes(
  a: { node: number; weight: number },
  b: { node: number; weight: number }
) {
  return a.node - b.node;
}

export function compareCharacters(a: string, b: string) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export function compareWeightedCharacters(
  a: { node: string; weight: number },
  b: { node: string; weight: number }
) {
  return a.node.toLowerCase().localeCompare(b.node.toLowerCase());
}

export class Graph {
  nodes: any[] = [];
  singleEdges = new Map();
  adjList = new Map();
  hasNegativeWeight: boolean = false;
  isNodesNumber: boolean = true;
  weighted: boolean = false;
  directed: boolean = false;
  visited;

  constructor() {}

  isDirected(): boolean {
    return this.directed;
  }

  isWeighted(): boolean {
    return this.weighted;
  }

  isNodeInGraph(node): boolean {
    if (this.isNodesNumber) {
      return this.nodes.includes(Number(node));
    } else {
      return this.nodes.includes(node);
    }
  }

  addEdge(node_a: any, node_b: any, weight?: number) {
    if (this.isNodesNumber == undefined) {
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

  addNode(node: any) {
    if (!this.singleEdges.has(node)) {
      this.singleEdges.set(node, []);
    }

    if (!this.adjList.has(node)) {
      this.adjList.set(node, []);
    }

    if (!this.nodes.includes(node)) {
      this.nodes.push(node);

      if (this.isNodesNumber == undefined) {
        this.isNodesNumber = !isNaN(node);
      }
      return true;
    } else {
      return false;
    }
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
      if (edges.length == 0) {
        continue;
      }
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
    this.hasNegativeWeight = false;
    this.isNodesNumber = true;
    this.weighted = false;
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
    console.log('singleEdges', this.singleEdges);
    console.log('\n\n');
  }

  hasEdge(node) {
    let foundEdge = false;
    this.singleEdges.forEach((value, key) => {
      if (this.weighted) {
        let index = value.findIndex((v) => (v.node = node));
        if (index != -1) {
          foundEdge = true;
          return;
        }
      } else {
        if (value.includes(node)) {
          foundEdge = true;
          return;
        }
      }
    });
    return foundEdge;
  }

  save() {
    let saveStr = '{\n';
    saveStr += `"directed": ${this.directed},\n`;
    saveStr += `"weighted": ${this.weighted},\n`;
    saveStr += '"nodes": [';
    this.nodes.map((node) => {
      saveStr += `${node}, `;
    });
    saveStr = saveStr.slice(0, -2) + '],\n';
    saveStr += '"edges": [\n';
    this.singleEdges.forEach((value, key) => {
      if (value.length == 0) {
        if (!this.hasEdge(key)) {
          saveStr += `{"from":${key}},\n`;
        }
      } else {
        value.map((node) => {
          if (typeof node === 'object') {
            saveStr += `{"from": ${key}, "to": ${node.node}, "weight": ${node.weight}},\n`;
          } else {
            saveStr += `{"from": ${key}, "to": ${node}},\n`;
          }
        });
      }
    });
    saveStr = saveStr.slice(0, -2) + '\n]\n';
    saveStr += '}';
    console.log('saveStr', saveStr);
    console.log('json', JSON.parse(saveStr));
    return saveStr;
  }
}
