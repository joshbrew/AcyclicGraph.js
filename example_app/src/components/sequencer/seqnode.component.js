
import {DOMElement, addCustomElement} from 'fragelement';

let component = require('./sequencer.component.html');

//See: https://github.com/brainsatplay/domelement
export class SeqNode extends DOMElement {
    props={
        operation:(input) => {
            return input;
        }
    } //can specify properties of the element which can be subscribed to for changes.
    
    //set the template string or function (which can input props to return a modified string)
    template=component;

    //DOMElement custom callbacks:
    oncreate=(props)=>{
        //set up the business logic for the component
        
    }
    //onresize=(props)=>{} //on window resize
    //onchanged=(props)=>{} //on props changed
    //ondelete=(props)=>{} //on element deleted. Can remove with this.delete() which runs cleanup functions
}

//window.customElements.define('custom-', Custom);

addCustomElement(SeqNode,'snode-');
