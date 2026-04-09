const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Note: There isn't a direct listModels in the client SDK like this, 
    // but we can test a common model and it will error if unavailable.
    // Actually, we can use the fetch API to call the models endpoint.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Available Models:");
    data.models?.forEach(m => {
        if (m.name.includes("gemini")) {
            console.log(`- ${m.name.split('/').pop()} (DisplayName: ${m.displayName})`);
        }
    });
  } catch (error) {
    console.error("Error fetching models:", error.message);
  }
}

listModels();
