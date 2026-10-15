// src/services/gemini.ts

export async function askGeminiAI(userPrompt: string): Promise<string> {
  try {
    // FIX: Updating the pipeline route string to match your verified live URL
    const response = await fetch("https://level-up-production-5a76.up.railway.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.reply; // Returns the text response back to your component
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return "Sorry, something went wrong processing your request.";
  }
}
