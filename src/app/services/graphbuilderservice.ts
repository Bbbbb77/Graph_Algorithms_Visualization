import { Injectable } from '@angular/core';

@Injectable()
export class GraphBuilderService {
  constructor() {}

  buildGraph(graph, nodes, edges) {
    let nodesFromJson: { id: number; label: string }[] = [];
    let edgesFromJson: {
      id: string;
      from: number;
      to: number;
      arrows?: string;
      label?: string;
    }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      graph.addNode(nodes[i]);
    }

    for (let i = 0; i < edges.length; i++) {
      if (!graph.isWeighted()) {
        graph.addEdge(edges[i].from, edges[i].to);
        if (graph.isDirected()) {
          edgesFromJson.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
            arrows: 'to',
          });
        } else {
          edgesFromJson.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
          });
        }
      } else {
        graph.addEdge(edges[i].from, edges[i].to, edges[i].weight);
        if (graph.isDirected()) {
          edgesFromJson.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
            arrows: 'to',
            label: String(edges[i].weight),
          });
        } else {
          edgesFromJson.push({
            id: String(edges[i].from) + String(edges[i].to),
            from: edges[i].from,
            to: edges[i].to,
            label: String(edges[i].weight),
          });
        }
      }

      if (nodesFromJson.find((obj) => obj.id == edges[i].from) == undefined) {
        nodesFromJson.push({
          id: edges[i].from,
          label: String(edges[i].from),
        });
      }

      if (nodesFromJson.find((obj) => obj.id == edges[i].to) == undefined) {
        nodesFromJson.push({
          id: edges[i].to,
          label: String(edges[i].to),
        });
      }
    }

    return {
      nodes: nodesFromJson,
      edges: edgesFromJson,
    };
  }
}
