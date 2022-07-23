import AreaNode from "./AreaNode";

export {
	IAreaNode,
	ParseContext,
	Quantity,
	RawAnalyzer,
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


interface RawAnalyzer {
	(pc: ParseContext): AreaNode|null;
}

interface Analyzer extends RawAnalyzer {
	q: (x: Quantity) => Analyzer;
	named: (x: string) => Analyzer;
	merged: (x?: string) => Analyzer;
	applyToText: (text: string) => AreaNode|null;
	"?": Analyzer;
	"+": Analyzer;
	"*": Analyzer;
}
