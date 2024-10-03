import { GoogleGenerativeAI } from "@google/generative-ai";
import { ocrSpace } from "ocr-space-api-wrapper";
import dotenv from 'dotenv'

// dotenv shenanigans
dotenv.config()

// Gemini Shenanigans
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);
const model = genAI.getGenerativeModel({model:"gemini-pro"})

export async function createJSON(req, res, next) {

    // Extract the text using OCR
    const extractedText = await extractText(req.session.billImage)

    const prompt = `
  Given the extracted text from a bill Image below (so they might contain astray characters), generate a json file with the following structure:

  ignore any negative values present in the bill and dont put it in the json file.

  Anything within the parantheses brackets must be stricly followed while generating the json file.

  (Give the response in plain text and without any wrapper)
  Fill in values that are not available or that seem wrong by analysing the entire bill and the structure of the bill. You can calculate the values
  from the grand total and other parameters present in the bill.

  (STRICTLY FOLLOW THE JSON FORMAT AT ANY COSTS)

  {
    "items": [
    {
      itemName: <Item Name> (if the item name is split into multiple lines, join them with a space)
      price: <Rate per item> (check from the bill structure whether its the total rate or rate per item),
      quantity: <Quantity> (if quantity is not present put the value as empty string in the json file),
      total: <Amount> (check from the bill structure whether its the total amount or amount per item)
    },
    {
      itemName: <Item Name>,
      price: <Rate per item>,
      quantity: <Quantity>,
      total: <Amount>
    }
    ],
    "tax": {each tax should be a separate key-value pairm, even if there is only one put it into its own key value pair},
    "serviceCharge": <Service Charge> (if service charge is not present put the value as 0 in the json file),
    "grandTotal": <Grand Total> (<Grand Total> should be equal to the sum of all the items and taxes)
  }

  Example JSON:
    {
        "items": [
        {
        itemName: "Item 1",
        price: "100",
        quantity: "2",
        total: "200"
        },
        {
        itemName: "Item 2",
        price: "50",
        quantity: "1",
        total: "50"
        }
        ],
        "tax": {
        "CGST": "10",
        "SGST": "10"
        },
        "grandTotal": "260"
    }

    The extracted text from the bill image is given below:
  ${extractedText}
  `;


    // Send the prompt to Gemini
    const result = await model.generateContent(prompt);
    req.session.billJSON = JSON.parse(result.response.text())
    console.log(req.session.billJSON)
    console.log("\nbillJSON generated")
    next()
}


async function extractText(base64String) {
    try {
        const ocrResponse = await ocrSpace(`data:image/png;base64,${base64String}`,
                                    { apiKey: process.env.OCR_API_KEY, scale: true, isTable: true, OCREngine: 2 });
        // req.session.extractedText = ocrResponse.ParsedResults.map(({ParsedText}) => ParsedText)
        const extractedText = ocrResponse.ParsedResults.map(({ParsedText}) => ParsedText)
        console.log("Text extracted\n")
        return extractedText[0];
    } catch (error) {
        console.log(error)
    }
}
