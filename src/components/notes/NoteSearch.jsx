import Button from "../common/Button";
import Input from "../common/Input";

function NoteSearch({ search, onSearchChange, onClearSearch }) {
  return (
    <div>
      <Input
        label="Search Notes"
        name="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by title or content"
      />

      {search && (
        <Button type="button" onClick={onClearSearch}>
          Clear
        </Button>
      )}
    </div>
  );
}

export default NoteSearch;