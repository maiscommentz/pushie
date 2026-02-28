import * as vscode from 'vscode';
import { AIProviderFactory } from './AIProvider';
import { getDashboardHtml } from './webview/DashboardWebview';

interface GitHubContributionsResult {
	user: {
		contributionsCollection: {
			totalCommitContributions: number;
			restrictedContributionsCount: number;
		};
	};
}

export class PushieProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'pushie.dashboard';

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(message => {
			if (message.type === 'refresh') {
				this._updateCommitCount(webviewView.webview);
			} else if (message.type === 'roastMe') {
				this._handleRoastRequest(webviewView.webview);
			}
		});

		this._updateCommitCount(webviewView.webview);
	}

	private async _updateCommitCount(webview: vscode.Webview) {
		try {
			const session = await vscode.authentication.getSession('github', ['repo', 'read:user'], { createIfNone: true });

			if (session) {
				const { Octokit } = await import('octokit');
				const octokit = new Octokit({ auth: session.accessToken });

				const { data: user } = await octokit.rest.users.getAuthenticated();

				// Get the start and end of the current local week (Monday start) in UTC for the query
				const startOfWeek = new Date();
				const day = startOfWeek.getDay() || 7; // Convert Sunday (0) to 7
				startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
				startOfWeek.setHours(0, 0, 0, 0);

				const endOfWeek = new Date();
				endOfWeek.setHours(23, 59, 59, 999);

				const query = `
					query($login: String!, $from: DateTime!, $to: DateTime!) {
						user(login: $login) {
							contributionsCollection(from: $from, to: $to) {
								totalCommitContributions
								restrictedContributionsCount
							}
						}
					}
				`;

				const result: GitHubContributionsResult = await octokit.graphql(query, {
					login: user.login,
					from: startOfWeek.toISOString(),
					to: endOfWeek.toISOString()
				});

				const collection = result.user.contributionsCollection;
				// restrictedContributionsCount covers private commits if the token has the right scope
				let commitCount = collection.totalCommitContributions + (collection.restrictedContributionsCount || 0);


				// Send count to the webview
				webview.postMessage({ type: 'updateCommitCount', value: commitCount });
			}
		} catch (error) {
			console.error('Error fetching GitHub data:', error);
			vscode.window.showErrorMessage('Failed to fetch GitHub commits for pushie.');
		}
	}

	private async _handleRoastRequest(webview: vscode.Webview) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			webview.postMessage({ type: 'showRoast', value: "No active editor? What am I supposed to roast, the air?" });
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText.trim()) {
			webview.postMessage({ type: 'showRoast', value: "Select some code first genius." });
			return;
		}

		const config = vscode.workspace.getConfiguration('pushie');
		const providerName = config.get<string>('aiProvider') || 'OpenAI';
		const apiKey = config.get<string>('apiKey');
		let apiModel = config.get<string>('apiModel') || 'gpt-4o-mini';

		if (!apiKey) {
			webview.postMessage({ type: 'showRoast', value: "No API key? I refuse to work for free." });
			vscode.window.showErrorMessage('Please set your API Key in the pushie extension settings (pushie.apiKey) to unlock roasts.');
			return;
		}

		webview.postMessage({ type: 'showRoast', value: "Judging your code... Hmm..." });

		try {
			const provider = AIProviderFactory.getProvider(providerName);
			const roast = await provider.roastCode({
				selectedText,
				apiKey: apiKey || '',
				apiModel
			});

			webview.postMessage({ type: 'showRoast', value: roast });
		} catch (error: any) {
			console.error('Error roasting code:', error);
			const errorMsg = error.message || "My connection dropped trying to read your spaghetti.";
			webview.postMessage({ type: 'showRoast', value: `${errorMsg} 😢` });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return getDashboardHtml();
	}
}
