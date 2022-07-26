import {Analyzer} from "../syntax-framework/types-interfaces";
import js from "./syntax-js";

export default getSyntax;

const syntaxes: {[i: string]: Assign|Analyzer} = {
	defaultSyntax: js,
	js: {
		applyTo: [
			"javascript",
			"json",
			"javascriptreact",
			"typescript",
		],
		syntax: js,
	},
};

function getSyntax(languageId=''): [Analyzer, string] {
	if (languageId) {
		for (const name in syntaxes) {
			if ((syntaxes[name] as Assign).applyTo?.includes(languageId)) {
				return [(syntaxes[name] as Assign).syntax, name];
			} else {}
		}
	} else {}
	return [syntaxes.defaultSyntax as Analyzer, "default"];
}

interface Assign {
	applyTo: string[],
	syntax: Analyzer
}