import NoteCard from "./NoteCard";

function NotesList({
  notes,
  search = "",
  onDeleteNote,
  onToggleComplete,
  onStartEdit,
  actionLoading = false,
}) {
  if (notes.length === 0) {
    return (
      <div>
        {search ? (
          <p>No notes matched your search.</p>
        ) : (
          <>
            <p>No notes found.</p>
            <p>Create your first note using the form above.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onDeleteNote={onDeleteNote}
          onToggleComplete={onToggleComplete}
          onStartEdit={onStartEdit}
          actionLoading={actionLoading}
        />
      ))}
    </div>
  );
}

export default NotesList;