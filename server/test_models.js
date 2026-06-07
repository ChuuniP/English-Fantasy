require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing with API key:', apiKey ? (apiKey.substring(0, 10) + '...') : 'none');
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-latest'];
  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello' }] }] })
      });
      console.log(`Model ${model}: status ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Success! Response:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
        break;
      } else {
        const err = await response.text();
        console.log(`Error detail for ${model}:`, err);
      }
    } catch (e) {
      console.log(`Error testing ${model}:`, e.message);
    }
  }
}
test();
