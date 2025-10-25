import Perplexity from '@perplexity-ai/perplexity_ai';

// Initialize the client (uses PERPLEXITY_API_KEY environment variable)
const client = new Perplexity();

// Make the streaming API call
const stream = await client.chat.completions.create({
    model: "sonar-pro",
    messages: [
        { role: "user", content: "What are the most popular open-source alternatives to OpenAI's GPT models?" }
    ],
    stream: true
});

// Process the streaming response
for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
        process.stdout.write(chunk.choices[0].delta.content);
    }
}