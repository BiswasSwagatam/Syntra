import React from "react";

function UploadForm({
  selectedFile,
  question,
  isLoading,
  handleSubmit,
  handleFileChange,
  handleQuestionChange,
}) {
  return (
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
  );
}

export default UploadForm;
