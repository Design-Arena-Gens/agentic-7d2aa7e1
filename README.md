# Agentic Chat

Simple AI agent chat built with Next.js and the Vercel AI SDK. Supports tool-calling and a mock mode that works without any API key.

- Provider options: OpenAI or Mock
- Tools: `math.calculate` (basic eval), `webFetch` (fetch page text)
- Add your OpenAI API key in the UI or set `OPENAI_API_KEY` in the environment

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Deploy

Set `OPENAI_API_KEY` in Vercel project (optional). Then:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-7d2aa7e1
```
