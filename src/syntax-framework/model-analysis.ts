import {
	AreaNode,
	ParseContext,
	Quantity,
	Analyzer,
} from "./types-interfaces";

export {
	getNodeStack,
	getDomainNodeStack,
	last,
	// getModelOfNamedOnly,
};

function getNodeStack(model: AreaNode, posA: number, posB=posA): AreaNode[] {
	const stack: AreaNode[] = [];
	recurs(model);
	return stack;
	function recurs(node: AreaNode) {
		const [start, end] = node.at;
		if (
			start <= posA && posA < end && 
			start <= posB && posB < end
		) {
			stack.push(node);
			if (node.ch?.length) {
				for (const ch of node.ch) {
					const [start, end] = node.at;
					if (
						start <= posA && posA < end && 
						start <= posB && posB < end
					) {
						recurs(ch);
						break;
					}
				}
			} 
		}
	}
}

function getDomainNodeStack(model: AreaNode, posA: number, posB=posA): AreaNode[] {
	const stack: AreaNode[] = [];
	recurs(model);
	return stack;
	function recurs(node: AreaNode) {
		const [start, end] = node.at;
		if (
			start <= posA && posA < end && 
			start <= posB && posB < end
		) {
			if (node.name) {
				stack.push(node);
			}
			if (node.ch?.length) {
				for (const ch of node.ch) {
					const [start, end] = node.at;
					if (
						start <= posA && posA < end && 
						start <= posB && posB < end
					) {
						recurs(ch);
						break;
					}
				}
			} 
		}
	}
}

/* function getModelOfNamedOnly(model: AreaNode): AreaNode {
	const 
		stack: AreaNode[] = [],
		newModel: AreaNode = {...model, ...{ch: []}};
	stack.push(newModel);
	recurs(model);
	return newModel;
	function recurs(node: AreaNode) {
		if (node.ch?.length) {
			for (const ch of node.ch) {
				if (ch.name) {
					const 
						newNode: AreaNode = {...ch, ...{ch: []}},
						actual: AreaNode  = last(stack);
					actual.ch ||= [];
					actual.ch.push(newNode);

					stack.push(newNode);
					recurs(ch);
					stack.pop;
				} else {
					recurs(ch);
				}
			}
		}
	}
} */

function last(arr: any[], i=0): any {
	return arr[arr.length - 1 - i];
}