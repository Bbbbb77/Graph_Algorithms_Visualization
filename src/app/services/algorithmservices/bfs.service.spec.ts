import { TestBed } from '@angular/core/testing';
import { BfsService } from './bfs.service';
import { GraphBuilderService } from '../graphbuilder.service';
import { DirectedUnweightedGraph } from '../../models/graphs/directedunweighted.graph';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true),
    };
  }
}

describe('Service: BFS', () => {
  let matDialog: MatDialog;
  let bfsService: BfsService;
  let builder: GraphBuilderService;
  let graph: DirectedUnweightedGraph = new DirectedUnweightedGraph();
  let nodes = [1, 2, 3, 4];
  let edges = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        BfsService,
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    bfsService = TestBed.inject(BfsService);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Steps', () => {
    let result = builder.buildGraph(graph, nodes, edges);
    let generator = bfsService.bfs(1, graph);
    let step;

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(JSON.stringify({ startNode: 1 }));

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 1, newInQueue: [2] })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 2, newInQueue: [3, 4] })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 3, newInQueue: [] })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 4, newInQueue: [] })
    );

    step = generator.next();
    expect(JSON.stringify(step)).toBe(JSON.stringify({ done: true }));
  });
});
