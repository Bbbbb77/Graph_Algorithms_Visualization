import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { bfs } from '../../models/algorithms/bfs';
import { dfs } from '../../models/algorithms/dfs';

@Component({
  selector: 'algorithms',
  templateUrl: './algorithms.component.html',
  styleUrls: ['./algorithms.component.css'],
})
export class Algorithms implements OnInit {
  speed: number;
  timerId: number;
  remainingTime: number = 0;
  startTimeMs: number = 0;

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

  constructor() {}

  ngOnInit(): void {}

  resetAlgo(): void {
    this.generator = undefined;
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
  }

  dfs(): void {
    this.generator = dfs(
      this.isNumeric(this.startNode) ? Number(this.startNode) : this.startNode,
      this.graph
    );
  }

  formatLabel(value: number) {
    return value;
  }

  stepAlgo(): void {
    let generatorResult = this.generator.next();
    console.log('generatorResult', generatorResult);
    this.generatorResultEmitter.emit(generatorResult);
  }

  startLoop(): void {
    this.stepAlgo();

    //todo if done

    this.startTimeMs = new Date().getTime();
    this.timerId = window.setTimeout(this.startLoop, this.speed * 1000);
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
