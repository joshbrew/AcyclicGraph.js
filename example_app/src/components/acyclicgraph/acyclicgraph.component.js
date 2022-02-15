
import {DOMElement, addCustomElement} from 'fragelement';

import {AcyclicGraph} from 'acyclicgraph'

let component = require('./acyclicgraph.component.html');

//See: https://github.com/brainsatplay/domelement
export class Graph extends DOMElement {
    props={
        
        graph:new AcyclicGraph(),
        nodes:[]
    } //can specify properties of the element which can be subscribed to for changes.
    
    //set the template string or function (which can input props to return a modified string)
    template=component;

    graphnode;

    //DOMElement custom callbacks:
    oncreate=(props)=>{
        setTimeout(()=> {
            
            let children = Array.from(this.children);
            let topchildren = [];
            if(children?.length > 0) {
                children.forEach((n)=>{
                    console.log(n)
                    if(n.props) props.nodes.push(n.props.node);
                    if(n.props && n.parentNode.tagName === this.tagName) topchildren.push(n)
                });
            }

            this.querySelector('button').onclick = () => {
                topchildren.forEach((c)=>{
                    c.props.node.runNode(c.props.node,'Test')
                });
            }
        }, 
        1);
    }

    //onresize=(props)=>{} //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

addCustomElement(Graph,'acyclic-graph');
