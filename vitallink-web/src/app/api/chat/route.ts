import { google } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';
import { knowledge } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userQuery = messages[messages.length - 1].content;

    const searchPrompt = `You are an expert semantic search system for the VitalLink knowledge base.
    Your task is to find the most relevant facts to answer the user's question.

    <user_question>
    ${userQuery}
    </user_question>

    <knowledge_base>
    ${knowledge.map(item => `ID: ${item.id}\nCONTENT: ${item.content}`).join('\n\n')}
    </knowledge_base>

    Analyze the user's question and the knowledge base. Return a comma-separated list of the IDs of the top 3 most relevant facts.
    Respond with ONLY the IDs and nothing else. Your response must be in the format: "vlk-001,vlk-003,vlk-005"`;

    const { text: relevantIdsText } = await generateText({
      model: google('models/gemini-1.5-pro-latest'),
      prompt: searchPrompt,
    });

    const relevantIds: string[] = relevantIdsText.match(/vlk-\d{3}/g) || [];
    const context = knowledge
      .filter(item => relevantIds.includes(item.id))
      .map(item => item.content)
      .join('\n\n');

    const systemPrompt = `You are a specialized AI assistant for VitalLink.
    You MUST answer the user's question based ONLY on the context provided below.
    - If the context contains the answer, formulate a clear, helpful response based on it.
    - If the context does not contain the answer, you MUST say "I do not have enough information about VitalLink to answer that question."
    - Do not use any prior knowledge. Do not make up information. Be concise and professional.

    <context>
    ${context || "No context provided."}
    </context>
    `;
    
    const result = await streamText({
      model: google('models/gemini-1.5-pro-latest'),
      system: systemPrompt,
      messages,
    });

    return result.toAIStreamResponse();

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'An error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}