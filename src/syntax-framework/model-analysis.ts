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
};

function getNodeStack(model: AreaNode, posA: number, posB=posA): AreaNode[] {
	const stack: AreaNode[] = [];
	recurs(model);
	return stack;
	function recurs(node: AreaNode) {
		const [start, end] = node.at;
		if (
			start < posA && posA < end && 
			start < posB && posB < end
		) {
			stack.push(node);
			if (node.ch?.length) {
				for (const ch of node.ch) {
					const [start, end] = node.at;
					if (
						start < posA && posA < end && 
						start < posB && posB < end
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
			start < posA && posA < end && 
			start < posB && posB < end
		) {
			if (node.name) {
				stack.push(node);
			}
			if (node.ch?.length) {
				for (const ch of node.ch) {
					const [start, end] = node.at;
					if (
						start < posA && posA < end && 
						start < posB && posB < end
					) {
						recurs(ch);
						break;
					}
				}
			} 
		}
	}
}

function last(arr: [], i=0): any {
	return arr[arr.length - 1 - i];
}