import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

import { CommandService } from '../../services/command.service';

import { BfsService } from '../../services/algorithmservices/bfs.service';
import { DfsService } from '../../services/algorithmservices/dfs.service';
import { DijkstraService } from '../../services/algorithmservices/dijkstra.service';
import { PrimService } from '../../services/algorithmservices/prim.service';
import { KruskalService } from '../../services/algorithmservices/kruskal.service';
import { FloydWarshallService } from '../../services/algorithmservices/floydwarshall.service';
import { BellmanFordService } from '../../services/algorithmservices/bellmanford.service';

import { MessageDialog } from '../message.dialog/message.dialog';
import { StepsCounterDialog } from '../stepscounter.dialog/stepscounter.dialog';

@Component({
  selector: 'algorithms',
  templateUrl: './algorithms.component.html',
  styleUrls: ['./algorithms.component.css'],
  providers: [
    CommandService,
    BfsService,
    DfsService,
    DijkstraService,
    PrimService,
    KruskalService,
    FloydWarshallService,
    BellmanFordService,
  ],
})
export class Algorithms implements OnInit {
  private eventsSubscription: Subscription;

  speed: number = 2;
  timerId: number;
  remainingTime: number = 0;
  startTimeMs: number = 0;
  isAlgorithmEnded: boolean = false;
  selectedAlgo: string = '';
  generator;
  algoStepsMap = new Map();

  @Input()
  graph;

  @Input()
  directed?: boolean;

  @Input()
  weighted?: boolean;

  @Input()
  startNode: String = '';

  @Input()
  graphIsConnected: boolean;

  @Input()
  graphHasNegativeEdge: boolean;

  @Input()
  events: Observable<void>;

  @Input()
  isAdjListEmpty: boolean = true;

  @Input()
  kruskalUserColoring: boolean = false;

  @Output()
  generatorResultEmitter: EventEmitter<any> = new EventEmitter();

  @Output()
  resetAlgoEmitter = new EventEmitter();

  @Output()
  algoNameEmitter = new EventEmitter();

  @Output()
  kruskalCostEmitter = new EventEmitter();

  @Output()
  startNodeSelectedEmitter = new EventEmitter();

  startNodeChanges(value): void {
    this.startNodeSelectedEmitter.emit(value);
  }

  constructor(
    private bfsService: BfsService,
    private dfsService: DfsService,
    private dijkstraService: DijkstraService,
    private primService: PrimService,
    private kruskalService: KruskalService,
    private bellmanFordService: BellmanFordService,
    private floydWarshallService: FloydWarshallService,
    private commandService: CommandService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe(() => {
      this.bfsService.resetStepCounter();
      this.dfsService.resetStepCounter();
      this.dijkstraService.resetStepCounter();
      this.primService.resetStepCounter();
      this.kruskalService.resetStepCounter();
      this.floydWarshallService.resetStepCounter();
      this.bellmanFordService.resetStepCounter();
      this.algoStepsMap.clear();
      this.resetAlgo();
    });
  }

  resetAlgo(): void {
    this.startNode = '';
    this.generator = undefined;
    this.isAlgorithmEnded = false;
    this.selectedAlgo = '';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.remainingTime = 0;
    this.startTimeMs = 0;
    this.kruskalUserColoring = false;
    this.commandService.clear();
    this.resetAlgoEmitter.emit();
  }

  isNumeric(num): boolean {
    return !isNaN(num);
  }

  isStartNodeCorrect(): boolean {
    let error = '';
    if (this.startNode === '') {
      error = 'Start node is not provided!';
    } else if (!this.graph.isNodeInGraph(this.startNode)) {
      error = 'Selected node is not in the graph!';
    }

    if (error != '') {
      this.dialog.open(MessageDialog, {
        width: '300px',
        height: '200px',
        data: { title: 'Error', message: error, error: true },
      });
      return false;
    } else {
      return true;
    }
  }

  bfs(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.selectedAlgo = 'bfs';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.bfsService.resetStepCounter();
    this.generator = this.bfsService.bfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  dfs(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.selectedAlgo = 'dfs';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.dfsService.resetStepCounter();
    this.generator = this.dfsService.dfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  dijkstra(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.selectedAlgo = 'dijkstra';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.dijkstraService.resetStepCounter();
    this.generator = this.dijkstraService.dijkstra(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  prim(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.selectedAlgo = 'prim';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.primService.resetStepCounter();
    this.generator = this.primService.primMST(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  kruskal(): void {
    this.selectedAlgo = 'kruskal';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.kruskalService.resetStepCounter();
    this.generator = this.kruskalService.kruskal(this.graph);
    this.commandService.setAlgoGenerator(this.generator);
  }

  bellmanford(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.selectedAlgo = 'bellmanford';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.bellmanFordService.resetStepCounter();
    this.generator = this.bellmanFordService.bellmanFord(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  floydWarshall(): void {
    this.selectedAlgo = 'floydWarshall';
    this.algoNameEmitter.emit(this.selectedAlgo);
    this.floydWarshallService.resetStepCounter();
    this.generator = this.floydWarshallService.floydWarshall(this.graph);
    this.commandService.setAlgoGenerator(this.generator);
  }

  formatLabel(value: number) {
    return value;
  }

  canUndo(): boolean {
    return this.commandService.isExecutedEmpty();
  }

  stepBackAlgo() {
    let undoCommand = this.commandService.undo();
    this.generatorResultEmitter.emit({
      algoStepResult: undoCommand,
      undo: true,
    });
    this.isAlgorithmEnded = false;
  }

  stepAlgo() {
    let generatorResult;
    if (this.commandService.isUnexecutedEmpty()) {
      generatorResult = this.commandService.do();
      this.generatorResultEmitter.emit({
        algoStepResult: generatorResult,
        undo: false,
      });
    } else {
      generatorResult = this.commandService.redo();
      this.generatorResultEmitter.emit({
        algoStepResult: generatorResult,
        undo: false,
      });
    }

    if (generatorResult.done) {
      this.dialog.open(MessageDialog, {
        width: '300px',
        height: '200px',
        data: {
          title: 'Info',
          message: 'Algorithm is ended!',
          error: false,
        },
      });
      this.isAlgorithmEnded = true;
      if (this.selectedAlgo == 'bfs') {
        this.algoStepsMap.set('bfs', this.bfsService.getStepCounter());
        this.bfsService.resetStepCounter();
      } else if (this.selectedAlgo == 'dfs') {
        this.algoStepsMap.set('dfs', this.dfsService.getStepCounter());
        this.dfsService.resetStepCounter();
      } else if (this.selectedAlgo == 'dijkstra') {
        this.algoStepsMap.set(
          'dijkstra',
          this.dijkstraService.getStepCounter()
        );
        this.dijkstraService.resetStepCounter();
      } else if (this.selectedAlgo == 'prim') {
        this.algoStepsMap.set('prim', this.primService.getStepCounter());
        this.primService.resetStepCounter();
      } else if (this.selectedAlgo == 'kruskal') {
        this.algoStepsMap.set('kruskal', this.kruskalService.getStepCounter());
        this.kruskalService.resetStepCounter();
        this.kruskalCostEmitter.emit(this.kruskalService.getMinimumCost());
      } else if (this.selectedAlgo == 'bellmanford') {
        this.algoStepsMap.set(
          'bellmanford',
          this.bellmanFordService.getStepCounter()
        );
        this.bellmanFordService.resetStepCounter();
      } else if (this.selectedAlgo == 'floydWarshall') {
        this.algoStepsMap.set(
          'floydWarshall',
          this.floydWarshallService.getStepCounter()
        );
        this.floydWarshallService.resetStepCounter();
      }
    }
    return generatorResult;
  }

  startLoop(): void {
    this.stepAlgo();
    if (!this.isAlgorithmEnded) {
      this.startTimeMs = new Date().getTime();
      this.timerId = window.setTimeout(
        this.startLoop.bind(this),
        this.speed * 1000
      );
    }
  }

  pause(): void {
    this.remainingTime = this.speed - (new Date().getTime() - this.startTimeMs);
    window.clearTimeout(this.timerId);
  }

  resume(): void {
    this.startTimeMs = new Date().getTime();
    this.timerId = window.setTimeout(this.startLoop, this.remainingTime);
  }

  openStats(): void {
    this.dialog.open(StepsCounterDialog, {
      width: '225px',
      height: '400px',
      data: { steps: this.algoStepsMap },
    });
  }
}
