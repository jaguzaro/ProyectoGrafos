import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { drag } from 'd3-drag';
import * as $ from 'jquery';
import * as Popper from 'popper.js';
import 'bootstrap';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {
  title = 'ProyectoGrafos';
  private svg: any;
  private destination: any;
  private nodoSeleccionado: any;
  deleteNode: boolean = false;
  private nextNodeId = 1;
  joinNode: boolean = false;
  dragNode: boolean = false;
  drawNode: boolean = false;
  node1: any = null;
  node2: any = null;
  distances: any = null;
  listGraph: any = null;
  nodesConected: any = {};
  adjacencyList: any = {};
  pathGraph: any = null;
  viewShortWay: boolean = false;
  @ViewChild('svg') private svgRef: ElementRef;
  @ViewChild('destiny') private destiny: ElementRef;

  constructor(){}
  ngAfterViewInit(): void {

  }
  ngOnInit(): void {
    this.svg = d3.select('svg');
    this.svg.on('click', this.onClick.bind(this));
  }
  
  removeNodes(){
    this.deleteNode = true;
    this.joinNode = false;
    this.dragNode = false;
    this.drawNode = false;
  }
  joinNodes(){
    this.deleteNode = false;
    this.joinNode = true;
    this.dragNode = false;
    this.drawNode = false;
  }
  drawNodes(){
    this.deleteNode = false;
    this.joinNode = false;
    this.dragNode = false;
    this.drawNode = true;
  }
  dragNodes(){
    this.deleteNode = false;
    this.joinNode = false;
    this.dragNode = true;
    this.drawNode = false;
  }

  onClick(event: MouseEvent) {
    const coordinates = d3.mouse(this.svg.node());

    if(!this.deleteNode && !this.joinNode && !this.dragNode && this.drawNode){
      const newNode = this.svg
        .append('g')
        .attr('class', 'nodo')
        .attr('id', `nodo-${this.nextNodeId}`)
        .attr('transform', `translate(${coordinates[0]}, ${coordinates[1]})`);

      newNode
        .append('circle')
        .attr('r', 20)
        .style('fill', '#ECB365');

      newNode
        .append('text')
        .text(this.nextNodeId)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('fill', 'white');

      this.nextNodeId++;
    }else if(this.deleteNode && !this.joinNode && !this.dragNode && !this.drawNode){
      const target = d3.event.target;
      if(target.tagName === 'circle'){
        d3.select(target).remove();
      }else if(target.tagName === 'line'){
        d3.select(target).remove();
      }
    }

    if(this.joinNode && !this.deleteNode && !this.dragNode && !this.drawNode){
      const target = d3.event.target;
      if(this.node1 == null){
        this.node1 = d3.select(target.parentNode);
        return
      }
      if(this.node2 == null){
        this.node2 = d3.select(target.parentNode);
      }
      
      if(this.node1 != null && this.node2 != null){
        const line = this.svg.append('line')
          .attr('x1', +this.node1.attr('transform').split(',')[0].split('(')[1])
          .attr('y1', +this.node1.attr('transform').split(',')[1].split(')')[0])
          .attr('x2', +this.node2.attr('transform').split(',')[0].split('(')[1])
          .attr('y2', +this.node2.attr('transform').split(',')[1].split(')')[0])
          .style('stroke', 'black')
          .style('stroke-width', 2)
          .attr('id', `line-${this.node1.attr('id').slice(-1)}_${this.node2.attr('id').slice(-1)}`);
        const id1 = this.node1.attr('id').slice(-1);
        const id2 = this.node2.attr('id').slice(-1);
        if(this.nodesConected[id1]){
          this.nodesConected[id1][id2] = 1;
        }else{
          this.nodesConected[id1] = {
            [id2]: 1
          }
        }
        
        if(this.nodesConected[id2]){
          this.nodesConected[id2][id1] = 1;
        }else{
          this.nodesConected[id2] = {
            [id1]: 1
          }
        }
        console.log(this.nodesConected)
        this.node1 = null;
        this.node2 = null;    
      }
    }

    if (this.dragNode) {
      const target = d3.event.target;
    
      if (target.tagName === 'circle') {
        const node = d3.select(target.parentNode);
    
        node.on('mousedown', function() {
          const nodeElement = d3.select(this);
          const initialMousePos = d3.mouse(nodeElement.node());
    
          const dragMove = function() {
            const currentMousePos = d3.mouse(nodeElement.node());
            const dx = currentMousePos[0] - initialMousePos[0];
            const dy = currentMousePos[1] - initialMousePos[1];
    
            const x = parseFloat(nodeElement.attr('transform').split('(')[1].split(',')[0]) + dx;
            const y = parseFloat(nodeElement.attr('transform').split('(')[1].split(',')[1].split(')')[0]) + dy;
            console.log(x, y, target)
            const transform = `translate(${x}, ${y})`;
            nodeElement.attr('transform', transform);
    
            const lines = d3.selectAll('line');
            lines.each(function() {
              const line = d3.select(this);
              const startNode = line.attr('start-node');
              const endNode = line.attr('end-node');
              if (startNode === nodeElement.attr('id')) {
                line.attr('x1', x).attr('y1', y);
              } else if (endNode === nodeElement.attr('id')) {
                line.attr('x2', x).attr('y2', y);
              }
            });
          };
    
          const dragEnd = function() {
            d3.select(this).on('mousemove', null);
            d3.select(document).on('mouseup', null);
          };
          
          nodeElement.on('mousemove', dragMove);
          nodeElement.on('mouseup', dragEnd);
        });
      }
    }
  }

  removeAll(){
    this.svg.selectAll("*").remove();
    this.nextNodeId = 1;
    
  }

  shortWay(){
    const inputInit = document.querySelector('#nInit') as HTMLInputElement;
    const initValue = inputInit.value;
    const inputFinish = document.querySelector('#nFinish') as HTMLInputElement;
    const finishValue = inputFinish.value;

    this.adjacencyList = {};

    for (let node in this.nodesConected) {
      this.adjacencyList[node] = {};
      for (let connectedNode in this.nodesConected[node]) {
        this.adjacencyList[node][connectedNode] = this.nodesConected[node][connectedNode];
      }
    }
    this.dijkstra(this.adjacencyList, initValue, finishValue);
    this.replicateSVG();
  }

  dijkstra(graph: Graph, start: string, end: string){
    const distances: {[key: string]: number} = {};
    const previous: {[key: string]: string | null} = {};
    const queue: string[] = [];
  
    for (const vertex in graph) {
      if (vertex === start) {
        distances[vertex] = 0;
        queue.push(vertex);
      } else {
        distances[vertex] = Infinity;
      }
      previous[vertex] = null;
    }
  
    while (queue.length > 0) {
      const current = queue.shift() as string;
  
      for (const neighbor in graph[current]) {
        const tentativeDistance = distances[current] + graph[current][neighbor];
        if (tentativeDistance < distances[neighbor]) {
          distances[neighbor] = tentativeDistance;
          previous[neighbor] = current;
          queue.push(neighbor);
        }
      }
    }
  
    const path: string[] = [];
    let current = end;
    while (current !== start) {
      path.unshift(current);
      current = previous[current] as string;
    }
    path.unshift(start);
    console.log(path)
    this.pathGraph = path;
    return path;
  }

  replicateSVG() {
    const graphContainer = document.createElement('div');
    const copiedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = this.svg.attr('width');
    const height = this.svg.attr('height');
    copiedSvg.setAttribute('width', width);
    copiedSvg.setAttribute('height', height);
    const newSvgNode = this.svg.node().cloneNode(true);
    copiedSvg.appendChild(newSvgNode);
    graphContainer.appendChild(copiedSvg);
    this.destiny.nativeElement.appendChild(graphContainer);
    this.viewShortWay = true;
    setTimeout(() => {
      for (let i = 0; i < this.pathGraph.length; i++) {
        const newNode = d3.select(newSvgNode).select(`#nodo-${this.pathGraph[i]}`).select('circle')
          .classed('node-short', true)
      }

      for (let i = 0; i < this.pathGraph.length; i++) {
        console.log(`#line-${this.pathGraph[i]}_${this.pathGraph[i+1]}`)
        const newLine = d3.select(newSvgNode).select(`#line-${this.pathGraph[i]}_${this.pathGraph[i+1]}`)
          .classed('line-short', true)
        const newLine2 = d3.select(newSvgNode).select(`#line-${this.pathGraph[i+1]}_${this.pathGraph[i]}`)
          .classed('line-short', true)
      }

    }, 1000);

  }
}

interface Graph {
  [key: string]: {[key: string]: number};
}
