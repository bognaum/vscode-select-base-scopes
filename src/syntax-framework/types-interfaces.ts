export {
	AreaNode,
	Node,
	ParseContext,
	Quantity,
	Analyzer,
};

interface AreaNode {
	__: string;
	name?: string;
	at: [number, number];
	ch?: AreaNode[];
	// text?: string;
}

interface ParseContext {
	readonly text: string;
	i: number;
}

type Quantity = "?"|"+"|"*"|"+/"|"*/";

// type Analyzer = (pc: ParseContext) => AreaNode|null;

interface Analyzer {
	(pc: ParseContext): Node|null;
	q: (x: Quantity) => Analyzer;
	named: (x: string) => Analyzer;
	merged: (x?: string) => Analyzer;
}

class Node {
	readonly __: string;
	readonly name?: string;
	readonly at: [number, number];
	readonly length: number;
	readonly ch?: AreaNode[];
	readonly #pc: ParseContext;
	constructor (pc: ParseContext, t: AreaNode) {
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
	get globalText (): string {return this.#pc.text;}
	get localText  (): string {return this.#pc.text.slice(...this.at);}
	get atLC       (): [[number, number], [number, number]] {
		return [this.getPointLC(this.at[0]), this.getPointLC(this.at[1])];
	}
	getPointLC (offset: number): [number, number] {
		const
			lines = this.#pc.text.slice(0, offset).split("\n"),
			lastLine = lines[lines.length - 1];
		return [lines.length, lastLine.length + 1];
	}
}