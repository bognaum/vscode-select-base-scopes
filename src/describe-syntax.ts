import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
} from "./describeAPI";

const 
	slashed = seq(token("\\"), token(/./y)),
	string = domain("string", alt(
		seq(
			token("'"),
			q("*", alt(nToken("'"), slashed)),
			token("'"),
		),
		seq(
			token('"'),
			q("*", alt(nToken('"'), slashed)),
			token('"'),
		),
		seq(
			token('`'),
			q("*", alt(nToken('`'), slashed)),
			token('`'),
		)
	)),
	commentLine = seq(
		token("//"), 
		q("*", nToken("\n")), 
		token("\n")
	);