import syntaxJS from "./syntax-js";

export default getSyntax;

const syntaxes: {[i: string]: any} = {
	defaultSyntax: syntaxJS,
	js: {
		applyTo: [
			"javascript",
			"json",
			"javascriptreact",
			"typescript",
		],
		syntax: syntaxJS,
	},
};

function getSyntax(languageId='') {
	if (languageId) {
		for (const name in syntaxes) {
			if (syntaxes[name].applyTo?.includes(languageId)) {
				return [syntaxes[name].syntax, name];
			} else {}
		}
	} else {}
	return [syntaxes.defaultSyntax, "default"];
}
