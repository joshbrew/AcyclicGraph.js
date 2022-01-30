//just a more typical hierarchical graph tree with back and forward prop and arbitrary 
// go-here-do-that utilities. Create an object node tree and make it do... things 
// same setup as sequencer but object/array/tag only (no functions), and can add arbitrary properties to mutate on objects
// or propagate to children/parents with utility calls that get added to the objects
//Joshua Brewster and Garrett Flynn AGPLv3.0


/*

let tree = { //top level should be an object, children can be arrays of objects
    tag:'top',
    operator:(input,node,origin)=>{
        if(typeof input === 'object') {
            if(input?.x) node.x = input.x; 
            if(input?.y) node.y = input.y;
            if(input?.z) node.z = input.z;
            console.log('top node, input:', input);
        }
        return input;
    }, //input is the previous result if passed from another node. node is 'this' node, origin is the previous node if passed
    forward:true, //forward prop: returned outputs from the operator are passed to children operator(s)
    //backward:true, //backprop: returned outputs from the operator are passed to the parent operator
    x:3, //arbitrary properties available on the node variable in the operator 
    y:2,
    z:1,
    children:{ //object, array, or tag. Same as the 'next' tag in Sequencer.js
        tag:'next', //tagged nodes get added to the node map by name, they must be unique! non-tagged nodes are only referenced internally e.g. in call trees
        operator:(input,node,origin)=>{
            if(origin.x) { //copy over the coordinates
                node.x = origin.x;
                node.y = origin.y;
                node.z = origin.z;
            }
            console.log('next node \n parent node:',node,'\ninput',input);
        }, // if you use a normal function operator(input,node,origin){} then you can use 'this' reference instead of 'node', while 'node' is more flexible for arrow functions etc.
        //etc..
        delay:500,
        repeat:3
    },
    delay:1000//, //can timeout the operation
    //frame:true //can have the operation run via requestAnimationFrame (throttling)
    //repeat:3 //can repeat an operator, or use "recursive" for the same but passing the node's result back in
};


let graph = new AcyclicGraph();
graph.addNode(tree);

graph.run(tree.tag,{x:4,y:5,z:6});

each node in the tree becomes a graphnode object

*/
//TODO: try to reduce the async stack a bit for better optimization, though in general it is advantageous matter as long as node propagation isn't 
//   relied on for absolute maximal performance concerns, those generally require custom solutions e.g. matrix math or clever indexing, but this can be used as a step toward that.

//a graph representing a callstack of nodes which can be arranged arbitrarily with forward and backprop or propagation to wherever
export class AcyclicGraph {
    constructor() {
    
        this.nodes = new Map();
    
        this.state = {
            pushToState:{},
            data:{},
            triggers:{},
            setState(updateObj){
                Object.assign(this.pushToState,updateObj);
        
                if(Object.keys(this.triggers).length > 0) {
                    // Object.assign(this.data,this.pushToState);
                    for (const prop of Object.getOwnPropertyNames(this.triggers)) {
                        if(this.pushToState[prop]) {
                            this.data[prop] = this.pushToState[prop]
                            delete this.pushToState[prop];
                            this.triggers[prop].forEach((obj)=>{
                                obj.onchange(this.data[prop]);
                            });
                        }
                    }
                }

                return this.pushToState;
            },
            subscribeTrigger(key,onchange=(res)=>{}){
                if(key) {
                    if(!this.triggers[key]) {
                        this.triggers[key] = [];
                    }
                    let l = this.triggers[key].length;
                    this.triggers[key].push({idx:l, onchange:onchange});
                    return this.triggers[key].length-1;
                } else return undefined;
            },
            unsubscribeTrigger(key,sub){
                let idx = undefined;
                let triggers = this.triggers[key]
                if (triggers){
                    if(!sub) delete this.triggers[key];
                    else {
                        let obj = triggers.find((o)=>{
                            if(o.idx===sub) {return true;}
                        });
                        if(obj) triggers.splice(idx,1);
                        return true;
                    }
                }
            },
            subscribeTriggerOnce(key=undefined,onchange=(value)=>{}) {
                let sub;
                let changed = (value) => {
                    onchange(value);
                    this.unsubscribeTrigger(key,sub);
                }

                sub = this.subscribeTrigger(key,changed);
            }
        }
        
    }
    
    //convert child objects to nodes
    convertToNodes(n) {
        if(typeof n.children === 'object') {
            n.children = new graphnode(n.children,n,this);
            this.convertToNodes(n.children);
            if(n.children.tag) this.nodes.set(n.children.tag,n.children);
        } else if (Array.isArray(n.children)) {
            for(let i = 0; i < n.children.length; i++) {
                n.children[i] = new graphnode(nn,n,this);
                this.convertToNodes(n.children[i]);
                if(n.children[i].tag) this.nodes.set(n.children[i].tag,n.children[i]);
            }
        } else if (typeof n.children === 'string') {
            n.children = this.getNode(n.children);
        }
    }

    addNode(node={}) {
        if(!node.tag) node.tag = `top${Math.floor(Math.random()*10000000)}`; //add a random id for the top index if none supplied
        let tree = new graphnode(node,undefined,this);
        this.convertToNodes(tree);
        this.nodes.set(tree.tag,tree);
        return tree;
    }

    getNode(tag) {
        return this.nodes.get(tag);
    }

    removeNode(tag) {
        this.nodes.delete(tag);
    }

    appendNode(node={}, parentNode) {
        parentNode.addChildren(node);
    }

    run (node,input,origin) {
        if(typeof node === 'string') node = this.nodes.get(node);

        return new Promise(async (resolve) => {
            if(node) {
                let run = (node, inp,tick=0) => {
                    return new Promise (async (r) => {
                        tick++;
                        let res = await node.runOp(inp,node,origin);
                        if(typeof node.repeat === 'number') {
                            while(tick < node.repeat) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,inp,tick));
                                    },node.delay);
                                    break;
                                } else if (node.frame && requestAnimationFrame) {
                                    requestAnimationFrame(async ()=>{
                                        r(await run(node,inp,tick));
                                    });
                                    break;
                                }
                                else res = await node.runOp(inp,node,origin);
                                tick++;
                            }
                            if(tick === node.repeat) {
                                r(res);
                                return;
                            }
                        } else if(typeof node.recursive === 'number') {
                            
                            while(tick < node.recursive) {
                                if(node.delay) {
                                    setTimeout(async ()=>{
                                        r(await run(node,res,tick));
                                    },node.delay);
                                    break;
                                } else if (node.frame && requestAnimationFrame) {
                                    requestAnimationFrame(async ()=>{
                                        r(await run(node,res,tick));
                                    });
                                    break;
                                }
                                else res = await node.runOp(res,node,origin);
                                tick++;
                            }
                            if(tick === node.recursive) {
                                r(res);
                                return;
                            }
                        } else {
                            r(res);
                            return;
                        }
                    });
                }


                let runnode = async () => {


                    let res = await run(node,input); //repeat/recurse before moving on to the parent/child

                    if(node.backward && node.parent) {
                        await this.run(node.parent,res,node)
                    }
                    if(node.children && node.forward) {
                        if(Array.isArray(node.children)) {
                            for(let i = 0; i < node.children.length; i++) {
                                await this.run(node.children[i],res,node);
                            }
                        }
                        else await this.run(node.children,res,node);
                    }
                    
                    return res;
                }

                if(node.delay) {
                    setTimeout(async ()=>{
                        resolve(await runnode());
                    },node.delay);
                } else if (node.frame && requestAnimationFrame) {
                    requestAnimationFrame(async ()=>{
                        resolve(await runnode());
                    });
                } else {
                    resolve(await runnode());
                }
                
            }
            else resolve(undefined);
        });
    }


    subscribe(tag,callback=(res)=>{}) {
        return this.state.subscribeTrigger(tag,callback);
    }

    unsubscribe(tag,sub) {
        this.state.unsubscribeTrigger(tag,sub);
    }

}

//the utilities in this class can be referenced in the operator after setup for more complex functionality
export class graphnode {
    constructor(node={}, parent, graph={}) {
        Object.assign(this,node); //set the node's props as this
        this.parent=parent;
        this.graph=graph;
    }

    //I/O scheme for this node
    operator(input,node=this,origin){
        return input;
    }

    //runs the node sequence
    run(node,input,origin){
        return this.graph.run(node,input,origin);
    }; //graph function

    //this is the i/o handler, or the 'main' function for this node to propagate results. The origin is the node the data was propagated from
    setOperator(operator=function operator(input,node=this,origin){return input;}) {
        this.operator = operator;
    }

    async runOp(input,node=this,origin) {
        let result = await this.operator(input,node, origin);
        if(this.tag) this.graph.state.setState({[this.tag]:result});
        return result;
    }

    setParent(parent) { 
        this.parent = parent;
    }

    addChildren(children) {
        if(!Array.isArray(this.children)) this.children = [this.children];
        if(Array.isArray(children)) this.children.push(...children);
        else this.children.push(children);
    }

    convertToNodes(n) {
        if(typeof n.children === 'object') {
            n.children = new graphnode(n.children,n,this.graph);
            convertToNodes(n.children);
        } else if (Array.isArray(n.children)) {
            for(let i = 0; i < n.children.length; i++) {
                n.children[i] = new graphnode(nn,n,this.graph);
                convertToNodes(n.children[i]);
            }
        }
    }

    async callParent(input){
        if(typeof this.parent?.operator === 'function') await this.parent.runOp(input,this.parent,this);
    }
    
    async callChildren(input, idx){
        let result;
        if(Array.isArray(this.children)) {
            if(idx) result = await this.children[idx]?.runOp(input,this.children[idx],this);
            else {
                result = [];
                for(let i = 0; i < this.children.length; i++) {
                    result.push(await this.children[idx]?.runOp(input,this.children[idx],this));
                } 
            }
        } else {
            result = await this.children.runOp(input,this.children,this);
        }
        return result;
    }

    setProps(props={}) {
        Object.assign(this,props);
    }

}

