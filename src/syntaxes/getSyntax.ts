import {iAnalyzer} from "../syntax-framework/types-interfaces";
import js from "./syntax-js";
import json from "./syntax-json";

export default getSyntax;

const syntaxes: {[i: string]: Assign|iAnalyzer} = {
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

function getSyntax(languageId=''): [iAnalyzer, string] {
	if (languageId) {
		for (const name in syntaxes) {
			if ((syntaxes[name] as Assign).applyTo?.includes(languageId)) {
				return [(syntaxes[name] as Assign).syntax, name];
			} else {}
		}
	} else {}
	return [syntaxes.defaultSyntax as iAnalyzer, "default"];
}

interface Assign {
	applyTo: string[],
	syntax: iAnalyzer
}