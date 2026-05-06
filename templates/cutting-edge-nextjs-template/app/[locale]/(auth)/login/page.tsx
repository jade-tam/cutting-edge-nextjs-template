import LoginForm from "@/features/auth/components/login-form";
import { setRequestLocale } from "next-intl/server";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-md px-2 py-10 sm:px-0">
      <LoginForm />
    </section>
  );
}
