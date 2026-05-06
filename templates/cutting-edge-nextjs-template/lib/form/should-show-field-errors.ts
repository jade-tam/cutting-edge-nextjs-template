export function shouldShowFieldErrors(
  isTouched: boolean,
  submissionAttempts: number,
): boolean {
  return isTouched || submissionAttempts > 0;
}
