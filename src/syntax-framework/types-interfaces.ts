import AreaNode from "./AreaNode";
import Node from "./AreaNode";

export {
	IAreaNode,
	ParseContext,
	Quantity,
	Analyzer,
};

interface IAreaNode {
	__: string;
	name?: string;
	at: [number, number];
	ch?: Node[];
}

interface ParseContext {
	readonly text: () => string;
	i: number;
}

type Quantity = "?"|"+"|"*"|"+/"|"*/";

// type Analyzer = (pc: ParseContext) => IAreaNode|null;

interface Analyzer {
	(pc: ParseContext): Node|null;
	q: (x: Quantity) => Analyzer;
	named: (x: string) => Analyzer;
	merged: (x?: string) => Analyzer;
	applyTo: (text: string) => AreaNode|null;
}
