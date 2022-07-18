import * as vsc from 'vscode';
export function activate(context: vsc.ExtensionContext) {
	const commands = [
		// vsc.commands.registerCommand('my-command', () => {}),
		// vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {}),
		vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {
			console.log("OK");
			console.error(`(!)-USER'S `, `OK`);
			console.trace(`tEditor >>`, tEditor);
			throw new Error("Test error");
		}),
	];

	context.subscriptions.push(...commands);
}

export function deactivate() {}