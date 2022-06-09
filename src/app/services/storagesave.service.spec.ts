import { TestBed } from '@angular/core/testing';
import { StorageSaveService } from './storagesave.service';
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

describe('Service: StorageSave', () => {
  let localStore;
  let matDialog: MatDialog;
  let storageSave: StorageSaveService;
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
        StorageSaveService,
        { provide: MatDialog, useValue: MatDialogMock },
        GraphBuilderService,
        { provide: MatDialog, useValue: MatDialogMock },
      ],
    });
    matDialog = TestBed.inject(MatDialog);
    storageSave = TestBed.inject(StorageSaveService);
    builder = TestBed.inject(GraphBuilderService);

    localStore = {};

    spyOn(window.localStorage, 'getItem').and.callFake((key) =>
      key in localStore ? localStore[key] : null
    );
    spyOn(window.localStorage, 'setItem').and.callFake(
      (key, value) => (localStore[key] = value + '')
    );
    spyOn(window.localStorage, 'clear').and.callFake(() => (localStore = {}));
  });

  it('Save and Load', () => {
    expect(storageSave).toBeDefined();
    expect(builder).toBeDefined();

    let result = builder.buildGraph(graph, nodes, edges);
    let graphJson = graph.save();

    storageSave.save(graphJson, 'GraphPicture');
    let saves = storageSave.load();

    expect(saves.length).toBe(1);

    let save = saves.find((s) => s.key == 'first');
    if (save != undefined) {
      expect(save.graph.graphJson).toBe(graphJson);
      expect(save.graph.img).toBe('GraphPicture');
    }
  });
});
