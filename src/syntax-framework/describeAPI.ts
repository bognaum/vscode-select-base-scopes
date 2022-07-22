import {
	IAreaNode,
	ParseContext,
	Quantity,
	RawAnalyzer,
	Analyzer,
} from "./types-interfaces";

import AreaNode from "./AreaNode";

export {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
	merge,
};

function makeAnalyzer(rAn: RawAnalyzer): Analyzer {
	Object.defineProperties(rAn, {
		"?": {get: function() {return q("?", this)}},
		"+": {get: function() {return q("+", this)}},
		"*": {get: function() {return q("*", this)}},
		q: {
			value: function (quantity: Quantity): Analyzer {
				return q(quantity, this);
			}
		},
		named: {
			value: function (name: string): Analyzer {
				return domain(name, this);
			}
		},
		merged: {
			value: function (name: string =""): Analyzer {
				return merge(this, name);
			}
		},
		applyTo: {
			value: function (text: string): AreaNode|null {
				const pc: ParseContext = {
					text: () => text,
					i: 0
				};
				return this(pc);
			}
		},
	});
	return rAn as Analyzer;
}

function token (...patterns: (string|RegExp)[]): Analyzer 
{
	const checkers: ((pc: ParseContext) => AreaNode|null)[] = [];
	
	for (const [k, pattern] of patterns.entries()) {
		if (typeof pattern === "string") {
			const len = pattern.length;
			checkers[k] = (pc: ParseContext) => {
				if (pc.text().startsWith(pattern, pc.i)) {
					return new AreaNode(
						{
							__: `token(${patterns.map(v => "'"+v.toString()+"'").join(", ")}); ='${pattern}'`,
							fullText: pc.text,
							at: [pc.i, pc.i += len], 
							ch: []
						}
					);
				} else {
					return null;
				}
			};
		} else if (pattern instanceof RegExp) {
			checkers[k] = (pc: ParseContext) => {
				pattern.lastIndex = pc.i;
				const m = pc.text().match(pattern);
				if (m) {
					return new AreaNode(
						{
							__: `token(${patterns.map(v => "'"+v.toString()+"'").join(", ")}); ='${pattern}'`,
							fullText: pc.text,
							at: [pc.i, pc.i = pattern.lastIndex], 
							ch: []
						}
					);
				} else {
					return null;
				}
			};
		} else {
			console.error(`(!)`, `Invalid argument ${k + 1} to 'nToken', pattern`);
			checkers[k] = (pc: ParseContext) => null;
		}
	}
	return makeAnalyzer(
		function _token_(pc: ParseContext): AreaNode|null {
			for (const checker of checkers) {
				const m = checker(pc);
				if (m) {
					return m;
				}
			}
			return null;
		}
	);
}

function merge(an: Analyzer, name: string =""): Analyzer  {
	return makeAnalyzer(
		function _merge_(pc: ParseContext): AreaNode|null {
			const 
				i0 = pc.i,
				res = an(pc);
			if (res) {
				return new AreaNode(
					{
						__: `merge (${name? "'"+name+"'" : ""})`,
						name,
						fullText: pc.text,
						at: [i0, pc.i],
						ch: []
					}
				);
			} else {
				return null;
			}
		}
	);
}

function nToken (...patterns: (string|RegExp)[]): Analyzer 
{
	const checkers: ((pc: ParseContext) => boolean)[] = [];

	for (const [k, pattern] of patterns.entries()) {
		if (typeof pattern === "string") {
			checkers[k] = (pc: ParseContext) => pc.text().startsWith(pattern, pc.i);
		// } else if (typeof pattern === "number") {
		} else if (pattern instanceof RegExp) {
			checkers[k] = (pc: ParseContext) => {
				pattern.lastIndex = pc.i;
				return !!pc.text().match(pattern);
			};
		} else {
			console.error(`(!)`, `Invalid argument ${k + 1} to 'nToken', pattern`);
			checkers[k] = (pc: ParseContext) => false;
		}
	}
	return makeAnalyzer(
		function _nToken_(pc: ParseContext): AreaNode|null {
			for (const checker of checkers) {
				if (checker(pc)) {
					return null;
				}
			}
			return new AreaNode(
				{
					__: `nToken(${patterns.map(v => "'"+v.toString()+"'").join(", ")})`,
					fullText: pc.text,
					at: [pc.i, pc.i += 1], 
					ch: [],
				}
			);
		}
	);
}

function domain (name: string, x: Analyzer): Analyzer
{
	return makeAnalyzer(
		function _domain_(pc: ParseContext): AreaNode|null 
		{
			const node = x(pc);
			if (node) {
				return new AreaNode(
					{
						__: `domain('${name}')`,
						name,
						fullText: pc.text,
						at: [...node.at],
						ch: [node],
					}
				);
			} else {
				return null;
			}
		}
	);
}

function seq (...args: Analyzer[]): Analyzer  {
	return makeAnalyzer(
		function _seq_(pc: ParseContext): AreaNode|null {
			const 
				xpc = {...pc},
				i0 = pc.i,
				results: AreaNode[] = [];
			let ok = true;
			for (const analyzer of args) {
				const res = analyzer(xpc);
				if (res) {
					results.push(res);
				} else {
					ok = false;
					break;
				}
			}
			if (ok) {
				pc.i = xpc.i;
				return new AreaNode(
					{
						__: `seq(${args.length})`,
						fullText: pc.text,
						at: [i0, xpc.i],
						ch: results,
					}
				);
			} else {
				return null;
			}
		}
	);
}
function alt (...args: Analyzer[]): Analyzer  {
	return makeAnalyzer(
		function _alt_(pc: ParseContext): AreaNode|null {
			for (const [k, analyzer] of args.entries()) {
				const 
					xpc = {...pc},
					i0 = pc.i,
					res = analyzer(xpc);
				if (res) {
					pc.i = xpc.i;
					return new AreaNode(
						{
							__: `alt(${args.length}) =${k + 1}`,
							fullText: pc.text,
							at: [...res.at],
							ch: [res],
						}
					);
				} else {}
			}
			return null;
		}
	);
}
function q (q: Quantity, x: Analyzer, y: Analyzer|null =null): Analyzer {
	if (q === "?" ) {
		return makeAnalyzer(
			function _zeroOrOne_(pc: ParseContext): AreaNode {
				const res = x(pc);
				if (res) {
					return new AreaNode(
						{
							__: `q('?') =1`,
							fullText: pc.text,
							at: [...res.at], 
							ch: [res],
						}
					);
				} else {
					return new AreaNode(
						{
							__: `q('?') =0`,
							fullText: pc.text,
							at: [pc.i, pc.i], 
							ch: [],
						}
					);
				}
			}
		);
	} else if (q === "+" ) {
		return makeAnalyzer(
			function _oneOrMany_(pc: ParseContext): AreaNode|null {
				const [results, at] = _many(x, pc);
				if (results.length) {
					return new AreaNode(
						{
							__: `q('+'); =${results.length}`,
							fullText: pc.text,
							at, 
							ch: results
						}
					);
				} else {
					return null;
				}
			}
		);
	} else if (q === "*" ) {
		return makeAnalyzer(
			function _zeroOrMany_(pc: ParseContext): AreaNode|null {
				const [results, at] = _many(x, pc);
				return new AreaNode(
					{
						__: `q('*'); =${results.length}`,
						fullText: pc.text,
						at, 
						ch: results
					}
				);
			}
		);
	} else if (q === "+/") {
		if (y) {
			return makeAnalyzer(
				function _oneOrManySeparate_(pc: ParseContext): AreaNode|null {
					const [results, at] = _manySep(x, pc, y);
					if (results.length) {
						return new AreaNode(
							{
								__: `q('+/'); =${results.length}`,
								fullText: pc.text,
								at, 
								ch: results
							}
						);
					} else {
						return null;
					}
				}
			);
		} else {
			console.error(`(!)`, `Invalid argument 3 to q`, q, x, y);
			return makeAnalyzer((pc: ParseContext) => null);
		}
	} else if (q === "*/") {
		if (y) {
			return makeAnalyzer(
				function _zeroOrManySeparate_(pc: ParseContext): AreaNode|null {
					const [results, at] = _manySep(x, pc, y);
					return new AreaNode(
						{
							__: `q('*/'); =${results.length}`,
							fullText: pc.text,
							at, 
							ch: results
						}
					);
				}
			);
		} else {
			console.error(`(!)`, `Invalid argument 3 to q`, q, x, y);
			return makeAnalyzer((pc: ParseContext) => null);
		}
	} else {
		console.error(`(!)`, `Invalid arguments to q`, q, x, y);
		return makeAnalyzer((pc: ParseContext) => null);
	}

	function _many(an: Analyzer, pc: ParseContext)
	: [AreaNode[], [number, number]] 
	{
		const 
			results: AreaNode[] = [],
			i0 = pc.i;
		let res: AreaNode|null;
		while ((pc.text()[pc.i]) && (res = an(pc))) {
			results.push(res);
			if (_len(res) <= 0) {
				break;
			}
		}
		return [results, [i0, pc.i]];
	}

	function _manySep(an1: Analyzer, pc: ParseContext, an2: Analyzer)
	: [AreaNode[], [number, number]] 
	{
		const 
			results: AreaNode[] = [],
			xpc = {...pc},
			i0 = pc.i;
		let res = an1(xpc);
		if (res) {
			results.push(res);
			let res2: AreaNode|null;
			while ((pc.text()[pc.i]) && (res2 = an2(xpc)) && (res = an1(xpc))) {
				results.push(res2);
				results.push(res);
				if (_len(res) <= 0 && _len(res2) <= 0) {
					break;
				}
			}
		} else {}
		pc.i = xpc.i;
		return [results, [i0, xpc.i]];
	}
	function _len(node: IAreaNode): number {
		const len = node.at[1] - node.at[0];
		return len;
	}
}
function not(x: Analyzer): Analyzer {
	return makeAnalyzer(
		function _not_(pc: ParseContext): AreaNode|null {
			const 
				xpc = {...pc},
				res = x(xpc);
			if (res) {
				return null;
			} else {
				pc.i++;
				return new AreaNode(
					{
						__: `not()`,
						fullText: pc.text,
						at: [pc.i - 1, pc.i],
						ch: [],
					},
				);
			}
		}
	);
}
