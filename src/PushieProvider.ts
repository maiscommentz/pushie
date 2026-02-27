import * as vscode from 'vscode';
import { Octokit } from 'octokit';

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

		this._updateCommitCount(webviewView.webview);
	}

	private async _updateCommitCount(webview: vscode.Webview) {
		try {
			const session = await vscode.authentication.getSession('github', ['repo', 'read:user'], { createIfNone: true });

			if (session) {
				const octokit = new Octokit({ auth: session.accessToken });

				const { data: user } = await octokit.rest.users.getAuthenticated();

				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);

				// Fetch events from the last 24h
				const { data: events } = await octokit.rest.activity.listEventsForAuthenticatedUser({
					username: user.login,
					per_page: 100
				});

				let commitCount = 0;
				for (const event of events) {
					if (event.type === 'PushEvent' && event.created_at) {
						const eventDate = new Date(event.created_at);
						if (eventDate > yesterday) {
							commitCount += (event.payload as any).commits?.length || 0;
						}
					}
				}

				// Send count to the webview
				webview.postMessage({ type: 'updateCommitCount', value: commitCount });
			}
		} catch (error) {
			console.error('Error fetching GitHub data:', error);
			vscode.window.showErrorMessage('Failed to fetch GitHub commits for Pushie.');
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Pushie Dashboard</title>
				<style>
					body {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						height: 100vh;
						margin: 0;
						font-family: var(--vscode-font-family);
						color: var(--vscode-editor-foreground);
						background-color: var(--vscode-editor-background);
					}
					.ghost-container {
						width: 150px;
						height: 150px;
						animation: float 3s ease-in-out infinite;
					}
					@keyframes float {
						0% {
							transform: translateY(0px);
						}
						50% {
							transform: translateY(-20px);
						}
						100% {
							transform: translateY(0px);
						}
					}
					.progress-container {
						width: 80%;
						background-color: var(--vscode-progressBar-background);
						border-radius: 10px;
						margin-top: 20px;
						height: 15px;
						overflow: hidden;
					}
					.progress-bar {
						width: 50%;
						height: 100%;
						background-color: #4CAF50;
						transition: width 0.5s;
					}
					h2 {
						margin-top: 10px;
					}
					.info-text {
						margin-top: 5px;
						font-size: 0.9em;
						color: var(--vscode-descriptionForeground);
					}
				</style>
			</head>
			<body>
				<div class="ghost-container">
					<!-- Simple SVG Ghost -->
					<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
						<path d="M 50,150 L 50,80 Q 50,20 100,20 Q 150,20 150,80 L 150,150 L 130,130 L 110,150 L 90,130 L 70,150 Z" 
							fill="#eeeeee" stroke="#333333" stroke-width="2"/>
						<circle cx="85" cy="70" r="10" fill="#333333"/>
						<circle cx="115" cy="70" r="10" fill="#333333"/>
						<ellipse cx="100" cy="100" rx="10" ry="15" fill="#333333"/>
					</svg>
				</div>
				<h2>Pushie</h2>
				<p>Hunger Level</p>
				<div class="progress-container">
					<div class="progress-bar"></div>
				</div>
				<p class="info-text">Commits today: <span id="commit-count">Loading...</span></p>

				<script>
					window.addEventListener('message', event => {
						const message = event.data;
						if (message.type === 'updateCommitCount') {
							const commitCount = message.value;
							document.getElementById('commit-count').textContent = commitCount.toString();
							
							// Each commit gives 10% food
							const percentage = Math.min(100, commitCount * 10);
							const progressBar = document.querySelector('.progress-bar');
							
							progressBar.style.width = percentage + '%';
							
							// Colors based on hunger
							if (percentage < 30) {
								progressBar.style.backgroundColor = '#F44336'; // Red
							} else if (percentage < 70) {
								progressBar.style.backgroundColor = '#FFC107'; // Yellow
							} else {
								progressBar.style.backgroundColor = '#4CAF50'; // Green
							}
						}
					});
				</script>
			</body>
			</html>`;
	}
}
