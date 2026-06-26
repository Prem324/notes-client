import { useState } from "react";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";

function AttachmentForm({ onUploadAttachments, loading = false }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const selectedFiles = Array.from(e.target.files);

    setFiles(selectedFiles);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    if (files.length > 5) {
      setError("You can upload maximum 5 files");
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("attachments", file);
    });

    const success = await onUploadAttachments(formData);

    if (success) {
      setFiles([]);
      e.target.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload Attachments</h2>

      <ErrorMessage message={error} />

      <label htmlFor="attachments">Attachments</label>

      <input
        id="attachments"
        name="attachments"
        type="file"
        multiple
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <div>
          <p>Selected files:</p>
          <ul>
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`}>
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload Attachments"}
      </Button>
    </form>
  );
}

export default AttachmentForm;