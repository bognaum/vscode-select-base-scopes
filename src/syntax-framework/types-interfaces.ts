import AreaNode from "./AreaNode";

export {
	Quantity,
	iAreaNode,
	iParseContext,
	iRawAnalyzer,
	iAnalyzer,
};

interface iAreaNode {
	__: string;
	name?: string;
	fullText: () => string;
	at: [number, number];
	ch?: AreaNode[];
}

interface iParseContext {
	readonly text: () => string;
	i: number;
}

type Quantity = "?"|"+"|"*"|"+/"|"*/";

interface iRawAnalyzer {
	(pc: iParseContext): AreaNode|null;
}

// type iAnalyzer = (pc: ParseContext) => IAreaNode|null;

interface iAnalyzer extends iRawAnalyzer {
	q:           (x: Quantity)              => iAnalyzer;
	as:          (x: string)                => iAnalyzer;
	merged:      (x?: string)               => iAnalyzer;
	applyToText: (text: string, i?: number) => AreaNode|null;
	"?": iAnalyzer;
	"+": iAnalyzer;
	"*": iAnalyzer;
}
