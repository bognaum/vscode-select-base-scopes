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
			alt(nToken("'")['*'].merged(), slashed)['*'].as("string.content"),
			token("'"),
		).as("string.quoted"),
		seq(
			token('"'),
			alt(nToken('"')['*'].merged(), slashed)['*'].as("string.content"),
			token('"'),
		).as("string.quoted"),
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
	)['*'].as("default"),
	glob = global()(
		subjects,
		not(subjects)['*'].as("simple")
	);

export default glob;

console.log("Syntax analyzer compiled.");
