import { useMutation } from "@tanstack/react-query";

export const useMutationHook = (mutationFnCallback) => {
  const mutation = useMutation({
    mutationFn: mutationFnCallback,
  });
  return mutation;
};
