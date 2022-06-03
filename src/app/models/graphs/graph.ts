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
  private nodes: any[] = [];
  protected singleEdges = new Map();
  protected adjList = new Map();
  private areNodesNumber: boolean = true;
  protected weighted: boolean = false;
  protected directed: boolean = false;
  private visited;

  constructor() {}

  isDirected(): boolean {
    return this.directed;
  }

  isWeighted(): boolean {
    return this.weighted;
  }

  isNodeInGraph(node): boolean {
    if (this.areNodesNumber) {
      return this.nodes.includes(Number(node));
    } else {
      return this.nodes.includes(node);
    }
  }

  addEdge(node_a: any, node_b: any, weight?: number): void {
    if (
      !this.singleEdges.has(node_b) ||
      (this.singleEdges.has(node_b) &&
        !this.singleEdges.get(node_b).includes(node_a))
    ) {
      if (!this.weighted) {
        this.singleEdges.get(node_a).push(node_b);
      } else {
        this.singleEdges.get(node_a).push({ node: node_b, weight });
      }
    }
  }

  removeEdge(node_a: any, node_b: any): void {
    if (this.singleEdges.get(node_a) != undefined) {
      var index = -1;
      if (!this.weighted) {
        index = this.singleEdges.get(node_a).indexOf(node_b);
      } else {
        index = this.singleEdges
          .get(node_a)
          .findIndex((node) => node.node == node_b);
      }
      if (index > -1) {
        this.singleEdges.get(node_a).splice(index, 1);
      }
    }
  }

  addNode(node: any): boolean {
    if (!this.singleEdges.has(node)) {
      this.singleEdges.set(node, []);
    }

    if (!this.adjList.has(node)) {
      this.adjList.set(node, []);
    }

    if (!this.nodes.includes(node)) {
      this.nodes.push(node);
      this.nodes.sort();

      if (this.areNodesNumber == undefined) {
        this.areNodesNumber = !isNaN(node);
      }
      return true;
    } else {
      return false;
    }
  }

  removeNode(node: any): void {
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      this.nodes.splice(index, 1);
    }
    this.nodes.sort();

    this.singleEdges.delete(node);
    this.singleEdges.forEach((value, key, map) => {
      let filteredValue;
      if (this.weighted) {
        filteredValue = value.filter((toNode) => toNode.node != node);
      } else {
        filteredValue = value.filter((toNode) => toNode != node);
      }
      this.singleEdges.set(key, filteredValue);
    });
  }

  editNode(oldNode: any, newNode: any): void {
    const index = this.nodes.indexOf(oldNode);
    if (index > -1) {
      this.nodes.splice(index, 1);
    }
    this.nodes.push(newNode);
    this.nodes.sort();

    var edgeList = this.singleEdges.get(oldNode);
    this.singleEdges.delete(oldNode);
    this.singleEdges.forEach((value, key, map) => {
      for (let i = 0; i < value.length; i++) {
        if (this.weighted) {
          if (value[i].node == oldNode) {
            value[i].node = newNode;
          }
        } else {
          if (value[i] == oldNode) {
            value[i] = newNode;
          }
        }
      }
    });
    this.singleEdges.set(newNode, edgeList);
  }

  getAdjList() {
    return this.adjList;
  }

  getNodes() {
    return this.nodes;
  }

  clearEdges(): void {
    this.nodes.map((node) => {
      this.adjList.set(node, []);
      this.singleEdges.set(node, []);
    });
  }

  getHasNegativeWeight(): boolean {
    if (!this.weighted) {
      return false;
    }

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

  reset(): void {
    this.nodes = [];
    this.singleEdges.clear();
    this.adjList.clear();
    this.areNodesNumber = true;
  }

  private dfs(node) {
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

  isAdjListEmpty(): boolean {
    return this.adjList.size == 0;
  }

  isConnected(): boolean {
    if (this.nodes.length == 0) {
      return false;
    }

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

  save(): string {
    let thereIsEdge = false;

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
      if (value.length != 0) {
        thereIsEdge = true;
        value.map((node) => {
          if (typeof node === 'object') {
            saveStr += `{"from": ${key}, "to": ${node.node}, "weight": ${node.weight}},\n`;
          } else {
            saveStr += `{"from": ${key}, "to": ${node}},\n`;
          }
        });
      }
    });

    if (thereIsEdge) {
      saveStr = saveStr.slice(0, -2) + '\n';
    } else {
      saveStr = saveStr.slice(0, -1);
    }
    saveStr += ']\n}';

    return saveStr;
  }
}
