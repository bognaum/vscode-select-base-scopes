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
} from "./syntax-framework/describeAPI";

const 
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
		nToken("\n")['*'].merged(), 
		token("\n")
	),
	commentBlock = seq(
		token("/*"),
		nToken("*/")['*'].merged(),
		token("*/")
	),
	comment = domain("comment", alt(commentLine, commentBlock)),
	mainScopeSubjects = alt(
		string,
		comment,
	),
	main = alt(
		mainScopeSubjects,
		not(mainScopeSubjects)
	)['*'].as("default"),
	glob = global()(
		mainScopeSubjects,
		not(mainScopeSubjects)['+'].as("simple")
	);

export default glob;

console.log("Syntax analyzer compiled.");

console.log("1", stringTag.applyToText("${el.scrollHeight}")?.namedOnly);
console.log("1.1", stringTag.applyToText("${}")?.namedOnly);
console.log("1.2", alt(mainScopeSubjects, token(1)).applyToText("el.scrollHeight")?.namedOnly);
console.log("2", string.applyToText("'${el.scrollHeight}'")?.namedOnly);