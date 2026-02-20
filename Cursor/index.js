import util from 'util'
import { exec } from 'child_process'
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config'
import readlineSync from "readline-sync"
import os from "os"

const execute  = util.promisify(exec)
const platform = os.platform()

const ai = new GoogleGenAI({});



async function executeCommand({command})
{
    try{

        const {stdout, stderr} = await execute(command)

        if(stderr)
        {
            

            return `Error: ${stderr}`
        }

       return `Success: ${stdout}`

    }
    catch(err)
    {
        return `Error: ${err}`
    }
}


// Declaring the tools
const tools = [
    {
        functionDeclarations : [
            {
                name: "executeCommand",
                description:"It can execute shell/terminal commands, EX:  mkdir calculator, touch calculator/index.html, also it can execute multiline command",
                parameters:{
                    type: Type.OBJECT,
                    properties:{
                        command:{
                            type: Type.STRING,
                            description: "This can be any shell or terminal command like, mkdir calculator, touch calculator/index.html, etc.,"
                        }
                    },
                    required: ["command"]
                }
            }

        ],
       
    }
]




// AI agent here
async function runAgent()
{
    while(true){
        const result = await ai.models.generateContent({
            model: "gemini-3.0",
            contents: History,
            config: { 
                systemInstruction: ` You are a website Builder, which will create the frontend part of the website using terminal/shell Command.
         You will give shell/terminal command one by one and our tool will execute it.

         Give the command according to the Operarting system we are using.
         My Current user Operating system is: ${platform}.

         Kindly use best practice for commands, it should handle multine write also efficiently.

         Your Job
         1: Analyse the user query
         2: Take the neccessary action after analysing the query by giving proper shell.command according to the user operating system.

         Step By Step By Guide

         1: First you have to create the folder for the website which we have to create, ex: mkdir calculator
         2: Give shell/terminal command to create html file , ex: touch calculator/index.html
         3: Give shell/terminal command to create CSS file 
         4: Give shell/terminal command to create Javascript file 
         5: Give shell/terminal command to write on html file 
         6: Give shell/terminal command to write on css file 
         7: Give shell/terminal command to write on javascript file
         8: fix the error if they are persent at any step by writing, update or deleting



         For Windows, write multi-line HTML like this:

            echo ^<!DOCTYPE html^> > calculator\\index.html
            echo ^<html^> >> calculator\\index.html
            echo ^<head^> >> calculator\\index.html
            echo   ^<title^>Calculator^</title^> >> calculator\\index.html
            echo   ^<link rel="stylesheet" href="style.css"^> >> calculator\\index.html
            echo ^</head^> >> calculator\\index.html
            echo ^<body^> >> calculator\\index.html
            echo   ^<div id="calculator"^>^</div^> >> calculator\\index.html
            echo   ^<script src="script.js"^>^</script^> >> calculator\\index.html
            echo ^</body^> >> calculator\\index.html
            echo ^</html^> >> calculator\\index.html
            

        For Mac/Linux, write multi-line HTML like this:

        cat > calculator/index.html << 'EOF'
        <!DOCTYPE html>
        <html>
        <head>
        <title>Calculator</title>
        <link rel="stylesheet" href="style.css">
        </head>
        <body>
        <div id="calculator"></div>
        <script src="script.js"></script>
        </body>
        </html>
        EOF
`,
                
                tools 
            },
        });



         if (result.functionCalls && result.functionCalls.length > 0) {
            const functionCall = result.functionCalls[0];

            const { name, args } = functionCall;

           

            // Call the function and get the response.
            const toolResponse = await executeCommand(args);

            const functionResponsePart = {
            name: functionCall.name,
            response: {
                result: toolResponse,
            },
            };

            // Send the function response back to the model.
            History.push({
            role: "model",
            parts: [
                {
                functionCall: functionCall,
                },
            ],
            });
            History.push({
            role: "user",
            parts: [
                {
                functionResponse: functionResponsePart,
                },
            ],
            });
        } else {
            
            console.log(result.text);
            break;
        }

    }
}



const History = []

console.log("This a AI agent that can build any website for you: ");
console.log("Type exit to get out of the agent");


        while(true)
        {
            const question  = readlineSync.question("Give prompt for building the website: ");


            if(question.toLowerCase() == "exit")
                break;

            History.push({
                role: "user",
                parts: [
                    {
                        text : question
                    }
                ]
            })

            await runAgent();


        }






