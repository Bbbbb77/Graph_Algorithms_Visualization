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

import { GraphParserService } from '../../services/graphparserservice';

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
  providers: [GraphParserService],
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

  baseNodeColor: string = '#97c2fc';
  baseEdgeColor: string = '#2b7ce9';
  edgeHighlightColor: string = 'orange';
  nodeVisitedColor: string = 'grey';
  nodeFinishedColor: string = 'balck';

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
  prevWasNewNext: boolean = false;

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

  constructor(
    public dialog: MatDialog,
    private graphParserService: GraphParserService
  ) {}

  @ViewChild('algorithmsComponent')
  algorithmsComponent: Algorithms;

  @ViewChild('bellmanfordtable')
  bellmanfordtable: MatTable<BellmanFordTableElement>;

  @ViewChild('bfsqueuetable')
  bfsqueuetable: MatTable<string>;

  @ViewChild('dfsstacktable')
  dfsstacktable: MatTable<string>;

  onFileSelected(event): void {
    let file = event.target.files[0];
    let fileReader: FileReader = new FileReader();
    fileReader.onloadend = () => {
      console.log('onloadend', fileReader.result);
      if (
        this.directed != undefined &&
        this.weighted != undefined &&
        fileReader.result != undefined
      ) {
        let nodesAndEdges = this.graphParserService.parseGraph(
          this.graph,
          this.directed,
          this.weighted,
          String(fileReader.result)
        );

        let nodesDataSet = new vis.DataSet(nodesAndEdges.nodes);
        let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
        this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
        this.setupNetwork();

        this.graph.print();

        this.graphIsConnected = this.graph.isConnected();
        this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
      }
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

  setupNetwork(): void {
    var options = {
      layout: { randomSeed: this.seed },
      nodes: { borderWidth: 4, size: 100 },
      edges: { color: { color: this.baseEdgeColor, inherit: false } },
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

  drawGraph(graphText): void {
    if (this.directed != undefined && this.weighted != undefined) {
      let nodesAndEdges = this.graphParserService.parseGraph(
        this.graph,
        this.directed,
        this.weighted,
        graphText
      );

      let nodesDataSet = new vis.DataSet(nodesAndEdges.nodes);
      let edgesDataSet = new vis.DataSet(nodesAndEdges.edges);
      this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
      this.setupNetwork();
      this.graphIsConnected = this.graph.isConnected();
      this.graphHasNegativeEdge = this.graph.getHasNegativeWeight();
    }
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
        data: {
          directed: this.directed,
          weighted: this.weighted,
          graph: this.graph,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log('result', result);
        let nodesDataSet = new vis.DataSet(result.nodes);
        let edgesDataSet = new vis.DataSet(result.edges);
        this.baseData = { nodes: nodesDataSet, edges: edgesDataSet };
        this.setupNetwork();

        this.graph.print();

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
      this.colorNode(value.current, this.nodeFinishedColor);
      value.newInQueue.forEach((node) => {
        this.colorNode(node, this.nodeVisitedColor);
        this.colorEdge(value.current, node, this.edgeHighlightColor);
      });
    }

    if (value.current != undefined) {
      this.colorNode(value.current, this.nodeFinishedColor);
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
        },
      ]);
      this.dfsStack.unshift(String(node));
      this.dfsstacktable.renderRows();
    }
  }

  stepBackDfs(value): void {
    console.log('stepBackDfs value', value);
    if (value.startNode != undefined) {
      let node = value.startNode;
      let counter = value.startCounter;
      let newLabel = String(node); //+ ' (' + String(counter) + ')';
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
      let newLabel = String(node); // + ' (' + String(counter) + ')';
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
      let newLabel =
        String(node) +
        ' (' +
        String(counter) /*+ '/' + String(endCounter)*/ +
        ')';
      this.baseData.nodes.update([
        {
          id: node,
          label: newLabel,
          color: { background: this.nodeVisitedColor },
        },
      ]);
      this.dfsStack.shift(); //.unshift(String(node));
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
        {
          id: id,
          color: { background: this.baseNodeColor, border: this.baseEdgeColor },
        },
      ]);
    });
    this.baseData.edges.getIds().forEach((id) => {
      this.baseData.edges.update([
        { id: id, color: { color: this.baseEdgeColor } },
      ]);
    });
    //this.newTable();
  }

  colorNode(nodeId, color): void {
    this.baseData.nodes.update([{ id: nodeId, color: { background: color } }]);
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
}
