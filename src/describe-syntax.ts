import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
} from "./syntax-framework/describeAPI";

const 
	slashed = seq(token("\\"), token(1)),
	string = domain("string", alt(
		seq(
			token("'"),
			alt(nToken("'"), slashed)['*'].merged(),
			token("'"),
		),
		seq(
			token('"'),
			alt(
				nToken('"')['*'], 
				slashed
			)['*'].named("string.content"),
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
	main = alt(
		string,
		comment,
		not(
			alt(
				string,
				comment,
			)
		)["+"].merged("default")
	).q("*").named("default");

export default main;

console.log("Syntax analyzer compiled.");
