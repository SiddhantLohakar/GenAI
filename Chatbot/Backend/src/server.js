import express from  "express"
import dotenv from "dotenv"
import main from "./Configuration/database.js"


dotenv.config();

const PORT = process.env.PORT;
const app = express();


async function initializeServer()
{
    try{

        
        await main();
        console.log("Database connected successfully");

        app.listen(PORT, ()=>{
        console.log(`Server listening on port ${PORT}`);
        })
    }catch(err){
        console.log("Error initializing the server", err);
    }

    
}

initializeServer();