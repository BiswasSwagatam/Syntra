// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import pdf from "pdf-parse";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import cors from "cors";
// import dotenv from "dotenv";

// const app = express();
// const port = process.env.PORT || 3000;
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash",
// });
// // app.use(express.json());

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname +
//         "-" +
//         uniqueSuffix +
//         "." +
//         file.originalname.split(".").pop()
//     );
//   },
// });

// const upload = multer({ storage: storage });

// app.use(cors());

// app.get("/", (req, res) => {
//   res.send("hello");
// });

// app.post("/upload", upload.single("document"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file uploaded");
//   }
//   // res.send("File uploaded");

//   const filePath = req.file.path;
//   const fileExtension = req.file.originalname
//     .split(".")
//     .pop()
//     .toLocaleLowerCase();
//   const question = req.query.question;

//   if (!question) {
//     await fs.unlink(filePath);
//     return res.status(400).send("Please provide a question");
//   }

//   // console.log("Uploaded file path: ", filePath);

//   try {
//     let fileContent = "";

//     if (fileExtension === "txt") {
//       fileContent = await fs.promises.readFile(filePath, "utf-8");
//     } else if (fileExtension === "pdf") {
//       if (fs.existsSync(filePath)) {
//         console.log("File exists before pdf parse");
//       } else {
//         console.log("File does NOT exist before pdf parse");
//       }
//       const dataBuffer = await fs.promises.readFile(filePath);
//       const pdfData = await pdf(dataBuffer);
//       fileContent = pdfData.text;
//     } else {
//       await fs.promises.unlink(filePath);
//       return res
//         .status(400)
//         .send("Invalid file format, only .pdf or .txt allowed");
//     }
//     // console.log("File content: ", fileContent);
//     // res.send("File uploaded successfully");

//     const prompt = `Based on the contents of the following document: ${fileContent}, please answer the question: ${question}`;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const answer = response.candidates[0].content.parts[0].text;

//     console.log("AI Answer: ", answer);
//     res.json({ answer });

//     await fs.promises.unlink(filePath);
//   } catch (error) {
//     console.log("Error processing file: ", error);
//     res.status(500).send("Error processing file");
//     if (fs.existsSync(filePath)) {
//       await fs.promises.unlink(filePath);
//     }
//   }
// });

// app.listen(port, () => {
//   console.log("server is running");
// });

import express from "express";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
app.use(express.json());

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

// Initialize SQLite database
const dbPromise = open({
  filename: "./database.db",
  driver: sqlite3.Database,
});

async function initializeDatabase() {
  try {
    const db = await dbPromise;
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT,
        role TEXT
      );
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT,
        uploader TEXT,
        uploadedAt TEXT
      );
    `);
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1); // Exit if database initialization fails
  }
}
initializeDatabase();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Access Denied: No token provided" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// Middleware to check user role
const checkRole = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: "Access Denied: Insufficient permissions" });
  }
};

app.get("/", (req, res) => {
  res.send("hello");
});

// User registration
app.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = await dbPromise;
    await db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role]
    );
    res.send("User registered");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// File upload (protected route)
app.post(
  "/upload",
  verifyToken,
  checkRole(["CEO", "Manager", "Admin"]),
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const fileExtension = req.file.originalname
        .split(".")
        .pop()
        .toLocaleLowerCase();
      const question = req.query.question;

      if (!question) {
        await fs.unlink(filePath);
        return res.status(400).json({ error: "Please provide a question" });
      }

      let fileContent = "";

      if (fileExtension === "txt") {
        fileContent = await fs.promises.readFile(filePath, "utf-8");
      } else if (fileExtension === "pdf") {
        const dataBuffer = await fs.promises.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        fileContent = pdfData.text;
      } else {
        await fs.promises.unlink(filePath);
        return res
          .status(400)
          .json({ error: "Invalid file format, only .pdf or .txt allowed" });
      }

      const prompt = `Based on the contents of the following document: ${fileContent}, please answer the question: ${question}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answer = response.candidates[0].content.parts[0].text;

      console.log("AI Answer: ", answer);
      res.json({ answer });

      await fs.promises.unlink(filePath);

      const db = await dbPromise;
      await db.run(
        "INSERT INTO files (fileName, uploader, uploadedAt) VALUES (?, ?, ?)",
        [req.file.originalname, req.user.username, new Date().toISOString()]
      );
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Error processing file" });
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }
);

// File deletion (protected route)
app.delete(
  "/files/:fileName",
  verifyToken,
  checkRole(["CEO", "Admin"]),
  async (req, res) => {
    try {
      const fileName = req.params.fileName;
      const db = await dbPromise;
      const result = await db.run("DELETE FROM files WHERE fileName = ?", [
        fileName,
      ]);
      if (result.changes === 0) {
        return res.status(404).json({ error: "File not found" });
      }
      res.send("File deleted");
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Error deleting file" });
    }
  }
);

//View files (protected route)
app.get(
  "/files",
  verifyToken,
  checkRole(["CEO", "Manager", "Admin", "Worker"]),
  async (req, res) => {
    try {
      const db = await dbPromise;
      const files = await db.all("SELECT * FROM files");
      res.json(files);
    } catch (error) {
      console.error("File view error:", error);
      res.status(500).json({ error: "Error viewing files" });
    }
  }
);

app.listen(port, () => {
  console.log("server is running");
});
