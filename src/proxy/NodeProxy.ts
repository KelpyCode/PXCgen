import { nodesMap } from '../factory/NodeFactory'
import { Node } from '../types/Project'

const INPUT_VAR_INDEX = 1

export interface INodeProxy {
  proxy: boolean;
  id: number;
  node: Node;
  setInputValue: (inputIndex: number, value: any) => void;
  setFromNode: (inputIndex: number, from?: number) => void;
  setName: (name: string) => void;
  getDependencyNodes: () => INodeProxy[];
  getAllDependencyNodes: () => INodeProxy[];
  move: (x: number, y: number) => void
}

export function NodeProxy(node: Node | number): INodeProxy {
    if (typeof node === 'number') {
        node = nodesMap.get(node) as Node
        if(node === undefined) {
            throw new Error(`Node ${node} not found`)
        }
    }
    const $node = node as Node


    function setInputValue(inputIndex: number, value: any) {
        $node.inputs[inputIndex]['raw value'][0][INPUT_VAR_INDEX] = value
    }

    function setFromNode(inputIndex: number, from?: number) {
        $node.inputs[inputIndex]['from node'] = from ?? -1
        $node.inputs[inputIndex]['from index'] = (from ?? -1) >= 0 ? 0 : -1
        console.log(inputIndex)

        if(from ?? -1 >= 0) {
            const fromProxy = NodeProxy(from ?? -1)
            fromProxy.move(-200, inputIndex * 75)
        }
        // if ((from ?? -1) >= 0) {
        //     const dep = NodeProxy(from ?? -1)
        //     console.log('dep', dep.getDependencyNodes())
        //     dep.getDependencyNodes().forEach(x => {
        //         console.log('dependency', x)
        //         x.move(-100, inputIndex * 100)
        //     })
        // }
    }

    function setName(name: string) {
        $node.name = name
    }

    function move(x: number, y: number) {
        $node.x += x
        $node.y += y
    }

    function getDependencyNodes(): INodeProxy[] {
        return $node.inputs
            .filter(x => x['from node'] >= 0)
            .map(x => NodeProxy(x['from node']))
    }

    function getAllDependencyNodes(): INodeProxy[] {
        const nodes: INodeProxy[] = []

        getDependencyNodes().forEach(x => {
            nodes.push(x)
            nodes.push(...x.getAllDependencyNodes())
        })

        return nodes
    }

    const proxy = {
        id: $node.id,
        node,
        setInputValue,
        setFromNode,
        setName,
        getDependencyNodes,
        getAllDependencyNodes,
        move,
        proxy: true
    }

    return proxy
}