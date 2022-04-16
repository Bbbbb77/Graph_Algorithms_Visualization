import { Injectable } from '@angular/core';

@Injectable()
export class AlgorithmsBaseService {
  stepCounter: number = 0;

  constructor() {}

  getStepCounter(): number {
    return this.stepCounter;
  }

  resetStepCounter(): void {
    this.stepCounter = 0;
  }

  protected increaseCounter(): void {
    console.log('inc counter');
    this.stepCounter++;
  }
}
