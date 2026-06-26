import React from 'react';
import { Link } from "react-router-dom";
import Button from "../common/Button";
import Card from "../common/Card";

function NoteCard({
  note,
  onDeleteNote,
  onToggleComplete,
  onStartEdit,
  actionLoading = false,
}) {
  return (
    <Card className="note-card">
      <div className="note-card-header">
        <h3>{note.title}</h3>

        <span
          className={
            note.completed ? "status status-completed" : "status status-pending"
          }
        >
          {note.completed ? "Completed" : "Pending"}
        </span>
      </div>

      <p>{note.content}</p>

      <div className="note-card-actions">
        <Link to={`/notes/${note._id}`}>View Details</Link>

        <Button
          type="button"
          disabled={actionLoading}
          onClick={() => onToggleComplete(note._id)}
        >
          {note.completed ? "Mark Pending" : "Mark Complete"}
        </Button>

        <Button
          type="button"
          disabled={actionLoading}
          onClick={() => onStartEdit(note)}
        >
          Edit
        </Button>

        <Button
          type="button"
          disabled={actionLoading}
          onClick={() => onDeleteNote(note._id)}
          className="btn-danger"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}

export default React.memo(NoteCard);