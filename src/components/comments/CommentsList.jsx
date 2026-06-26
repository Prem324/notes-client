import {formatDate} from "../../utils/formatDate"

function CommentsList({ comments }) {
  if (comments.length === 0) {
    return <p>No comments yet.</p>;
  }

  return (
    <div>
      <h2>Comments</h2>

      <div className="comments-list">
        {comments.map((comment) => (
          <div className="comment-card" key={comment._id}>
            <p>{comment.text}</p>

            {comment.user && (
              <small>
                By: {comment.user.name || comment.user.email || "Unknown user"}
              </small>
            )}

            {comment.createdAt && (
              <small>{formatDate(comment.createdAt)}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentsList