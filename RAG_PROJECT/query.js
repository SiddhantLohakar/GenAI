import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings,ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

dotenv.config();

// configuration
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-embedding-001',
});


const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',  
    temperature: 0.3, 
});

// configure Pinecone
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);


const history = [];

async function chatting(question) {
    

    // intent model ko introduce: Homework


    // question ki embedding create karna hai
    const queryVector = await embeddings.embedQuery(question);  

    // embeddig aagyi, uske baad usko vectorDB ke andar search karna, top10
    const searchResults = await pineconeIndex.query({
    topK: 10,
    vector: queryVector,
    includeMetadata: true,
    });


    const context = searchResults.matches
                   .map(match => match.metadata.text)
                   .join("\n\n---\n\n");


    // console.log(searchResults);


    // top10+question isko mein llm ko de dunga

    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant answering questions based on the provided documentation.

Context from the documentation:
{context}

Question: {question}

Instructions:
- Answer the question using ONLY the information from the context above
- Consider the conversation history for context
- If the answer is not in the context, say "I don't have enough information to answer that question."
- Be concise and clear
- Use code examples from the context if relevant

Answer:
        `);


        const chain = RunnableSequence.from([
            promptTemplate,
            model,
            new StringOutputParser(),
        ]);

        // Step 6: Invoke the chain and get the answer
        const answer = await chain.invoke({
            context: context,
            question: question,
            chat_history: history
        }); 
       

        history.push(HumanMessage(question));
        history.push(AIMessage(answer))

        if(history.length > 10){
            history.splice(0, 2)
        }

        console.log(answer);


    // Output create kar dunga
}


async function main(){
   const userProblem = readlineSync.question("Ask me anything--> ");
   if(userProblem.toLocaleLowerCase() == "exit")
    return;
   await chatting(userProblem);
   main();
}


main();