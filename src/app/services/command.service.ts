import { Injectable } from '@angular/core';

@Injectable()
export class CommandService {
  executed: any[];
  unexecuted: any[];
  generator;

  constructor() {
    this.executed = [];
    this.unexecuted = [];
  }

  setAlgoGenerator(algoGenerator): void {
    this.generator = algoGenerator;
  }

  clear(): void {
    this.executed = [];
    this.unexecuted = [];
    this.generator = null;
  }

  isExecutedEmpty(): boolean {
    return this.executed.length == 0;
  }

  isUnexecutedEmpty(): boolean {
    return this.unexecuted.length == 0;
  }

  do() {
    let result = this.generator.next();
    this.executed.push(result);
    return result;
  }

  undo() {
    let command = this.executed.pop();
    this.unexecuted.push(command);
    return command;
  }

  redo() {
    let command = this.unexecuted.pop();
    this.executed.push(command);
    return command;
  }
}
