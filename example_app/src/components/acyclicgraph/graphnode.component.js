
import {DOMElement, addCustomElement} from 'fragelement';

import {GraphNode} from 'acyclicgraph'

let component = require('./graphnode.component.html');

//See: https://github.com/brainsatplay/domelement
export class NodeDiv extends DOMElement {
    props={
        tag:undefined,
        operator:(input,node,origin)=>{},
        forward:true,
        backward:false,
        children:undefined,
        delay:false,
        repeat:false, // set repeat 
        recursive:false,
        graph:undefined, //parent AcyclicGraph instance
        node:undefined, //GraphNode instance
    }; //can specify properties of the element which can be subscribed to for changes.
    
    //set the template string or function (which can input props to return a modified string)
    template=component;

    //DOMElement custom callbacks:
    oncreate=(props)=>{
        this.setupNode(props)
    }

    setupNode(props) {
        if(!props.graph) {
            let parent = this.parentNode;
            if(parent.constructor.name === 'NodeDiv') {
                props.parent = parent.node;
            }
            while(parent?.constructor.name !== 'AcyclicGraph') {
                if(parent.constructor.name === 'HTMLBodyElement' || parent.constructor.name === 'HTMLHeadElement' || parent.constructor.name === 'HTMLHtmlElement' || parent.constructor.name === 'HTMLDocument') {
                    console.error("No AcyclicGraph Found, error")
                    break;
                }
                parent = parent.parentNode;
            }
            if(parent.constructor.name === 'AcyclicGraph') {
                props.graph = parent.props.graph;
            }
        }
        if(this.id && !props.tag) props.tag = this.id;

        props.node = new GraphNode(props, parent.node, props.graph);

        props.tag = props.node.tag;
       
        if(!this.id) this.id = props.tag;

    }
    //onresize=(props)=>{} //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

addCustomElement(NodeDiv,'graph-node');
