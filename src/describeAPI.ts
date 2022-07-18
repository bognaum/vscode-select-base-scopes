import {
	AreaNode,
	ParseContext,
	Quantity,
	Analyzer,
} from "./base";

export {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
};

function token (pattern: string|RegExp): Analyzer 
{
	if (typeof pattern === "string") {
		const len = pattern.length;
		return function _token_(pc: ParseContext): AreaNode|null 
		{
			if (pc.text.startsWith(pattern, pc.i)) {
				return {
					at: [pc.i, pc.i += len], 
					ch: []
				};
			} else {
				return null;
			}
		};
	} else if (pattern instanceof RegExp) {
		return function _token_(pc: ParseContext): AreaNode|null 
		{
			pattern.lastIndex = pc.i;
			const m = pc.text.match(pattern);
			if (m) {
				return {
					at: [pc.i, pc.i = pattern.lastIndex], 
					ch: []
				};
			} else {
				return null;
			}
		};
	} else {
		return (pc: ParseContext) => null;
	}
	
}

function nToken (pattern: string|RegExp): Analyzer 
{
	if (typeof pattern === "string") {
		return function _token_(pc: ParseContext): AreaNode|null 
		{
			if (pc.text.startsWith(pattern, pc.i)) {
				return null;
			} else {
				return {
					at: [pc.i, pc.i += 1], 
					ch: []
				};
			}
		};
	} else if (pattern instanceof RegExp) {
		return function _token_(pc: ParseContext): AreaNode|null 
		{
			pattern.lastIndex = pc.i;
			const m = pc.text.match(pattern);
			if (m) {
				return null;
			} else {
				return {
					at: [pc.i, pc.i += 1], 
					ch: []
				};
			}
		};
	} else {
		console.error(`(!)`, `error`);
		return function internalError(pc: ParseContext): AreaNode|null {return null;};
	}
	
}

function domain (name: string, x: Analyzer)
: (a: ParseContext) => AreaNode|null
{
	return function _domain_(pc: ParseContext): AreaNode|null 
	{
		const node = x(pc);
		if (node) {
			return {
				name,
				at: [...node.at],
				ch: [node],
			};
		} else {
			return null;
		}
	};
}

function seq (...args: Analyzer[]): Analyzer  {
	return function (pc: ParseContext): AreaNode|null {
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
			return {
				at: [i0, xpc.i],
				ch: results,
			};
		} else {
			return null;
		}
	};
}
function alt (...args: Analyzer[]): Analyzer  {
	return function (pc: ParseContext): AreaNode|null {
		for (const analyzer of args) {
			const 
				xpc = {...pc},
				i0 = pc.i,
				res = analyzer(xpc);
			if (res) {
				pc.i = xpc.i;
				return {
					at: [...res.at],
					ch: [res],
				};
			} else {}
		}
		return null;
	};
}
function q (q: Quantity, x: Analyzer, y: Analyzer|null =null): Analyzer {
	if (q === "?" ) {
		return function _zero_or_one_(pc: ParseContext): AreaNode {
			const res = x(pc);
			if (res) {
				return {at: [...res.at], ch: [res],};
			} else {
				return {at: [pc.i, pc.i], ch: [],};
			}
		};
	} else if (q === "+" ) {
		return function _one_or_many_(pc: ParseContext): AreaNode|null {
			const [results, at] = many(x, pc);
			if (results.length) {
				return {at, ch: results};
			} else {
				return null;
			}
		};
	} else if (q === "*" ) {
		return function _zero_or_many_(pc: ParseContext): AreaNode|null {
			const [results, at] = many(x, pc);
			return {at, ch: results};
		};
	} else if (q === "+/") {
		if (y) {
			return function _one_or_many_separate_(pc: ParseContext): AreaNode|null {
				const [results, at] = manySep(x, pc, y);
				if (results.length) {
					return {at, ch: results};
				} else {
					return null;
				}
			};
		} else {
			console.error(`(!)`, `Invalid argument 3 to q`, q, x, y);
			return function internalError(pc: ParseContext): AreaNode|null {return null;};
		}
	} else if (q === "*/") {
		if (y) {
			return function _zero_or_many_separate_(pc: ParseContext): AreaNode|null {
				const [results, at] = manySep(x, pc, y);
				return {at, ch: results};
			};
		} else {
			console.error(`(!)`, `Invalid argument 3 to q`, q, x, y);
			return function internalError(pc: ParseContext): AreaNode|null {return null;};
		}
	} else {
		console.error(`(!)`, `Invalid arguments to q`, q, x, y);
		return function internalError(pc: ParseContext): AreaNode|null {return null;};
	}

	function many(an: Analyzer, pc: ParseContext)
	: [AreaNode[], [number, number]] 
	{
		const 
			results: AreaNode[] = [],
			i0 = pc.i;
		let res: AreaNode|null;
		while (res = an(pc)) {
			results.push(res);
		}
		return [results, [i0, pc.i]];
	}

	function manySep(an1: Analyzer, pc: ParseContext, an2: Analyzer)
	: [AreaNode[], [number, number]] 
	{
		const 
			results: AreaNode[] = [],
			xpc = {...pc},
			i0 = pc.i;
		let res = an1(pc);
		if (res) {
			results.push(res);
			let res2: AreaNode|null;
			while ((res2 = an2(xpc)) && (res = an1(xpc))) {
				results.push(res2);
				results.push(res);
			}
		} else {}
		return [results, [i0, xpc.i]];
	}
}