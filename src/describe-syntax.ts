import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
	global,
} from "./syntax-framework/describeAPI";

const 
	slashed = seq(token("\\"), token(1)),
	string = domain("string", alt(
		seq(
			token("'"),
			alt(nToken("'")['*'].merged(), slashed)['*'].named("string.content"),
			token("'"),
		).named("string.quoted"),
		seq(
			token('"'),
			alt(nToken('"')['*'].merged(), slashed)['*'].named("string.content"),
			token('"'),
		).named("string.quoted"),
		seq(
			token('`'),
			alt(nToken('`'), slashed)['*'].merged(),
			token('`'),
		)
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
	subjects = alt(
		string,
		comment,
	),
	main = alt(
		subjects,
		not(subjects)
	)['*'].named("default"),
	glob = global()(
		subjects,
		not(subjects)['*'].named("simple")
	);

export default glob;

console.log("Syntax analyzer compiled.");
