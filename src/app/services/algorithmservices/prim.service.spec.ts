import { TestBed } from '@angular/core/testing';
import { PrimService } from './prim.service';
import { GraphBuilderService } from '../graphbuilder.service';
import { DirectedWeightedGraph } from '../../models/graphs/directedweighted.graph';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true),
    };
  }
}

describe('Service: Prim', () => {
  let matDialog: MatDialog;
  let primService: PrimService;
  let builder: GraphBuilderService;
  let graph: DirectedWeightedGraph = new DirectedWeightedGraph();
  let nodes = [1, 2, 3, 4];
  let edges = [
    { from: 1, to: 2, weight: 2 },
    { from: 2, to: 3, weight: 3 },
    { from: 2, to: 4, weight: 4 },
    { from: 4, to: 3, weight: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        PrimService,
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    primService = TestBed.inject(PrimService);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Steps', () => {
    let result = builder.buildGraph(graph, nodes, edges);
    let generator = primService.primMST(1, graph);
    let step;

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(JSON.stringify({ startNode: 1 }));

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ from: 1, to: 2, weight: 2 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ from: 2, to: 3, weight: 3 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ from: 2, to: 4, weight: 4 })
    );

    step = generator.next();
    expect(JSON.stringify(step)).toBe(JSON.stringify({ done: true }));
  });
});
