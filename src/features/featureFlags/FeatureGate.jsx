import { useFeatureFlags } from "./useFeatureFlags";

function FeatureGate({ feature, children, fallback = null }) {
  const { isEnabled, isLoading, isError } = useFeatureFlags();

  // Fail closed:
  // while flags are loading or if fetching fails,
  // don't expose the feature.
  if (isLoading || isError) {
    return fallback;
  }

  return isEnabled(feature) ? children : fallback;
}

export default FeatureGate;