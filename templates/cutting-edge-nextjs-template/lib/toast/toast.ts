import { toast } from "sonner";

export type ToastMessage = string;

export function showSuccessToast(
  message: ToastMessage,
  options?: Parameters<typeof toast.success>[1],
) {
  if (options) {
    toast.success(message, options);
    return;
  }

  toast.success(message);
}

export function showErrorToast(
  message: ToastMessage,
  options?: Parameters<typeof toast.error>[1],
) {
  if (options) {
    toast.error(message, options);
    return;
  }

  toast.error(message);
}

export function showInfoToast(
  message: ToastMessage,
  options?: Parameters<typeof toast.info>[1],
) {
  if (options) {
    toast.info(message, options);
    return;
  }

  toast.info(message);
}

export function showWarningToast(
  message: ToastMessage,
  options?: Parameters<typeof toast.warning>[1],
) {
  if (options) {
    toast.warning(message, options);
    return;
  }

  toast.warning(message);
}
