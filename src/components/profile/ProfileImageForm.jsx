import { useEffect, useState } from "react";

import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";

function ProfileImageForm({ onUploadProfilePicture, loading = false }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setImage(null);
      setPreviewUrl("");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      setImage(null);
      setPreviewUrl("");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Image must be less than 5MB");
      setImage(null);
      setPreviewUrl("");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImage(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!image) {
      setError("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", image);

    for (const [key, value] of formData.entries()) {
  console.log("FormData:", key, value);
}

    const success = await onUploadProfilePicture(formData);

    if (success) {
      setImage(null);
      setPreviewUrl("");
      e.target.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload Profile Picture</h2>

      <ErrorMessage message={error} />

      <label htmlFor="profilePicture">Profile Picture</label>


      <input 
      id="profilePicture"
      name="profilePicture" 
      type="file" 
      accept="image/*" 
      onChange={handleFileChange} 
      />

      {previewUrl && (
        <div>
          <p>Preview:</p>
          <img
            src={previewUrl}
            alt="Selected profile preview"
            width="150"
          />
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload Profile Picture"}
      </Button>
    </form>
  );
}

export default ProfileImageForm;