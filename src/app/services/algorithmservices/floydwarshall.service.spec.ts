import { TestBed } from '@angular/core/testing';
import { FloydWarshallService } from './floydwarshall.service';
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

describe('Service: Floyd-Warshall', () => {
  let matDialog: MatDialog;
  let floydWarshallService: FloydWarshallService;
  let builder: GraphBuilderService;
  let graph: DirectedWeightedGraph = new DirectedWeightedGraph();
  let nodes = [1, 2, 3, 4];
  let edges = [
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 4, weight: 10 },
    { from: 2, to: 3, weight: 3 },
    { from: 3, to: 4, weight: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        FloydWarshallService,
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    floydWarshallService = TestBed.inject(FloydWarshallService);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Steps', () => {
    let result = builder.buildGraph(graph, nodes, edges);
    let generator = floydWarshallService.floydWarshall(graph);
    let step;
    let mapCheck = new Map();

    step = generator.next();
    mapCheck.set(1, [
      { node: 1, weight: 0 },
      { node: 2, weight: 5 },
      { node: 3, weight: Number.MAX_VALUE },
      { node: 4, weight: 10 },
    ]);
    mapCheck.set(2, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: 0 },
      { node: 3, weight: 3 },
      { node: 4, weight: Number.MAX_VALUE },
    ]);
    mapCheck.set(3, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: 0 },
      { node: 4, weight: 1 },
    ]);
    mapCheck.set(4, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: Number.MAX_VALUE },
      { node: 4, weight: 0 },
    ]);
    expect(step.value).toEqual({ distances: mapCheck });

    step = generator.next();
    mapCheck.set(1, [
      { node: 1, weight: 0 },
      { node: 2, weight: 5 },
      { node: 3, weight: 8 },
      { node: 4, weight: 10 },
    ]);
    mapCheck.set(2, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: 0 },
      { node: 3, weight: 3 },
      { node: 4, weight: Number.MAX_VALUE },
    ]);
    mapCheck.set(3, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: 0 },
      { node: 4, weight: 1 },
    ]);
    mapCheck.set(4, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: Number.MAX_VALUE },
      { node: 4, weight: 0 },
    ]);
    expect(step.value).toEqual({ distances: mapCheck });

    step = generator.next();
    mapCheck.set(1, [
      { node: 1, weight: 0 },
      { node: 2, weight: 5 },
      { node: 3, weight: 8 },
      { node: 4, weight: 9 },
    ]);
    mapCheck.set(2, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: 0 },
      { node: 3, weight: 3 },
      { node: 4, weight: Number.MAX_VALUE },
    ]);
    mapCheck.set(3, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: 0 },
      { node: 4, weight: 1 },
    ]);
    mapCheck.set(4, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: Number.MAX_VALUE },
      { node: 4, weight: 0 },
    ]);
    expect(step.value).toEqual({ distances: mapCheck });

    step = generator.next();
    mapCheck.set(1, [
      { node: 1, weight: 0 },
      { node: 2, weight: 5 },
      { node: 3, weight: 8 },
      { node: 4, weight: 9 },
    ]);
    mapCheck.set(2, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: 0 },
      { node: 3, weight: 3 },
      { node: 4, weight: 4 },
    ]);
    mapCheck.set(3, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: 0 },
      { node: 4, weight: 1 },
    ]);
    mapCheck.set(4, [
      { node: 1, weight: Number.MAX_VALUE },
      { node: 2, weight: Number.MAX_VALUE },
      { node: 3, weight: Number.MAX_VALUE },
      { node: 4, weight: 0 },
    ]);
    expect(step.value).toEqual({ distances: mapCheck });

    step = generator.next();
    expect(JSON.stringify(step)).toBe(JSON.stringify({ done: true }));
  });
});
