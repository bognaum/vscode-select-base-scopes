import {
	IAreaNode,
	ParseContext,
	Quantity,
	Analyzer,
} from "./types-interfaces";

export default class AreaNode {
	readonly __: string;
	readonly name?: string;
	readonly at: [number, number];
	readonly length: number;
	readonly ch?: AreaNode[];
	readonly fullText: () => string;
	constructor (t: IAreaNode) {
		this.__           = t.__;
		this.at           = [...t.at];
		this.length       = t.at[1] - t.at[0];
		this.fullText   = t.fullText;
		if (t.ch) {
			this.ch = [...t.ch];
		}
		if (t.name) {
			this.name = t.name;
		}
	}
	get selfText   (): string {return this.fullText().slice(...this.at);}
	get atLC       (): [[number, number], [number, number]] {
		return [this.getPointLC(this.at[0]), this.getPointLC(this.at[1])];
	}
	getPointLC (offset: number): [number, number] {
		const
			lines = this.fullText().slice(0, offset).split("\n"),
			lastLine = lines[lines.length - 1];
		return [lines.length, lastLine.length + 1];
	}

	getNodeStack(posA: number, posB=posA): AreaNode[] {
		return getNodeStack(this, posA, posB);
	}
	getDomainNodeStack(posA: number, posB=posA): AreaNode[] {
		return getDomainNodeStack(this, posA, posB);
	}
	getModelOfNamedOnly(): AreaNode {
		return getModelOfNamedOnly(this);
	}
}

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

function getModelOfNamedOnly(model: IAreaNode): AreaNode {
	return recurs(model);

	function recurs(node: IAreaNode): AreaNode;
	function recurs(node: IAreaNode, dept: 0): AreaNode;
	function recurs(node: IAreaNode, dept: number): AreaNode|AreaNode[];

	function recurs(node: IAreaNode, dept=0): AreaNode|AreaNode[] {
		const children: AreaNode[] = [];
		if (node.ch?.length) {
			for (const ch of node.ch) {
				const res = recurs(ch, dept + 1);
				if (res instanceof Array) {
					children.push(...res);
				} else if (res instanceof AreaNode) {
					children.push(res);
				}
			}
		} else {}
		if (!dept || node.name) {
			const newNode: AreaNode = new AreaNode({...node, ch: children});
			return newNode;
		} else {
			return children;
		}
	}
}

function last(arr: any[], i=0): any {
	return arr[arr.length - 1 - i];
}