import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
	ref,
	global,
} from "../syntax-framework/describeAPI";
const startDT = Date.now();

const 
	re = token(/\/(\\\/|[^\/\n])+\/[migy]{0,4}/y).as("regexp"),
	slashed = seq(token("\\"), token(1)),
	stringTag = domain("string.tag", seq(
		token("${"),
		alt(
			ref(() => mainScopeSubjects),
			nToken("}"),
		)['*'].as("string.tag.content"),
		token("}"),
	)),
	string = domain("string", alt(
		seq(
			token("'"),
			alt(slashed, nToken("'"))['*'].as("string.content"),
			token("'"),
		).as("string.quoted"),
		seq(
			token('"'),
			alt(slashed, nToken('"'))['*'].as("string.content"),
			token('"'),
		).as("string.quoted"),
		seq(
			token('`'),
			alt(stringTag, slashed, nToken('`'))['*'].as("string.content"),
			token('`'),
		).as("string.quoted")
	)),
	commentLine = seq(
		token("//"), 
		nToken("\n", "\r\n")['*'].merged("comment.content"), 
		token("\r")['*'], 
		token("\n")
	),
	commentBlock = seq(
		token("/*"),
		nToken("*/")['*'].merged("comment.content"),
		token("*/")
	),
	comment = domain("comment", alt(commentLine, commentBlock)),
	parenRound = seq(
		token("("),
		alt(
			ref(() => mainScopeSubjects),
			nToken(")"),
		)['*'].as("paren.content"),
		token(")"),
	),
	parenCurly = seq(
		token("{"),
		alt(
			ref(() => mainScopeSubjects),
			nToken("}"),
		)['*'].as("paren.content"),
		token("}"),
	),
	parenSquare = seq(
		token("["),
		alt(
			ref(() => mainScopeSubjects),
			nToken("]"),
		)['*'].as("paren.content"),
		token("]"),
	),
	paren = alt(parenRound, parenCurly, parenSquare).as("paren"), 
	mainScopeSubjects = alt(
		comment,
		string,
		re,
		paren,
	),
	main = alt(
		mainScopeSubjects,
		not(mainScopeSubjects)
	)['*'].as("default"),
	glob = global()(
		mainScopeSubjects,
		not(mainScopeSubjects)['+'].as("simple")
	);

const endDT = Date.now(), performT = (endDT - startDT);
console.log(`'syntax-js' perform time: ${performT} ms`);

// export default glob.log("js glob");
export default glob;
