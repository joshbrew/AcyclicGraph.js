
import {DOMElement, addCustomElement} from 'fragelement';

import {GraphNode} from 'acyclicgraph'

let component = require('./graphnode.component.html');

//See: https://github.com/brainsatplay/domelement
export class NodeDiv extends DOMElement {
    props={
        tag:undefined,
        input:undefined,
        operator:(input,node,origin)=>{ console.log(input); return input; },
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

        if(props.input) { //e.g. run the node on input
            props.node.runNode(props.node,props.input,undefined);
        }
    }

    setupNode(props) {
        let parent = this.parentNode;
        if(parent.tagName.toLowerCase() === 'graph-node') {
            props.parent = parent;
        }
        if(!props.graph) {   
            while(parent.tagName.toLowerCase() !== 'acyclic-graph') {
                // console.log(parent)
                // console.log(parent.tagName)
                if(parent.constructor.name === 'HTMLBodyElement' || parent.constructor.name === 'HTMLHeadElement' || parent.constructor.name === 'HTMLHtmlElement' || parent.constructor.name === 'HTMLDocument') {
                    console.error("No AcyclicGraph Found")
                    break;
                }
                parent = parent.parentNode;
            }
            if(parent.tagName.toLowerCase() === 'acyclic-graph') {
                props.graph = parent.props.graph;
            }
        }
        if(this.id && !props.tag) props.tag = this.id;

        props.node = new GraphNode(props, parent.node, props.graph);

        if(props.parent) {
            setTimeout(()=>{props.parent.props.node?.addChildren(props.node);},1);
        }
        

        props.tag = props.node.tag;
       
        if(!this.id) this.id = props.tag;

    }
    //onresize=(props)=>{} //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

addCustomElement(NodeDiv,'graph-node');
