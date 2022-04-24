## Acyclic Graphs

![status](https://img.shields.io/npm/v/acyclicgraph) 
![downloads](https://img.shields.io/npm/dt/acyclicgraph)
![size](https://img.shields.io/github/size/brainsatplay/acyclicgraph.js/acyclicgraph.js)
![lic](https://img.shields.io/npm/l/acyclicgraph)

`npm i acyclicgraph`

Easy node tree graph for creating graphs like [DAGs](https://en.wikipedia.org/wiki/Directed_acyclic_graph) i.e. any arbitrary node tree with forward and backpropagation, repeaters, etc. for chaining scripts and scopes e.g. [game systems](https://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/). You can construct any type of graph and run async coroutines etc.

This is built around the idea of having an operator i.e. a custom i/o handler at each scope. You can easily extend the graphnode class with primitives etc for different systems, just read the code. Otherwise it's a pure javascript implementation with no dependencies.

Running a node returns a promise that resolves after the tree is finished running, so you can chain complex functions that can mutate e.g. an object returned and passed along by the first operator or a property on a node. See below for a very simple example. 

This can get as complex as you want as each node is essentially just a different local scope and a main() function for each, with some easy piping based on writing a native object hierarchy with optional tagging for important nodes where results need to be subscribed to or chained to other complex nodes.

For a more basic function sequencer, see [Sequencer.js](https://github.com/moothyknight/Sequencer.js)

### Basic usage
```js

let tree = { //top level should be an object, children can be arrays of objects
    tag:'top',
    operator:(
        input, //input, e.g. output from another node
        node,  //'this' node
        origin, //origin node
        cmd    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>{
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
        operator:(
            input,
            node,
            origin,
            cmd
        )=>{
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
    //loop: 10 //can add a loop subroutine, the node will only run the loop once and can still be called. Specify milliseconds. Stop with node.stopLooping()
    //animate: true //can add a requestAnimationFrame subroutine. Stop with node.stopAnimating()
};


let graph = new AcyclicGraph();
graph.addNode(tree);

let res = graph.run(tree.tag,{x:4,y:5,z:6}).then(res => console.log('promise, after', res));

console.log('promise returned:',res);


```

### Also try the webcomponents we built to run natively with our AcyclicGraph logic!
`npm i acyclicgraph-webcomponents`

Run the /example_app for demonstration, it's purely conceptual but you can see a fully implemented example at http://190.92.148.106 using this to do gravitational physics with html elements as planets.

### GraphNode class

These are the objects created to represent each node in the tree. They can be created without belonging to an acyclic graph. The acyclic graph simply adds sequential tags 'node0, node1' etc (rather than random tags) to all untagged nodes according to the order of the tree provided so it's easier to create self-referencing trees.

GraphNode properties
```ts
type GraphNodeProperties = {
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    operator:( //can be async
        input:any, //input, e.g. output from another node
        node:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string|number    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward:boolean, //pass output to child nodes
    backward:boolean, //pass output to parent node
    children?:string|GraphNodeProperties|GraphNode|(GraphNodeProperties|GraphNode|string)[], //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
    parent?:GraphNode|undefined, //parent graph node
    delay?:false|number, //ms delay to fire the node
    repeat?:false|number, // set repeat as an integer to repeat the input n times, cmd will be the number of times the operation has been repeated
    recursive?:false|number, //or set recursive with an integer to pass the output back in as the next input n times, cmd will be the number of times the operation has been repeated
    animate?:boolean, //true or false
    loop?:false|number, //milliseconds or false
    animation?:( //uses operator by default unless defined otherwise can be async 
        input:any, //input, e.g. output from another node
        node:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string|number    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any | undefined,
    looper?:( //uses operator by default unless defined otherwise (to separate functions or keep them consolidated) can be async
        input:any, //input, e.g. output from another node
        node:GraphNode|string,  //'this' node
        origin?:GraphNode|string, //origin node
        cmd?:string|number    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any | undefined,
    [key:string]:any //add whatever variables and utilities
}; //can specify properties of the element which can be subscribed to for changes.

```

GraphNode utilities

```js

    //node properties you can set, create a whole tree using the children
    let props={
        operator:(
            input, //input, e.g. output from another node
            node,  //'this' node
            origin, //origin node
            cmd    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
        )=>{ console.log(input); return input; }, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
        forward:true, //pass output to child nodes
        backward:false, //pass output to parent node
        children:undefined, //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
        parent:undefined, //parent graph node
        delay:false, //ms delay to fire the node
        repeat:false, // set repeat as an integer to repeat the input n times
        recursive:false, //or set recursive with an integer to pass the output back in as the next input n times
        animate:false, //true or false
        loop:undefined, //milliseconds or false
        tag:undefined, //generated if not specified, or use to get another node by tag instead of generating a new one
      }; //can specify properties of the element which can be subscribed to for changes.


let node = new GraphNode(props, parentNode, graph);

node
    .operator(input,node=this,origin,cmd) //<--- runs the operator function
    
    .runOp(input, node=this, origin, cmd) //<--- runs the operator and sets state with the result for that tag
    
    .runNode(node,input,origin) //<--- runs the node sequence starting from the given node, returns a promise that will spit out the final result from the tree if any

    .run(input,node=this,origin) //<--- this is the base sequencing function, returns a promise that will spit out the final result of the tree if any

    .runAnimation(input,node=this,origin) //run the operator loop on the animation loop with the given input conditions, the cmd will be 'animate' so you can put an if statement in to run animation logic in the operator

    .runLoop(input,node=this,origin) //runs a setTimeout loop according to the node.loop setting (ms)

    .setOperator(operator) //set the operator functions

    .setParent(parent) //set the parent GraphNode

    .addChildren(children) //add child GraphNodes to this node (operation results passed on forward pass)

    .removeTree(node) //remove a node and all associated nodes

    .addNode(props) //add a node using a properties object

    .appendNode(props, parentNode=this) //append a child node with a properties object or string

    .getNode(tag) //get a child node of this node by tag (in tree)

    .stopLooping() //stop the loop

    .stopAnimating() //stop the animation loop

    .stopNode() //stop both

    .convertChildrenToNodes(node=this) //convert child node properties objects/tags/etc to nodes.

    .callParent(input, origin=this, cmd) //run the parent node operation (no propagation)

    .callChildren(input, origin=this, cmd, idx) //call the children node(s) with the given input, won't run their forward/backward passes. 

    .setProps(props) //assign to self

    .subscribe(callback=(res)=>{},tag=this.tag) //subscribe to the tagged node output, returns an int. if you pass a graphnode as a callback it will call subscribeNode
 
    .unsubscribe(sub,tag=this.tag) //unsubscribe from the tag, no sub = unsubscribe all

    .subscribeNode(node) //subscribe another node sequence (not a direct child) to this node's output via the state

    .print(node=this,printChildren=true) //recursively print a reconstrucible json hierarchy of the graph nodes, including arbitrary keys/functions, if printChildren is set to false it will only print the tags and not the whole object in the .children property of this node

    .reconstruct(json='{}') //reconstruct a jsonified node hierarchy into a functional GraphNode tree and add it to the list

```


### Acyclic Graph Utilities

```js

//this is less useful now that the graph nodes are self contained but it can act as an index for your node trees.
let graph = new AcyclicGraph();

    graph

        .addNode(node) // add a node with a properties object

        .getNode(tag) // get a node by tag, nodes added in the acyclic graph automatically get their tags set to sequential numbers if not set otherwise

        .create(operator=(input,node,origin,cmd)=>{},parentNode,props) //create a node just using an operator, can pass props for more

        .run(node,input,origin) //<--- runs the node sequence starting from the given node, returns a promise that will spit out the final result from the tree if any

        .runNode(node,input,origin) //same as run

        .removeTree(node) // remove a node tree by head node

        .removeNode(node) // remove a node and any references

        .appendNode(node, parentNode) // append a node to a parent node

        .callParent(node,input,origin=node,cmd) // call a parent ndoe of a given node

        .callChildren(node, input, origin=node, cmd, idx) // call the children of a given node

        .subscribe(tag, callback=(res)=>{}) //subscribe to a node tag, callbacks contain that node's operator output, returns an int sub number

        .unsubscribe(tag, sub) //unsubscribe to a node by tag, 

        .subscribeNode(inputNode,outputNode) //subscribe the outputNode to the output of the inputNode

        .print(node,printChildren=true) //recursively print a reconstrucible json hierarchy of the graph nodes, including arbitrary keys/functions, if printChildren is set to false it will only print the tags and not the whole object in the .children property of this node

        .reconstruct(json='{}') //reconstruct a jsonified node hierarchy into a functional GraphNode tree

```

Extra methods:
```js 
reconstructNode(json='{}') //return a GraphNode tree reconstructed from a jsonified tree

//just provide an operator to make a node
createNode(operator=(input,node,origin,cmd)=>{},parentNode,props,graph)

```


### Design Philosophy

Graphs simply are a way to manage operation sequences. These can be directed or undirected, and can have cycles on some nodes (technically not acyclic) with single trees or multiple running concurrently e.g. an animation loop and then event loops for user or server inputs<br/>
![DAG-and-not-DAG-768x321](https://user-images.githubusercontent.com/18196383/153975071-34ae096e-2bfa-4564-a1ec-4e21989806ad.png)

Acyclic graphs are trees of operations with arbitrary entry and exit points plus arbitrary propagation of results through the tree.
Each node is an object with a few required properties and functions and then anything else you want to add as variables, reference, utility functions etc. 

Nodes added to the graph tree are made into a 'GraphNode' class object with some added utility functions added to allow generic message passing between parent/child/any nodes.
There are additional properties to indicate whether to delay (or render on frame), repeat or recurse, and do automatic forward or backprop based on the tree hierarchy.

Each node comes with an 'operator' main function to handle input and output with arbitrary conditions. 

Tagged nodes are indexed as callable entry points to the tree.
Node operations return results via a promise as well as propagating up or down-treee (or to other trees) based on available default object settings. 
All else will be built into the custom main 'operator()' functions you add yourself.

The 'operator()' function in each node is a program for that node that passes an input, the node, and the origin node if it's passing the input. 
It can and should return results which can be used for propagation to other nodes automatically or for returning results from a chain of operations 
starting with the called node. This is like a 'main()' program in a file where the node is the script's scope with local properties

Tagged node operation results can also be subscribed to with via an internal state manager from anywhere in your program so you don't need to add more lines to operators to output to certain places.

### Contributors

Joshua Brewster --  AGPLv3.0
