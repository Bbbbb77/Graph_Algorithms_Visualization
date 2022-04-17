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
import { Player } from '../player.component/player.component';
import { ErrorMessageDialog } from '../errormessage.dialog/errormessage.dialog';
import { StorageSavedDialog } from '../storagesaved.dialog/storagesaved.dialog';

import { Graph } from '../../models/graphs/graph';
import { DirectedWeightedGraph } from '../../models/graphs/directedweighted.graph';
import { DirectedUnweightedGraph } from '../../models/graphs/directedunweighted.graph';
import { UndirectedUnweightedGraph } from '../../models/graphs/undirectedunweighted.graph';
import { UndirectedWeightedGraph } from '../../models/graphs/undirectedweighted.graph';

import { StorageSaveService } from '../../services/storagesaveservice';
import { GraphBuilderService } from '../../services/graphbuilderservice';

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

  prevWasNewNext: boolean = false;

  bellmanFordTable: BellmanFordTableElement[] = [];
  dfsCounterMap = new Map();
  dfsStack: string[] = [];
  topSort: string[] = [];
  bfsQueue: string[] = [];

  distaceColumnHeaders: string[] = ['Node', 'Distance'];
  queueColumnHeaders: string[] = ['Node queue'];
  stackColumnHeaders: string[] = ['Node stack'];
  topSortColumnHeaders: string[] = ['Top sort'];

  graphStr(): void {
    this.graph.print();
    let s = this.graph.save();
    console.log('graph obj', JSON.parse(s));
  }

  selectedAlgorithmName: string = '';
  selectedAlgorithm(algorithmName) {
    if (algorithmName == 'bfs') {
      this.selectedAlgorithmName = 'bfs';
    } else if (algorithmName == 'bellmanford') {
      this.selectedAlgorithmName = 'bellmanford';
      if (this.weighted) {
        this.newTable();
      }
    } else if (algorithmName == 'dfs') {
      this.selectedAlgorithmName = 'dfs';
    } else {
      this.selectedAlgorithmName = '';
    }
  }

  positions(): void {
    console.log('positions', this.network.getPositions());
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

  constructor(
    public dialog: MatDialog,
    private graphBuilderService: GraphBuilderService,
    private storageSaveService: StorageSaveService
  ) {}

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
          this.drawGraph(result.graph);
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

  @ViewChild('imgCanvas')
  imgCanvas: ElementRef;

  saveGraphToPNG(): void {
    this.imgCanvas.nativeElement.src = this.canvasContext.canvas.toDataURL();
  }

  setupNetwork(): void {
    var options = {
      physics: { enabled: this.physicsEnabled },
      layout: { randomSeed: this.seed },
      nodes: { borderWidth: 4, size: 100 },
      edges: {
        smooth: { enabled: true, type: this.smoothType },
        color: { color: this.baseEdgeColor, inherit: false },
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
    this.network.on('afterDrawing', (ctx) => {
      this.canvasContext = ctx;
    });
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

    this.weighted = graphObject.weighted;
    this.directed = graphObject.directed;
    this.createGraph();
    let nodesAndEdges = this.graphBuilderService.buildGraph(
      this.graph,
      graphObject.nodes,
      graphObject.edges
    );

    let nodesDataSet = new vis.DataSet(nodesAndEdges.nodes);
    let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
    this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
    this.setupNetwork();
    this.graphIsConnected = this.graph.isConnected();
    this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
  }

  setNodesAndEdges(): void {}

  addNode(data, callback): void {
    this.dialog
      .open(AddAndEditNodeDialog, {
        width: '230px',
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
              });
            } else if (edge.to == prevNodeValue) {
              newEdges.push({
                id: String(edge.from) + String(data.id),
                from: edge.from,
                to: data.id,
                label: edge.label,
              });
            }
          });

          if (!this.graph.containsNode(data.id)) {
            this.graph.editNode(prevNodeValue, data.id);
            //callback(data);
            this.baseData.nodes.remove(Number(prevNodeValue));
            this.baseData.nodes.add({ id: data.id, label: data.label });

            this.baseData.edges.remove(edgeIdsOfNode);
            this.baseData.edges.add(newEdges);
            this.graphChangedEvent.next();
          } /*else {
            console.log('node not edited');
          }*/
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
    this.graph.removeEdge(
      Number(data.edges[0].charAt(0)),
      Number(data.edges[0].charAt(1))
    );
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
    }
  }

  stepClicked(result): void {
    if (result.algoStepResult.done) {
      console.log('Done');
    } else {
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

    if (value.startNode != undefined) {
      this.colorNode(value.startNode, this.nodeVisitedColor);
    }

    if (value.current != undefined && value.newInQueue != undefined) {
      this.colorNode(value.current, this.nodeFinishedColor, this.nodeTextColor);
      value.newInQueue.forEach((node) => {
        this.colorNode(node, this.nodeVisitedColor);
        this.colorEdge(value.current, node, this.edgeHighlightColor);
      });
    }

    if (value.current != undefined) {
      this.colorNode(value.current, this.nodeFinishedColor, this.nodeTextColor);
    }

    if (value.next != undefined) {
      this.colorNode(value.next, this.nodeVisitedColor);
      this.colorEdge(value.current, value.next, this.edgeHighlightColor);
    }

    if (value.newNext != undefined) {
      this.colorNode(value.newNext, this.nodeVisitedColor);
      this.colorEdge(value.current, value.newNext, this.edgeHighlightColor);
      this.colorEdge(value.prevCurrent, value.newNext, this.baseEdgeColor);
    }

    if (this.selectedAlgorithmName == 'bellmanford') {
      if (this.weighted) {
        if (value.startNode != undefined) {
          this.setStartNodeInTable(value.startNode);
        } else if (value.current != undefined && value.weight != undefined) {
          let valueNext = value.next;
          if (valueNext == undefined) {
            valueNext = value.newNext;
          }

          this.updateTable(value.current, valueNext, value.weight);
        }
      }
    }

    if (this.selectedAlgorithmName == 'bfs') {
      this.bfsStep(value);
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
        },
      ]);
      //this.dfsCounterMap.set(node, counter);
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
        },
      ]);
      this.dfsStack.shift();
      this.dfsstacktable.renderRows();
    }
  }

  stepBack(value): void {
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

    if (value.current != undefined && value.newInQueue != undefined) {
      this.colorNode(value.current, this.nodeVisitedColor);
      value.newInQueue.forEach((node) => {
        this.colorNode(node, this.baseNodeColor);
        this.colorEdge(value.current, node, this.baseEdgeColor);
      });
    }

    if (value.next != undefined) {
      this.colorNode(value.next, this.baseNodeColor);
      this.colorEdge(value.current, value.next, this.baseEdgeColor);
    }

    if (value.newNext != undefined) {
      //this.colorNode(value.newNext, this.nodeVisitedColor);
      this.colorEdge(value.prevCurrent, value.newNext, this.edgeHighlightColor);
      this.colorEdge(value.current, value.newNext, this.baseEdgeColor);
    }
  }

  clearEdges(): void {
    this.baseData.edges.clear();
    this.graph.clearEdges();
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
    this.topSort = [];
    this.bfsQueue = [];
    this.smoothType = 'dyanmic';
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
      this.dfsstacktable.renderRows();
      this.topsorttable.renderRows();
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
  }
}
