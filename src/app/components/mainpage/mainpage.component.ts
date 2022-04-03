import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgModule,
  Output,
  Input,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAndEditNodeDialog } from '../addandeditnode.dialog/addandeditnode.dialog';
import { AddGraphDialog } from '../addgraph.dialog/addgraph.dialog';
import { AddAndEditWeightedEdge } from '../addandeditweightededge.dialog/addandeditweightededge.dialog';
import { RandomGraph } from '../randomgraph.component/randomgraph.component';
import { Algorithms } from '../algorithms.component/algorithms.component';
import { Player } from '../player.component/player.component';
import { ErrorMessageDialog } from '../errormessage.dialog/errormessage.dialog';

import { Graph } from '../../models/graphs/graph';
import { DirectedWeightedGraph } from '../../models/graphs/directedweighted.graph';
import { DirectedUnweightedGraph } from '../../models/graphs/directedunweighted.graph';
import { UndirectedUnweightedGraph } from '../../models/graphs/undirectedunweighted.graph';
import { UndirectedWeightedGraph } from '../../models/graphs/undirectedweighted.graph';

import { MatTable } from '@angular/material/table';

declare var vis: any;

export interface BellmanFordTableElement {
  Node: string;
  Distance: string;
}

export interface DfsNode {
  startCounter: number;
  endCounter?: number;
}

@Component({
  selector: 'mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css'],
})
export class MainPage implements OnInit {
  @ViewChild('siteConfigNetwork')
  networkContainer: ElementRef;

  @Output()
  directed?: boolean;

  @Output()
  weighted?: boolean;

  @Output()
  graphHasNegativeEdge: boolean = false;

  @Output()
  graphIsConnected: boolean = false;

  @Output()
  graph: any;

  graphText: string;

  network: any = null;
  seed: number = 2;
  nodes: any[];
  edges: any[];
  baseData;
  nodesFromJson;
  edgesFromJson;

  nodeIdIndex: number = 0;
  idOfnode = new Map();

  edgeIdIndex: number = 0;
  edgesOfNode = new Map();
  nodesOfEdge = new Map();

  prevNodeValue = null;

  bellmanFordTable: BellmanFordTableElement[] = [];
  dfsCounterMap = new Map();
  dfsStack: string[] = [];
  bfsQueue: string[] = [];

  distaceColumnHeaders: string[] = ['Node', 'Distance'];
  queueColumnHeaders: string[] = ['Node queue'];
  stackColumnHeaders: string[] = ['Node stack'];

  selectedAlgorithmName: string = '';
  selectedAlgorithm(algorithmName) {
    console.log('selectedalgorithm', algorithmName);
    if (algorithmName == 'bfs') {
      this.selectedAlgorithmName = 'bfs';
      console.log('bfs');
    } else if (algorithmName == 'bellmanford') {
      this.selectedAlgorithmName = 'bellmanford';
      console.log('bellmanford');
      if (this.weighted) {
        this.newTable();
      }
    } else if (algorithmName == 'dfs') {
      this.selectedAlgorithmName = 'dfs';
    } else {
      this.selectedAlgorithmName = '';
    }
  }

  constructor(public dialog: MatDialog) {}

  @ViewChild('algorithmsComponent')
  algorithmsComponent: Algorithms;

  @ViewChild('bellmanfordtable')
  bellmanfordtable: MatTable<BellmanFordTableElement>;

  @ViewChild('bfsqueuetable')
  bfsqueuetable: MatTable<string>;

  @ViewChild('dfsstacktable')
  dfsstacktable: MatTable<string>;

  newTable(): void {
    this.bellmanFordTable = [];
    let nodes = this.graph.getNodes().sort();
    nodes.forEach((node) => {
      this.bellmanFordTable.push({
        Node: String(node),
        Distance: 'INF',
      });
    });
  }

  setStartNodeInTable(startNode): void {
    let toIndex = this.bellmanFordTable.findIndex(
      (b) => b.Node == String(startNode)
    );
    this.bellmanFordTable[toIndex].Distance = String(0);
    this.bellmanfordtable.renderRows();
  }

  updateTable(fromNode, toNode, distance): void {
    let toIndex = this.bellmanFordTable.findIndex(
      (b) => b.Node == String(toNode)
    );
    this.bellmanFordTable[toIndex].Distance = String(distance);
    this.bellmanfordtable.renderRows();
  }

  ngOnInit(): void {}

  createGraph(): void {
    if (this.directed) {
      if (this.weighted) {
        this.graph = new DirectedWeightedGraph();
      } else {
        this.graph = new DirectedUnweightedGraph();
      }
    } else {
      if (this.weighted) {
        this.graph = new UndirectedWeightedGraph();
      } else {
        this.graph = new UndirectedUnweightedGraph();
      }
    }
    this.destroy();
    this.setupNetwork();
  }

  setupNetwork(): void {
    var options = {
      layout: { randomSeed: this.seed },
      nodes: { borderWidth: 4, size: 100 },
      edges: { color: { color: '#2b7ce9', inherit: false } },
      manipulation: {
        addNode: (data, callback) => {
          this.addNode(data, callback);
        },
        editNode: (data, callback) => {
          this.editNode(data, callback);
        },
        deleteNode: (data, callback) => {
          this.deleteSelectedNode(data, callback);
        },
        addEdge: (data, callback) => {
          if (data.from == data.to) {
            this.dialog
              .open(ErrorMessageDialog, {
                width: '300px',
                height: '200px',
                data: { errorMessage: 'Node cannot be connected with itsel!' },
              })
              .afterClosed()
              .subscribe((result) => {
                callback(null);
                return;
              });
          } else {
            this.addEdgeWithoutDrag(data, callback);
          }
        },
        editEdge: {
          editWithoutDrag: (data, callback) => {
            if (!this.weighted) {
              this.dialog
                .open(ErrorMessageDialog, {
                  width: '300px',
                  height: '200px',
                  data: {
                    errorMessage:
                      'Edge cannot be edited because the graph is not weighted!',
                  },
                })
                .afterClosed()
                .subscribe((result) => {
                  callback(null);
                  return;
                });
            } else {
              this.editEdgeWithoutDragFunc(data, callback);
            }
          },
        },
        deleteEdge: (data, callback) => {
          this.deleteSelectedEdge(data, callback);
        },
      },
    };

    var container = this.networkContainer.nativeElement;
    this.network = new vis.Network(container, this.baseData, options);
  }

  destroy(): void {
    if (this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
    if (this.baseData) {
      this.baseData.nodes.clear();
      this.baseData.edges.clear();
    }
  }

  drawGraph(): void {
    let rawJson = this.graphText.replace(/\n/g, '').replace(' ', '');
    let valuesJson = JSON.parse(rawJson);

    this.nodesFromJson = [];
    this.edgesFromJson = [];

    for (let v in valuesJson) {
      if (!this.weighted) {
        this.graph.addEdge(valuesJson[v].from, valuesJson[v].to);
        if (this.directed) {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            arrows: 'to',
          });
        } else {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
          });
        }
      } else {
        this.graph.addEdge(
          valuesJson[v].from,
          valuesJson[v].to,
          valuesJson[v].weight
        );
        if (this.directed) {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            arrows: 'to',
            label: String(valuesJson[v].weight),
          });
        } else {
          this.edgesFromJson.push({
            id: String(valuesJson[v].from) + String(valuesJson[v].to),
            from: valuesJson[v].from,
            to: valuesJson[v].to,
            label: String(valuesJson[v].weight),
          });
        }
      }

      if (
        this.nodesFromJson.find((obj) => obj.id == valuesJson[v].from) ==
        undefined
      ) {
        this.nodesFromJson.push({
          id: valuesJson[v].from,
          label: String(valuesJson[v].from),
        });
      }

      if (
        this.nodesFromJson.find((obj) => obj.id == valuesJson[v].to) ==
        undefined
      ) {
        this.nodesFromJson.push({
          id: valuesJson[v].to,
          label: String(valuesJson[v].to),
        });
      }
    }

    let nodesDataSet = new vis.DataSet(this.nodesFromJson);
    let edgesDataSet = new vis.DataSet(this.edgesFromJson);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  setNodesAndEdges(): void {}

  addNode(data, callback): void {
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '250px',
        height: '250px',
        data: { label: 'Add new node', nodeValue: '5', editMode: false },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != undefined) {
          data.label = result;
          data.id = Number(result);
          if (this.graph.addNode(data.id)) {
            this.graphIsConnected = this.graph.isConnected();
            callback(data);
          }
        }
      });
  }

  editNode(data, callback): void {
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '250px',
        height: '250px',
        data: { label: 'Edit node', nodeValue: data.label, editMode: true },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != undefined) {
          data.label = result;
          data.id = Number(result);
          this.network.getConnectedEdges(this.prevNodeValue);

          var newEdges: any[] = [];

          var edgeIdsOfNode = this.network.getConnectedEdges(
            this.prevNodeValue
          );

          var edgesOfNode = this.baseData.edges.get(edgeIdsOfNode);

          edgesOfNode.map((edge) => {
            if (edge.from == this.prevNodeValue) {
              newEdges.push({
                id: String(data.id) + String(edge.to),
                from: data.id,
                to: edge.to,
                label: edge.label,
              });
            } else if (edge.to == this.prevNodeValue) {
              newEdges.push({
                id: String(edge.from) + String(data.id),
                from: edge.from,
                to: data.id,
                label: edge.label,
              });
            }
          });

          if (!this.graph.containsNode(data.id)) {
            this.graph.editNode(data.id);
            //callback(data);
            this.baseData.nodesDataSet.remove(Number(this.prevNodeValue));
            this.baseData.nodesDataSet.add({ id: data.id, label: data.label });

            this.baseData.edgesDataSet.remove(edgeIdsOfNode);
            this.baseData.edgesDataSet.add(newEdges);
          } /*else {
            console.log('node not edited');
          }*/
        }
      });
  }

  addGraph(): void {
    this.dialog
      .open(AddGraphDialog, {
        width: '300px',
        height: '350px',
        data: {},
      })
      .afterClosed()
      .subscribe((result) => {
        let nodesDataSet = new vis.DataSet(result.nodesFromJson);
        let edgesDataSet = new vis.DataSet(result.edgesFromJson);
        this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
        this.setupNetwork();
        this.graphIsConnected = this.graph.isConnected();
        this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
      });
  }

  deleteSelectedNode(data, callback): void {
    this.graph.removeNode(data.nodes[0]);
    callback(data);
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  addEdgeWithoutDrag(data, callback): void {
    this.dialog
      .open(AddAndEditWeightedEdge, {
        width: '300px',
        height: '350px',
        data: { label: 'Add weighted edge', editMode: false },
      })
      .afterClosed()
      .subscribe((result) => {
        this.saveEdgeData(data, callback, result);
      });
  }

  editEdgeWithoutDragFunc(data, callback): void {
    this.dialog
      .open(AddAndEditWeightedEdge, {
        width: '300px',
        height: '350px',
        data: { label: 'Edit weighted edge', editMode: true },
      })
      .afterClosed()
      .subscribe((result) => {
        this.editEdgeData(data, callback, result);
      });
  }

  editEdgeData(data, callback, edgeWeight): void {
    data.label = edgeWeight;
    this.graph.editEdge(data.from, data.to, Number(data.label));
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
    callback(data);
  }

  deleteSelectedEdge(data, callback): void {
    this.graph.removeEdge(
      Number(data.edges[0].charAt(0)),
      Number(data.edges[0].charAt(1))
    );
    callback(data);
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  saveEdgeData(data, callback, edgeWeigth?: number): void {
    if (typeof data.from === 'object') {
      data.from = data.from.id;
    }
    if (typeof data.to === 'object') {
      data.to = data.to.id;
    }

    if (this.directed) {
      data.arrows = 'to';
    }

    if (this.weighted) {
      data.label = edgeWeigth;
    }

    data.id = String(data.from) + String(data.to);

    var isEdgeAdded = false;

    if (this.weighted) {
      isEdgeAdded = this.graph.addEdge(data.from, data.to, Number(edgeWeigth));
    } else {
      isEdgeAdded = this.graph.addEdge(data.from, data.to);
    }

    if (isEdgeAdded) {
      this.graphIsConnected = this.graph.isConnected();
      this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
      callback(data);
    }
  }

  stepClicked(result): void {
    if (result.algoStepResult.done) {
      console.log('Done');
    } else {
      if (result.undo) {
        this.stepBack(result.algoStepResult);
      } else {
        this.stepForward(result.algoStepResult);
      }
    }
  }

  stepForward(algoStepResult): void {
    if (this.selectedAlgorithmName == 'dfs') {
      this.dfsStep(algoStepResult.value);
      return;
    }

    if (algoStepResult.value.startNode != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.startNode, color: { background: 'grey' } },
      ]);
    }

    if (
      algoStepResult.value.current != undefined &&
      algoStepResult.value.newInQueue != undefined
    ) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.current, color: { background: 'black' } },
      ]);

      algoStepResult.value.newInQueue.forEach((node) => {
        this.baseData.nodes.update([
          { id: node, color: { background: 'grey' } },
        ]);
        let edgeId = String(algoStepResult.value.current) + String(node);

        let edgeItem = this.baseData.edges.get(edgeId);
        if (edgeItem != undefined) {
          this.baseData.edges.update([
            { id: edgeId, color: { color: 'orange' } },
          ]);
        } else {
          edgeId = String(node) + String(algoStepResult.value.current);
          this.baseData.edges.update([
            { id: edgeId, color: { color: 'orange' } },
          ]);
        }
      });
    }

    if (algoStepResult.value.current != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.current, color: { background: 'black' } },
      ]);
    }

    if (algoStepResult.value.next != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.next, color: { background: 'grey' } },
      ]);
      let edgeId =
        String(algoStepResult.value.current) +
        String(algoStepResult.value.next);

      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      } else {
        edgeId =
          String(algoStepResult.value.next) +
          String(algoStepResult.value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      }
    }

    if (algoStepResult.value.newNext != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.newNext, color: { background: 'grey' } },
      ]);

      var edgeIdsOfNode = this.network.getConnectedEdges(
        algoStepResult.value.newNext
      );
      var edgesOfNode = this.baseData.edges.get(edgeIdsOfNode);
      console.log('edgesOfNode', edgesOfNode);
      edgesOfNode.map((edge) => {
        this.baseData.edges.update([
          { id: edge.id, color: { color: '#2b7ce9' } },
        ]);
      });

      let edgeId =
        String(algoStepResult.value.current) +
        String(algoStepResult.value.newNext);
      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      } else {
        edgeId =
          String(algoStepResult.value.newNext) +
          String(algoStepResult.value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      }
    }

    if (this.selectedAlgorithmName == 'bellmanford') {
      let value = algoStepResult.value;
      if (this.weighted) {
        if (value.startNode != undefined) {
          this.setStartNodeInTable(value.startNode);
        } else if (
          value.current != undefined &&
          value.next != undefined &&
          value.weight != undefined
        ) {
          this.updateTable(value.current, value.next, value.weight);
        }
      }
    }

    if (this.selectedAlgorithmName == 'bfs') {
      this.bfsStep(algoStepResult.value);
    }
  }

  bfsStep(value): void {
    if (this.bfsQueue.length != 0) {
      this.bfsQueue.shift();
    }
    if (value.startNode != undefined) {
      this.bfsQueue.push(String(value.startNode));
    }
    if (value.newInQueue != undefined) {
      value.newInQueue.forEach((node) => {
        this.bfsQueue.push(String(node));
      });
    }
    this.bfsqueuetable.renderRows();
  }

  dfsStep(value): void {
    if (value.startNode != undefined) {
      let node = value.startNode;
      let counter = value.startCounter;
      let newLabel = String(node) + ' (' + String(counter) + ')';
      this.baseData.nodes.update([
        { id: node, label: newLabel, color: { background: 'grey' } },
      ]);
      this.dfsCounterMap.set(node, counter);
    }

    if (value.next != undefined) {
      let node = value.next;
      let counter = value.startCounter;
      let newLabel = String(node) + ' (' + String(counter) + ')';
      this.baseData.nodes.update([
        { id: node, label: newLabel, color: { background: 'grey' } },
      ]);
      this.dfsCounterMap.set(node, counter);

      let edgeId = String(value.current) + String(value.next);

      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      } else {
        edgeId = String(value.next) + String(value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      }
    }

    if (value.current != undefined && value.next == undefined) {
      let node = value.current;
      let endCounter = value.endCounter;
      let counter = this.dfsCounterMap.get(node);
      let newLabel =
        String(node) + ' (' + String(counter) + '/' + String(endCounter) + ')';
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: 'black' },
        },
      ]);
      this.dfsStack.unshift(String(node));
      this.dfsstacktable.renderRows();
    }
  }

  stepForward2(algoStepResult): void {
    var edgeId;
    if (algoStepResult.value.newInQueue != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.newInQueue, color: { background: 'red' } },
      ]);
      edgeId =
        String(algoStepResult.value.current) +
        String(algoStepResult.value.newInQueue);
      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      } else {
        edgeId =
          String(algoStepResult.value.newInQueue) +
          String(algoStepResult.value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      }
    }

    if (algoStepResult.value.next != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.next, color: { background: 'red' } },
      ]);

      edgeId =
        String(algoStepResult.value.current) +
        String(algoStepResult.value.next);
      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      } else {
        edgeId =
          String(algoStepResult.value.next) +
          String(algoStepResult.value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: 'orange' } },
        ]);
      }
    }

    this.baseData.nodes.update([
      {
        id: algoStepResult.value.current,
        color: { background: 'green', border: 'pink' },
      },
    ]);

    //if (prevSelectedEdgeId != undefined) {
    //baseData.edges.update([
    //  { id: prevSelectedEdgeId, color: { color: "#2b7ce9" } },
    //]);
    //}

    //prevSelectedEdgeId = edgeId;
  }

  stepBackDfs(value): void {
    console.log('stepBackDfs value', value);
    if (value.startNode != undefined) {
      let node = value.startNode;
      let counter = value.startCounter;
      let newLabel = String(node); //+ ' (' + String(counter) + ')';
      this.baseData.nodes.update([
        { id: node, label: newLabel, color: { background: '#97c2fc' } },
      ]);
      //this.dfsCounterMap.set(node, counter);
    }

    if (value.next != undefined) {
      let node = value.next;
      let counter = value.startCounter;
      let newLabel = String(node); // + ' (' + String(counter) + ')';
      this.baseData.nodes.update([
        { id: node, label: newLabel, color: { background: '#97c2fc' } },
      ]);
      this.dfsCounterMap.set(node, counter);

      let edgeId = String(value.current) + String(value.next);

      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: '#2b7ce9' } },
        ]);
      } else {
        edgeId = String(value.next) + String(value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: '#2b7ce9' } },
        ]);
      }
    }

    if (value.current != undefined && value.next == undefined) {
      let node = value.current;
      let endCounter = value.endCounter;
      let counter = this.dfsCounterMap.get(node);
      let newLabel =
        String(node) +
        ' (' +
        String(counter) /*+ '/' + String(endCounter)*/ +
        ')';
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: 'grey' },
        },
      ]);
      this.dfsStack.shift(); //.unshift(String(node));
      this.dfsstacktable.renderRows();
    }
  }

  stepBack(algoStepResult): void {
    if (this.selectedAlgorithmName == 'bfs') {
      if (algoStepResult.value.startNode) {
        this.bfsQueue.pop();
      }
      if (algoStepResult.value.current != undefined) {
        this.bfsQueue.unshift(algoStepResult.value.current);
      }
      if (algoStepResult.value.newInQueue != undefined) {
        for (let i = 0; i < algoStepResult.value.newInQueue.length; i++) {
          this.bfsQueue.pop();
        }
      }
      this.bfsqueuetable.renderRows();
    }

    if (this.selectedAlgorithmName == 'dfs') {
      this.stepBackDfs(algoStepResult.value);
      return;
    }

    if (algoStepResult.value.startNode) {
      this.baseData.nodes.update([
        {
          id: algoStepResult.value.startNode,
          color: { background: '#97c2fc' },
        },
      ]);
    }

    if (algoStepResult.value.current && algoStepResult.value.newInQueue) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.current, color: { background: 'grey' } },
      ]);

      algoStepResult.value.newInQueue.forEach((node) => {
        this.baseData.nodes.update([
          { id: node, color: { background: '#97c2fc' } },
        ]);
        let edgeId = String(algoStepResult.value.current) + String(node);

        let edgeItem = this.baseData.edges.get(edgeId);
        if (edgeItem != undefined) {
          this.baseData.edges.update([
            { id: edgeId, color: { color: '#2b7ce9' } },
          ]);
        } else {
          edgeId = String(node) + String(algoStepResult.value.current);
          this.baseData.edges.update([
            { id: edgeId, color: { color: '#2b7ce9' } },
          ]);
        }
      });
    }
  }

  stepBack2(algoStepResult): void {
    var edgeId;
    if (algoStepResult.value.newInQueue != undefined) {
      this.baseData.nodes.update([
        {
          id: algoStepResult.value.newInQueue,
          color: { background: '#97c2fc', border: '#2b7ce9' },
        },
      ]);
      edgeId =
        String(algoStepResult.value.current) +
        String(algoStepResult.value.newInQueue);
      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: '#2b7ce9' } },
        ]);
      } else {
        edgeId =
          String(algoStepResult.value.newInQueue) +
          String(algoStepResult.value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: '#2b7ce9' } },
        ]);
      }
    }

    this.baseData.nodes.update([
      {
        id: algoStepResult.value.current,
        color: { background: 'green', border: 'pink' },
      },
    ]);
  }

  clearEdges(): void {
    this.baseData.edges.clear();
    this.graph.getAdjList().clear();
  }

  clearAll(): void {
    this.baseData.edges.clear();
    this.baseData.nodes.clear();
    this.graph.clear();
  }

  reset(): void {
    this.destroy();
    this.directed = undefined;
    this.weighted = undefined;
    this.graph = null;
    this.algorithmsComponent.resetAlgo();
    this.bellmanFordTable = [];
    this.dfsCounterMap = new Map();
    this.dfsStack = [];
    this.bfsQueue = [];
  }

  resetAlgo(): void {
    this.baseData.nodes.getIds().forEach((id) => {
      this.baseData.nodes.update([
        { id: id, color: { background: '#97c2fc', border: '#2b7ce9' } },
      ]);
    });
    this.baseData.edges.getIds().forEach((id) => {
      this.baseData.edges.update([{ id: id, color: { color: '#2b7ce9' } }]);
    });
    //this.newTable();
  }
}
