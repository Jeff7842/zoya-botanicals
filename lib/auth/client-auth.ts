"use client";

import { useCallback, useEffect, useState } from "react";

export type ActiveAuthUser = {
  id: string;
  username: string | null;
  first_name: string | null;
  name: string | null;
  email: string | null;
  imageUrl: string | null;
};

type ActiveAuthResponse = {
  authenticated: boolean;
  user?: ActiveAuthUser;
};

type ActiveAuthState = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: ActiveAuthUser | null;
};

const AUTH_STATE_EVENT = "zoya-auth-state-changed";

function unauthenticatedState(): ActiveAuthState {
  return {
    status: "unauthenticated",
    user: null,
  };
}

export function notifyAuthStateChanged() {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

export async function fetchActiveAuthState(signal?: AbortSignal) {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-store",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error("Could not read the current session.");
  }

  const payload = (await response.json()) as ActiveAuthResponse;

  if (!payload.authenticated || !payload.user) {
    return unauthenticatedState();
  }

  return {
    status: "authenticated" as const,
    user: payload.user,
  };
}

export async function logoutCurrentSession() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-store",
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "We could not log you out right now.");
  }

  notifyAuthStateChanged();
}

export function useActiveAuthState() {
  const [state, setState] = useState<ActiveAuthState>({
    status: "loading",
    user: null,
  });

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const nextState = await fetchActiveAuthState(signal);
      setState(nextState);
    } catch {
      if (signal?.aborted) {
        return;
      }

      setState(unauthenticatedState());
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchActiveAuthState(controller.signal)
      .then((nextState) => {
        setState(nextState);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }

        setState(unauthenticatedState());
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const handleAuthStateChanged = () => {
      void refresh();
    };
    const handleWindowFocus = () => {
      void refresh();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener(AUTH_STATE_EVENT, handleAuthStateChanged);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(AUTH_STATE_EVENT, handleAuthStateChanged);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
