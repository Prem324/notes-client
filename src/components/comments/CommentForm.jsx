import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Textarea from "../common/Textarea";

function CommentForm({ onAddComment, loading = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      text: "",
    },
  });

  async function handleFormSubmit(data) {
    const trimmedText = data.text.trim();

    const success = await onAddComment(trimmedText);

    if (success) {
      reset();
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <h2>Add Comment</h2>

      <Textarea
        label="Comment"
        placeholder="Write your comment"
        rows={3}
        {...register("text", {
          required: "Comment text is required",
          validate: (value) =>
            value.trim().length > 0 ||
            "Comment cannot contain only spaces",
        })}
      />

      {errors.text && (
        <p className="field-error">
          {errors.text.message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Comment"}
      </Button>
    </form>
  );
}

export default CommentForm;