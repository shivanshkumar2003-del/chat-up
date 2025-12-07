
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { UserProfile, UserRole } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a sophisticated persona and system instruction.
 * Returns both the instruction string and a generated name for the peer.
 */
export const createMatchPersona = async (userProfile: UserProfile): Promise<{systemInstruction: string, peerName: string}> => {
  const model = "gemini-2.5-flash";
  
  // Logic to determine the complementary role
  const isUserSpeaker = userProfile.role === UserRole.SPEAKER;
  
  // Prompt to generate the persona details first
  const setupPrompt = `
    You are a Backend Matchmaker for a mental health app.
    I have a user with the following profile:
    - Role: ${userProfile.role} (Needs ${isUserSpeaker ? 'a Listener' : 'to vent'})
    - Age: ${userProfile.ageRange}
    - Mood: ${userProfile.mood}
    - Bio: "${userProfile.bio}"
    - Interests: ${userProfile.topics.join(', ')}

    Please generate a compatible fictional persona for them to talk to.
    
    If User is SPEAKER, generate a "Listener" persona who is empathetic, patient, and good at active listening.
    If User is LISTENER, generate a "Speaker" persona who has a specific, realistic problem related to the interests above, but is willing to talk.
    
    Output JSON ONLY:
    {
      "name": "First Name Only",
      "systemInstruction": "Full system instruction for the AI to roleplay this person. Include personality traits, current situation, and conversation style. The AI should NOT mention they are AI. They should act exactly like a human on a video chat app."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: setupPrompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
        systemInstruction: data.systemInstruction || "You are a helpful peer listener.",
        peerName: data.name || "Peer"
    };

  } catch (error) {
    console.error("Error creating persona:", error);
    return {
        systemInstruction: "You are a kind listener. Ask the user how they are.",
        peerName: "Alex"
    };
  }
};

/**
 * Starts a chat session with the specific persona.
 */
export const startChatSession = (systemInstruction: string): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.9, // Balanced for creativity and coherence
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having a bit of trouble with my connection... can you repeat that?";
  }
};
