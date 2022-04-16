import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'stepscounter.dialog',
  templateUrl: './stepscounter.dialog.html',
  styleUrls: ['./stepscounter.dialog.css'],
})
export class StepsCounterDialog implements OnInit {
  algoSteps: { algo: string; steps: number }[] = [];

  constructor(
    private dialogRef: MatDialogRef<StepsCounterDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    data.steps.forEach((value, key, map) => {
      this.algoSteps.push({ algo: key, steps: value });
    });
  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }
}
