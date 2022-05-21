import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialog } from '../components/message.dialog/message.dialog';

@Injectable()
export class GraphBuilderService {
  isNodeNumber?: Boolean;

  constructor(public dialog: MatDialog) {}

  buildGraph(graph, nodes, edges) {
    this.isNodeNumber = undefined;
    let networkNodes: { id: number; label: string }[] = [];
    let networkEdges: {
      id: string;
      from: number;
      to: number;
      arrows?: string;
      label?: string;
    }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      if (this.isNodeNumber == undefined) {
        this.isNodeNumber = !isNaN(nodes[i]);
      }

      if (this.isNodeNumber && isNaN(nodes[i])) {
        this.dialog.open(MessageDialog, {
          width: '300px',
          height: '200px',
          data: {
            title: 'Error',
            message: 'Nodes are not matched!',
            error: true,
          },
        });
        return { error: true };
      }

      graph.addNode(nodes[i]);
      if (networkNodes.find((obj) => obj.id == nodes[i]) == undefined) {
        networkNodes.push({
          id: nodes[i],
          label: String(nodes[i]),
        });
      }
    }

    for (let i = 0; i < edges.length; i++) {
      if (
        (this.isNodeNumber && (isNaN(edges[i].from) || isNaN(edges[i].to))) ||
        (!this.isNodeNumber && (!isNaN(edges[i].from) || !isNaN(edges[i].to)))
      ) {
        this.dialog.open(MessageDialog, {
          width: '300px',
          height: '200px',
          data: {
            title: 'Error',
            message: 'Nodes in edges are not matched!',
            error: true,
          },
        });
        return { error: true };
      }

      if (!nodes.includes(edges[i].from) || !nodes.includes(edges[i].to)) {
        this.dialog.open(MessageDialog, {
          width: '300px',
          height: '200px',
          data: {
            title: 'Error',
            message:
              'There is a node in the edges which is not in the nodes property!',
            error: true,
          },
        });
        return { error: true };
      }
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
