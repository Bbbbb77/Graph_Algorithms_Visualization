import { TestBed } from '@angular/core/testing';
import { DfsService } from './dfs.service';
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

describe('Service: DFS', () => {
  let matDialog: MatDialog;
  let dfsService: DfsService;
  let builder: GraphBuilderService;
  let graph: DirectedUnweightedGraph = new DirectedUnweightedGraph();
  let nodes = [1, 2, 3];
  let edges = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DfsService,
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    dfsService = TestBed.inject(DfsService);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Steps', () => {
    let result = builder.buildGraph(graph, nodes, edges);
    let generator = dfsService.dfs(1, graph);
    let step;

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ startNode: 1, startCounter: 1 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 1, next: 2, startCounter: 2 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 2, next: 3, startCounter: 3 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 3, endCounter: 4 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 2, endCounter: 5 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 1, endCounter: 6 })
    );

    step = generator.next();
    expect(JSON.stringify(step)).toBe(JSON.stringify({ done: true }));
  });
});
