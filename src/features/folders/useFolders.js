import { useQuery } from "@tanstack/react-query";
import { folderService } from "./folderService";

export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: folderService.getFolders,
    staleTime: 5 * 60 * 1000,
  });
}