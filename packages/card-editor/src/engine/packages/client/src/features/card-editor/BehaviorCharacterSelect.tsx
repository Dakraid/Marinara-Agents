import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { CardEditorApiError, searchHostCharacters, type CharacterCatalogEntry } from "./api";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

/** Per-card style choice: inherit the session style, force no style card, or pick a specific character. */
export type BehaviorSelection =
  { kind: "inherit" } | { kind: "none" } | { kind: "character"; id: string; name: string; avatarPath?: string | null };

const SEARCH_DEBOUNCE_MS = 200;

function Avatar({ name, avatarPath }: { name: string; avatarPath?: string | null }) {
  return (
    <span className="ce-search-option-avatar" aria-hidden="true">
      {avatarPath ? <img src={avatarPath} alt="" loading="lazy" /> : name.trim().charAt(0) || "?"}
    </span>
  );
}

export function BehaviorCharacterSelect({
  localization,
  selection,
  onChange,
  allowInherit = false,
  buttonLabel,
  inheritLabel,
  noneLabel,
}: {
  localization?: CardEditorLocalizationContext;
  selection: BehaviorSelection;
  onChange: (next: BehaviorSelection) => void;
  allowInherit?: boolean;
  buttonLabel: string;
  inheritLabel?: string;
  /** Omitted: no "none" choice (the setup's add-a-character search). */
  noneLabel?: string;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const faceRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<CharacterCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  /** The Engine's message for a search that is not valid character query syntax. */
  const [queryError, setQueryError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchSeq = useRef(0);

  useEffect(() => {
    if (!open) return undefined;
    const seq = ++searchSeq.current;
    setLoading(true);
    setLoadError(false);
    setQueryError(null);
    const handle = setTimeout(() => {
      searchHostCharacters({ search, limit: 50, offset: 0 })
        .then((page) => {
          if (searchSeq.current !== seq) return;
          setOptions(Array.isArray(page?.items) ? page.items : []);
          setLoading(false);
        })
        .catch((error: unknown) => {
          if (searchSeq.current !== seq) return;
          const code = (error instanceof CardEditorApiError ? error.payload : null) as { code?: unknown } | null;
          // A half-typed query keeps the last results; the message says what to fix.
          if (code?.code === "query_syntax") setQueryError((error as Error).message);
          else {
            setOptions([]);
            setLoadError(true);
          }
          setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [open, search]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const pick = (next: BehaviorSelection) => {
    onChange(next);
    setOpen(false);
    setSearch("");
    faceRef.current?.focus();
  };

  type Option = {
    key: string;
    label: string;
    avatarPath: string | null;
    title?: string;
    tags?: string[];
    selected: boolean;
    select: () => void;
  };
  const entries: Option[] = [
    ...(allowInherit
      ? [
          {
            key: "inherit",
            label: inheritLabel ?? "",
            avatarPath: null,
            selected: selection.kind === "inherit",
            select: () => pick({ kind: "inherit" }),
          },
        ]
      : []),
    ...(noneLabel === undefined
      ? []
      : [
          {
            key: "none",
            label: noneLabel,
            avatarPath: null,
            selected: selection.kind === "none",
            select: () => pick({ kind: "none" }),
          },
        ]),
    ...options.map((option) => ({
      key: option.id,
      label: option.name,
      avatarPath: option.avatarPath,
      title: option.comment?.trim() || undefined,
      tags: option.tags,
      selected: selection.kind === "character" && selection.id === option.id,
      select: () => pick({ kind: "character", id: option.id, name: option.name, avatarPath: option.avatarPath }),
    })),
  ];
  const active = entries[Math.min(activeIndex, Math.max(entries.length - 1, 0))];

  const faceLabel =
    selection.kind === "character"
      ? selection.name
      : selection.kind === "inherit"
        ? (inheritLabel ?? "")
        : (noneLabel ?? buttonLabel);

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
      faceRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (entries.length === 0) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (Math.min(index, entries.length - 1) + delta + entries.length) % entries.length);
      return;
    }
    if (event.key === "Enter" && active) {
      event.preventDefault();
      active.select();
    }
  };

  return (
    <div className="ce-search-select" ref={rootRef}>
      <button
        ref={faceRef}
        type="button"
        className={`mari-chrome-field ce-field ce-search-face${selection.kind === "character" ? "" : " ce-search-face--muted"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          setOpen((value) => !value);
          setActiveIndex(0);
        }}
      >
        <span className="ce-sr-only">{`${buttonLabel}: `}</span>
        {selection.kind === "character" ? <Avatar name={selection.name} avatarPath={selection.avatarPath} /> : null}
        <span className="ce-search-face-label">{faceLabel}</span>
        <ChevronDown
          className={`ce-icon ce-search-chevron${open ? " ce-search-chevron--open" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="ce-search-panel">
          <input
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={active ? `${listId}-${active.key}` : undefined}
            aria-label={t("cardEditor.dialog.search.placeholder")}
            className="mari-chrome-field ce-field"
            placeholder={t("cardEditor.dialog.search.placeholder")}
            value={search}
            autoFocus
            onChange={(event) => {
              setSearch(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onSearchKeyDown}
          />
          {loading ? <div className="ce-caption">{t("cardEditor.dialog.search.loading")}</div> : null}
          {queryError ? (
            <div className="ce-status ce-status--error" role="alert">
              {t("cardEditor.dialog.search.invalid", { message: queryError })}
            </div>
          ) : null}
          {loadError ? (
            <div className="ce-status ce-status--error" role="alert">
              {t("cardEditor.dialog.search.error")}
            </div>
          ) : null}
          {!loading && !loadError && !queryError && options.length === 0 ? (
            <div className="ce-caption">{t("cardEditor.dialog.search.noResults")}</div>
          ) : null}
          <ul className="ce-search-options" role="listbox" id={listId} aria-label={buttonLabel}>
            {entries.map((entry, index) => (
              <li role="presentation" key={entry.key}>
                <button
                  type="button"
                  role="option"
                  id={`${listId}-${entry.key}`}
                  aria-selected={entry.selected}
                  className={`ce-search-option${entry === active ? " ce-search-option--active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={entry.select}
                >
                  {entry.key === "inherit" || entry.key === "none" ? null : (
                    <Avatar name={entry.label} avatarPath={entry.avatarPath} />
                  )}
                  <span className="ce-search-option-text">
                    <span className="ce-search-option-name">{entry.label}</span>
                    {entry.title ? <em className="ce-search-option-meta">{entry.title}</em> : null}
                    {entry.tags?.length ? (
                      <span className="ce-search-option-meta">
                        {entry.tags.slice(0, 3).join(" · ")}
                        {entry.tags.length > 3 ? ` +${entry.tags.length - 3}` : ""}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
