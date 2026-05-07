type PageLoadingProps = {
  text: string;
  variant: "fullscreen" | "section";
  className?: string;
};

const variantClassMap: Record<PageLoadingProps["variant"], string> = {
  fullscreen: "min-h-screen w-full",
  section: "h-full w-full",
};

export function PageLoading({ text, variant, className }: PageLoadingProps) {
  return (
    <div
      data-testid="page-loading-root"
      className={["flex items-center justify-center", variantClassMap[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <span
          data-testid="page-loading-spinner"
          className="loading loading-spinner loading-md"
          aria-hidden
        />
        <span data-testid="page-loading-text" className="skeleton skeleton-text">
          {text}
        </span>
      </div>
    </div>
  );
}
