// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { invoke } from "@tauri-apps/api/core";
import type { Options } from "./index";

(function () {
  let permissionSettable = false;
  let permissionValue = "default";
  // CHANGE: below(1): "granted"
  permissionValue = "granted";
  
  async function isPermissionGranted(): Promise<boolean> {
    // CHANGE: below(1): return true (temp disabled)
    // return true;
    if (window.Notification.permission !== "default") {
      return await Promise.resolve(
        window.Notification.permission === "granted",
      );
    }
    return await invoke("plugin:notification|is_permission_granted");
  }

  function setNotificationPermission(
    value: "granted" | "denied" | "default",
  ): void {
    // CHANGE: below(1): return (temp disabled)
    // return;
    permissionSettable = true;
    // @ts-expect-error we can actually set this value on the webview
    window.Notification.permission = value;
    permissionSettable = false;
  }

  async function requestPermission(): Promise<
    "default" | "denied" | "granted" | "prompt"
  > {
    // CHANGE: below(1): return "granted" (temp disabled)
    // return "granted";
    return await invoke<"prompt" | "default" | "granted" | "denied">(
      "plugin:notification|request_permission",
    ).then((permission) => {
      setNotificationPermission(
        permission === "prompt" ? "default" : permission,
      );
      return permission;
    });
  }

  async function sendNotification(options: string | Options): Promise<void> {
    if (typeof options === "object") {
      Object.freeze(options);
    }

    await invoke("plugin:notification|notify", {
      options:
        typeof options === "string"
          ? {
              title: options,
            }
          : options,
    });
  }

  // @ts-expect-error unfortunately we can't implement the whole type, so we overwrite it with our own version
  window.Notification = function (title, options) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const opts = options || {};
    void sendNotification(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.assign(opts, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        title,
      }),
    );
  };

  // CHANGE was here

  // @ts-expect-error tauri does not have sync IPC :(
  window.Notification.requestPermission = requestPermission;

  Object.defineProperty(window.Notification, "permission", {
    enumerable: true,
    get: () => permissionValue,
    set: (v) => {
      if (!permissionSettable) {
        throw new Error("Readonly property");
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      permissionValue = v;
    },
  });

  // CHANGE (NEW): below(1): return
  return;

  // CHANGE: below(1): return
  return;
  void isPermissionGranted().then(function (response) {
    if (response === null) {
      setNotificationPermission("default");
    } else {
      setNotificationPermission(response ? "granted" : "denied");
    }
  });
})();
