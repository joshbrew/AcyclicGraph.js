
import {addCustomElement} from 'fragelement';

import {NodeDiv} from '../acyclicgraph/graphnode.component'

let component = require('./canvasnode.component.html');

//See: https://github.com/brainsatplay/domelement
export class CanvasNodeDiv extends NodeDiv {
    props={
        radius:20,

        operator:(
            input,
            node,
            origin,
            cmd
        )=>{ 

            if(typeof input === 'object') {
                if(input.radius) this.props.radius = input.radius;
            } else {
                this.props.radius += Math.random()-0.5;
                if(this.props.radius <= 1) this.props.radius = 1
            }

            if(cmd === 'animate') {
                let canvas = this.props.canvas;
                let ctx = this.props.ctx;
                this.drawCircle(
                    canvas.height*0.5,
                    canvas.width*0.5,
                    this.props.radius,
                    'green',
                    5,
                    '#003300'
                );
            }
        },
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:true, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
        input:undefined,// can set on the attribute etc
        graph:undefined, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
        node:undefined, //GraphNode instance, can set manually or as a string to grab a node by tag (or use tag)
    }; //can specify properties of the element which can be subscribed to for changes.

    //set the template string or function (which can input props to return a modified string)
    template=component;

        
    drawCircle(centerX, centerY, radius, fill='green', strokewidth=5, strokestyle='#003300') {
        this.props.ctx.beginPath();
        this.props.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.props.ctx.fillStyle = fill;
        this.props.ctx.fill();
        this.props.ctx.lineWidth = strokewidth;
        this.props.ctx.strokeStyle = strokestyle;
        this.props.ctx.stroke();
    }

    drawLine(
        from={x:0,y:0},
        to={x:1,y:1},
        strokewidth=5,
        strokestyle='#003300'
    ) {
        this.props.ctx.beginPath();
        this.props.ctx.lineWidth = strokewidth;
        this.props.ctx.strokeStyle = strokestyle;
        this.props.ctx.moveTo(from.x, from.y);
        this.props.ctx.lineTo(to.x, to.y);
        this.props.ctx.stroke();
    }
    
    //DOMElement custom callbacks:
    oncreate=(props)=>{
        this.canvas = this.querySelector('canvas');
        props.canvas = this.canvas;
        if(props.context) props.context = this.canvas.getContext(props.context);
        else props.context = this.canvas.getContext('2d');
        this.context = props.context;
        this.ctx = this.context;
        props.ctx = this.context;

        setTimeout(()=>{if(props.animate) props.node.runAnimation();},10)

    } //after rendering
    onresize=(props)=>{
        if(props.canvas) {
            props.canvas.height = this.clientHeight;
            props.canvas.width = this.clientWidth;
        }
    } //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

addCustomElement(CanvasNodeDiv,'canvas-node');