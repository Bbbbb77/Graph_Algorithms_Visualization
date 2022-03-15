import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { CommandService } from '../../services/commandservice';
import { bfs } from '../../models/algorithms/bfs';
import { dfs } from '../../models/algorithms/dfs';
import { dijkstra } from '../../models/algorithms/dijkstra';
import { primMST } from '../../models/algorithms/prim';
import { kruskal } from '../../models/algorithms/kruskal';

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

  startNode: String;

  constructor(private commandService: CommandService) {}

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

  bfs(): void {
    console.log('generator', this.generator);
    this.generator = bfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  dfs(): void {
    this.generator = dfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  dijkstra(): void {
    this.generator = dijkstra(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  prim(): void {
    this.generator = primMST(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
    this.commandService.setAlgoGenerator(this.generator);
  }

  kruskal(): void {
    this.generator = kruskal(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
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

    //console.group();
    //console.table(generatorResult);
    //console.groupEnd();

    if (generatorResult.done) this.isAlgorithmEnded = true;

    return generatorResult;
  }

  startLoop(): void {
    let result = this.stepAlgo();

    if (!result.done) {
      this.startTimeMs = new Date().getTime();
      this.timerId = window.setTimeout(this.startLoop, this.speed * 1000);
    } /* else {
    }*/
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
