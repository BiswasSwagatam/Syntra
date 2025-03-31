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
        `https://syntra.onrender.com/upload?question=${encodeURIComponent(question)}`,
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

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
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
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload a document (.pdf or .txt):
            </label>
            <input
              type="file"
              accept=".pdf, .txt"
              onChange={handleFileChange}
              className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ask a question:
            </label>
            <input
              type="text"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Enter your question here"
              className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Ask AI
          </button>
        </form>
        {isLoading && <p className="text-gray-600 italic">Loading...</p>}
        {answer && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800">AI Answer:</h2>
            <p className="text-gray-700">{answer}</p>
          </div>
        )}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Uploaded Files:
          </h2>
          <ul>
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between py-2 border-b border-gray-200"
              >
                <div>
                  {file.fileName} - Uploaded by: {file.uploader} - Uploaded at:{" "}
                  {file.uploadedAt}
                </div>
                <button
                  onClick={() => handleDelete(file.fileName)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
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
