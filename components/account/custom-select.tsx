"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";

export type CustomSelectOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
  searchText?: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  buttonClassName?: string;
  panelClassName?: string;
  optionClassName?: string;
  selectedLabelClassName?: string;
  optionLabelClassName?: string;
  align?: "left" | "right";
};

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search options",
  emptyText = "No matches found.",
  buttonClassName = "",
  panelClassName = "",
  optionClassName = "",
  selectedLabelClassName = "",
  optionLabelClassName = "",
  align = "left",
}: CustomSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => option.value === value) ?? null;

  const closeMenu = () => {
    setOpen(false);
    setQuery("");
  };

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.secondaryLabel ?? ""} ${option.searchText ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }

          setOpen(true);
        }}
        className={`flex h-14 w-full items-center justify-between gap-3 rounded-[1.15rem] border border-transparent bg-[#eceaf1] px-4 text-left text-[0.98rem] text-[#322d40] outline-none transition-all duration-200 hover:border-[#d7ccef] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#1d1630] dark:text-[#f2edff] dark:hover:border-[#4b2ba3] dark:hover:bg-[#241b3a] ${buttonClassName}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 flex-1">
          {selectedOption ? (
            <span className="block min-w-0">
              <span className={`block truncate font-medium ${selectedLabelClassName}`}>{selectedOption.label}</span>
              {selectedOption.secondaryLabel ? (
                <span className="mt-0.5 block truncate text-xs text-[#8e88a2] dark:text-[#a89dc4]">
                  {selectedOption.secondaryLabel}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="block truncate text-[#9d97ae] dark:text-[#8d81ab]">{placeholder}</span>
          )}
        </span>

        <Icon
          icon={open ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
          width="18"
          height="18"
          className="shrink-0 text-[#5b5569] dark:text-[#b9add6]"
        />
      </button>

      <div
        className={`absolute z-40 mt-3 w-full overflow-hidden rounded-[1.4rem] border border-[#e6dff4] bg-white shadow-[0_24px_60px_rgba(25,14,51,0.14)] transition-all duration-200 dark:border-[#35264f] dark:bg-[#120d21] dark:shadow-[0_28px_70px_rgba(0,0,0,0.42)] ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"} ${panelClassName}`}
      >
        {open ? (
          <div className="p-3">
            {searchable ? (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-[#f5f2fa] px-3 py-3 dark:bg-[#1d1630]">
                <Icon icon="solar:magnifer-linear" width="18" height="18" className="text-[#8c85a1] dark:text-[#b2a7cf]" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm text-[#241f31] outline-none placeholder:text-[#8c85a1] dark:text-[#f2edff] dark:placeholder:text-[#8d81ab]"
                />
              </div>
            ) : null}

            <div className="max-h-64 overflow-y-auto pr-1">
              {filteredOptions.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredOptions.map((option) => {
                    const selected = option.value === value;

                    return (
                      <button
                        key={`${option.value}-${option.label}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          onChange(option.value);
                          closeMenu();
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-3 text-left transition-all duration-200 ${
                          selected
                            ? "bg-[#f0e9ff] text-[#34058d] dark:bg-[#2b1a4e] dark:text-[#d8c6ff]"
                            : "text-[#322d40] hover:bg-[#f5f2fa] dark:text-[#f2edff] dark:hover:bg-[#1d1630]"
                        } ${optionClassName}`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-semibold ${optionLabelClassName}`}>
                            {option.label}
                          </span>
                          {option.secondaryLabel ? (
                            <span className="mt-0.5 block truncate text-xs text-[#8c85a1] dark:text-[#8d81ab]">
                              {option.secondaryLabel}
                            </span>
                          ) : null}
                        </span>

                        {selected ? (
                          <Icon icon="solar:check-circle-bold" width="18" height="18" className="shrink-0 text-[#34058d] dark:text-[#d8c6ff]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1rem] bg-[#f8f5ff] px-3 py-5 text-center text-sm text-[#827b97] dark:bg-[#1d1630] dark:text-[#a89dc4]">
                  {emptyText}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
