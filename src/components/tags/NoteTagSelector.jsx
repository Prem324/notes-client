import { useTags } from "../../features/tags/useTags";

function NoteTagSelector({ register }) {
  const { data, isLoading, isError } = useTags();

  const tags = data?.data ?? [];

  if (isLoading) {
    return <p>Loading tags...</p>;
  }

  if (isError) {
    return <p className="field-error">Unable to load tags.</p>;
  }

  if (tags.length === 0) {
    return <p>No tags available. Create a tag first.</p>;
  }

  return (
    <div>
      <label htmlFor="tags">Tags</label>

      <select id="tags" multiple {...register("tags")}>
        {tags.map((tag) => (
          <option key={tag._id} value={tag._id}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default NoteTagSelector;