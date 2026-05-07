"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type NotificationType = "info" | "warning" | "error" | "success";

type NotificationKey =
  | "newUser"
  | "systemUpdate"
  | "paymentReceived"
  | "securityAlert";

type NotificationItem = {
  id: string;
  titleKey: NotificationKey;
  descriptionKey: `${NotificationKey}Desc`;
  timestamp: string;
  read: boolean;
  type: NotificationType;
};

const NOTIFICATION_TYPE_STYLES: Record<
  NotificationType,
  { iconClass: string; textClass: string }
> = {
  info: {
    iconClass: "icon-[fluent--info-24-regular]",
    textClass: "text-info",
  },
  warning: {
    iconClass: "icon-[fluent--warning-24-regular]",
    textClass: "text-warning",
  },
  error: {
    iconClass: "icon-[fluent--error-circle-24-regular]",
    textClass: "text-error",
  },
  success: {
    iconClass: "icon-[fluent--checkmark-circle-24-regular]",
    textClass: "text-success",
  },
};

const NOW_REFERENCE_MS = new Date("2026-04-10T08:00:00.000Z").getTime();

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    titleKey: "newUser",
    descriptionKey: "newUserDesc",
    timestamp: "2026-04-10T07:00:00.000Z",
    read: false,
    type: "info",
  },
  {
    id: "2",
    titleKey: "systemUpdate",
    descriptionKey: "systemUpdateDesc",
    timestamp: "2026-04-09T08:00:00.000Z",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    titleKey: "paymentReceived",
    descriptionKey: "paymentReceivedDesc",
    timestamp: "2026-04-08T08:00:00.000Z",
    read: true,
    type: "success",
  },
  {
    id: "4",
    titleKey: "securityAlert",
    descriptionKey: "securityAlertDesc",
    timestamp: "2026-04-07T08:00:00.000Z",
    read: true,
    type: "error",
  },
];

export default function NotificationDropdown() {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    MOCK_NOTIFICATIONS,
  );


  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getTimeAgo = (timestamp: string) => {
    const diffMs = Math.max(0, NOW_REFERENCE_MS - new Date(timestamp).getTime());
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return t("dashboardShell.notifications.daysAgo", { count: diffDays });
    }

    if (diffHours > 0) {
      return t("dashboardShell.notifications.hoursAgo", { count: diffHours });
    }

    return t("dashboardShell.notifications.justNow");
  };

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-square"
        aria-label={t("dashboardShell.notifications.title")}
      >
        <div className="indicator">
          {unreadCount > 0 ? (
            <span className="badge badge-primary badge-xs indicator-item">
              {unreadCount}
            </span>
          ) : null}
          <span className="icon-[fluent--alert-24-regular] text-2xl" />
        </div>
      </button>

      <div className="dropdown-content z-20 mt-2 w-80 rounded-box border border-base-300 bg-base-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-base-300 p-3">
          <h3 className="font-semibold">
            {t("dashboardShell.notifications.title")}
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              {t("dashboardShell.notifications.markAllRead")}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              {t("dashboardShell.notifications.clearAll")}
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification) => {
                const typeStyle = NOTIFICATION_TYPE_STYLES[notification.type];
                return (
                  <li
                    key={notification.id}
                    className={`rounded-lg border border-base-300 p-3 ${
                      notification.read ? "bg-base-100" : "bg-base-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`${typeStyle.iconClass} ${typeStyle.textClass} mt-0.5 text-2xl`}
                        aria-hidden="true"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-5">
                            {t(`dashboardShell.notifications.${notification.titleKey}`)}
                          </p>
                          <time
                            className="whitespace-nowrap text-xs opacity-70"
                            dateTime={notification.timestamp}
                          >
                            {getTimeAgo(notification.timestamp)}
                          </time>
                        </div>
                        <p className="mt-1 text-sm opacity-80">
                          {t(
                            `dashboardShell.notifications.${notification.descriptionKey}`,
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => toggleReadStatus(notification.id)}
                        aria-label={
                          notification.read
                            ? t("dashboardShell.notifications.markUnread")
                            : t("dashboardShell.notifications.markRead")
                        }
                        title={
                          notification.read
                            ? t("dashboardShell.notifications.markUnread")
                            : t("dashboardShell.notifications.markRead")
                        }
                      >
                        <span
                          className={
                            notification.read
                              ? "icon-[fluent--mail-open-24-regular] text-base-content/70 text-2xl"
                              : "icon-[fluent--mail-24-regular] text-primary text-2xl"
                          }
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm opacity-70">
              {t("dashboardShell.notifications.empty")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
