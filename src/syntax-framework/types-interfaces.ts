import Node from "./Node";

export {
	AreaNode,
	ParseContext,
	Quantity,
	Analyzer,
};

interface AreaNode {
	__: string;
	name?: string;
	at: [number, number];
	ch?: AreaNode[];
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
