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
	not,
};

const analyzerMethods = {
	q: function (this: Analyzer, quantity: Quantity): Analyzer {
		return q(quantity, this);
	},
	named: function (this: Analyzer, name: string): Analyzer {
		return domain(name, this);
	},
};

function token (...patterns: (string|RegExp)[]): Analyzer 
{
	const checkers: ((pc: ParseContext) => AreaNode|null)[] = [];
	
	for (const [k, pattern] of patterns.entries()) {
		if (typeof pattern === "string") {
			const len = pattern.length;
			checkers[k] = (pc: ParseContext) => {
				if (pc.text.startsWith(pattern, pc.i)) {
					return {
						at: [pc.i, pc.i += len], 
						get text() {return pc.text.slice(...this.at);},
						ch: []
					};
				} else {
					return null;
				}
			};
		} else if (pattern instanceof RegExp) {
			checkers[k] = (pc: ParseContext) => {
				pattern.lastIndex = pc.i;
				const m = pc.text.match(pattern);
				if (m) {
					return {
						at: [pc.i, pc.i = pattern.lastIndex], 
						get text() {return pc.text.slice(...this.at);},
						ch: []
					};
				} else {
					return null;
				}
			};
		} else {
			console.error(`(!)`, `Invalid argument ${k + 1} to 'nToken', pattern`);
			checkers[k] = (pc: ParseContext) => null;
		}
	}
	return Object.assign(
		function _token_(pc: ParseContext): AreaNode|null {
			for (const checker of checkers) {
				const m = checker(pc)
				if (m) {
					return m;
				}
			}
			return null;
		},
		analyzerMethods
	);
}

function nToken (...patterns: (string|RegExp)[]): Analyzer 
{
	const checkers: ((pc: ParseContext) => boolean)[] = [];

	for (const [k, pattern] of patterns.entries()) {
		if (typeof pattern === "string") {
			checkers[k] = (pc: ParseContext) => pc.text.startsWith(pattern, pc.i);
		// } else if (typeof pattern === "number") {
		} else if (pattern instanceof RegExp) {
			checkers[k] = (pc: ParseContext) => {
				pattern.lastIndex = pc.i;
				return !!pc.text.match(pattern);
			};
		} else {
			console.error(`(!)`, `Invalid argument ${k + 1} to 'nToken', pattern`);
			checkers[k] = (pc: ParseContext) => false;
		}
	}
	return Object.assign(
		function _token_(pc: ParseContext): AreaNode|null {
			for (const checker of checkers) {
				if (checker(pc)) {
					return null;
				}
			}
			return {
				at: [pc.i, pc.i += 1], 
				get text() {return pc.text.slice(...this.at);},
				ch: [],
			};
		},
		analyzerMethods
	);
}

function domain (name: string, x: Analyzer): Analyzer
{
	return Object.assign(
		function _domain_(pc: ParseContext): AreaNode|null 
		{
			const node = x(pc);
			if (node) {
				return {
					name,
					at: [...node.at],
					get text() {return pc.text.slice(...this.at);},
					ch: [node],
				};
			} else {
				return null;
			}
		},
		analyzerMethods
	);
}

function seq (...args: Analyzer[]): Analyzer  {
	return Object.assign(
		function (pc: ParseContext): AreaNode|null {
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
					get text() {return pc.text.slice(...this.at);},
					ch: results,
				};
			} else {
				return null;
			}
		},
		analyzerMethods
	);
}
function alt (...args: Analyzer[]): Analyzer  {
	return Object.assign(
		function (pc: ParseContext): AreaNode|null {
			for (const analyzer of args) {
				const 
					xpc = {...pc},
					i0 = pc.i,
					res = analyzer(xpc);
				if (res) {
					pc.i = xpc.i;
					return {
						at: [...res.at],
						get text() {return pc.text.slice(...this.at);},
						ch: [res],
					};
				} else {}
			}
			return null;
		},
		analyzerMethods
	);
}
function q (q: Quantity, x: Analyzer, y: Analyzer|null =null): Analyzer {
	if (q === "?" ) {
		return Object.assign(
			function _zero_or_one_(pc: ParseContext): AreaNode {
				const res = x(pc);
				if (res) {
					return {
						at: [...res.at], 
						get text() {return pc.text.slice(...this.at);},
						ch: [res],
					};
				} else {
					return {
						at: [pc.i, pc.i], 
						get text() {return pc.text.slice(...this.at);},
						ch: [],
					};
				}
			},
			analyzerMethods
		);
	} else if (q === "+" ) {
		return Object.assign(
			function _one_or_many_(pc: ParseContext): AreaNode|null {
				const [results, at] = many(x, pc);
				if (results.length) {
					return {
						at, 
						get text() {return pc.text.slice(...this.at);},
						ch: results
					};
				} else {
					return null;
				}
			},
			analyzerMethods
		);
	} else if (q === "*" ) {
		return Object.assign(
			function _zero_or_many_(pc: ParseContext): AreaNode|null {
				const [results, at] = many(x, pc);
				return {
					at, 
					get text() {return pc.text.slice(...this.at);},
					ch: results
				};
			},
			analyzerMethods
		);
	} else if (q === "+/") {
		if (y) {
			return Object.assign(
				function _one_or_many_separate_(pc: ParseContext): AreaNode|null {
					const [results, at] = manySep(x, pc, y);
					if (results.length) {
						return {
							at, 
							get text() {return pc.text.slice(...this.at);},
							ch: results
						};
					} else {
						return null;
					}
				},
				analyzerMethods
			);
		} else {
			console.error(`(!)`, `Invalid argument 3 to q`, q, x, y);
			return Object.assign((pc: ParseContext) => null, analyzerMethods);
		}
	} else if (q === "*/") {
		if (y) {
			return Object.assign(
				function _zero_or_many_separate_(pc: ParseContext): AreaNode|null {
					const [results, at] = manySep(x, pc, y);
					return {
						at, 
						get text() {return pc.text.slice(...this.at);},
						ch: results
					};
				},
				analyzerMethods
			);
		} else {
			console.error(`(!)`, `Invalid argument 3 to q`, q, x, y);
			return Object.assign((pc: ParseContext) => null, analyzerMethods);
		}
	} else {
		console.error(`(!)`, `Invalid arguments to q`, q, x, y);
		return Object.assign((pc: ParseContext) => null, analyzerMethods);
	}

	function many(an: Analyzer, pc: ParseContext)
	: [AreaNode[], [number, number]] 
	{
		const 
			results: AreaNode[] = [],
			i0 = pc.i;
		let res: AreaNode|null;
		while ((pc.text[pc.i]) && (res = an(pc))) {
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
		let res = an1(xpc);
		if (res) {
			results.push(res);
			let res2: AreaNode|null;
			while ((pc.text[pc.i]) && (res2 = an2(xpc)) && (res = an1(xpc))) {
				results.push(res2);
				results.push(res);
			}
		} else {}
		pc.i = xpc.i;
		return [results, [i0, xpc.i]];
	}
}
function not(x: Analyzer): Analyzer {
	return Object.assign(
		function _offset_(pc: ParseContext): AreaNode|null {
			const 
				xpc = {...pc},
				res = x(xpc);
			if (res) {
				return null;
			} else {
				pc.i++;
				return {
					at: [pc.i - 1, pc.i],
					get text() {return pc.text.slice(...this.at);},
					ch: [],
				};
			}
		},
		analyzerMethods
	);
}
