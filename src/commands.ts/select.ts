import * as vsc from "vscode";
import getSyntax from '../syntaxes/getSyntax';

export default function select(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	const 
		doc  = tEditor.document,
		opts = tEditor.options,
		languageId = doc.languageId,
		EOL  = ["", "\n", "\r\n"][doc.eol],
		TAB  = opts.insertSpaces && typeof opts.tabSize === "number" ? 
		" ".repeat(opts.tabSize) : "\t",
		newSelections: vsc.Selection[] = [];

	const 
		[syntax, syntaxName] = getSyntax(languageId),
		model = syntax.applyToText(doc.getText())?.namedOnly;
	
	console.log(`languageId, syntaxName >>`, languageId, syntaxName);

	if (model) {
		tEditor.edit((edit) => {
			for (let sel of tEditor.selections) {
				// edit.replace(sel, doc.getText(sel).trim());
				const 
					startOffset = doc.offsetAt(sel.start),
					endOffset = doc.offsetAt(sel.end),
					scopeStack = model.getNodeStack(startOffset, endOffset);

				// console.log(`startOffset, endOffset >>`, startOffset, endOffset);
				// console.log(`scopeStack >>`, scopeStack);

				let i = 0, node, newSel = sel;
				while (node = last(scopeStack, i ++)) {
					const [nodeStart, nodeEnd] = node.at;
					if (nodeStart < startOffset || endOffset < nodeEnd) {
						newSel = new vsc.Selection(
							doc.positionAt(nodeStart), 
							doc.positionAt(nodeEnd)
						);
						break;
					}
				}
				newSelections.push(newSel);
			}
			tEditor.selections = newSelections;
		});
	}
	
}


function last(arr: any[], i=0): any {
	return arr[arr.length - 1 - i];
}

function rangeToOffsets(doc: vsc.TextDocument, range: vsc.Range) {
	return [range.start, range.end].map(doc.offsetAt);
}

function offsetsToRange(doc: vsc.TextDocument, offsets: [number, number]): vsc.Range {
	const [a, b] = offsets.map(doc.positionAt);
	return new vsc.Range(a, b);
}