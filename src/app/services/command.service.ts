import { Injectable } from '@angular/core';

@Injectable()
export class CommandService {
  history: any[];
  executed: any[];
  unexecuted: any[];

  generator;

  constructor() {
    this.history = [];
    this.executed = [];
    this.unexecuted = [];
  }

  setAlgoGenerator(algoGenerator) {
    this.generator = algoGenerator;
  }

  clear() {
    this.history = [];
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
    console.log('do command', result);
    this.executed.push(result);
    this.history.push(result);
    return result;
  }

  undo() {
    let command = this.executed.pop();
    console.log('undo command', command);
    this.unexecuted.push(command);
    return command;
  }

  redo() {
    let command = this.unexecuted.pop();
    console.log('redo command', command);
    this.executed.push(command);
    return command;
  }
}