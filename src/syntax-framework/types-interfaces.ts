import AreaNode from "./AreaNode";

export {
	IAreaNode,
	ParseContext,
	Quantity,
	Analyzer,
};

interface IAreaNode {
	__: string;
	name?: string;
	fullText: () => string;
	at: [number, number];
	ch?: AreaNode[];
}

interface ParseContext {
	readonly text: () => string;
	i: number;
}

type Quantity = "?"|"+"|"*"|"+/"|"*/";

// type Analyzer = (pc: ParseContext) => IAreaNode|null;

interface Analyzer {
	(pc: ParseContext): AreaNode|null;
	q: (x: Quantity) => Analyzer;
	named: (x: string) => Analyzer;
	merged: (x?: string) => Analyzer;
	applyTo: (text: string) => AreaNode|null;
	"?": Analyzer;
	"+": Analyzer;
	"*": Analyzer;
}
