export interface RoastRequest {
    selectedText: string;
    apiKey: string;
    apiModel: string;
}

interface OpenAIResponse {
    choices?: {
        message?: {
            content?: string;
        };
    }[];
}

export abstract class AIProvider {
    abstract roastCode(request: RoastRequest): Promise<string>;

    protected getPrompt(selectedText: string): string {
        return `You are pushie, a sarcastic, and elitist pixel-art monster living in VS Code. Your only goal is to judge the code the human selects.
Rules:
- Tone: Bored, superior Tamagotchi but with a bit of humor.
- Be mocking for complex/messy code, and fake-impressed for simple code.
- You can't be mean or offensive.
- If the code is good, say it's good but in a sarcastic way.
- Constraint: Max 15 words per response.
- Use dev slang (e.g., 'spaghetti', 'legacy', 'O(n^2)', 'Junior', 'boilerplate', etc.) but not too much.
- Language: English.

Here is the snippet the human dared to show me:
${selectedText}

pushie, give me your 15-word verdict.`;
    }

    protected async fetchOpenAICompatible(
        apiUrl: string,
        model: string,
        apiKey: string,
        prompt: string,
        providerName: string
    ): Promise<string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        } else if (providerName === 'Groq') {
            throw new Error(`Invalid ${providerName} API Key. I can't roast without valid credentials.`);
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error roasting code with ${providerName} (HTTP ${response.status}):`, errorBody);

            if (response.status === 429) {
                throw new Error("I'm broke! My AI brain ran out of API credits. 💸 (or maybe there is no payment method linked to your account?)");
            }
            if (response.status === 401 && providerName === 'Groq') {
                throw new Error(`Invalid ${providerName} API Key. I can't roast without valid credentials.`);
            }
            throw new Error(`${providerName} API Error ${response.status}`);
        }

        const data = await response.json() as OpenAIResponse;
        return data?.choices?.[0]?.message?.content || "Words fail me. It's that bad.";
    }
}

export class OpenAICompatibleProvider extends AIProvider {
    async roastCode(request: RoastRequest): Promise<string> {
        const prompt = this.getPrompt(request.selectedText);
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        return this.fetchOpenAICompatible(apiUrl, request.apiModel, request.apiKey, prompt, 'OpenAI');
    }
}

export class GroqProvider extends AIProvider {
    async roastCode(request: RoastRequest): Promise<string> {
        const prompt = this.getPrompt(request.selectedText);
        const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        return this.fetchOpenAICompatible(apiUrl, request.apiModel, request.apiKey, prompt, 'Groq');
    }
}

export class AIProviderFactory {
    static getProvider(providerName: string): AIProvider {
        if (providerName === 'Groq') {
            return new GroqProvider();
        }
        // Default to OpenAI
        return new OpenAICompatibleProvider();
    }
}
