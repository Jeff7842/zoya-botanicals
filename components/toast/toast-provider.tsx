"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ContactToast, { GlobalToast, ToastVariant } from "./global-toast";

type ShowToastArgs = {
  title: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  showToast: (args: ShowToastArgs) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<GlobalToast>({
    show: false,
    title: "",
    message: "",
    variant: "success",
  });

  const timeoutRef = useRef<number | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = "success", duration = 4500 }: ShowToastArgs) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      setToast({
        show: true,
        title,
        message,
        variant,
      });

      timeoutRef.current = window.setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, duration);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      hideToast,
    }),
    [showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ContactToast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}