import { Graph, compareNodes } from './graph';

export class UndirectedUnweightedGraph extends Graph {
  constructor() {
    super();
    this.directed = false;
    this.weighted = false;
  }

  override addEdge(node_a: any, node_b: any) {
    if (
      this.adjList.get(node_a) &&
      !this.adjList.get(node_a).includes(node_b) &&
      this.adjList.get(node_b) &&
      !this.adjList.get(node_b).includes(node_a)
    ) {
      this.adjList.get(node_a).push(node_b);
      this.adjList.get(node_b).push(node_a);

      this.adjList.get(node_a).sort(compareNodes);
      this.adjList.get(node_b).sort(compareNodes);

      super.addEdge(node_a, node_b);
      return true;
    } else {
      return false;
    }
  }

  override removeEdge(node_a: any, node_b: any) {
    if (this.adjList.get(node_a) != undefined) {
      var index = this.adjList.get(node_a).indexOf(node_b);
      if (index > -1) {
        this.adjList.get(node_a).splice(index, 1);
      }
    }

    if (this.adjList.get(node_b) != undefined) {
      var index = this.adjList.get(node_b).indexOf(node_a);
      if (index > -1) {
        this.adjList.get(node_b).splice(index, 1);
      }
    }
    super.removeEdge(node_a, node_b);
    this.print();
  }

  override removeNode(node: any) {
    this.adjList.delete(node);
    this.adjList.forEach((value, key, map) => {
      let filteredValue = value.filter((toNode) => toNode != node);
      this.adjList.set(key, filteredValue);
    });

    super.removeNode(node);
    this.print();
  }

  override editNode(oldNode: any, newNode: any) {
    super.editNode(oldNode, newNode);
    var edgeList = this.adjList.get(oldNode);
    this.adjList.delete(oldNode);
    this.adjList.forEach((value, key, map) => {
      for (let i = 0; i < value.length; i++) {
        if (value[i] == oldNode) {
          value[i] = newNode;
        }
      }
    });
    this.adjList.set(newNode, edgeList);
  }
}
