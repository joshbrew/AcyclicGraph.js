import { AcyclicGraph, GraphNode } from "./acyclicgraph";

//properties input on GraphNode or addNode, or for children
export type GraphNodeProperties = {
    operator:(
        input:any, //input, e.g. output from another node
        node:GraphNodeProperties,  //'this' node
        origin?:GraphNodeProperties, //origin node
        cmd?:string    //e.g. 'loop' or 'animate' will be defined if the operator is running on the loop or animate routines, needed something. Can define more commands but you might as well use an object in input for that. 
    )=>any|AsyncGeneratorFunction, //Operator to handle I/O on this node. Returned inputs can propagate according to below settings
    forward:boolean, //pass output to child nodes
    backward:boolean, //pass output to parent node
    children?:string|GraphNodeProperties|GraphNode|(GraphNodeProperties|GraphNode|string)[], //child node(s), can be tags of other nodes, properties objects like this, or graphnodes, or null
    parent?:GraphNode|undefined, //parent graph node
    delay?:false|number, //ms delay to fire the node
    repeat?:false|number, // set repeat as an integer to repeat the input n times
    recursive?:false|number, //or set recursive with an integer to pass the output back in as the next input n times
    animate?:boolean, //true or false
    loop?:false|number, //milliseconds or false
    tag?:string, //generated if not specified, or use to get another node by tag instead of generating a new one
    input?:any,// can set on the attribute etc
    graph?:AcyclicGraph, //parent AcyclicGraph instance, can set manually or via enclosing acyclic-graph div
    [key:string]:any //add whatever variables and utilities
}; //can specify properties of the element which can be subscribed to for changes.

export interface GraphNodeConstructor {
    properties:GraphNodeProperties,
    parentNode?:GraphNode|string,
    graph?:AcyclicGraph
}
