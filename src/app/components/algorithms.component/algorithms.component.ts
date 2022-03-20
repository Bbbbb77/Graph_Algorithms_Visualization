import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CommandService } from '../../services/commandservice';

import { ErrorMessageDialog } from '../errormessage.dialog/errormessage.dialog';

import { bfs } from '../../models/algorithms/bfs';
import { dfs } from '../../models/algorithms/dfs';
import { dijkstra } from '../../models/algorithms/dijkstra';
import { primMST } from '../../models/algorithms/prim';
import { kruskal } from '../../models/algorithms/kruskal';
import { topologicalSorting } from '../../models/algorithms/topologicalsorting';
import { bellmanFord } from '../../models/algorithms/bellmanford';
import { floydWarshall } from '../../models/algorithms/floydWarshall';

@Component({
  selector: 'algorithms',
  templateUrl: './algorithms.component.html',
  styleUrls: ['./algorithms.component.css'],
  providers: [CommandService],
})
export class Algorithms implements OnInit {
  speed: number;
  timerId: number;
  remainingTime: number = 0;
  startTimeMs: number = 0;
  isAlgorithmEnded: boolean = false;
  startNode: String = '';
  generator;

  @Input()
  graph;

  @Input()
  directed: boolean;

  @Input()
  weighted: boolean;

  @Output()
  generatorResultEmitter: EventEmitter<any> = new EventEmitter();

  @Output()
  resetAlgoEmitter = new EventEmitter();

  constructor(
    private commandService: CommandService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  resetAlgo(): void {
    this.generator = undefined;
    this.isAlgorithmEnded = false;
    this.commandService.clear();
    this.resetAlgoEmitter.emit();
  }

  isNumeric(num): boolean {
    return !isNaN(num);
  }

  isStartNodeCorrect(): boolean {
    let error = '';
    console.log('node', this.startNode);
    console.log('type', typeof this.startNode);
    if (this.startNode === '') {
      error = 'Start node is not provided!';
    } else if (!this.graph.isNodeInGraph(this.startNode)) {
      error = 'Selected node is not in the graph!';
    }

    if (error != '') {
      this.dialog.open(ErrorMessageDialog, {
        width: '300px',
        height: '200px',
        data: { errorMessage: error },
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
    this.generator = bfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  dfs(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.generator = dfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  dijkstra(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.generator = dijkstra(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  prim(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.generator = primMST(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  kruskal(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.generator = kruskal(
      //this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  bellmanford(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    this.generator = bellmanFord(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  floydWarshall(): void {
    // this.generator = floydWarshall(
    //this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
    //   this.graph
    // );
    // this.commandService.setAlgoGenerator(this.generator);
  }

  topSort(): void {
    if (!this.isStartNodeCorrect()) {
      return;
    }
    topologicalSorting(this.graph);
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
      this.isAlgorithmEnded = true;
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
}
