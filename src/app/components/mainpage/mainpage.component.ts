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

declare var vis: any;

@Component({
  selector: 'mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css'],
})
export class MainPage implements OnInit {
  @ViewChild('siteConfigNetwork')
  networkContainer: ElementRef;

  @Output()
  directed: boolean;

  @Output()
  weighted: boolean;

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

  constructor(public dialog: MatDialog) {}

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
      nodes: { borderWidth: 4 },
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
          console.log('editNodeData data', data);
          this.network.getConnectedEdges(this.prevNodeValue);
          console.log('savenode data.label', data.label);
          console.log('prevnodevalue', this.prevNodeValue);

          var newEdges: any[] = [];

          var edgeIdsOfNode = this.network.getConnectedEdges(
            this.prevNodeValue
          );

          var edgesOfNode = this.baseData.edges.get(edgeIdsOfNode);

          console.log('ids', edgeIdsOfNode);
          console.log('edges', edgesOfNode);
          console.log('\n');

          console.log('before edges', this.baseData.edges.get());

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

            console.log('newEdges', newEdges);

            this.baseData.edgesDataSet.remove(edgeIdsOfNode);
            this.baseData.edgesDataSet.add(newEdges);

            console.log('after edges', this.baseData.edges.get());
          } else {
            console.log('node not edited');
          }
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
      });
  }

  deleteSelectedNode(data, callback): void {
    this.graph.removeNode(data.nodes[0]);
    callback(data);
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
      .subscribe((result) => {});
  }

  editEdgeData(data, callback, edgeWeight): void {
    data.label = edgeWeight;
    callback(data);
    this.graph.editEdge(data.from, data.to, Number(data.label));
  }

  deleteSelectedEdge(data, callback): void {
    this.graph.removeEdge(
      Number(data.edges[0].charAt(0)),
      Number(data.edges[0].charAt(1))
    );
    callback(data);
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
      callback(data);
    }
  }

  stepClicked(result): void {
    if (result.algoStepResult.done) {
      //let button = document.getElementById('stepButton');
      //button.disabled = true;
      //list.innerHTML += "<li>done</li>";
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
    var edgeId;
    //console.log('basedata edges', this.baseData.edges.getIds());
    if (algoStepResult.value.newInQueue != undefined) {
      this.baseData.nodes.update([
        { id: algoStepResult.value.newInQueue, color: { background: 'red' } },
      ]);
      edgeId =
        String(algoStepResult.value.current) +
        String(algoStepResult.value.newInQueue);
      //console.log('edgeId', edgeId);
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

  stepBack(algoStepResult): void {
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
    //this.directed = undefined;
    //this.weighted = undefined;
    //this.nodesDataSet = null;
    //this.edgesDataSet = null;
    this.baseData = null;
    this.graph = null;
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
  }
}
