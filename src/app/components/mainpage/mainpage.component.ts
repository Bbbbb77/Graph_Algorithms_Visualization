import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgModule,
  Output,
  Input,
} from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddAndEditNodeDialog } from '../addandeditnode.dialog/addandeditnode.dialog';
import { AddGraphDialog } from '../addgraph.dialog/addgraph.dialog';
import { AddAndEditWeightedEdge } from '../addandeditweightededge.dialog/addandeditweightededge.dialog';
import { RandomGraph } from '../randomgraph.component/randomgraph.component';
import { Algorithms } from '../algorithms.component/algorithms.component';
import { MessageDialog } from '../message.dialog/message.dialog';
import { StorageSavedDialog } from '../storagesaved.dialog/storagesaved.dialog';

import { Graph } from '../../models/graphs/graph';
import { DirectedWeightedGraph } from '../../models/graphs/directedweighted.graph';
import { DirectedUnweightedGraph } from '../../models/graphs/directedunweighted.graph';
import { UndirectedUnweightedGraph } from '../../models/graphs/undirectedunweighted.graph';
import { UndirectedWeightedGraph } from '../../models/graphs/undirectedweighted.graph';

import { StorageSaveService } from '../../services/storagesave.service';
import { GraphBuilderService } from '../../services/graphbuilder.service';

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
  providers: [StorageSaveService, GraphBuilderService],
})
export class MainPage implements OnInit {
  kruskalMinimumCost?: number;

  graphChangedEvent: Subject<void> = new Subject<void>();

  baseNodeColor: string = '#97c2fc';
  baseEdgeColor: string = '#2b7ce9';
  edgeHighlightColor: string = 'orange';
  nodeVisitedColor: string = 'grey';
  nodeFinishedColor: string = 'black';
  nodeTextColor: string = 'white';

  network: any = null;
  seed: number = 1;
  smoothType: string = 'dynamic';
  physicsEnabled: boolean = true;
  canvasContext;

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

  selectedStartnode;
  bellmanFordTable: BellmanFordTableElement[] = [];
  dfsCounterMap = new Map();
  dfsStack: string[] = [];
  topSort: string[] = [];
  bfsQueue: string[] = [];
  kruskalNodeHelper = new Map();
  nodeColoringHelper = new Map();
  kruskalColoringHelper: { nodes: number[]; color: string }[] = [];

  distaceColumnHeaders: string[] = ['Node', 'Distance'];
  queueColumnHeaders: string[] = ['Node queue'];
  stackColumnHeaders: string[] = ['Node stack'];
  topSortColumnHeaders: string[] = ['Top sort'];

  selectedAlgorithmName: string = '';

  fwData: string[][];
  fwTableHeaders: string[] = ['Node', '1', '2', '3', '4'];

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

  @Output()
  selectedNode;

  @ViewChild('inputFile')
  inputFile: ElementRef;

  @ViewChild('algorithmsComponent')
  algorithmsComponent: Algorithms;

  @ViewChild('bellmanfordtable')
  bellmanfordtable: MatTable<BellmanFordTableElement>;

  @ViewChild('bfsqueuetable')
  bfsqueuetable: MatTable<string>;

  @ViewChild('dfsstacktable')
  dfsstacktable: MatTable<string>;

  @ViewChild('topsorttable')
  topsorttable: MatTable<string>;

  @ViewChild('fwtable')
  fwtable;

  constructor(
    public dialog: MatDialog,
    private graphBuilderService: GraphBuilderService,
    private storageSaveService: StorageSaveService
  ) {}

  ngOnInit(): void {}

  selectedAlgorithm(algorithmName: string) {
    if (this.network != undefined) {
      this.network.unselectAll();
    }

    if (this.graph != undefined) {
      let nodes = this.graph.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        this.nodeColoringHelper.set(nodes[i], 0);
      }
    }

    if (algorithmName == 'bfs') {
      this.selectedAlgorithmName = 'bfs';
    } else if (algorithmName == 'bellmanford') {
      this.selectedAlgorithmName = 'bellmanford';
      if (this.weighted) {
        this.newTable();
      }
    } else if (algorithmName == 'dfs') {
      this.selectedAlgorithmName = 'dfs';
    } else if (algorithmName == 'kruskal') {
      this.selectedAlgorithmName = 'kruskal';
      let nodes = this.graph.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        this.kruskalNodeHelper.set(nodes[i], 0);
      }
    } else if (algorithmName == 'floydWarshall') {
      this.selectedAlgorithmName = 'floydWarshall';
      this.fwData = [[]];
      this.fwTableHeaders = ['Node'];
      let nodes = this.graph.getNodes();
      for (let i = 0; i < nodes.length; i++) {
        this.fwTableHeaders.push(String(nodes[i]));
        let temp = [String(nodes[i])];
        for (let j = 0; j < nodes.length; j++) {
          if (i == j) {
            temp.push('0');
          } else {
            temp.push('INF');
          }
        }
        this.fwData.push(temp);
      }
    } else {
      this.selectedAlgorithmName = '';
    }
  }

  butterfly(): void {
    let nodesRaw = [1, 2, 3, 4, 5];

    let edges = [
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 3 },
      { from: 2, to: 5 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
    ];

    this.smoothType = 'continuous';
    this.physicsEnabled = false;
    this.directed = false;
    this.weighted = false;
    this.graph = new UndirectedUnweightedGraph();

    let nodesAndEdges = this.graphBuilderService.buildGraph(
      this.graph,
      nodesRaw,
      edges
    );

    if (nodesAndEdges.error != undefined) {
      this.reset();
      return;
    }

    let nodes = [
      { id: 1, label: '1', x: 100, y: 75 },
      { id: 2, label: '2', x: 200, y: 75 },
      { id: 3, label: '3', x: 150, y: 125 },
      { id: 4, label: '4', x: 100, y: 175 },
      { id: 5, label: '5', x: 200, y: 175 },
    ];

    let nodesDataSet = new vis.DataSet(nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  complete(): void {
    let nodesRaw = [1, 2, 3, 4, 5, 6 /*, 7, 8, 9, 10*/];
    let edges: { from: number; to: number }[] = [];
    for (let i = 0; i < nodesRaw.length; i++) {
      for (let j = 0; j < nodesRaw.length; j++) {
        if (i == j) {
          continue;
        }
        edges.push({ from: nodesRaw[i], to: nodesRaw[j] });
      }
    }

    this.smoothType = 'continuous';
    this.physicsEnabled = false;
    this.directed = false;
    this.weighted = false;
    this.graph = new UndirectedUnweightedGraph();

    let nodesAndEdges = this.graphBuilderService.buildGraph(
      this.graph,
      nodesRaw,
      edges
    );

    if (nodesAndEdges.error != undefined) {
      this.reset();
      return;
    }

    let nodes = [
      { id: 1, label: '1', x: 260, y: 30 },
      { id: 2, label: '2', x: 150, y: 100 },
      { id: 3, label: '3', x: 370, y: 100 },
      { id: 4, label: '4', x: 150, y: 200 },
      { id: 5, label: '5', x: 370, y: 200 },
      { id: 6, label: '6', x: 260, y: 280 },
    ];

    let nodesDataSet = new vis.DataSet(nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  housesWells(): void {
    let nodesRaw = [1, 2, 3, 4, 5, 6];
    let edges = [
      { from: 1, to: 4 },
      { from: 1, to: 5 },
      { from: 1, to: 6 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 2, to: 6 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 3, to: 6 },
    ];

    this.smoothType = 'continuous';
    this.physicsEnabled = false;
    this.directed = false;
    this.weighted = false;
    this.graph = new UndirectedUnweightedGraph();

    let nodesAndEdges = this.graphBuilderService.buildGraph(
      this.graph,
      nodesRaw,
      edges
    );

    if (nodesAndEdges.error != undefined) {
      this.reset();
      return;
    }

    let nodes = [
      { id: 1, label: '1', x: 160, y: 75 },
      { id: 2, label: '2', x: 260, y: 75 },
      { id: 3, label: '3', x: 360, y: 75 },
      { id: 4, label: '4', x: 160, y: 225 },
      { id: 5, label: '5', x: 260, y: 225 },
      { id: 6, label: '6', x: 360, y: 225 },
    ];

    let nodesDataSet = new vis.DataSet(nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  petersenGraph(): void {
    let nodesRaw = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let edges = [
      { from: 1, to: 3 },
      { from: 1, to: 2 },
      { from: 1, to: 6 },
      { from: 2, to: 7 },
      { from: 2, to: 8 },
      { from: 3, to: 4 },
      { from: 3, to: 9 },
      { from: 4, to: 5 },
      { from: 4, to: 8 },
      { from: 5, to: 6 },
      { from: 5, to: 7 },
      { from: 6, to: 10 },
      { from: 7, to: 9 },
      { from: 8, to: 10 },
      { from: 9, to: 10 },
    ];

    this.smoothType = 'continuous';
    this.physicsEnabled = false;
    this.directed = false;
    this.weighted = false;
    this.graph = new UndirectedUnweightedGraph();

    let nodesAndEdges = this.graphBuilderService.buildGraph(
      this.graph,
      nodesRaw,
      edges
    );

    if (nodesAndEdges.error != undefined) {
      this.reset();
      return;
    }

    let nodes = [
      { id: 1, label: '1', x: 260, y: 20 },
      { id: 2, label: '2', x: 260, y: 80 },
      { id: 3, label: '3', x: 50, y: 100 },
      { id: 4, label: '4', x: 160, y: 130 },
      { id: 5, label: '5', x: 360, y: 130 },
      { id: 6, label: '6', x: 460, y: 100 },
      { id: 7, label: '7', x: 200, y: 200 },
      { id: 8, label: '8', x: 330, y: 200 },
      { id: 9, label: '9', x: 80, y: 260 },
      { id: 10, label: '10', x: 400, y: 260 },
    ];

    let nodesDataSet = new vis.DataSet(nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  updateFloydWarshallTable(distances): void {
    this.fwData = [[]];
    distances.forEach((value, key, map) => {
      let temp = [String(key)];
      value.map((node) => {
        let v;
        if (node.weight == Number.MAX_VALUE) {
          v = 'INF';
        } else {
          v = String(node.weight);
        }
        temp.push(v);
      });
      this.fwData.push(temp);
    });
  }

  downloaGraph(): void {
    var graphJsonStr = this.graph.save();
    let date = new Date();
    let dateStr = `${date.getFullYear()}. ${
      date.getMonth() + 1
    }. ${date.getDate()}. `;

    var dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(graphJsonStr);
    var download = document.createElement('a');
    download.setAttribute('href', dataStr);
    download.setAttribute('download', 'graph - ' + dateStr + '.json');
    document.body.appendChild(download);
    download.click();
    download.remove();
  }

  loadGraph(): void {
    this.dialog
      .open(StorageSavedDialog, {
        width: '600px',
        height: '600px',
        data: {},
      })
      .afterClosed()
      .subscribe((result) => {
        if (result.deleteKeys != undefined) {
          this.storageSaveService.deleteKeys(result.deleteKeys);
        }

        if (result.graph != undefined) {
          this.reset();
          this.drawGraph(result.graph.graphJson);
        }
      });
  }

  saveGraph(): void {
    if (this.directed != undefined && this.weighted != undefined) {
      this.storageSaveService.save(
        this.graph.save(),
        this.canvasContext.canvas.toDataURL()
      );
    }
  }

  openFileInput(): void {
    this.inputFile.nativeElement.click();
  }

  onFileSelected(event): void {
    let file = event.target.files[0];
    let fileReader: FileReader = new FileReader();
    fileReader.onloadend = () => {
      this.drawGraph(fileReader.result);
    };
    fileReader.readAsText(file);
  }

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

  updateTable(toNode, distance): void {
    let toIndex = this.bellmanFordTable.findIndex(
      (b) => b.Node == String(toNode)
    );
    this.bellmanFordTable[toIndex].Distance = String(distance);
    this.bellmanfordtable.renderRows();
  }

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
    this.algorithmsComponent.resetAlgo();
    this.setupNetwork();
  }

  setupNetwork(): void {
    var options = {
      physics: { enabled: this.physicsEnabled },
      layout: { randomSeed: this.seed },
      nodes: { borderWidth: 4, size: 100 },
      edges: {
        smooth: { enabled: true, type: this.smoothType },
        color: {
          color: this.baseEdgeColor,
          inherit: false /*, highlight: ''*/,
        },
      },
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
              .open(MessageDialog, {
                width: '300px',
                height: '200px',
                data: {
                  title: 'Error',
                  message: 'Node cannot be connected with itself!',
                  error: true,
                },
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
                .open(MessageDialog, {
                  width: '300px',
                  height: '200px',
                  data: {
                    title: 'Error',
                    message:
                      'Edge cannot be edited because the graph is not weighted!',
                    error: true,
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
    if (this.baseData == undefined) {
      let nodesDataSet = new vis.DataSet([]);
      let edgesDataSet = new vis.DataSet([]);
      this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    }

    this.network = new vis.Network(container, this.baseData, options);
    this.network.on('afterDrawing', (ctx) => {
      this.canvasContext = ctx;
    });
    this.network.on('selectNode', (properties) => {
      this.selectedNode = String(properties.nodes[0]);
    });
  }

  startNodeSelected(node): void {
    if (this.graph.isNodeInGraph(node)) {
      this.network.selectNodes([node]);
    } else {
      this.network.selectNodes([]);
    }
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

  drawGraph(graphText): void {
    var graphObject = JSON.parse(graphText);

    if (graphObject.weighted == undefined) {
      this.dialog.open(MessageDialog, {
        width: '300px',
        height: '200px',
        data: {
          title: 'Error',
          message: 'Weighted property is not provided!',
          error: true,
        },
      });
      return;
    }

    if (graphObject.directed == undefined) {
      this.dialog.open(MessageDialog, {
        width: '300px',
        height: '200px',
        data: {
          title: 'Error',
          message: 'Directed property is not provided!',
          error: true,
        },
      });
      return;
    }

    this.weighted = graphObject.weighted;
    this.directed = graphObject.directed;
    this.createGraph();
    let nodesAndEdges = this.graphBuilderService.buildGraph(
      this.graph,
      graphObject.nodes,
      graphObject.edges
    );

    if (nodesAndEdges.error != undefined) {
      this.reset();
      return;
    }

    let nodesDataSet = new vis.DataSet(nodesAndEdges.nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  addNode(data, callback): void {
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '230px',
        height: '250px',
        data: { label: 'Add new node', nodeValue: '', editMode: false },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != undefined) {
          data.label = result;
          data.id = Number(result);
          if (this.graph.addNode(data.id)) {
            this.graphIsConnected = this.graph.isConnected();
            callback(data);
            this.graphChangedEvent.next();
          }
        } else {
          callback(null);
        }
      });
  }

  editNode(data, callback): void {
    let prevNodeValue = data.id;
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '230px',
        height: '250px',
        data: { label: 'Edit node', nodeValue: data.label, editMode: true },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result != undefined) {
          data.label = result;
          data.id = Number(result);

          var newEdges: any[] = [];
          var edgeIdsOfNode = this.network.getConnectedEdges(prevNodeValue);
          var edgesOfNode = this.baseData.edges.get(edgeIdsOfNode);

          edgesOfNode.map((edge) => {
            if (edge.from == prevNodeValue) {
              newEdges.push({
                id: String(data.id) + String(edge.to),
                from: data.id,
                to: edge.to,
                label: edge.label,
                arrows: this.directed ? 'to' : '',
              });
            } else if (edge.to == prevNodeValue) {
              newEdges.push({
                id: String(edge.from) + String(data.id),
                from: edge.from,
                to: data.id,
                label: edge.label,
                arrows: this.directed ? 'to' : '',
              });
            }
          });

          if (!this.graph.isNodeInGraph(data.id)) {
            this.graph.editNode(prevNodeValue, data.id);
            //callback(data);
            this.baseData.nodes.remove(Number(prevNodeValue));
            this.baseData.nodes.add({ id: data.id, label: data.label });

            this.baseData.edges.remove(edgeIdsOfNode);
            this.baseData.edges.add(newEdges);
            this.graphChangedEvent.next();
          } else {
            callback(null);
          }
        } else {
          callback(null);
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
        if (result != undefined) {
          this.weighted = result.weighted;
          this.directed = result.directed;
          this.createGraph();
          let nodesAndEdges = this.graphBuilderService.buildGraph(
            this.graph,
            result.nodes,
            result.edges
          );

          if (nodesAndEdges.error != undefined) {
            this.reset();
            return;
          }

          let nodesDataSet = new vis.DataSet(nodesAndEdges.nodes);
          let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
          this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
          this.setupNetwork();
          this.graphIsConnected = this.graph.isConnected();
          this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
        }
      });
  }

  deleteSelectedNode(data, callback): void {
    this.graph.removeNode(data.nodes[0]);
    callback(data);
    this.graphChangedEvent.next();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  addEdgeWithoutDrag(data, callback): void {
    if (this.weighted) {
      this.dialog
        .open(AddAndEditWeightedEdge, {
          width: '230px',
          height: '250px',
          data: { label: 'Add weighted edge', editMode: false },
        })
        .afterClosed()
        .subscribe((result) => {
          if (result != undefined) {
            this.saveEdgeData(data, callback, result);
          } else {
            callback(null);
          }
        });
    } else {
      this.saveEdgeData(data, callback);
    }
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
        if (result != undefined) {
          this.editEdgeData(data, callback, result);
        } else {
          callback(null);
        }
      });
  }

  editEdgeData(data, callback, edgeWeight): void {
    data.label = edgeWeight;
    this.graph.editEdge(data.from, data.to, Number(data.label));
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
    callback(data);
    this.graphChangedEvent.next();
  }

  deleteSelectedEdge(data, callback): void {
    let edge = this.baseData.edges.get(data.edges[0]);
    if (edge == undefined) {
      callback(null);
    }

    this.graph.removeEdge(edge.from, edge.to);
    callback(data);
    this.graphChangedEvent.next();
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
      this.graphChangedEvent.next();
    } else {
      callback(null);
    }
  }

  updateKruskalColoringHelper(from, to): void {
    let index1 = -1;
    let index2 = -1;
    for (let i = 0; i < this.kruskalColoringHelper.length; i++) {
      let set = this.kruskalColoringHelper[i];
      if (set.nodes.includes(from)) {
        index1 = i;
      }
      if (set.nodes.includes(to)) {
        index2 = i;
      }
    }

    if (index1 == -1 && index2 == -1) {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      this.kruskalColoringHelper.push({
        nodes: [from, to],
        color: String(color),
      });
      this.colorNode(to, color);
      this.colorNode(from, color);
    } else if (index1 != -1 && index2 == -1) {
      this.kruskalColoringHelper[index1].nodes.push(to);
      this.colorNode(to, this.kruskalColoringHelper[index1].color);
    } else if (index1 == -1 && index2 != -1) {
      this.kruskalColoringHelper[index2].nodes.push(from);
      this.colorNode(from, this.kruskalColoringHelper[index2].color);
    } else if (index1 != -1 && index2 != -1) {
      let nodes1 = this.kruskalColoringHelper[index1].nodes;
      let nodes2 = this.kruskalColoringHelper[index2].nodes;
      this.kruskalColoringHelper[index1].nodes = nodes1.concat(nodes2);
      let nodes = this.kruskalColoringHelper[index1].nodes;

      for (let i = 0; i < nodes.length; i++) {
        this.colorNode(nodes[i], this.kruskalColoringHelper[index1].color);
      }

      this.kruskalColoringHelper.splice(index2, 1);
    }

    for (let i = 0; i < this.kruskalColoringHelper.length; i++) {
      let set = this.kruskalColoringHelper[i];
      if (set.nodes.includes(from)) {
        index1 = i;
      }
      if (set.nodes.includes(to)) {
        index2 = i;
      }
    }
  }

  stepClicked(result): void {
    if (!result.algoStepResult.done) {
      if (result.undo) {
        this.stepBack(result.algoStepResult.value);
      } else {
        this.stepForward(result.algoStepResult.value);
      }
    }
  }

  stepForward(value): void {
    if (this.selectedAlgorithmName == 'dfs') {
      this.dfsStep(value);
      return;
    }

    if (this.selectedAlgorithmName == 'floydWarshall') {
      this.updateFloydWarshallTable(value.distances);
      return;
    }

    if (value.startNode != undefined) {
      this.selectedStartnode = value.startNode;
      this.colorNode(value.startNode, this.nodeVisitedColor);
    }

    if (value.current != undefined && value.newInQueue != undefined) {
      this.colorNode(value.current, this.nodeFinishedColor, this.nodeTextColor);
      value.newInQueue.forEach((node) => {
        this.colorNode(node, this.nodeVisitedColor);
        this.colorEdge(value.current, node, this.edgeHighlightColor);
      });
    }

    if (value.current != undefined && this.selectedAlgorithmName != 'kruskal') {
      this.colorNode(value.current, this.nodeFinishedColor, this.nodeTextColor);
    }

    if (value.next != undefined) {
      if (this.selectedAlgorithmName == 'kruskal') {
        this.updateKruskalColoringHelper(value.current, value.next);
        //this.colorNode(value.next, this.nodeFinishedColor, this.nodeTextColor);
        let counter = this.kruskalNodeHelper.get(value.current);
        this.kruskalNodeHelper.set(value.current, counter + 1);
        counter = this.kruskalNodeHelper.get(value.next);
        this.kruskalNodeHelper.set(value.next, counter + 1);
      } else {
        this.colorNode(value.next, this.nodeVisitedColor);
      }

      this.colorEdge(value.current, value.next, this.edgeHighlightColor);
    }

    if (this.selectedAlgorithmName == 'bellmanford') {
      if (this.weighted) {
        if (value.startNode != undefined) {
          this.setStartNodeInTable(value.startNode);
        } else if (value.from != undefined && value.weight != undefined) {
          let valueTo = value.to;
          if (valueTo == undefined) {
            valueTo = value.newTo;
          }

          this.updateTable(valueTo, value.weight);
        }
      }
    }

    if (this.selectedAlgorithmName == 'bfs') {
      this.bfsStep(value);
    }

    if (value.newTo != undefined && value.from != undefined) {
      let counter = this.nodeColoringHelper.get(value.prevFrom);
      this.nodeColoringHelper.set(value.prevFrom, counter - 1);

      counter = this.nodeColoringHelper.get(value.from);
      this.nodeColoringHelper.set(value.from, counter + 1);

      counter = this.nodeColoringHelper.get(value.newTo);
      this.nodeColoringHelper.set(value.newTo, counter + 1);

      this.colorNode(value.newTo, this.nodeFinishedColor, this.nodeTextColor);
      this.colorEdge(value.from, value.newTo, this.edgeHighlightColor);
      this.colorEdge(value.prevFrom, value.newTo, this.baseEdgeColor);
    }

    if (value.to != undefined && value.from != undefined) {
      let counter = this.nodeColoringHelper.get(value.from);
      this.nodeColoringHelper.set(value.from, counter + 1);

      counter = this.nodeColoringHelper.get(value.to);
      this.nodeColoringHelper.set(value.to, counter + 1);

      this.colorNode(value.from, this.nodeFinishedColor, this.nodeTextColor);
      this.colorNode(value.to, this.nodeFinishedColor, this.nodeTextColor);
      this.colorEdge(value.from, value.to, this.edgeHighlightColor);
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
        {
          id: node,
          label: newLabel,
          color: { background: this.nodeVisitedColor },
        },
      ]);
      this.dfsCounterMap.set(node, counter);
      this.dfsStack.unshift(String(node));
      this.dfsstacktable.renderRows();
    }

    if (value.next != undefined) {
      let node = value.next;
      let counter = value.startCounter;
      let newLabel = String(node) + ' (' + String(counter) + ')';
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: this.nodeVisitedColor },
        },
      ]);
      this.dfsCounterMap.set(node, counter);

      let edgeId = String(value.current) + String(value.next);

      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: this.edgeHighlightColor } },
        ]);
      } else {
        edgeId = String(value.next) + String(value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: this.edgeHighlightColor } },
        ]);
      }
      this.dfsStack.unshift(String(node));
      this.dfsstacktable.renderRows();
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
          color: { background: this.nodeFinishedColor },
          font: { color: this.nodeTextColor },
        },
      ]);
      this.topSort.unshift(String(node));
      this.topsorttable.renderRows();

      this.dfsStack.shift();
      this.dfsstacktable.renderRows();
    }
  }

  stepBackDfs(value): void {
    if (value.startNode != undefined) {
      let node = value.startNode;
      let counter = value.startCounter;
      let newLabel = String(node);
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: this.baseNodeColor },
          font: { color: 'black' },
        },
      ]);
      this.dfsStack.shift();
      this.dfsstacktable.renderRows();
    }

    if (value.next != undefined) {
      let node = value.next;
      let counter = value.startCounter;
      let newLabel = String(node);
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: this.baseNodeColor },
          font: { color: 'black' },
        },
      ]);
      this.dfsCounterMap.set(node, counter);

      let edgeId = String(value.current) + String(value.next);

      let edgeItem = this.baseData.edges.get(edgeId);
      if (edgeItem != undefined) {
        this.baseData.edges.update([
          { id: edgeId, color: { color: this.baseEdgeColor } },
        ]);
      } else {
        edgeId = String(value.next) + String(value.current);
        this.baseData.edges.update([
          { id: edgeId, color: { color: this.baseEdgeColor } },
        ]);
      }
      this.dfsStack.shift();
      this.dfsstacktable.renderRows();
    }

    if (value.current != undefined && value.next == undefined) {
      let node = value.current;
      let endCounter = value.endCounter;
      let counter = this.dfsCounterMap.get(node);
      let newLabel = String(node) + ' (' + String(counter) + ')';
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: this.nodeVisitedColor },
          font: { color: 'black' },
        },
      ]);
      this.topSort.shift();
      this.topsorttable.renderRows();

      this.dfsStack.unshift(String(node));
      this.dfsstacktable.renderRows();
    }
  }

  stepBack(value): void {
    if (this.selectedAlgorithmName == 'floydWarshall') {
      this.updateFloydWarshallTable(value.distances);
      return;
    }

    if (this.selectedAlgorithmName == 'bfs') {
      if (value.startNode) {
        this.bfsQueue.pop();
      }
      if (value.current != undefined) {
        this.bfsQueue.unshift(value.current);
      }
      if (value.newInQueue != undefined) {
        for (let i = 0; i < value.newInQueue.length; i++) {
          this.bfsQueue.pop();
        }
      }
      this.bfsqueuetable.renderRows();
    }

    if (this.selectedAlgorithmName == 'dfs') {
      this.stepBackDfs(value);
      return;
    }

    if (value.startNode != undefined) {
      this.colorNode(value.startNode, this.baseNodeColor);
    }

    if (this.selectedAlgorithmName == 'kruskal' && value.current != undefined) {
      let counter = this.kruskalNodeHelper.get(value.current);
      if (counter > 0) {
        counter--;
      }
      if (counter == 0) {
        this.colorNode(value.current, this.baseNodeColor);
      }
      this.kruskalNodeHelper.set(value.current, counter);
    }

    if (value.current != undefined && value.newInQueue != undefined) {
      this.colorNode(value.current, this.nodeVisitedColor);
      value.newInQueue.forEach((node) => {
        this.colorNode(node, this.baseNodeColor);
        this.colorEdge(value.current, node, this.baseEdgeColor);
      });
    }

    if (value.next != undefined) {
      if (this.selectedAlgorithmName == 'kruskal') {
        let counter = this.kruskalNodeHelper.get(value.next);
        if (counter > 0) {
          counter--;
        }
        if (counter == 0) {
          this.colorNode(value.next, this.baseNodeColor);
        }
        this.kruskalNodeHelper.set(value.next, counter);
      } else {
        this.colorNode(value.next, this.baseNodeColor);
      }
      this.colorEdge(value.current, value.next, this.baseEdgeColor);
    }

    if (value.from != undefined) {
      let counter = this.nodeColoringHelper.get(value.from);
      if (counter > 0) {
        counter--;
      }
      if (counter == 0) {
        if (this.selectedStartnode == value.from) {
          this.colorNode(value.from, this.nodeVisitedColor, 'black');
        } else {
          this.colorNode(value.from, this.baseNodeColor, 'black');
        }
      }
      this.nodeColoringHelper.set(value.from, counter);
    }

    if (value.newTo != undefined) {
      let counter = this.nodeColoringHelper.get(value.prevFrom);
      this.nodeColoringHelper.set(value.prevFrom, counter + 1);

      counter = this.nodeColoringHelper.get(value.newTo);
      if (counter > 0) {
        counter--;
      }
      if (counter == 0) {
        this.colorNode(value.newTo, this.baseNodeColor, 'black');
      }
      this.nodeColoringHelper.set(value.newTo, counter);

      this.colorEdge(value.from, value.newTo, this.baseEdgeColor);
      this.colorEdge(value.prevFrom, value.newTo, this.edgeHighlightColor);
    }

    if (value.to != undefined) {
      let counter = this.nodeColoringHelper.get(value.to);
      if (counter > 0) {
        counter--;
      }
      if (counter == 0) {
        this.colorNode(value.to, this.baseNodeColor, 'black');
      }
      this.nodeColoringHelper.set(value.to, counter);
      this.colorEdge(value.from, value.to, this.baseEdgeColor);
    }
  }

  clearEdges(): void {
    this.baseData.edges.clear();
    this.graph.clearEdges();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  clearAll(): void {
    this.baseData.edges.clear();
    this.baseData.nodes.clear();
    this.graph.reset();
    this.graphChangedEvent.next();
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
    this.topSort = [];
    this.bfsQueue = [];
    this.smoothType = 'dynamic';
    this.physicsEnabled = true;
  }

  resetAlgo(): void {
    if (this.baseData != undefined) {
      this.baseData.nodes.getIds().forEach((id) => {
        this.baseData.nodes.update([
          {
            id: id,
            label: String(id),
            color: {
              background: this.baseNodeColor,
              border: this.baseEdgeColor,
            },
            font: { color: 'black' },
          },
        ]);
      });
      this.baseData.edges.getIds().forEach((id) => {
        this.baseData.edges.update([
          { id: id, color: { color: this.baseEdgeColor } },
        ]);
      });

      if (this.bfsqueuetable != undefined) {
        this.bfsQueue = [];
        this.bfsqueuetable.renderRows();
      }
      if (this.dfsstacktable != undefined) {
        this.dfsStack = [];
        this.dfsstacktable.renderRows();
      }
      if (this.topsorttable != undefined) {
        this.topSort = [];
        this.topsorttable.renderRows();
      }
      if (this.bellmanfordtable != undefined) {
        this.bellmanFordTable = [];
        this.bellmanfordtable.renderRows();
      }
      this.kruskalMinimumCost = undefined;
      this.fwTableHeaders = [];
      this.fwData = [[]];
    }
  }

  colorNode(nodeId, color, textColor?: string): void {
    this.baseData.nodes.update([
      { id: nodeId, color: { background: color }, font: { color: textColor } },
    ]);
  }

  colorEdge(from, to, color): void {
    let edgeId = String(from) + String(to);
    let edgeItem = this.baseData.edges.get(edgeId);
    if (edgeItem != undefined) {
      this.baseData.edges.update([{ id: edgeId, color: { color: color } }]);
    } else {
      edgeId = String(to) + String(from);
      this.baseData.edges.update([{ id: edgeId, color: { color: color } }]);
    }
  }

  setGeneratedGraph(nodesAndEdges): void {
    let nodesDataSet = new vis.DataSet(nodesAndEdges.nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
    this.graphChangedEvent.next();
  }

  setKruskalCost(value): void {
    this.kruskalMinimumCost = value;
  }
}
