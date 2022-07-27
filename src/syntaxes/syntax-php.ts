import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
	noOne,
	ref,
	bof,
	eof,
	global,
} from "../syntax-framework/describeAPI";
const startDT = Date.now();

const 
	phpStart = seq(
		token("<?"),
		token("php")['?'],
	),
	phpEnd = alt(
		token("?>"), 
		eof()
	);

const
	phpCommentLine = seq(
		token("//"), 
		nToken("\n", "\r\n")['*'].merged("comment.content"), 
		token("\r")['*'], 
		token("\n")
	).as("comment.line"),
	phpCommentBlock = seq(
		token("/*"),
		nToken("*/")['*'].merged("comment.content"),
		token("*/")
	).as("comment.block"),
	phpComment = alt(phpCommentLine, phpCommentBlock);

const
	commentHtml = seq(
		token("<!--"),
		nToken("-->")['*'].as("comment.inner"),
		token("-->")
	).as("comment");

const
	string = domain("string", alt(
		seq(
			token("'"),
			nToken("'")['*'].as("string.content"),
			token("'"),
		),
		seq(
			token('"'),
			nToken('"')['*'].as("string.content"),
			token('"'),
		),
	));

const
	parenRound = seq(
		token("("),
		alt(
			string,
			ref(() => parentheses),
			nToken(")"),
		)['*'].as("paren.content"),
		token(")"),
	),
	parenCurly = seq(
		token("{"),
		alt(
			ref(() => parenContent),
			nToken("}"),
		)['*'].as("paren.content"),
		token("}"),
	),
	parenSquare = seq(
		token("["),
		alt(
			ref(() => parenContent),
			nToken("]"),
		)['*'].as("paren.content"),
		token("]"),
	),
	parenContent = alt(
		string,
		ref(() => parentheses),
		not(phpEnd),
		ref(() => html),
	),
	parentheses = alt(parenRound, parenCurly, parenSquare).as("paren");

const
	phpSubjects = alt(
		phpComment,
		string,
		parentheses,
		not(phpEnd),
	),
	php = seq(
		phpStart,
		alt(
			phpSubjects,
			noOne(
				phpSubjects,
				phpEnd,
			),
		)['*'].as("php.content"),
		phpEnd,
	).as("php"),
	htmlSubjects = alt(
		commentHtml,
		string,
	),
	html = alt(
		token(' '),
		htmlSubjects,
		noOne(
			htmlSubjects,
			phpStart,
		)
	)['*'].as("html"),
	main = alt(
		php,
		html,
	)['*'];

const endDT = Date.now(), performT = (endDT - startDT);
console.log(`'syntax-php' perform time: ${performT}mSec`);

export default main.log("main");