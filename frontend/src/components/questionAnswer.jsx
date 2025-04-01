import React from "react";
import ReactMarkdown from "react-markdown";

function QuestionAnswer({ answer }) {
  return (
    answer && (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h2 className="text-lg font-semibold text-gray-800">AI Answer:</h2>
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>
    )
  );
}

export default QuestionAnswer;

