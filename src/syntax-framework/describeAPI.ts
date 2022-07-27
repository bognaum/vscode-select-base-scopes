import {
	iAreaNode,
	iParseContext,
	Quantity,
	iRawAnalyzer,
	iAnalyzer,
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
	noOne,
	merge,
	ref,
	bof,
	eof,
	global,
	log,
};

function makeAnalyzer(rAn: iRawAnalyzer): iAnalyzer {
	Object.defineProperties(rAn, {
		"?": {get: function() {return q("?", this)}},
		"+": {get: function() {return q("+", this)}},
		"*": {get: function() {return q("*", this)}},
		q: {
			value: function (quantity: Quantity): iAnalyzer {
				return q(quantity, this);
			}
		},
		as: {
			value: function (name: string): iAnalyzer {
				return domain(name, this);
			}
		},
		merged: {
			value: function (name: string =""): iAnalyzer {
				return merge(this, name);
			}
		},
		applyToText: {
			value: function (text: string, i=0): AreaNode|null {
				const startDT = Date.now();
				const pc: iParseContext = {
					text: () => text,
					i
				};
				const res = this(pc);

				const endDT = Date.now(), performT = (endDT - startDT);
				console.log(`'applyToText()' perform time: ${performT}mSec`);
				return res;
			}
		},
		log: {
			value: function (name=''): iAnalyzer {
				return log(this, name);
			}
		},
	});
	return rAn as iAnalyzer;
}

function token (...patterns: (string|RegExp|number)[]): iAnalyzer 
{
	const checkers: ((pc: iParseContext) => AreaNode|null)[] = [];
	
	for (const [k, pattern] of patterns.entries()) {
		if (typeof pattern === "number") {
			if (0 < pattern) {
				const len = pattern;
				checkers[k] = (pc: iParseContext) => {
					return new AreaNode(
						{
							__: `token(${patterns.map(v => "'"+v.toString()+"'").join(", ")}); ='${pattern}'`,
							fullText: pc.text,
							at: [pc.i, pc.i += len], 
							ch: []
						}
					);
				};
			} else {
				console.error(`(!)`, `Pattern must be more that 0. The pattern is ${pattern}`);
				throw new Error("Pattern must be more that 0.");
			}
		} else if (typeof pattern === "string") {
			const len = pattern.length;
			if (len) {
				checkers[k] = (pc: iParseContext) => {
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
			} else {
				console.error(`(!)`, `The string pattern of a token must have the a non-zero length.`);
				throw new Error("The string pattern of a token must have the a non-zero length.");
			}
		} else if (pattern instanceof RegExp) {
			if (!pattern.sticky) {
				console.error(`(!)`, `The regexp of token '${pattern.toString()}' must have the 'y' flag.`);
				throw new Error("The regexp of token '${pattern.toString()}' must have the 'y' flag.");
			}
			if (pattern.global) {
				console.error(`(!)`, `The regexp of token cannot have the 'g' flag.`);
				throw new Error("The regexp of token cannot have the 'g' flag.");
			}
			checkers[k] = (pc: iParseContext) => {
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
			checkers[k] = (pc: iParseContext) => null;
		}
	}
	return makeAnalyzer(
		function _token_(pc: iParseContext): AreaNode|null {
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

function merge(an: iAnalyzer, name: string =""): iAnalyzer  {
	return makeAnalyzer(
		function _merge_(pc: iParseContext): AreaNode|null {
			const 
				i0 = pc.i,
				res = an(pc);
			if (res) {
				return new AreaNode(
					{
						__: `merge (${name? "'"+name+"'" : ""})`,
						...(name ? {name} : {}),
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

function nToken (...patterns: (string|RegExp)[]): iAnalyzer 
{
	const an: iAnalyzer = token(...patterns);
	return makeAnalyzer(
		function _nToken_(pc: iParseContext): AreaNode|null {
			const 
				xpc = {...pc},
				res = an(xpc);
			if (res) {
				return null;
			} else {
				return new AreaNode(
					{
						__: `nToken(${patterns.map(v => "'"+v.toString()+"'").join(", ")})`,
						fullText: pc.text,
						at: [pc.i, pc.i += 1], 
						ch: [],
					}
				);
			}
		}
	);
}

function domain (name: string, x: iAnalyzer): iAnalyzer
{
	return makeAnalyzer(
		function _domain_(pc: iParseContext): AreaNode|null 
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

function seq (...args: iAnalyzer[]): iAnalyzer  {
	return makeAnalyzer(
		function _seq_(pc: iParseContext): AreaNode|null {
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
function alt (...args: iAnalyzer[]): iAnalyzer  {
	return makeAnalyzer(
		function _alt_(pc: iParseContext): AreaNode|null {
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
function q (q: Quantity, x: iAnalyzer, y: iAnalyzer|null =null): iAnalyzer {
	if (q === "?" ) {
		return makeAnalyzer(
			function _zeroOrOne_(pc: iParseContext): AreaNode {
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
			function _oneOrMany_(pc: iParseContext): AreaNode|null {
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
			function _zeroOrMany_(pc: iParseContext): AreaNode|null {
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
				function _oneOrManySeparate_(pc: iParseContext): AreaNode|null {
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
			throw new Error(`Invalid argument 3 to q`);
			// return makeAnalyzer((pc: iParseContext) => null);
		}
	} else if (q === "*/") {
		if (y) {
			return makeAnalyzer(
				function _zeroOrManySeparate_(pc: iParseContext): AreaNode|null {
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
			throw new Error(`Invalid argument 3 to q`);
			// return makeAnalyzer((pc: iParseContext) => null);
		}
	} else {
		console.error(`(!)`, `Invalid arguments to q`, q, x, y);
		throw new Error(`Invalid arguments to q`);
		// return makeAnalyzer((pc: iParseContext) => null);
	}

	function _many(an: iAnalyzer, pc: iParseContext)
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

	function _manySep(an1: iAnalyzer, pc: iParseContext, an2: iAnalyzer)
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
	function _len(node: iAreaNode): number {
		const len = node.at[1] - node.at[0];
		return len;
	}
}
function not(x: iAnalyzer): iAnalyzer {
	return makeAnalyzer(
		function _not_(pc: iParseContext): AreaNode|null {
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
function noOne(...args: iAnalyzer[]): iAnalyzer {
	return makeAnalyzer(
		function _noOne_(pc: iParseContext): AreaNode|null {
			const xpc = {...pc};
			for (const [k, an]of args.entries()) {
				if (an(xpc)) {
					return null;
				} else {}
			}
			pc.i++;
			return new AreaNode(
				{
					__: `noOne(${args.length})`,
					fullText: pc.text,
					at: [pc.i - 1, pc.i],
					ch: [],
				},
			);
		}
	);
}
function ref(f: () => iAnalyzer): iAnalyzer {
	return makeAnalyzer(
		function _ref_(pc: iParseContext): AreaNode|null {
			return f()(pc);
		}
	);
}
function bof(): iAnalyzer {
	return makeAnalyzer (
		function _bof_(pc: iParseContext): AreaNode|null {
			if (pc.i === 0) {
				return new AreaNode({
					__: "bof()",
					fullText: pc.text,
					at: [0, 0],
					ch: [],
				});
			} else {
				return null;
			}
		}
	);
}
function eof():iAnalyzer {
	return makeAnalyzer(
		function _eof_(pc: iParseContext): AreaNode|null {
			if (pc.text().length <= pc.i) {
				return new AreaNode({
					__: "eof()",
					fullText: pc.text,
					at: [pc.i, pc.i],
					ch: [],
				});
			} else {
				return null;
			}
		}
	);
}

function log(an: iAnalyzer, name='', range: [number, number] =[0,0]): iAnalyzer {
	return makeAnalyzer(
		function _log_(pc: iParseContext) {
			range[1] |= pc.text().length;
			if (range[0] <= pc.i && pc.i <= range[1]) {
				const
					t0 = Date.now(),
					i0 = pc.i, 
					[l0, c0] = _getPointLCFr1(pc.text(), pc.i);
				console.log("(..", an.name.padEnd(15), name.padEnd(15), `${i0}[${l0}:${c0}]`);
				const res = an(pc);
				const 
					t1 = Date.now(),
					dT = t1 - t0,
					i1 = pc.i,
					[l1, c1] = _getPointLCFr1(pc.text(), pc.i);
				console.log("..)", an.name.padEnd(15), name.padEnd(15), 
					`${i0}[${l0}:${c0}] - ${i1}[${l1}:${c1}]; ${dT}ms`);
				console.log("==>", res);
				return res;
			} else {
				return an(pc);
			}
			
		}
	);
	function _getPointLCFr1 (text: String, offset: number): [number, number] {
		const
			lines = text.slice(0, offset).split("\n"),
			lastLine = lines[lines.length - 1];
		return [lines.length, lastLine.length + 1];
	}
}

function global(globName="", defName="_unrecognized_") {
	return function (...variants: iAnalyzer[]): iAnalyzer {
		return q('*', 
			alt(
				domain(globName, q('+', alt(    ...variants ))),
				domain(defName , q('+', not(alt(...variants))))
			)
		);
	};
}
