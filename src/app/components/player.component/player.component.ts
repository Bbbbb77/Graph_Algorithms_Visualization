import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class Player implements OnInit {
  speed: number;

  @Input()
  directed: boolean;

  @Input()
  weighted: boolean;

  constructor() {}

  ngOnInit(): void {}

  formatLabel(value: number) {
    return value;
  }
}
