"use client";

import { useEffect } from "react";

export default function CleanVerifyUrl() {
  useEffect(() => {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  return null;
}