import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
} from "./describeAPI";

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
			alt(nToken('"'), slashed).q("*").merged(),
			token('"'),
		),
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
		).named("default")
	).q("*").named("default");

export default main;
