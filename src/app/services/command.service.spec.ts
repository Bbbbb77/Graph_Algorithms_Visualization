import { TestBed } from '@angular/core/testing';
import { BfsService } from './algorithmservices/bfs.service';
import { CommandService } from './command.service';
import { GraphBuilderService } from './graphbuilder.service';
import { DirectedUnweightedGraph } from '../models/graphs/directedunweighted.graph';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true),
    };
  }
}

describe('Service: Command', () => {
  let matDialog: MatDialog;
  let bfsService: BfsService;
  let command: CommandService;
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
        BfsService,
        CommandService,
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    bfsService = TestBed.inject(BfsService);
    command = TestBed.inject(CommandService);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Steps', () => {
    let result = builder.buildGraph(graph, nodes, edges);
    let generator = bfsService.bfs(1, graph);
    command.setAlgoGenerator(generator);
    let step;

    step = command.do();
    expect(JSON.stringify(step.value)).toBe(JSON.stringify({ startNode: 1 }));

    step = command.do();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 1, newInQueue: [2] })
    );

    step = command.do();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 2, newInQueue: [3] })
    );

    step = command.undo();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 2, newInQueue: [3] })
    );

    step = command.redo();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 2, newInQueue: [3] })
    );

    step = command.do();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ current: 3, newInQueue: [] })
    );

    step = command.do();
    expect(JSON.stringify(step)).toBe(JSON.stringify({ done: true }));
  });
});
