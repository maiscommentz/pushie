import * as vscode from 'vscode';
import { PushieProvider } from './PushieProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "pushie" is now active!');

	const provider = new PushieProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			PushieProvider.viewType,
			provider,
			{ webviewOptions: { retainContextWhenHidden: true } }
		)
	);
}

export function deactivate() { }
