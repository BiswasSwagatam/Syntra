import React from "react";

function QuestionAnswer({ answer }) {
  return (
    answer && (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h2 className="text-lg font-semibold text-gray-800">AI Answer:</h2>
        <p className="text-gray-700">{answer}</p>
      </div>
    )
  );
}

export default QuestionAnswer;
