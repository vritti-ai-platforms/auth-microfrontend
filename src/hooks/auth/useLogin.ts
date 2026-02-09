import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import {
	type LoginDto,
	type LoginResponse,
	login,
} from "../../services/auth.service";

type UseLoginOptions = Omit<
	UseMutationOptions<LoginResponse, Error, LoginDto>,
	"mutationFn"
>;

export function useLogin(options?: UseLoginOptions) {
	return useMutation<LoginResponse, Error, LoginDto>({
		mutationFn: login,
		...options,
	});
}
