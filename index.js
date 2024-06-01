import express from "express";
import path from "path";
import multer from "multer";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

import { parseBill } from "./middleware/billParser.mjs";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const extName = path.extname(file.originalname); 
      cb(null, file.fieldname + '-' + uniqueSuffix + extName)
    }
})

const upload = multer({ storage: storage })

const app = express();

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET , resave: false, saveUninitialized: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render("index");
})

app.get('/display', (req, res) => {
    res.render("display", { participants: req.session.participants, billImage: req.session.billImage, billJSON: req.session.billJSON});
});

app.post('/', upload.single('billImage'), parseBill, (req, res) => {
    req.session.participants = req.body.participants.filter(participant => participant !== "");
    console.log(req.session.billJSON);
    res.redirect("/display");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    }
);

// handle some of the errors and make it more navigable