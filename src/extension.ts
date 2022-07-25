import * as vsc from 'vscode';
import main from './describe-syntax';
import select from './commands.ts/select';
export function activate(context: vsc.ExtensionContext) {
	const commands = [
		// vsc.commands.registerCommand('my-command', () => {}),
		// vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {}),
		vsc.commands.registerTextEditorCommand('select-between.select', select),
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