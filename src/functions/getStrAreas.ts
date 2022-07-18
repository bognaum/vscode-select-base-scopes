import * as vsc from 'vscode';

interface Str {
	type: "Str";
	at: [number, number];
	children?: NoStr[];
}

interface NoStr {
	type: "NoStr";
	at: [number, number];
	children?: Str[];
}

export default function getStrAreas(text: string): Str[] {
	const areas: Str[] = [];
	let quote = "", s = "", i = 0, nextI = 0;

	while (s = text[i = nextI++]) {
		if (quote) {

		} else {}
		if (["'", '"', "`"].includes(s)) {

		} else {}
	}

	return areas;
}