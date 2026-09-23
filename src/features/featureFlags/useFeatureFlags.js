import { useQuery } from "@tanstack/react-query";

import { featureFlagService } from "./featureFlagService";

export function useFeatureFlags() {
  const query = useQuery({
    queryKey: ["featureFlags"],
    queryFn: featureFlagService.getFeatureFlags,
    staleTime: 5 * 60 * 1000,
  });

  const flags = query.data?.data ?? {};

  return {
    flags,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    isEnabled: (featureName) => flags[featureName] === true,
  };
}