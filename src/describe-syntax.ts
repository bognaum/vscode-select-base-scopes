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
	slashed = seq(token("\\"), token(/./y)),
	string = domain("string", alt(
		seq(
			token("'"),
			alt(nToken("'"), slashed).q("*").merged(),
			token("'"),
		),
		seq(
			token('"'),
			alt(
				nToken('"').q("*"), 
				slashed
			).q("*").named("string.content"),
			token('"'),
		).named("string.quoted"),
		seq(
			token('`'),
			alt(nToken('`'), slashed).q("*").merged(),
			token('`'),
		)
	)),
	commentLine = seq(
		token("//"), 
		nToken("\n").q("*").merged(), 
		token("\n")
	),
	commentBlock = seq(
		token("/*"),
		nToken("*/").q("*").merged(),
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
		).q("+").merged("default")
	).q("*").named("default");

export default main;

console.log("Syntax analyzer compiled.");
