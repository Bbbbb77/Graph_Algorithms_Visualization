import { Graph, compareWeightedNodes } from './graph';

export class UndirectedWeightedGraph extends Graph {
  constructor() {
    super();
    this.directed = false;
    this.weighted = true;
  }

  override addEdge(node_a, node_b, weight) {
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
        this.singleEdges.get(fromNode)[i].weight = newWeight;
        break;
      }
    }

    var edgeList = this.adjList.get(toNode);
    for (let i = 0; i < edgeList.length; i++) {
      if (edgeList[i].node == fromNode) {
        edgeList[i].weight = newWeight;
        break;
      }
    }
  }

  override removeEdge(node_a, node_b) {
    if (this.adjList.get(node_a) != undefined) {
      var index = this.adjList.get(node_a).findIndex((node) => {
        node.node == node_b;
      });
      if (index > -1) {
        this.adjList.get(node_a).splice(index, 1);
      }
    }

    if (this.adjList.get(node_b) != undefined) {
      var index = this.adjList.get(node_b).findIndex((node) => {
        node.node == node_a;
      });
      if (index > -1) {
        this.adjList.get(node_b).splice(index, 1);
      }
    }
    super.removeEdge(node_a, node_b);
  }

  override removeNode(node) {
    this.adjList.delete(node);
    this.adjList.forEach((value, key, map) => {
      let filteredValue = value.filter((toNode) => toNode.node != node);
      this.adjList.set(key, filteredValue);
    });
    super.removeNode(node);
  }

  override editNode(oldNode, newNode) {
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
    super.editNode(oldNode, newNode);
  }
}
