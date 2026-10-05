import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services/auth.service";
import { queryKeys } from "../lib/queryKeys";
import { AuthStorage } from "../lib/AuthStorage";

export function useAuth() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => AuthService.me(),
    enabled: !!AuthStorage.getToken(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      AuthStorage.setToken(data.token);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: AuthService.signup,
    onSuccess: (data) => {
      AuthStorage.setToken(data.token);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      AuthStorage.clearToken();
      queryClient.clear();
    },
    onError: () => {
      AuthStorage.clearToken();
      queryClient.clear();
    },
  });

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthed: !!meQuery.data,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };
}
