"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import type { ExampleEntity } from "@/lib/example-entity/types";

import { getStaffNavConfig } from "../../config/admin-nav";

type SegmentLabelKey =
  | "dashboardShell.nav.overview"
  | "dashboardShell.nav.exampleEntities"
  | "dashboardShell.pageTitle.createExampleEntity"
  | "dashboardShell.pageTitle.editExampleEntity";

const KNOWN_SEGMENT_LABELS: Record<string, SegmentLabelKey> = {
  dashboard: "dashboardShell.nav.overview",
  "example-entities": "dashboardShell.nav.exampleEntities",
  new: "dashboardShell.pageTitle.createExampleEntity",
  edit: "dashboardShell.pageTitle.editExampleEntity",
};

function getIconClassForPath(path: string, t: (key: string) => string): string | undefined {
  const navConfig = getStaffNavConfig(t);
  const navItem = navConfig.find((item) => item.href === path);
  return navItem?.iconClass;
}

function getIconClassForSegment(segment: string, t: (key: string) => string): string | undefined {
  let path: string | null = null;

  if (segment === "dashboard") {
    path = "/dashboard";
  } else if (segment === "example-entities") {
    path = "/dashboard/example-entities";
  }

  if (path) {
    return getIconClassForPath(path, t);
  }

  return undefined;
}

function safeDecodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

async function fetchExampleEntity(id: string) {
  const response = await fetch(`/api/example-entities/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as ExampleEntity;
}

export default function DashboardBreadcrumb() {
  const t = useTranslations();
  const pathname = usePathname();

  const segments = useMemo(() => {
    const rawSegments = pathname.split("/").filter(Boolean);

    if (rawSegments[0] === "en" || rawSegments[0] === "vi") {
      return rawSegments.slice(1);
    }

    return rawSegments;
  }, [pathname]);

  const exampleEntitiesIndex = segments.indexOf("example-entities");
  const maybeEntityId =
    exampleEntitiesIndex >= 0 ? segments[exampleEntitiesIndex + 1] : undefined;
  const shouldLoadEntity = Boolean(
    maybeEntityId && maybeEntityId !== "new" && maybeEntityId !== "edit",
  );

  const { data: entity } = useQuery({
    queryKey: ["example-entity", maybeEntityId],
    queryFn: () => {
      if (!maybeEntityId) {
        throw new Error("missing_entity_id");
      }

      return fetchExampleEntity(maybeEntityId);
    },
    enabled: shouldLoadEntity,
    staleTime: 5 * 60 * 1000,
  });

  // Create breadcrumb items, but modify the logic to treat example-entities specially
  // when it's accessed directly (not as a child of other items)
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    const labelKey = KNOWN_SEGMENT_LABELS[segment];
    const iconClass = getIconClassForSegment(segment, t);
    const isEntityIdSegment = Boolean(maybeEntityId && segment === maybeEntityId);

    const label = isEntityIdSegment && entity?.title
      ? entity.title
      : labelKey
        ? t(labelKey)
        : safeDecodeSegment(segment);

    return {
      href,
      label,
      iconClass,
    };
  });

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label={t("dashboardShell.breadcrumb.label")} className="breadcrumbs min-w-0 overflow-hidden text-sm">
      <ul className="min-w-0">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href}>
              {isLast ? (
                <span aria-current="page" className="flex min-w-0 items-center gap-2">
                  {item.iconClass && <span className={`${item.iconClass} shrink-0 text-lg`} />}
                  <span className="truncate" title={item.label}>{item.label}</span>
                </span>
              ) : (
                <Link href={item.href} className="flex min-w-0 items-center gap-2">
                  {item.iconClass && <span className={`${item.iconClass} shrink-0 text-lg`} />}
                  <span className="truncate" title={item.label}>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
