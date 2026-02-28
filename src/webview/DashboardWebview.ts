export function getDashboardHtml(): string {
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Dashboard</title>
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
					transform-origin: bottom center;
				}
				@keyframes slime-squish {
					0% { transform: scale(1, 1) translateY(0); }
					15% { transform: scale(1.1, 0.9) translateY(10px); }
					30% { transform: scale(0.9, 1.1) translateY(-10px); }
					45% { transform: scale(1.05, 0.95) translateY(4px); }
					60% { transform: scale(1, 1) translateY(0); }
					100% { transform: scale(1, 1) translateY(0); }
				}
				@keyframes slime-squish-slow {
					0% { transform: scale(1, 1) translateY(0); }
					20% { transform: scale(1.05, 0.95) translateY(5px); }
					40% { transform: scale(0.98, 1.02) translateY(-2px); }
					60% { transform: scale(1, 1) translateY(0); }
					100% { transform: scale(1, 1) translateY(0); }
				}
				@keyframes slime-shake {
					0% { transform: translateX(0); }
					5% { transform: translateX(-5px); }
					10% { transform: translateX(5px); }
					15% { transform: translateX(-5px); }
					20% { transform: translateX(0); }
					100% { transform: translateX(0); }
				}
				.anim-happy { animation: slime-squish 2s ease-in-out infinite; }
				.anim-epic { animation: slime-epic-levitate 3s ease-in-out infinite; filter: drop-shadow(0px 0px 8px rgba(0,230,118,0.8)); }
				@keyframes slime-epic-levitate {
					0% { transform: translateY(-5px); }
					50% { transform: translateY(-20px); }
					100% { transform: translateY(-5px); }
				}
				.anim-neutral { animation: slime-squish-slow 3s ease-in-out infinite; }
				.anim-sad { animation: slime-shake 2.5s ease-in-out infinite; }
				.anim-dead { animation: none; transform: translateY(40px) scale(1, 0.8); }

				/* Parts Animations */
				@keyframes anim-blink {
					0%, 94%, 98%, 100% { transform: scaleY(1); }
					96% { transform: scaleY(0.1); }
				}
				.part-blink { animation: anim-blink 4s infinite; }

				@keyframes anim-mouth-wobble {
					0%, 100% { transform: scaleX(1); }
					50% { transform: scaleX(0.7); }
				}
				.part-mouth { animation: anim-mouth-wobble 2s ease-in-out infinite; }

				@keyframes anim-sparkle {
					0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
					50% { opacity: 0.5; transform: scale(0.5) rotate(45deg); }
				}
				.part-sparkle { animation: anim-sparkle 2s ease-in-out infinite; }
				.part-sparkle-delayed { animation: anim-sparkle 2s ease-in-out infinite 1s; }

				@keyframes anim-sweat {
					0%, 100% { transform: translateY(0); opacity: 1; }
					50% { transform: translateY(1.5px); opacity: 0.6; }
				}
				.part-sweat { animation: anim-sweat 1.5s ease-in-out infinite; }

				.progress-container {
					width: 80%;
					background-color: #424242;
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
				
				/* SVG Visibility */
				.ghost-svg, .tombstone-svg {
					display: none;
					width: 100%;
					height: 100%;
				}	
				.ghost-svg.active, .tombstone-svg.active {
					display: block;
				}
				
				.refresh-btn {
					margin-top: 15px;
					padding: 4px 12px;
					background-color: var(--vscode-button-background);
					color: var(--vscode-button-foreground);
					border: none;
					border-radius: 4px;
					cursor: pointer;
					font-family: inherit;
					font-size: 0.9em;
				}
				.refresh-btn:hover {
					background-color: var(--vscode-button-hoverBackground);
				}
			</style>
		</head>
		<body>
			<div class="speech-bubble" id="speech-bubble">...</div>
			<div class="ghost-container" id="avatar-container">
				<!-- Epic Pixel Slime (1M Dollar) -->
				<svg id="svg-epic" class="ghost-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
					<!-- Base Body -->
					<rect x="5" y="3" width="6" height="1" fill="#00E676"/>
					<rect x="3" y="4" width="10" height="1" fill="#00E676"/>
					<rect x="2" y="5" width="12" height="1" fill="#00E676"/>
					<rect x="1" y="6" width="14" height="6" fill="#00E676"/>
					
					<!-- Shadows (Bottom part) -->
					<rect x="1" y="12" width="14" height="1" fill="#00C853"/>
					<rect x="2" y="13" width="12" height="1" fill="#00C853"/>
					<rect x="4" y="14" width="8" height="1" fill="#00C853"/>

					<!-- Highlights -->
					<rect x="4" y="4" width="3" height="1" fill="#69F0AE"/>
					<rect x="3" y="5" width="2" height="1" fill="#69F0AE"/>
					<rect x="2" y="6" width="1" height="3" fill="#69F0AE"/>

					<!-- Deal With It Sunglasses -->
					<g class="part-blink" style="transform-origin: center; transform-box: fill-box;">
						<rect x="2" y="7" width="12" height="1" fill="#111111"/>
						<rect x="3" y="8" width="4" height="2" fill="#111111"/>
						<rect x="9" y="8" width="4" height="2" fill="#111111"/>
						<rect x="7" y="8" width="2" height="1" fill="#111111"/>
						<!-- Reflections -->
						<rect x="5" y="8" width="1" height="1" fill="#FFF"/>
						<rect x="4" y="9" width="1" height="1" fill="#FFF"/>
						<rect x="11" y="8" width="1" height="1" fill="#FFF"/>
						<rect x="10" y="9" width="1" height="1" fill="#FFF"/>
					</g>
					
					<!-- Confident Smirk -->
					<g class="part-mouth" style="transform-origin: center; transform-box: fill-box;">
						<rect x="7" y="11" width="3" height="1" fill="#111"/>
						<rect x="10" y="10" width="1" height="1" fill="#111"/>
					</g>

					<!-- Bling / Sparkle 1 -->
					<g class="part-sparkle" style="transform-origin: center; transform-box: fill-box;">
						<rect x="2" y="2" width="1" height="1" fill="#FFF59D"/>
						<rect x="2" y="1" width="1" height="1" fill="#FFF176"/>
						<rect x="2" y="3" width="1" height="1" fill="#FFF176"/>
						<rect x="1" y="2" width="1" height="1" fill="#FFF176"/>
						<rect x="3" y="2" width="1" height="1" fill="#FFF176"/>
					</g>

					<!-- Bling / Sparkle 2 -->
					<g class="part-sparkle-delayed" style="transform-origin: center; transform-box: fill-box;">
						<rect x="13" y="11" width="1" height="1" fill="#FFF59D"/>
						<rect x="13" y="10" width="1" height="1" fill="#FFF176"/>
						<rect x="13" y="12" width="1" height="1" fill="#FFF176"/>
						<rect x="12" y="11" width="1" height="1" fill="#FFF176"/>
						<rect x="14" y="11" width="1" height="1" fill="#FFF176"/>
					</g>
				</svg>

				<!-- Good Pixel Slime (Normal Happy) -->
				<svg id="svg-good" class="ghost-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
					<!-- Base Body -->
					<rect x="5" y="3" width="6" height="1" fill="#29B6F6"/>
					<rect x="3" y="4" width="10" height="1" fill="#29B6F6"/>
					<rect x="2" y="5" width="12" height="1" fill="#29B6F6"/>
					<rect x="1" y="6" width="14" height="6" fill="#29B6F6"/>
					
					<!-- Shadows (Bottom part) -->
					<rect x="1" y="12" width="14" height="1" fill="#0288D1"/>
					<rect x="2" y="13" width="12" height="1" fill="#0288D1"/>
					<rect x="4" y="14" width="8" height="1" fill="#0288D1"/>

					<!-- Highlights -->
					<rect x="4" y="4" width="3" height="1" fill="#81D4FA"/>
					<rect x="3" y="5" width="2" height="1" fill="#81D4FA"/>
					<rect x="2" y="6" width="1" height="3" fill="#81D4FA"/>

					<!-- Happy Eyes -->
					<g class="part-blink" style="transform-origin: center; transform-box: fill-box;">
						<rect x="4" y="9" width="1" height="2" fill="#111"/>
						<rect x="11" y="9" width="1" height="2" fill="#111"/>
					</g>
					
					<!-- Cute Smile -->
					<g class="part-mouth" style="transform-origin: center; transform-box: fill-box;">
						<rect x="6" y="11" width="1" height="1" fill="#111"/>
						<rect x="9" y="11" width="1" height="1" fill="#111"/>
						<rect x="7" y="12" width="2" height="1" fill="#111"/>
					</g>
				</svg>

				<!-- Neutral Pixel Slime -->
				<svg id="svg-neutral" class="ghost-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
					<!-- Base Body -->
					<rect x="5" y="3" width="6" height="1" fill="#FFC107"/>
					<rect x="3" y="4" width="10" height="1" fill="#FFC107"/>
					<rect x="2" y="5" width="12" height="1" fill="#FFC107"/>
					<rect x="1" y="6" width="14" height="6" fill="#FFC107"/>
					
					<!-- Shadows (Bottom part) -->
					<rect x="1" y="12" width="14" height="1" fill="#FFA000"/>
					<rect x="2" y="13" width="12" height="1" fill="#FFA000"/>
					<rect x="4" y="14" width="8" height="1" fill="#FFA000"/>

					<!-- Highlights -->
					<rect x="4" y="4" width="3" height="1" fill="#FFE082"/>
					<rect x="3" y="5" width="2" height="1" fill="#FFE082"/>
					<rect x="2" y="6" width="1" height="3" fill="#FFE082"/>

					<!-- Neutral Eyes -->
					<g class="part-blink" style="transform-origin: center; transform-box: fill-box;">
						<rect x="4" y="9" width="2" height="1" fill="#111"/>
						<rect x="10" y="9" width="2" height="1" fill="#111"/>
					</g>
					<!-- Mouth -->
					<rect x="7" y="11" width="2" height="1" fill="#111"/>
				</svg>

				<!-- Sad/Hungry Pixel Slime -->
				<svg id="svg-sad" class="ghost-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
					<!-- Base Body (Drooping slightly lower) -->
					<rect x="5" y="5" width="6" height="1" fill="#F44336"/>
					<rect x="4" y="6" width="8" height="1" fill="#F44336"/>
					<rect x="3" y="7" width="10" height="1" fill="#F44336"/>
					<rect x="2" y="8" width="12" height="1" fill="#F44336"/>
					<rect x="1" y="9" width="14" height="4" fill="#F44336"/>

					<!-- Shadows (Bottom spread out) -->
					<rect x="0" y="13" width="16" height="1" fill="#C62828"/>
					<rect x="1" y="14" width="14" height="1" fill="#C62828"/>
					<rect x="3" y="15" width="10" height="1" fill="#C62828"/>

					<!-- Highlights -->
					<rect x="5" y="6" width="2" height="1" fill="#EF9A9A"/>
					<rect x="4" y="7" width="1" height="2" fill="#EF9A9A"/>

					<!-- Pleading Eyes -->
					<g class="part-blink" style="transform-origin: center; transform-box: fill-box;">
						<rect x="3" y="10" width="2" height="2" fill="#111"/>
						<rect x="11" y="10" width="2" height="2" fill="#111"/>
						<!-- Eye shines -->
						<rect x="4" y="10" width="1" height="1" fill="#FFF"/>
						<rect x="12" y="10" width="1" height="1" fill="#FFF"/>
						<rect x="3" y="11" width="1" height="1" fill="#FFF"/> 
						<rect x="11" y="11" width="1" height="1" fill="#FFF"/>
					</g>

					<!-- Sad mouth -->
					<g class="part-mouth" style="transform-origin: center; transform-box: fill-box;">
						<rect x="7" y="11" width="2" height="1" fill="#111"/>
						<rect x="6" y="12" width="1" height="1" fill="#111"/>
						<rect x="9" y="12" width="1" height="1" fill="#111"/>
					</g>
				</svg>

				<!-- Dead Puddle Pixel Slime -->
				<svg id="svg-dead" class="tombstone-svg" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">

					<!-- Melted Body -->
					<rect x="4" y="11" width="8" height="1" fill="#9E9E9E"/>
					<rect x="2" y="12" width="12" height="1" fill="#9E9E9E"/>
					<rect x="1" y="13" width="14" height="1" fill="#9E9E9E"/>
					<rect x="0" y="14" width="16" height="2" fill="#9E9E9E"/>
					<!-- Highlight -->
					<rect x="4" y="12" width="2" height="1" fill="#E0E0E0"/>
					<rect x="7" y="13" width="3" height="1" fill="#E0E0E0"/>
					<!-- Dead Eyes (X X) -->
					<rect x="4" y="13" width="1" height="1" fill="#000"/><rect x="6" y="13" width="1" height="1" fill="#000"/><rect x="5" y="14" width="1" height="1" fill="#000"/>
					<rect x="10" y="13" width="1" height="1" fill="#000"/><rect x="12" y="13" width="1" height="1" fill="#000"/><rect x="11" y="14" width="1" height="1" fill="#000"/>
				</svg>
			</div>
			<h2>pushie</h2>
			<div class="progress-container">
				<div class="progress-bar"></div>
			</div>
			<p class="info-text">Commits this week: <span id="commit-count">Loading...</span></p>
			<div style="display:flex; gap: 10px; margin-top: 15px;">
				<button class="refresh-btn" style="margin-top: 0; background-color: #3e404cff; color: white;" id="refresh-btn">🔄 Refresh</button>
				<button class="refresh-btn" style="margin-top: 0; background-color: #4c463eff; color: white;" id="roast-btn">🔥 Roast my code</button>
			</div>

			<script>
				const vscode = acquireVsCodeApi();

				window.addEventListener('message', event => {
					const message = event.data;
					if (message.type === 'updateCommitCount') {
						const commitCount = message.value;
						const commitCountElement = document.getElementById('commit-count');
						if (commitCountElement) {
							commitCountElement.textContent = commitCount.toString();
						}
						
						// Each commit gives 4% food
						const percentage = Math.min(100, commitCount * 4);
						const progressBar = document.querySelector('.progress-bar');
						const container = document.getElementById('avatar-container');
						const bubble = document.getElementById('speech-bubble');
						
						if (progressBar) progressBar.style.width = percentage + '%';
						
						// Reset SVGs
						document.querySelectorAll('.ghost-svg, .tombstone-svg').forEach(svg => svg.classList.remove('active'));
						if (container) container.className = 'ghost-container'; // Wipe dynamic classes
						if (bubble) bubble.style.opacity = '1';
						
						// States logic
						if (percentage === 0) {
							if (progressBar) progressBar.style.backgroundColor = '#424242'; // Grey
							const svgDead = document.getElementById('svg-dead');
							if (svgDead) svgDead.classList.add('active');
							if (container) container.classList.add('anim-dead');
							if (bubble) bubble.textContent = "I melted from boredom... 💀";
						} else if (percentage < 50) {
							if (progressBar) progressBar.style.backgroundColor = '#F44336'; // Red
							const svgSad = document.getElementById('svg-sad');
							if (svgSad) svgSad.classList.add('active');
							if (container) container.classList.add('anim-sad');
							if (bubble) bubble.textContent = "Commit please... I'm hungry! 😭";
						} else if (percentage < 80) {
							if (progressBar) progressBar.style.backgroundColor = '#FFC107'; // Yellow
							const svgNeutral = document.getElementById('svg-neutral');
							if (svgNeutral) svgNeutral.classList.add('active');
							if (container) container.classList.add('anim-neutral');
							if (bubble) bubble.textContent = "A little push would do me good... 😐";
						} else if (percentage < 100) {
							if (progressBar) progressBar.style.backgroundColor = '#29B6F6'; // Light Blue
							const svgGood = document.getElementById('svg-good');
							if (svgGood) svgGood.classList.add('active');
							if (container) container.classList.add('anim-happy');
							if (bubble) bubble.textContent = "Great job! I'm in tip-top shape! ✨";
						} else {
							if (progressBar) progressBar.style.backgroundColor = '#00E676'; // Bright Green
							const svgEpic = document.getElementById('svg-epic');
							if (svgEpic) svgEpic.classList.add('active');
							if (container) container.classList.add('anim-epic');
							if (bubble) bubble.textContent = "So much commits, I feel more alive than ever! 💸😎";
						}
					} else if (message.type === 'showRoast') {
						const bubble = document.getElementById('speech-bubble');
						if (bubble) {
							bubble.style.opacity = '1';
							bubble.textContent = message.value;
						}
					}
				});

				const refreshBtn = document.getElementById('refresh-btn');
				if (refreshBtn) {
					refreshBtn.addEventListener('click', () => {
						const bubble = document.getElementById('speech-bubble');
						const commitCount = document.getElementById('commit-count');
						if (commitCount) commitCount.textContent = 'Loading...';
						if (bubble) bubble.textContent = "Checking GitHub...";
						vscode.postMessage({ type: 'refresh' });
					});
				}

				const roastBtn = document.getElementById('roast-btn');
				if (roastBtn) {
					roastBtn.addEventListener('click', () => {
						const bubble = document.getElementById('speech-bubble');
						if (bubble) bubble.textContent = "Summoning judgment...";
						vscode.postMessage({ type: 'roastMe' });
					});
				}
			</script>
		</body>
		</html>`;
}
