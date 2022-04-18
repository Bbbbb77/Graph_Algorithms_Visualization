import { Injectable } from '@angular/core';

@Injectable()
export class GraphBuilderService {
  constructor() {}

  buildGraph(graph, nodes, edges) {
    let networkNodes: { id: number; label: string }[] = [];
    let networkEdges: {
      id: string;
      from: number;
      to: number;
      arrows?: string;
      label?: string;
    }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      graph.addNode(nodes[i]);
      if (networkNodes.find((obj) => obj.id == nodes[i]) == undefined) {
        networkNodes.push({
          id: nodes[i],
          label: String(nodes[i]),
        });
      }
    }

    for (let i = 0; i < edges.length; i++) {
      if (!graph.isWeighted()) {
        graph.addEdge(edges[i].from, edges[i].to);
        if (graph.isDirected()) {
          networkEdges.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
            arrows: 'to',
          });
        } else {
          networkEdges.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
          });
        }
      } else {
        graph.addEdge(edges[i].from, edges[i].to, edges[i].weight);
        if (graph.isDirected()) {
          networkEdges.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
            arrows: 'to',
            label: String(edges[i].weight),
          });
        } else {
          networkEdges.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
            label: String(edges[i].weight),
          });
        }
      }
    }

    return {
      nodes: networkNodes,
      edges: networkEdges,
    };
  }
}
