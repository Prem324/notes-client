import { useState } from "react";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import Textarea from "../common/Textarea";

function CommentForm({ onAddComment, loading = false }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedText = text.trim();

    if (!trimmedText) {
      setError("Comment text is required");
      return;
    }

    const success=onAddComment(trimmedText);

    if(success){
        setText("");
    }   
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Comment</h2>

      <ErrorMessage message={error} />

      <Textarea
        label="Comment"
        name="comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your comment"
        rows={3}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Comment"}
      </Button>
    </form>
  );
}

export default CommentForm;