import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StorageSaveService } from '../../services/storagesaveservice';

@Component({
  selector: 'storagesaved.dialog',
  templateUrl: './storagesaved.dialog.html',
  styleUrls: ['./storagesaved.dialog.css'],
  providers: [StorageSaveService],
})
export class StorageSavedDialog implements OnInit {
  savedGraphs: {
    key: string;
    graph: {
      directed: boolean;
      weighted: boolean;
      graphJson: string;
      img: string;
    };
  }[] = [];

  deleteKeys: string[] = [];

  constructor(
    private storageSaveService: StorageSaveService,
    private dialogRef: MatDialogRef<StorageSavedDialog>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.savedGraphs = this.storageSaveService.load();
  }

  select(graph: {
    directed: boolean;
    weighted: boolean;
    graphJson: string;
    img: string;
  }): void {
    this.dialogRef.close({ deleteKeys: this.deleteKeys, graph: graph });
  }

  delete(key: string): void {
    this.deleteKeys.push(key);
    let index = this.savedGraphs.findIndex((g) => g.key == key);
    this.savedGraphs.splice(index, 1);
  }

  closeDialog(): void {
    this.dialogRef.close({ deleteKeys: this.deleteKeys });
  }
}
