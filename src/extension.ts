import * as vsc from 'vscode';
import main from './describe-syntax';
export function activate(context: vsc.ExtensionContext) {
	const commands = [
		// vsc.commands.registerCommand('my-command', () => {}),
		// vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {}),
		vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {
			console.log("OK");
			const 
				doc = tEditor.document,
				text = doc.getText(),
				res = main.applyTo(text);
				if (res) {
					console.log(`res.fullText >>`, res.selfText);
				}
				console.log(`res >>`, res);
			/* console.log("OK");
			console.error(`(!)-USER'S `, `OK`);
			console.trace(`tEditor >>`, tEditor);
			throw new Error("Test error"); */
		}),
	];

	context.subscriptions.push(...commands);
}

export function deactivate() {}


interface A {
	(a: number): number;
	b: (a: number) => number;
}

function a(a: number): number {
	return a;
}

function b(this: A, a: number): number {
	const x: A = this;
	return this(a);
};

a.b = b;

let x: A = a;