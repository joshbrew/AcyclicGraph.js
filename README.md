## Acyclic Graphs

Easy node tree graph for creating [DAGs](https://en.wikipedia.org/wiki/Directed_acyclic_graph) i.e. any arbitrary node tree with forward and backpropagation, repeaters, etc. for chaining scripts and scopes e.g. [game systems](https://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/). 

This is built around the idea of having an operator i.e. a custom i/o handler at each scope. You can easily extend the graphnode class with primitives etc for different systems, just read the code. Otherwise it's a pure javascript implementation with no dependencies.

Running a node returns a promise that resolves after the tree is finished running, so you can chain complex functions that can mutate e.g. an object returned and passed along by the first operator or a property on a node. See below for a very simple example. 

This can get as complex as you want as each node is essentially just a different local scope and a main() function for each, with some easy piping based on writing a native object hierarchy with optional tagging for important nodes where results need to be subscribed to or chained to other complex nodes.

For a more basic function sequencer, see [Sequencer.js](https://github.com/brainsatplay/Sequencer.js)

### Basic usage
```js

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


```

### Design Philosophy

Acyclic graphs are trees of operations with arbitrary entry and exit points plus arbitrary propagation of results through the tree.
Each node is an object with a few required properties and functions and then anything else you want to add as variables, reference, utility functions etc. 

Nodes added to the graph tree are made into a 'graphnode' class object with some added utility functions added to allow generic message passing between parent/child/any nodes.
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
