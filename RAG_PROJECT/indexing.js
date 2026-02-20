import  dotenv from 'dotenv';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
dotenv.config();


const PDF_PATH = './NodeJS.pdf';
const pdfLoader = new PDFLoader(PDF_PATH);
const rawDocs = await pdfLoader.load();


console.log(JSON.stringify(rawDocs, null, 2));
console.log(rawDocs.length)