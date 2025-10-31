# Chat Participant OpenAI Proxy

**Chat Participant OpenAI Proxy** is a Visual Studio Code extension that provides a development-grade proxy server to route OpenAI API compatible requests through GitHub Copilot's language models.

## Features

- Creates a local REST API server (localhost:8080) that mimics OpenAI's Chat Completions API
- Supports standard chat completion requests with user and assistant messages
- Provides OpenAPI documentation via Swagger UI at /api-docs endpoint
- Integrates with VSCode's built-in language model capabilities
- Compatible with standard OpenAI API request/response formats
- Supports model selection, temperature and tools(MCP) controls
- Basic request validation and error handling

## Requirements

1. Valid GitHub Copilot license(any plan - including free tier).
2. [Visual Studio Code](https://code.visualstudio.com/)

## Usage

1. Install the extension in VS Code(`
2. Use the command `@llmproxy /start` to start the proxy server
3. Send requests to http://localhost:8080/v1/chat/completions using standard OpenAI API format
4. View API documentation at http://localhost:8080/api-docs

### Examples

General request format:

```
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "string",
  "messages": [
    {
      "role": "user|system|assistant",
      "content": "string"
    }
  ],
  "temperature": number,
  "stream": boolean
}
```

Request with OpenAI Python SDK:

```python
import openai

# Dummy API key - it is not used in this proxy
client = OpenAI(
    api_key='',
)
client.base_url = "http://localhost:8080/v1"

all_models = ['gpt-3.5-turbo',]

for model in all_models:
   print(f"Model: {model}")
   try:
      response = client.chat.completions.create(
            model=model,
            messages=[{
               "role": "user",
               "content": "Answer the following question and assign it to a variable named smellies. Question:What are the most smelly cheeses?!IMPORTANT: don't return any comments. Only the JSON structure please."
            }]
      )
      print(response.choices[0].message.content)
   except Exception as e:
      print(e)
```

Example output:

```json
{
  "smellies": ["Limburger", "Epoisses", "Roquefort", "Camembert", "Munster"]
}
```

## How to build and package the extension from source

To package your extension is a very straight-forward process. All you need to do is to run the following command:

```sh
npm install
npm run package:production
```

A new VSCode extension will be created with the name `chat-participant-openai-proxy-0.0.1.vsix`. If you would like to change the name, you need to modify the `name` property in [`package.json`](./package.json).


## Installation and run

- If you are still in the development phase, you can simply debug your extension from within your editor.

- If you packaged your extension you can install the extension from the `.vsix` file

## Architecture Documentation

Comprehensive architectural documentation is available in the `docs/` directory:

- **[Central hub with navigation guide](./docs/ARCHITECTURE_INDEX.md)**
- **[System architecture with Mermaid diagrams](./docs/ARCHITECTURE_DIAGRAMS.md)**
- **[Detailed implementation flows](./docs/TECHNICAL_FLOWS.md)**
- **[Developer guide for contributors](./docs/IMPLEMENTATION_GUIDE.md)**

These documents cover system design, data flows, security architecture, API details, and development patterns with extensive Mermaid diagrams for visual understanding.

# Contributions

You can contribute to this repository too! As a matter of fact, we encourage you to contribute.

`How can I contribute?`. Well, I'm glad you asked :).

1. Submit code that improves this project. Easy steps:
   - Fork the repo
   - Create a new branch for your fix or new feature
   - Implement the fix or new feature
   - Open a Pull Request
2. Raise an issue
3. Raise awareness and spread the word about this project :)
