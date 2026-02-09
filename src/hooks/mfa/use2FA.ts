import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import {
	type BackupCodesResponse,
	initiateTotpSetup,
	skip2FASetup,
	type TotpSetupResponse,
	verifyTotpSetup,
} from "../../services/onboarding.service";

type UseInitiateTotpSetupOptions = Omit<
	UseMutationOptions<TotpSetupResponse, Error, void>,
	"mutationFn"
>;
type UseVerifyTotpSetupOptions = Omit<
	UseMutationOptions<BackupCodesResponse, Error, string>,
	"mutationFn"
>;
type UseSkip2FASetupOptions = Omit<
	UseMutationOptions<{ success: boolean; message: string }, Error, void>,
	"mutationFn"
>;

export function useInitiateTotpSetup(options?: UseInitiateTotpSetupOptions) {
	return useMutation<TotpSetupResponse, Error, void>({
		mutationFn: initiateTotpSetup,
		...options,
	});
}

export function useVerifyTotpSetup(options?: UseVerifyTotpSetupOptions) {
	return useMutation<BackupCodesResponse, Error, string>({
		mutationFn: verifyTotpSetup,
		...options,
	});
}

export function useSkip2FASetup(options?: UseSkip2FASetupOptions) {
	return useMutation<{ success: boolean; message: string }, Error, void>({
		mutationFn: skip2FASetup,
		...options,
	});
}
