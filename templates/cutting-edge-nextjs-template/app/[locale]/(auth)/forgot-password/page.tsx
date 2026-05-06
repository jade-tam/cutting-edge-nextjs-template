import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";
import { setRequestLocale } from "next-intl/server";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-md px-2 py-10 sm:px-0">
      <ForgotPasswordForm />
    </section>
  );
}
