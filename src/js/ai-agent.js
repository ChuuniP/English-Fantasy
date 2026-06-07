// src/js/ai-agent.js
// Central AI integration file for the English Fantasy project.
// This file contains the RAG, LangChain-style workflow, and agent logic.

const DATA_PATH = '../assets/data/';
const DATA_FILES = [
  'Floor 1.json',
  'Floor 2.json',
  'Floor 3.json',
  'Boss 1.json',
  'Boss 2.json',
  'Boss 3.json',
  'Dungeon Boss 1.json',
  'Dungeon Monster 1.json',
  'Elite 1.json',
  'Elite 2.json',
  'Elite 3.json',
];

// === RAG (Retrieval-Augmented Generation) ===
// RAG uses game data as a knowledge base to ground responses.

export async function loadGameDocuments() {
  const documents = [];

  for (const file of DATA_FILES) {
    try {
      const response = await fetch(`${DATA_PATH}${encodeURIComponent(file)}`);
      if (!response.ok) {
        console.warn('Failed to load', file, response.status);
        continue;
      }
      const payload = await response.json();
      documents.push(...flattenGameData(file, payload));
    } catch (error) {
      console.warn('Error loading document', file, error);
    }
  }

  return documents;
}

function flattenGameData(idPrefix, data) {
  const entries = [];

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      entries.push({
        id: `${idPrefix}-${index}`,
        text: objectToText(item),
      });
    });
  } else if (typeof data === 'object' && data !== null) {
    entries.push({
      id: `${idPrefix}`,
      text: objectToText(data),
    });
  }

  return entries;
}

function objectToText(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);

  if (Array.isArray(obj)) {
    return obj.map(objectToText).join(' ');
  }

  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${objectToText(value)}`)
    .join(' | ');
}

export function buildRetriever(documents) {
  return {
    async retrieve(query) {
      const normalized = query.trim().toLowerCase();
      const results = documents
        .map(doc => ({
          ...doc,
          score: scoreDocument(normalized, doc.text.toLowerCase()),
        }))
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score);

      return results.slice(0, 5);
    },
  };
}

function scoreDocument(query, text) {
  if (!query || !text) return 0;
  const tokens = query.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) score += 1;
  }
  return score;
}

// === LangChain-style workflow ===
// Orchestrates retrieval, prompt creation, and LLM generation.

export function buildLangChain(retriever) {
  return {
    async run(query) {
      const hits = await retriever.retrieve(query);
      const context = hits.map(hit => `- ${hit.id}: ${hit.text}`).join('\n\n');
      const prompt = buildPrompt(query, context);
      return generateLLMResponse(prompt);
    },
  };
}

function buildPrompt(query, context) {
  return `You are an English Fantasy game assistant.
Use the game content below to answer the player's question clearly and helpfully.

Game context:
${context || 'No relevant context found.'}

Player question: ${query}

Answer:`;
}

async function generateLLMResponse(prompt) {
  // In a production version, replace this placeholder with a real model API call.
  // Example: return callBackendLLM({ prompt });
  return `[[AI response placeholder]]\n\n${prompt}`;
}

async function callBackendLLM(payload) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text || data.response || '';
}

// === Agent ===
// The agent is the interactive AI persona inside the game.

export class GameAgent {
  constructor(chain) {
    this.chain = chain;
  }

  async respond(playerInput) {
    return this.chain.run(playerInput);
  }

  async explainVocabulary(term) {
    return this.chain.run(`Explain the meaning of the word '${term}' in the context of English Fantasy.`);
  }

  async guideStory(topic) {
    return this.chain.run(`Provide a story-driven description or advice about ${topic} using game data.`);
  }
}

export async function createGameAgent() {
  const documents = await loadGameDocuments();
  const retriever = buildRetriever(documents);
  const chain = buildLangChain(retriever);
  return new GameAgent(chain);
}
