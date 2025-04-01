import React from "react";

function FileList({ files, handleDelete }) {
  return (
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
  );
}

export default FileList;
