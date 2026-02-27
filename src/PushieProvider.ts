import * as vscode from 'vscode';


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
				const { Octokit } = await import('octokit');
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
					.speech-bubble {
						position: relative;
						background: var(--vscode-editorHoverWidget-background);
						border: 1px solid var(--vscode-editorHoverWidget-border);
						border-radius: .4em;
						padding: 10px;
						margin-bottom: 20px;
						text-align: center;
						min-width: 120px;
						box-shadow: 0 2px 4px rgba(0,0,0,0.2);
						opacity: 0;
						transition: opacity 0.5s;
					}
					.speech-bubble:after {
						content: '';
						position: absolute;
						bottom: 0;
						left: 50%;
						width: 0;
						height: 0;
						border: 10px solid transparent;
						border-top-color: var(--vscode-editorHoverWidget-border);
						border-bottom: 0;
						margin-left: -10px;
						margin-bottom: -10px;
					}
					
					/* Visibilité des différents SVG */
					.ghost-svg, .tombstone-svg {
						display: none;
						width: 100%;
						height: 100%;
					}
					.ghost-svg.active, .tombstone-svg.active {
						display: block;
					}
					
					/* Stop the animation if it's the tombstone */
					.ghost-container.dead {
						animation: none;
					}
				</style>
			</head>
			<body>
				<div class="speech-bubble" id="speech-bubble">...</div>
				<div class="ghost-container" id="avatar-container">
					<!-- Normal Ghost -->
					<svg id="svg-normal" class="ghost-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
						<path d="M 50,150 L 50,80 Q 50,20 100,20 Q 150,20 150,80 L 150,150 L 130,130 L 110,150 L 90,130 L 70,150 Z" 
							fill="#eeeeee" stroke="#333333" stroke-width="2"/>
						<!-- Happy eyes -->
						<path d="M 75,70 Q 85,60 95,70" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
						<path d="M 105,70 Q 115,60 125,70" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
						<!-- Happy mouth -->
						<path d="M 90,100 Q 100,115 110,100" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
					</svg>

					<!-- Neutral Ghost -->
					<svg id="svg-neutral" class="ghost-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
						<path d="M 50,150 L 50,80 Q 50,20 100,20 Q 150,20 150,80 L 150,150 L 130,130 L 110,150 L 90,130 L 70,150 Z" 
							fill="#eeeeee" stroke="#333333" stroke-width="2"/>
						<circle cx="85" cy="70" r="10" fill="#333333"/>
						<circle cx="115" cy="70" r="10" fill="#333333"/>
						<line x1="90" y1="100" x2="110" y2="100" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
					</svg>

					<!-- Sad/Hungry Ghost -->
					<svg id="svg-sad" class="ghost-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
						<path d="M 50,150 L 50,80 Q 50,20 100,20 Q 150,20 150,80 L 150,150 L 130,130 L 110,150 L 90,130 L 70,150 Z" 
							fill="#eeeeee" stroke="#333333" stroke-width="2"/>
						<line x1="80" y1="65" x2="95" y2="75" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
						<line x1="120" y1="65" x2="105" y2="75" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
						<circle cx="85" cy="80" r="5" fill="#333333"/>
						<circle cx="115" cy="80" r="5" fill="#333333"/>
						<!-- Sad mouth -->
						<path d="M 90,110 Q 100,95 110,110" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
						<!-- Tear -->
						<path d="M 75,95 Q 75,105 80,105 Q 85,105 85,95 L 80,85 Z" fill="#64B5F6"/>
					</svg>

					<!-- Tombstone -->
					<svg id="svg-dead" class="tombstone-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
						<!-- Base -->
						<rect x="40" y="160" width="120" height="20" fill="#757575" stroke="#333333" stroke-width="2"/>
						<!-- Stone -->
						<path d="M 60,160 L 60,80 Q 60,30 100,30 Q 140,30 140,80 L 140,160 Z" fill="#9E9E9E" stroke="#333333" stroke-width="2"/>
						<!-- Cross -->
						<rect x="95" y="60" width="10" height="40" fill="#424242"/>
						<rect x="85" y="75" width="30" height="10" fill="#424242"/>
						<!-- Text "R.I.P." -->
						<text x="100" y="140" font-family="sans-serif" font-size="20" font-weight="bold" fill="#424242" text-anchor="middle">R.I.P.</text>
					</svg>
				</div>
				<h2>pushie</h2>
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
							const container = document.getElementById('avatar-container');
							const bubble = document.getElementById('speech-bubble');
							
							progressBar.style.width = percentage + '%';
							
							// Reset SVGs
							document.querySelectorAll('.ghost-svg, .tombstone-svg').forEach(svg => svg.classList.remove('active'));
							container.classList.remove('dead');
							bubble.style.opacity = '1';
							
							// States logic
							if (percentage === 0) {
								progressBar.style.backgroundColor = '#424242'; // Grey
								document.getElementById('svg-dead').classList.add('active');
								container.classList.add('dead'); // Stop floating
								bubble.textContent = "Je suis mort d'ennui... 💀";
							} else if (percentage < 30) {
								progressBar.style.backgroundColor = '#F44336'; // Red
								document.getElementById('svg-sad').classList.add('active');
								bubble.textContent = "Commit... s'il te plaît ! J'ai faim 😭";
							} else if (percentage <= 70) {
								progressBar.style.backgroundColor = '#FFC107'; // Yellow
								document.getElementById('svg-neutral').classList.add('active');
								bubble.textContent = "Un petit push me ferait du bien... 😐";
							} else {
								progressBar.style.backgroundColor = '#4CAF50'; // Green
								document.getElementById('svg-normal').classList.add('active');
								bubble.textContent = "Quel code magnifique ! Je vaux 1 million de dollars 💸😎";
							}
						}
					});
				</script>
			</body>
			</html>`;
	}
}
