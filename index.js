import express from 'express';
import multer from 'multer';
import session from 'express-session'
import dotenv from 'dotenv'
import { createJSON } from './middleware/billParser.mjs';

const app = express()

// Dotenv shenanigans
dotenv.config()

// Multer shenanigans
const storage = multer.memoryStorage()
const upload = multer({storage : storage})

// Session Storage shenanigans
app.use(session({
    secret : process.env.SESSION_SECRET,
    saveUninitialized : true,
    cookie : {secure : true},
    resave : false,
    cookie : {secure : false}
}))

app.set("view engine", "ejs");
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/", upload.single('billImage') ,(req, res) => {
    console.log("\nNew Bill Initiated")
    try {
        req.session.billImage = req.file.buffer.toString('base64');
        console.log("Bill Successfully Uploaded")
        res.redirect("/display")
    } catch (error) {
        console.log(error);
        res.status(500)
        res.send("Internal Server Error")
    }
})

app.get("/display", createJSON, (req, res) => {
    res.render("display", {billImage : req.session.billImage, billJSON : req.session.billJSON})
})

app.get("/split", (req, res) => {
    res.send("Split page for choosing who ate what")
})

app.listen(3000, () => {
    console.log("Server started on PORT 3000")
})
