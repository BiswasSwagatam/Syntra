import { useState } from "react";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please upload a file");
      return;
    }
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setIsLoading(true);
    setAnswer("");

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await axios.post(
        `http://localhost:3000/upload?question=${encodeURIComponent(question)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAnswer(response.data.answer);
    } catch (error) {
      setAnswer(
        "Something went wrong, make sure the document uploaded are in .pdf or .txt format"
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
        alert("Invalid file format, only .pdf or .txt allowed");
        setSelectedFile(null);
        e.target.value = "";
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 sm:py-12 lg:py-24">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          AI-Powered Document Assistant
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
        >
          <div className="mb-4">
            <label
              htmlFor="document"
              className="block text-gray-700 text-sm font-black mb-2"
            >
              Upload a document (.pdf or .txt):
            </label>
            <input
              type="file"
              id="document"
              accept=".pdf, .txt"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="question"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Ask a question:{" "}
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Enter a question here"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            Ask AI
          </button>
        </form>
        {isLoading && <p className="text-gray-600 italic mt-4">Loading...</p>}
        {answer && (
          <div className="mt-8 p-6 bg-gray-50 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              AI Answer:
            </h2>
            <p className="text-gray-700">{answer}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
