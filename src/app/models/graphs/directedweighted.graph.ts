import { Graph, compareWeightedNodes } from './graph';

export class DirectedWeightedGraph extends Graph {
  constructor() {
    super();
    this.directed = true;
    this.weighted = true;
  }

  override addEdge(node_a: any, node_b: any, weight: number) {
    if (
      this.adjList.get(node_a) &&
      this.adjList.get(node_a).findIndex((node) => {
        return node.node == node_b;
      }) == -1
    ) {
      this.adjList.get(node_a).push({ node: node_b, weight });
      this.adjList.get(node_a).sort(compareWeightedNodes);

      super.addEdge(node_a, node_b, weight);
      return true;
    } else {
      return false;
    }
  }

  editEdge(fromNode: any, toNode: any, newWeight: number) {
    var edgeList = this.adjList.get(fromNode);
    for (let i = 0; i < edgeList.length; i++) {
      if (edgeList[i].node == toNode) {
        edgeList[i].weight = newWeight;
        this.singleEdges.get(fromNode)[i].weight = newWeight;
        break;
      }
    }
  }

  removeEdge(node_a: any, node_b: any) {
    if (this.adjList.get(node_a) != undefined) {
      var index1 = this.adjList.get(node_a).findIndex((node) => {
        node.node == node_b;
      });
      if (index1 > -1) {
        this.adjList.get(node_a).splice(index1, 1);
      }
    }

    this.print();
  }

  override removeNode(node: any) {
    this.adjList.delete(node);
    this.adjList.forEach((value, key, map) => {
      let filteredValue = value.filter((toNode) => toNode.node != node);
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
        if (value[i].node == oldNode) {
          value[i].node = newNode;
        }
      }
    });
    this.adjList.set(newNode, edgeList);
  }
}
