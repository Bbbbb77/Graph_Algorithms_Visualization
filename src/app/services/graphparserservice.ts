import { Injectable } from '@angular/core';

@Injectable()
export class GraphParserService {
  constructor() {}

  parseGraph(graph, directed: boolean, weighted: boolean, graphJson: string) {
    let rawJson = graphJson.replace(/\n/g, '').replace(' ', '');
    let valuesJson = JSON.parse(rawJson);

    let nodesFromJson: { id: number; label: string }[] = [];
    let edgesFromJson: {
      id: string;
      from: number;
      to: number;
      arrows?: string;
      label?: string;
    }[] = [];

    for (let v in valuesJson) {
      if (!weighted) {
        graph.addEdge(valuesJson[v].from, valuesJson[v].to);
        if (directed) {
          edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            arrows: 'to',
          });
        } else {
          edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
          });
        }
      } else {
        graph.addEdge(
          valuesJson[v].from,
          valuesJson[v].to,
          valuesJson[v].weight
        );
        if (directed) {
          edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            arrows: 'to',
            label: String(valuesJson[v].weight),
          });
        } else {
          edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            label: String(valuesJson[v].weight),
          });
        }
      }

      if (
        nodesFromJson.find((obj) => obj.id == valuesJson[v].from) == undefined
      ) {
        nodesFromJson.push({
          id: valuesJson[v].from,
          label: String(valuesJson[v].from),
        });
      }

      if (
        nodesFromJson.find((obj) => obj.id == valuesJson[v].to) == undefined
      ) {
        nodesFromJson.push({
          id: valuesJson[v].to,
          label: String(valuesJson[v].to),
        });
      }
    }
    return {
      nodes: nodesFromJson,
      edges: edgesFromJson,
    };
  }
}
