import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class Player implements OnInit {
  speed: number;
  timerId: number;
  remainingTime: number = 0;
  startTimeMs: number = 0;

  @Input()
  graph;

  @Input()
  directed: boolean;

  @Input()
  weighted: boolean;

  @Output()
  step = new EventEmitter();

  /*@Output()
  step = new EventEmitter();

  @Output()
  step = new EventEmitter();

  @Output()
  step = new EventEmitter();*/

  constructor() {}

  ngOnInit(): void {}

  formatLabel(value: number) {
    return value;
  }

  stepAlgo(): void {
    this.step.emit();
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
