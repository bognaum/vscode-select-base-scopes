import * as vsc from 'vscode';
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
