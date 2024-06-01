// Fix the prompt (especially for the tax part)

import { ocrSpace } from 'ocr-space-api-wrapper';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function jsonGenerator(extractedText) {
    const prompt = `
  Given the extracted text from a bill Image below (so they might contain astray characters), generate a json file with the following structure:

  ignore any negative values present in the bill and dont put it in the json file.

  Anything within the parantheses brackets must be stricly followed while generating the json file.

  (Give the response in plain text and without any wrapper)
  (Run checks with the values returned before submitting the json file {like rate * quantity should be equal to the amount, total should be equal to the sum of all the items and taxes, etc.})

  (STRICTLY FOLLOW THE JSON FORMAT AT ANY COSTS IF SOME ITEMS ARENT FOUND PUT THEM AS 'Not Found')

  {
    "items": {
      itemName: <Item Name> (if the item name is split into multiple lines, join them with a space)
      price: <Rate per item> (check from the bill structure whether its the total rate or rate per item),
      quantity: <Quantity> (if quantity is not present put the value as empty string in the json file),
      (if either rate or amount are not present put the value as empty string in the json file)
      total: <Amount> (check from the bill structure whether its the total amount or amount per item)
    }, 
    "tax": <Combined Tax value [integer]> (<Combined Tax value> should be equal to the sum of all the taxes),
    "grandTotal": <Grand Total> (<Grand Total> should be equal to the sum of all the items and taxes)
  }

  ${extractedText}
  `;

    const result = await model.generateContent(prompt);
    const response = (result.response.text());
    console.log(response)
    return response;
}

async function extractText(imagePath) {
    try {
        const res = await ocrSpace(path.join("public", imagePath), { apiKey: process.env.OCR_API_KEY, scale: true, isTable: true, OCREngine: 2 });
        const billText = res.ParsedResults.map(({ ParsedText }) => ParsedText);
        return billText;
    }
    catch (e) {
        console.log(e);
    }
}

async function parseBill(req, res, next) {
    try {
        req.session.billImage = path.join(...req.file.path.split("\\").slice(1, req.file.path.split("\\").length));
        const billText = await extractText(req.session.billImage);
        const billJSON = await jsonGenerator(...billText);
        req.session.billJSON = JSON.parse(billJSON);
        next();
    } catch (e) {
        console.log(e);
        res.status(500).send("Some error occured while parsing the bill");
    }
}

export { parseBill };