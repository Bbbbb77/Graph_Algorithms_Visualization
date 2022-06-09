import { TestBed } from '@angular/core/testing';
import { GraphBuilderService } from './graphbuilder.service';
import { DirectedWeightedGraph } from '../models/graphs/directedweighted.graph';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true),
    };
  }
}

describe('Service: GraphBuilder', () => {
  let matDialog: MatDialog;
  let builder: GraphBuilderService;
  let graph: DirectedWeightedGraph = new DirectedWeightedGraph();
  let nodes = [1, 2, 3];
  let edges = [
    { from: 1, to: 2, weight: 4 },
    { from: 2, to: 3, weight: 3 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Nodes and edges are correct', () => {
    expect(builder).toBeDefined();
    let result = builder.buildGraph(graph, nodes, edges);
    if (
      result != undefined &&
      result.nodes != undefined &&
      result.edges != undefined
    ) {
      expect(result.nodes.length).toBe(3);
      expect(result.edges.length).toBe(2);

      expect(JSON.stringify(result.nodes[0])).toBe(
        JSON.stringify({ id: 1, label: '1' })
      );
      expect(JSON.stringify(result.nodes[1])).toBe(
        JSON.stringify({ id: 2, label: '2' })
      );
      expect(JSON.stringify(result.nodes[2])).toBe(
        JSON.stringify({ id: 3, label: '3' })
      );

      expect(JSON.stringify(result.edges[0])).toBe(
        JSON.stringify({ id: '12', from: 1, to: 2, arrows: 'to', label: '4' })
      );
      expect(JSON.stringify(result.edges[1])).toBe(
        JSON.stringify({ id: '23', from: 2, to: 3, arrows: 'to', label: '3' })
      );

      let adjList = graph.getAdjList();
      expect(adjList.get(1).length).toBe(1);
      expect(JSON.stringify(adjList.get(1)[0])).toBe(
        JSON.stringify({ node: 2, weight: 4 })
      );

      expect(adjList.get(2).length).toBe(1);
      expect(JSON.stringify(adjList.get(2)[0])).toBe(
        JSON.stringify({ node: 3, weight: 3 })
      );

      expect(adjList.get(3).length).toBe(0);
    }
  });
});
