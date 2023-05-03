import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { drag } from 'd3-drag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'ProyectoGrafos';
  private svg: any;
  private nodoSeleccionado: any;
  deleteNode: boolean = false;
  private nextNodeId = 1;
  joinNode: boolean = false;
  dragNode: boolean = false;
  node1: any = null;
  node2: any = null;
  @ViewChild('svg') private svgRef: ElementRef;

  constructor(){}
  ngAfterViewInit(): void {

  }
  ngOnInit(): void {
    this.svg = d3.select('svg');
    this.svg.on('click', this.onClick.bind(this));
  }
  
  removeNode(){
    this.deleteNode = !this.deleteNode;
  }

  joinNodes(){
    this.joinNode = !this.joinNode;
  }

  dragNodes(){
    this.dragNode = !this.dragNode;
  }

  onClick(event: MouseEvent) {
    const coordinates = d3.mouse(this.svg.node());

    if(!this.deleteNode && !this.joinNode){
      const newNode = this.svg
        .append('g')
        .attr('class', 'nodo')
        .attr('id', `nodo-${this.nextNodeId}`)
        .attr('transform', `translate(${coordinates[0]}, ${coordinates[1]})`);

      newNode
        .append('circle')
        .attr('r', 20)
        .style('fill', 'blue');

      newNode
        .append('text')
        .text(this.nextNodeId)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('fill', 'white');

        this.nextNodeId++;
    }else if(this.deleteNode && !this.joinNode){
      const target = d3.event.target;
      if(target.tagName === 'circle'){
        d3.select(target).remove();
      }

    }

    if(this.joinNode){
      const target = d3.event.target;
      if(this.node1 == null){
        this.node1 = d3.select(target.parentNode);
        return
      }
      if(this.node2 == null){
        this.node2 = d3.select(target.parentNode);
      }
      
      if(this.node1 != null && this.node2 != null){
        console.log('aqui')
        const line = this.svg.append('line')
          .attr('x1', +this.node1.attr('transform').split(',')[0].split('(')[1])
          .attr('y1', +this.node1.attr('transform').split(',')[1].split(')')[0])
          .attr('x2', +this.node2.attr('transform').split(',')[0].split('(')[1])
          .attr('y2', +this.node2.attr('transform').split(',')[1].split(')')[0])
          .style('stroke', 'black')
          .style('stroke-width', 2);
        this.node1 = null;
        this.node2 = null;
      }
    }

    if(this.dragNode){
      const target = d3.event.target;
      if(target.tagName === 'circle'){
        console.log('entra')
        const nodeGroup = d3.select(target.parentNode);
        const drag = d3.drag()
          .on('start', () => {
            nodeGroup.attr('initialPos', nodeGroup.attr('transform'));
          })
          .on('drag', () => {
            const dx = d3.event.dx;
            const dy = d3.event.dy;
            nodeGroup.attr('transform', `translate(${dx},${dy})`);
          })
          .on('end', () => {
            const collision = this.detectCollision(nodeGroup);
            if (collision) {
              nodeGroup.attr('transform', nodeGroup.attr('initialPos'));
            }
            nodeGroup.attr('initialPos', null);
          });
        nodeGroup.call(drag);
      }
    }
  }
  private getNodes(): any[] {
    const nodes = [];
    const nodeGroups = d3.selectAll('.nodo');
    nodeGroups.each(function () {
      nodes.push(d3.select(this));
    });
    return nodes;
  }
  private detectCollision(node: any): boolean {
    const nodes = this.getNodes();
    const bbox1 = node.node().getBBox();
    for (let i = 0; i < nodes.length; i++) {
      const otherNode = nodes[i];
      if (otherNode.attr('id') !== node.attr('id')) {
        const bbox2 = otherNode.node().getBBox();
        const collision = !(
          bbox1.y + bbox1.height < bbox2.y ||
          bbox1.y > bbox2.y + bbox2.height ||
          bbox1.x + bbox1.width < bbox2.x ||
          bbox1.x > bbox2.x + bbox2.width
        );
        if (collision) {
          return true;
        }
      }
    }
    return false;
  }
}
interface Node {
  id: number;
  x: number;
  y: number;
}

interface NodeDatum {
  id: string;
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphData {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

interface NodeDatum {
  id: string;
  x?: number;
  y?: number;
}

interface LinkDatum {
  source: string | number | NodeDatum;
  target: string | number | NodeDatum;
}


