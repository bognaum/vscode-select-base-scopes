import { type } from "os";

export {
	AreaNode,
	ParseContext,
	Quantity,
	Analyzer,
};

interface AreaNode {
	name?: string;
	at: [number, number];
	ch?: AreaNode[];
	analyzerName?: string;
	analyzerOpt?: any;
	text?: string;
}

interface ParseContext {
	text: string;
	i: number;
}

type Quantity = "?"|"+"|"*"|"+/"|"*/";

// type Analyzer = (pc: ParseContext) => AreaNode|null;

interface Aaa {
	(pc: ParseContext): AreaNode|null;
	q: (pc: ParseContext) => AreaNode|null;
}

interface Analyzer {
	(pc: ParseContext): AreaNode|null;
	q: (x: Quantity) => Analyzer;
	named: (x: string) => Analyzer;
}

