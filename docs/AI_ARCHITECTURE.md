# AI Architecture: RAG, LangChain, and Agent

This document explains how the AI components should be structured in the English Fantasy project.
It describes the role of Retrieval-Augmented Generation (RAG), LangChain-style workflows, and the AI agent concept.

## 1. RAG (Retrieval-Augmented Generation)

### What RAG means here
- RAG combines a knowledge retrieval step with a language model generation step.
- It helps the game produce context-aware answers, explanations, or narrative content by using existing game data as the knowledge base.

### Project sources for RAG
- `src/assets/data/` - vocabulary files, floor content, enemy data, dialogue seeds.
- `database/` - schema and migration data that can seed structured game knowledge.
- `docs/` - design and narrative guidance that can become part of the retrieval corpus.

### RAG responsibilities
- Load or index relevant documents from game and vocabulary content.
- Find the best matching passages for the user query or game context.
- Combine retrieved content with an LLM prompt to generate a coherent response.

### Example RAG flow
```js
const documents = loadDocumentsFrom('src/assets/data');
const query = userQuestion;
const results = retriever.search(query);
const prompt = buildPrompt(results, query);
const response = llm.generate(prompt);
```

## 2. LangChain-style Integration

### Why LangChain?
- LangChain is a framework for building chained LLM workflows.
- It helps connect prompt templates, document retrievers, tool calls, and agent logic in a reusable way.

### Core LangChain concepts
- DocumentLoader: load game content and vocabulary data.
- Retriever: search indexed text or embeddings.
- PromptTemplate: structure the prompt with retrieved context.
- Chain: orchestrate the sequence of retrieval + generation.
- Tool / Memory: optionally support external functions or conversation history.

### How it maps to this project
- `src/js/` or `server/` can implement the chain logic.
- `src/assets/data/` becomes the document store for retrieval.
- `src/html/visual_novel.html` and other UI pages can call the agent chain.

### Example LangChain-style pseudo-code
```js
const chain = new LLMChain({
  prompt: PromptTemplate.fromTemplate(`Use the following game data to answer the user:\n{context}\nQuestion: {question}`),
  llm: openAI,
  retriever: dataRetriever,
});
const answer = await chain.call({ question: playerQuestion });
```

## 3. Agent

### What the agent does
- The agent is the interactive AI persona inside the game.
- It can act as a tutor, story companion, dungeon guide, or NPC dialogue manager.
- It receives player input and decides whether to retrieve knowledge, generate text, or execute game logic.

### Agent roles in the project
- Dialogue assistant for story mode and sub-quests.
- Vocabulary explanation helper during battles or exploration.
- Quest generator that uses game data to create custom challenges.

### Where the agent fits
- `src/html/visual_novel.html` - can host agent-driven story interactions.
- `src/html/sub_quest.html` - can use the agent to create adaptive subquests.
- `src/js/` - stores the agent implementation and interaction bridge.
- `server/` - optionally handles secure model calls and retrieval logic.

### Agent behavior
- Accept player input or game context.
- Use RAG to fetch relevant game data.
- Use LangChain-style chaining to make decisions.
- Return a structured response for the UI.

### Simple agent interface example
```js
class GameAgent {
  constructor(retriever, llm) {
    this.retriever = retriever;
    this.llm = llm;
  }

  async respond(playerMessage) {
    const context = await this.retriever.find(playerMessage);
    const prompt = `Use game context to answer:\n${context}\nPlayer: ${playerMessage}`;
    return this.llm.generate(prompt);
  }
}
```

## 4. Recommended integration file

This architecture can be implemented in one dedicated file such as:

 - `src/js/ai-agent.js` for client-side prototype logic
 - or `server/ai_server.py` for backend retrieval and model calls (Python FastAPI)

In this project, `src/js/ai-agent.js` is already created as a starting point and a Python backend
prototype is available at `server/ai_server.py` which implements ingestion and RAG query endpoints.

That file should contain:
- a document loader for game data
- a retriever component
- a prompt-builder / chain orchestrator
- an agent class or function that exposes `respond()`

## 5. Summary

- **RAG** uses the existing game and vocabulary content as a knowledge base.
- **LangChain** organizes retrieval + prompt + generation into a reusable workflow.
- **Agent** is the interactive AI persona that connects the game UI to the RAG/LangChain pipeline.

This file is the central reference for how AI-enhanced content should be structured in the project.
