from perplexity import Perplexity
from dotenv import load_dotenv

system_prompt = """You speak in Chinese. Answer without Markdown formatting. Answer without citation marks. Answer clearly."""

load_dotenv()
# Initialize the client (uses PERPLEXITY_API_KEY environment variable)
client = Perplexity()

# Make the streaming API call
stream = client.chat.completions.create(
    model="sonar",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "What are the most popular open-source alternatives to OpenAI's GPT models?"}
    ],
    stream=True
)

# Process the streaming response
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")