import { useForm } from "react-hook-form";

import Button from "../common/Button";

function AttachmentForm({ onUploadAttachments, loading = false }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const selectedFiles = watch("attachments");

  async function handleFormSubmit(data) {
    const formData = new FormData();

    Array.from(data.attachments).forEach((file) => {
      formData.append("attachments", file);
    });

    const success = await onUploadAttachments(formData);

    if (success) {
      reset();
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h2>Upload Attachments</h2>

      <label htmlFor="attachments">
        Attachments
      </label>

      <input
        id="attachments"
        type="file"
        multiple
        {...register("attachments", {
          validate: {
            required: (files) =>
              files?.length > 0 ||
              "Please select at least one file",

            maxFiles: (files) =>
              files?.length <= 5 ||
              "You can upload maximum 5 files",
          },
        })}
      />

      {errors.attachments && (
        <p className="field-error">
          {errors.attachments.message}
        </p>
      )}

      {selectedFiles?.length > 0 && (
        <div>
          <p>Selected files:</p>

          <ul>
            {Array.from(selectedFiles).map((file) => (
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