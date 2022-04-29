import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../components/confirm.dialog/confirm.dialog';

@Injectable()
export class StorageSaveService {
  keysHelper: string[] = ['first', 'second', 'third', 'fourth', 'fifth'];

  constructor(public dialog: MatDialog) {}

  save(graphJson: string, img: string): void {
    let newValue = JSON.stringify({
      graphJson: graphJson,
      img: img,
    });

    if (localStorage.getItem('first') == undefined) {
      localStorage.setItem('first', newValue);
      return;
    }

    if (localStorage.getItem('second') == undefined) {
      localStorage.setItem('second', newValue);
      return;
    }

    if (localStorage.getItem('third') == undefined) {
      localStorage.setItem('third', newValue);
      return;
    }

    if (localStorage.getItem('fourth') == undefined) {
      localStorage.setItem('fourth', newValue);
      return;
    }

    if (localStorage.getItem('fifth') == undefined) {
      localStorage.setItem('fifth', newValue);
      return;
    }

    this.dialog
      .open(ConfirmDialog, {
        width: '300px',
        height: '225px',
        data: {
          message:
            'You have already reached the maximum (5) to save graphs.\n If you save this one the first will be deleted!',
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != undefined && result) {
          let prevKey = 'first';
          localStorage.removeItem(prevKey);
          for (let index = 0; index < this.keysHelper.length; index++) {
            let key = this.keysHelper[index];
            let value = localStorage.getItem(key);
            if (value != undefined) {
              localStorage.setItem(prevKey, value);
            }
            prevKey = key;
            localStorage.removeItem(key);
          }
          localStorage.setItem('fifth', newValue);
        }
      });
  }

  deleteKeys(keys: string[]): void {
    keys.map((key) => {
      localStorage.removeItem(key);
    });

    let listObjects: string[] = [];
    this.keysHelper.map((key) => {
      let value = localStorage.getItem(key);
      if (value != undefined) {
        listObjects.push(value);
        localStorage.removeItem(key);
      }
    });

    for (let i = 0; i < listObjects.length; i++) {
      localStorage.setItem(this.keysHelper[i], listObjects[i]);
    }
  }

  delete(deleteKey: string) {
    localStorage.removeItem(deleteKey);
    let index = this.keysHelper.findIndex((k) => k == deleteKey);

    let prevKey = deleteKey;
    for (; index < this.keysHelper.length; index++) {
      let key = this.keysHelper[index];
      let value = localStorage.getItem(key);
      if (value != undefined) {
        localStorage.setItem(prevKey, value);
      }
      prevKey = key;
      localStorage.removeItem(key);
    }
  }

  load(): {
    key: string;
    graph: {
      graphJson: string;
      img: string;
    };
  }[] {
    let graphList: {
      key: string;
      graph: {
        graphJson: string;
        img: string;
      };
    }[] = [];

    this.keysHelper.map((key) => {
      let value = localStorage.getItem(key);
      if (value != undefined) {
        graphList.push({ key: key, graph: JSON.parse(value) });
      }
    });

    return graphList;
  }
}
