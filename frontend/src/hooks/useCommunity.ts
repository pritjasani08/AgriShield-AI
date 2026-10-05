import { useQuery } from "@tanstack/react-query";
import { CommunityService } from "../services/community.service";
import { queryKeys } from "../lib/queryKeys";

export function useCommunity() {
  return useQuery({
    queryKey: [...queryKeys.community.all, 'feed'],
    queryFn: () => CommunityService.getPosts(),
  });
}
