import { TestBed } from '@angular/core/testing';
import { KruskalService } from './kruskal.service';
import { GraphBuilderService } from '../graphbuilder.service';
import { UndirectedWeightedGraph } from '../../models/graphs/undirectedweighted.graph';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true),
    };
  }
}

describe('Service: Kruskal', () => {
  let matDialog: MatDialog;
  let kruskalService: KruskalService;
  let builder: GraphBuilderService;
  let graph: UndirectedWeightedGraph = new UndirectedWeightedGraph();
  let nodes = [1, 2, 3, 4];
  let edges = [
    { from: 1, to: 2, weight: 2 },
    { from: 2, to: 3, weight: 3 },
    { from: 2, to: 4, weight: 4 },
    { from: 3, to: 4, weight: 1 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        KruskalService,
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    kruskalService = TestBed.inject(KruskalService);
    builder = TestBed.inject(GraphBuilderService);
  });

  it('Steps', () => {
    let result = builder.buildGraph(graph, nodes, edges);
    let generator = kruskalService.kruskal(graph);
    let step;

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ from: 3, to: 4, weight: 1 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ from: 1, to: 2, weight: 2 })
    );

    step = generator.next();
    expect(JSON.stringify(step.value)).toBe(
      JSON.stringify({ from: 2, to: 3, weight: 3 })
    );

    step = generator.next();
    expect(JSON.stringify(step)).toBe(JSON.stringify({ done: true }));
  });
});
