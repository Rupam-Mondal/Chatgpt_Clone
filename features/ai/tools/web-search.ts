import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";


const client = tavily({
    apiKey: process.env.TAVILY_API_KEY,
});


export const webSearchTool = tool({
    description: "Search the web for up-to-date information.Use the user's original question as the search query.Do not invent dates, years, or additional constraints unless the user explicitly mentions them. if someone uses current , recent search for the most recent available information.Do not invent years or dates unless the user explicitly mentions them.",
    inputSchema: z.object({
        query: z.string(),
    }),

    execute: async ({ query }) => {
        const response = await client.search(query, {
            maxResults: 5,
        });

        console.log(JSON.stringify(response, null, 2));

        return response;
    }
})