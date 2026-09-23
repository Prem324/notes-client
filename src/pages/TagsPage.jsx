import FeatureGate from "../features/featureFlags/FeatureGate";
import TagManager from "../components/tags/TagManager";

function TagsPage() {
  return (
    <FeatureGate feature="tags">
      <TagManager />
    </FeatureGate>
  );
}

export default TagsPage;