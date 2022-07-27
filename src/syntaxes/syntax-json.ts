import {
	token,
	nToken,
	domain,
	seq,
	alt,
	q,
	not,
	noOne,
	merge,
	ref,
	bof,
	eof,
	lookForward,
	log,
	global,
} from "../syntax-framework/describeAPI";

const 
	subject = ref(() => subject_),
	comment = ref(() => comment_);

const 
	s = alt(token(/\s/y), comment)['*'],
	coma = seq(s, token(","), s);

const 
	null_ = token("null"),
	slashed = seq(token("\\"), token(1)).as("slashed"),
	string = seq(
		token('"'),
		alt(slashed, nToken('"'))['*'].as("string.content"),
		token('"'),
	).as("string"),
	number = token(/\d+/y).as("number"),
	boolean = token("true", "false").as("boolean");

const 
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
	comment_ = domain("comment", alt(commentLine, commentBlock));

const array = seq(
	token("["),
	seq(s, subject.q("*/", coma), s, coma['?'],).as("array.content"),
	token("]"),
).as("array");

const 
	keyValue = seq(string, s, token(":"), s, subject).as("object.key-value"),
	object = seq(
	token("{"),
	seq(s, keyValue.q("*/", coma), s, coma['?']).as("object.content"),
	token("}"),
).as("object");

const subject_ = alt(
	null_,
	boolean,
	number,
	comment,
	string,
	array,
	object,
);

const main = seq(s, subject, s);

export default main.log("main");