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
	readonly #pc: ParseContext;
	constructor (pc: ParseContext, t: IAreaNode) {
		this.__ = t.__;
		this.at = [...t.at];
		this.length = t.at[1] - t.at[0];
		this.#pc = pc;
		if (t.ch) {
			this.ch = [...t.ch];
		}
		if (t.name) {
			this.name = t.name;
		}
	}
	get globalText (): string {return this.#pc.text();}
	get localText  (): string {return this.#pc.text().slice(...this.at);}
	get atLC       (): [[number, number], [number, number]] {
		return [this.getPointLC(this.at[0]), this.getPointLC(this.at[1])];
	}
	getPointLC (offset: number): [number, number] {
		const
			lines = this.#pc.text().slice(0, offset).split("\n"),
			lastLine = lines[lines.length - 1];
		return [lines.length, lastLine.length + 1];
	}

	getNodeStack(posA: number, posB=posA): AreaNode[] {
		return getNodeStack(this, posA, posB);
	}
	getDomainNodeStack(posA: number, posB=posA): AreaNode[] {
		return getDomainNodeStack(this, posA, posB);
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