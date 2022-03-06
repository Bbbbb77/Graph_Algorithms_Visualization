import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgModule,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAndEditNodeDialog } from '../addandeditnode.dialog/addandeditnode.dialog';
import { AddGraphDialog } from '../addgraph.dialog/addgraph.dialog';
import { AddAndEditWeightedEdge } from '../addandeditweightededge.dialog/addandeditweightededge.dialog';
import { RandomGraph } from '../randomgraph.component/randomgraph.component';
import { Algorithms } from '../algorithms.component/algorithms.component';
import { Player } from '../player.component/player.component';

declare var vis: any;

@Component({
  selector: 'mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css'],
})
export class MainPage implements OnInit, AfterViewInit {
  @ViewChild('siteConfigNetwork')
  networkContainer: ElementRef;

  @Output()
  directed: boolean;

  @Output()
  weighted: boolean;

  public network: any;

  constructor(public dialog: MatDialog) {}

  change(): void {
    console.log('directed', this.directed);
    console.log('weighted', this.weighted);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    var nodes = [
      { id: 1, label: 'Node 1', title: 'I am node 1!' },
      { id: 2, label: 'Node 2', title: 'I am node 2!' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
      { id: 5, label: 'Node 5' },
    ];

    // create an array with edges
    var edges = [
      { from: 1, to: 3 },
      { from: 1, to: 2 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
    ];

    var treeData = {
      nodes: new vis.DataSet(nodes),
      edges: new vis.DataSet(edges),
    };

    var options = {
      interaction: {
        hover: true,
      },
      manipulation: {
        addNode: (data, callback) => {
          console.log('addnode');

          this.addNodeDialog(data, callback);
        },
        editNode: (data, callback) => {
          console.log('editnode');
        },
        deleteNode: (data, callback) => {
          console.log('deleteNode');
        },
        addEdge: (data, callback) => {
          console.log('addEdge');
        },
        deleteEdge: (data, callback) => {
          console.log('deleteEdge');
        },
      },
    };
    var container = this.networkContainer.nativeElement;
    this.network = new vis.Network(container, treeData, options);
  }

  clearNodePopUp(): void {}

  addNodeDialog(data, callback): void {
    console.log('dialog open');
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '250px',
        height: '250px',
        data: { label: 'Add new node', nodeValue: '5' },
      })
      .afterClosed()
      .subscribe();
  }

  editNode(data, callback): void {
    console.log('dialog open');
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '250px',
        height: '250px',
        data: { label: 'Edit node', nodeValue: '5' },
      })
      .afterClosed()
      .subscribe();
  }

  addGraph(): void {
    this.dialog.open(AddGraphDialog, {
      width: '300px',
      height: '350px',
      data: {},
    });
  }

  deleteSelectedNode(data, callback): void {}
  addEdgeWithoutDrag(data, callback): void {}
  editEdgeWithoutDragFunc(data, callback): void {}
  deleteSelectedEdge(data, callback): void {}

  reset(): void {}
}
