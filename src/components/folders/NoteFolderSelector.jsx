import { useFolders } from "../../features/folders/useFolders";

function NoteFolderSelector({ register }) {
  const { data, isLoading, isError } = useFolders();

  const folders = data?.data ?? [];

  if (isLoading) {
    return <p>Loading folders...</p>;
  }

  if (isError) {
    return <p className="field-error">Unable to load folders.</p>;
  }

  return (
    <div>
      <label htmlFor="folder">Folder</label>

      <select id="folder" {...register("folder")}>
        <option value="">No folder</option>

        {folders.map((folder) => (
          <option key={folder._id} value={folder._id}>
            {folder.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default NoteFolderSelector;