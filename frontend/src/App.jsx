import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import FileList from "./components/fileList";
import QuestionAnswer from "./components/questionAnswer";
import UploadForm from "./components/uploadForm";
import HomePage from "./components/homePage";
import { ClipLoader } from "react-spinners";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchFiles();
    }
  }, [token]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get("https://syntra.onrender.com/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching files:", error);
      setError(
        error.response?.data?.error ||
          "Failed to fetch files. Please try again."
      );
    }
  };

  const handleDelete = async (fileName) => {
    try {
      await axios.delete(`https://syntra.onrender.com/files/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchFiles();
      setError("");
    } catch (error) {
      console.error("Error deleting file:", error);
      setError(
        error.response?.data?.error ||
          "Failed to delete file. Please try again."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please upload a file");
      return;
    }
    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    setIsLoading(true);
    setAnswer("");
    setError("");

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await axios.post(
        `https://syntra.onrender.com/upload?question=${encodeURIComponent(
          question
        )}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnswer(response.data.answer);
      fetchFiles();
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Something went wrong. Make sure the document uploaded are in .pdf or .txt format"
      );
      console.log("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = ["text/plain", "application/pdf"];
      const allowedExtensions = ["txt", "pdf"];
      const fileExtension = file.name.toLowerCase().split(".").pop();

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(`.${fileExtension}`)
      ) {
        setError("Invalid file format, only .pdf or .txt allowed");
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
      setError("");
      setSelectedFile(file);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage token={token} />} />
      <Route path="/login" element={<Login setToken={setToken} />} />
      <Route path="/register" element={<Register />} />
      {token ? (
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen bg-gray-100 p-4">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl mb-5 drop-shadow-lg font-semibold text-gray-800">
                    AI-Powered Document Assistant ✨
                    <p className="text-gray-600 text-sm">
                      Upload and ask questions about your documents
                    </p>
                  </h1>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Logout
                  </button>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <UploadForm
                  selectedFile={selectedFile}
                  question={question}
                  isLoading={isLoading}
                  handleSubmit={handleSubmit}
                  handleFileChange={handleFileChange}
                  handleQuestionChange={handleQuestionChange}
                />
                {isLoading && (
                  <div className="flex flex-col justify-center items-center mt-4">
                    <ClipLoader color="#1A56DB" size={30} />
                    <p className="italic text-gray-600">
                      Please wait, AI is processing your request
                    </p>
                  </div>
          )}
        />
      ) : (
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default RootApp;
