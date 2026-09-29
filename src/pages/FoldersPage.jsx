import FeatureGate from "../features/featureFlags/FeatureGate";
import FolderManager from "../components/folders/FolderManager";

function FoldersPage() {
  return (
    <FeatureGate feature="folders">
      <FolderManager />
    </FeatureGate>
  );
}

export default FoldersPage;