import mongoose from "mongoose"

async function main()
{       
        await mongoose.connect(process.env.DATABASE_URL + "Chatbot");
}

export default main;
