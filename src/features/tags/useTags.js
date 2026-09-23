import { useQuery } from "@tanstack/react-query";
import { tagService } from "./tagService";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: tagService.getTags,
    staleTime: 5 * 60 * 1000,
  });
}