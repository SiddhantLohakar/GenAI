import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs/promises';
import path from 'path';
import readlineSync from 'readline-sync';
import 'dotenv/config';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});


const BASE_DIR = path.join(process.cwd(), 'projects');


// Function to initialize the base directory
async function initializeBaseDirectory() {
  try {
    await fs.mkdir(BASE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to initialize base directory:', error.message);
    process.exit(1);
  }
}


//  Function to create any directrory
async function createDirectory({ directoryPath }) {
  try {
    const fullPath = path.join(BASE_DIR, directoryPath);
    await fs.mkdir(fullPath, { recursive: true });
    return {
      success: true,
      message: `Directory created successfully: ${directoryPath}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create directory: ${error.message}`
    };
  }
}


// function to create file
async function createFile({ filePath, content = '' }) {
  try {
    const fullPath = path.join(BASE_DIR, filePath);
    const directory = path.dirname(fullPath);
    

    await fs.mkdir(directory, { recursive: true });
    
    
    await fs.writeFile(fullPath, content, 'utf-8');
    
    return {
      success: true,
      message: `File created successfully: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create file: ${error.message}`
    };
  }
}


// Function to write withing a file
async function writeFile({ filePath, content }) {
  try {
    const fullPath = path.join(BASE_DIR, filePath);
    await fs.writeFile(fullPath, content, 'utf-8');
    
    return {
      success: true,
      message: `Content written successfully to: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to write to file: ${error.message}`
    };
  }
}


// Function to append content inside of a file
async function appendFile({ filePath, content }) {
  try {
    const fullPath = path.join(BASE_DIR, filePath);
    await fs.appendFile(fullPath, content, 'utf-8');
    
    return {
      success: true,
      message: `Content appended successfully to: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to append to file: ${error.message}`
    };
  }
}


// Function to readFile
async function readFile({ filePath }) {
  try {
    const fullPath = path.join(BASE_DIR, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    return {
      success: true,
      message: 'File read successfully',
      content: content
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to read file: ${error.message}`,
      content: null
    };
  }
}



// Function to update the file
async function updateFile({ filePath, content }) {
  try {
    const fullPath = path.join(BASE_DIR, filePath);
    
  
    await fs.access(fullPath);
    
 
    await fs.writeFile(fullPath, content, 'utf-8');
    
    return {
      success: true,
      message: `File updated successfully: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update file: ${error.message}`
    };
  }
}


// Function to delete a file
async function deleteFile({ filePath }) {
  try {
    const fullPath = path.join(BASE_DIR, filePath);
    await fs.unlink(fullPath);
    
    return {
      success: true,
      message: `File deleted successfully: ${filePath}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete file: ${error.message}`
    };
  }
}

// Listing file paths
async function listDirectory({ directoryPath = '.' }) {
  try {
    const fullPath = path.join(BASE_DIR, directoryPath);
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    
    const fileList = files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory()
    }));
    
    return {
      success: true,
      message: 'Directory listed successfully',
      files: fileList
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to list directory: ${error.message}`,
      files: []
    };
  }
}



const tools = [
  {
    name: "createDirectory",
    description: "Creates a new directory at the specified path. Use this to create project folders.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        directoryPath: {
          type: Type.STRING,
          description: "Relative path for the directory to create (e.g., 'calculator', 'portfolio/images')"
        }
      },
      required: ['directoryPath']
    }
  },
  {
    name: "createFile",
    description: "Creates a new file at the specified path with optional initial content.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "Relative path for the file to create (e.g., 'calculator/index.html')"
        },
        content: {
          type: Type.STRING,
          description: "Initial content for the file (optional)"
        }
      },
      required: ['filePath']
    }
  },
  {
    name: "writeFile",
    description: "Writes content to a file, replacing any existing content. Use this to write HTML, CSS, or JavaScript code.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "Relative path to the file (e.g., 'calculator/index.html')"
        },
        content: {
          type: Type.STRING,
          description: "Content to write to the file"
        }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: "appendFile",
    description: "Appends content to an existing file without replacing current content.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "Relative path to the file"
        },
        content: {
          type: Type.STRING,
          description: "Content to append"
        }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: "readFile",
    description: "Reads and returns the content of a file. Use this to check existing code or debug issues.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "Relative path to the file to read"
        }
      },
      required: ['filePath']
    }
  },
  {
    name: "updateFile",
    description: "Updates an existing file with new content. Similar to writeFile but explicitly for updates.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "Relative path to the file to update"
        },
        content: {
          type: Type.STRING,
          description: "New content for the file"
        }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: "deleteFile",
    description: "Deletes a file at the specified path. Use with caution.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "Relative path to the file to delete"
        }
      },
      required: ['filePath']
    }
  },
  {
    name: "listDirectory",
    description: "Lists all files and directories in the specified directory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        directoryPath: {
          type: Type.STRING,
          description: "Relative path to the directory to list (defaults to root)"
        }
      },
      required: []
    }
  }
];


const functionExecutors = {
  createDirectory,
  createFile,
  writeFile,
  appendFile,
  readFile,
  updateFile,
  deleteFile,
  listDirectory
};


const conversationHistory = [];


async function buildWebsite() {
  const maxIterations = 50; 
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationHistory,
        config: {
          systemInstruction: `You are an expert website builder AI that creates frontend websites using file operations.

IMPORTANT RULES:
1. You MUST use the provided functions to create, read, write, update, and delete files
2. You are NOT allowed to use terminal commands directly
3. All file paths should be relative to the project directory
4. Create one file at a time and verify success before proceeding

WORKFLOW:
1. Analyze the user's request carefully
2. Plan the website structure (folders and files needed)
3. Create the project directory first
4. Create necessary files (HTML, CSS, JavaScript)
5. Write content to each file using writeFile function
6. If errors occur, read the file, identify issues, and update accordingly
7. Always provide a completion message when done

BEST PRACTICES:
- Use semantic HTML5
- Write clean, commented code
- Ensure CSS is organized and responsive
- Make JavaScript modular and error-free
- Create proper file structure (separate HTML, CSS, JS)
- Use modern web development standards

AVAILABLE FUNCTIONS:
- createDirectory: Create project folders
- createFile: Create empty files
- writeFile: Write complete content to files
- readFile: Read file content to check or debug
- updateFile: Update existing files
- deleteFile: Remove files if needed
- listDirectory: View directory contents

FILE STRUCTURE EXAMPLE:
project-name/
  ├── index.html
  ├── styles.css
  ├── script.js
  └── assets/
      └── images/

When you complete the website, provide a summary of what was created.`,

          tools: [{
            functionDeclarations: tools
          }]
        }
      });

      
      if (result.functionCalls && result.functionCalls.length > 0) {
        const functionCall = result.functionCalls[0];
        const { name, args } = functionCall;

        
        console.log(`\n Executing: ${name}`);
        console.log(`   Parameters:`, JSON.stringify(args, null, 2));

       
        const executor = functionExecutors[name];
        if (!executor) {
          throw new Error(`Unknown function: ${name}`);
        }

        const toolResponse = await executor(args);
        
        
        if (toolResponse.success) {
          console.log(`    ${toolResponse.message}`);
        } else {
          console.log(`   ${toolResponse.message}`);
        }

       
        conversationHistory.push({
          role: "model",
          parts: [{
            functionCall: functionCall
          }]
        });

       
        conversationHistory.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: toolResponse
            }
          }]
        });

      } else {
        
        console.log('\n✨ ' + result.text);
        
        conversationHistory.push({
          role: "model",
          parts: [{ text: result.text }]
        });
        
        break;
      }

    } catch (error) {
      console.error('\n Error during execution:', error.message);
      
      
      conversationHistory.push({
        role: "user",
        parts: [{
          text: `An error occurred: ${error.message}. Please handle this error and continue.`
        }]
      });
      
      break;
    }
  }

  if (iteration >= maxIterations) {
    console.log('\n  Maximum iterations reached. The website building process has been stopped.');
  }
}


async function main() {
  console.log(' Website Builder AI');
  console.log('=====================');
  console.log(` Projects will be created in: ${BASE_DIR}`);
  console.log('Type "exit" to quit\n');

  await initializeBaseDirectory();

  while (true) {
    try {
      const question = readlineSync.question('\n What website would you like to build? ');

      if (question.toLowerCase().trim() === 'exit') {
        console.log('\n Goodbye!');
        break;
      }

      if (!question.trim()) {
        console.log('  Please provide a valid request.');
        continue;
      }

      
      conversationHistory.push({
        role: 'user',
        parts: [{ text: question }]
      });

     
      await buildWebsite();

    } catch (error) {
      console.error('\n Unexpected error:', error.message);
      console.log('Please try again or type "exit" to quit.');
    }
  }
}


process.on('uncaughtException', (error) => {
  console.error('\n Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


main().catch(error => {
  console.error('\n Fatal error:', error.message);
  process.exit(1);
});