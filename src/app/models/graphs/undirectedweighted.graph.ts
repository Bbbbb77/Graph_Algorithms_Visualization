import { Graph, compareWeightedNodes } from './graph';

export class UndirectedWeightedGraph extends Graph {
  constructor() {
    super();
    this.weighted = true;
  }

  override addEdge(node_a, node_b, weight) {
    if (!this.adjList.has(node_a)) {
      this.adjList.set(node_a, []);
    }

    if (!this.adjList.has(node_b)) {
      this.adjList.set(node_b, []);
    }

    if (
      this.adjList.get(node_a) &&
      this.adjList.get(node_a).findIndex((node) => {
        return node.node == node_b;
      }) == -1 &&
      this.adjList.get(node_b) &&
      this.adjList.get(node_b).findIndex((node) => {
        return node.node == node_a;
      }) == -1
    ) {
      this.adjList.get(node_a).push({ node: node_b, weight });
      this.adjList.get(node_a).sort(compareWeightedNodes);

      this.adjList.get(node_b).push({ node: node_a, weight });
      this.adjList.get(node_b).sort(compareWeightedNodes);

      super.addEdge(node_a, node_b, weight);
      return true;
    } else {
      return false;
    }
  }

  editEdge(fromNode, toNode, newWeight) {
    var edgeList = this.adjList.get(fromNode);
    for (let i = 0; i < edgeList.length; i++) {
      if (edgeList[i].node == toNode) {
        edgeList[i].weight = newWeight;
        break;
      }
    }
    this.adjList.set(fromNode, edgeList);
    this.print();
  }

  removeEdge(node_a, node_b) {
    if (this.adjList.get(node_a) != undefined) {
      var index1 = this.adjList.get(node_a).findIndex((node) => {
        return node.node == node_b;
      });
      if (index1 > -1) {
        this.adjList.get(node_a).splice(index1, 1);
      }
    }

    if (this.adjList.get(node_b) != undefined) {
      var index2 = this.adjList.get(node_b).findIndex((node) => {
        return node.node == node_a;
      });
      if (index2 > -1) {
        this.adjList.get(node_b).splice(index2, 1);
      }
    }

    super.clearAdjList();
    this.print();
  }

  override removeNode(node) {
    this.adjList.delete(node);
    this.adjList.forEach((value, key, map) => {
      let filteredValue = value.filter((toNode) => toNode.node != node);
      this.adjList.set(key, filteredValue);
    });

    super.removeNode(node);
    super.clearAdjList();
    this.print();
  }

  override editNode(oldNode, newNode) {
    super.editNode(oldNode, newNode);
    var edgeList = this.adjList.get(oldNode);
    this.adjList.delete(oldNode);
    this.adjList.forEach((value, key, map) => {
      for (let i = 0; i < value.length; i++) {
        if (value[i].node == oldNode) {
          value[i].node = newNode;
        }
      }
    });
    this.adjList.set(newNode, edgeList);
  }
}
