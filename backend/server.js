import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
// app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({ storage: storage });

app.use(cors());

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/upload", upload.single("document"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  // res.send("File uploaded");

  const filePath = req.file.path;
  const fileExtension = req.file.originalname
    .split(".")
    .pop()
    .toLocaleLowerCase();
  const question = req.query.question;

  if (!question) {
    await fs.unlink(filePath);
    return res.status(400).send("Please provide a question");
  }

  // console.log("Uploaded file path: ", filePath);

  try {
    let fileContent = "";

    if (fileExtension === "txt") {
      fileContent = await fs.promises.readFile(filePath, "utf-8");
    } else if (fileExtension === "pdf") {
      if (fs.existsSync(filePath)) {
        console.log("File exists before pdf parse");
      } else {
        console.log("File does NOT exist before pdf parse");
      }
      const dataBuffer = await fs.promises.readFile(filePath);
      const pdfData = await pdf(dataBuffer);
      fileContent = pdfData.text;
    } else {
      await fs.promises.unlink(filePath);
      return res
        .status(400)
        .send("Invalid file format, only .pdf or .txt allowed");
    }
    // console.log("File content: ", fileContent);
    // res.send("File uploaded successfully");

    const prompt = `Based on the contents of the following document: ${fileContent}, please answer the question: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.candidates[0].content.parts[0].text;

    console.log("AI Answer: ", answer);
    res.json({ answer });

    await fs.promises.unlink(filePath);
  } catch (error) {
    console.log("Error processing file: ", error);
    res.status(500).send("Error processing file");
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
});

app.listen(port, () => {
  console.log("server is running");
});
