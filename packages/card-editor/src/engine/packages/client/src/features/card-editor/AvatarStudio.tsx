import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { BulkSession } from "../../../../shared/src/features/agents/card-editor/schema.ts";
import { getHostCharacterCard, uploadHostAvatar } from "./api";
import {
  cellCoverDraw,
  cellMinScale,
  computeLayoutCells,
  COMPOSITOR_WHEEL_STEP,
  DEFAULT_COMPOSITOR_LAYOUT,
  DEFAULT_OFFSET,
  exportSize,
  hitTestCell,
  panOffset,
  pinchScale,
  zoomOffset,
  normalizeOffset,
  type CompositorLayout,
  type CompositorOffset,
} from "./avatar-compositor";
import { useDialogFocusTrap } from "./dialog-controls";
import { translateCardEditor, type CardEditorLocalizationContext } from "./localization";

interface StudioCard {
  id: string;
  name: string;
  image: HTMLImageElement | null;
}

/** Every card the session touched: sources, split copies and duplicates, the combined card. */
export function studioCardIds(session: BulkSession): { sources: string[]; targets: string[] } {
  const sources = [
    ...new Set(session.items.filter((item) => item.parentItemId === undefined).map((item) => item.characterId)),
  ];
  const created = session.items.flatMap((item) => (item.resultCardId ? [item.resultCardId] : []));
  const inPlace = session.items
    .filter((item) => item.status === "applied" && !item.resultCardId)
    .map((item) => item.characterId);
  const targets = [...new Set([...(session.combinedCardId ? [session.combinedCardId] : []), ...created, ...inPlace])];
  return { sources: [...new Set([...sources, ...created])], targets };
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/**
 * Avatar Studio: composites card images into one avatar (ported from the ST Bulk Combine
 * compositor). Offsets are keyed by character id, so reordering or unticking images never shifts
 * another card's crop. Empty cells use a fixed neutral fill, never the current theme, so the
 * exported PNG looks the same for everyone.
 */
export function AvatarStudio({
  localization,
  session,
  onClose,
}: {
  localization?: CardEditorLocalizationContext;
  session: BulkSession;
  onClose: () => void;
}) {
  const t = (key: string, values?: Record<string, string | number>) => translateCardEditor(localization, key, values);
  const [{ sources, targets }] = useState(() => studioCardIds(session));
  const [cards, setCards] = useState<StudioCard[] | null>(null);
  const [included, setIncluded] = useState<Set<string>>(() => new Set(sources));
  const [order, setOrder] = useState<string[]>(sources);
  const [targetId, setTargetId] = useState<string>(targets[0] ?? "");
  const [layout, setLayout] = useState<CompositorLayout>(DEFAULT_COMPOSITOR_LAYOUT);
  const [offsets, setOffsets] = useState<Record<string, CompositorOffset>>({});
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gesture = useRef<{
    pointers: Map<number, { x: number; y: number }>;
    pinch?: { distance: number; scale: number };
  }>({
    pointers: new Map(),
  });
  const dialogRef = useDialogFocusTrap(true, () => busy, onClose);

  useEffect(() => {
    let cancelled = false;
    const ids = [...new Set([...sources, ...targets])];
    void Promise.all(
      ids.map(async (id) => {
        try {
          const card = await getHostCharacterCard(id);
          return { id, name: card.name, image: card.avatarPath ? await loadImage(card.avatarPath) : null };
        } catch {
          return { id, name: id, image: null };
        }
      }),
    ).then((loaded) => {
      if (!cancelled) setCards(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [sources, targets]);

  const byId = new Map((cards ?? []).map((card) => [card.id, card]));
  const shown = order.filter((id) => included.has(id)).map((id) => byId.get(id) ?? { id, name: id, image: null });
  const size = exportSize(layout);
  const cells = computeLayoutCells(
    layout,
    shown.length,
    size.width,
    size.height,
    shown.map((card) => (card.image ? card.image.naturalWidth / card.image.naturalHeight : null)),
  );
  const safeCurrent = Math.min(current, Math.max(0, shown.length - 1));
  const floorFor = (index: number) => {
    const card = shown[index];
    const cell = cells[index];
    return card?.image && cell ? cellMinScale(cell, card.image.naturalWidth, card.image.naturalHeight) : 50;
  };
  const offsetFor = (id: string) => offsets[id] ?? DEFAULT_OFFSET;
  const setOffset = (index: number, next: (offset: CompositorOffset, floor: number) => CompositorOffset) => {
    const card = shown[index];
    if (!card) return;
    setOffsets((currentOffsets) => ({
      ...currentOffsets,
      [card.id]: next(currentOffsets[card.id] ?? DEFAULT_OFFSET, floorFor(index)),
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#16121f";
    context.fillRect(0, 0, canvas.width, canvas.height);
    shown.forEach((card, index) => {
      const cell = cells[index];
      if (!cell) return;
      context.save();
      context.beginPath();
      context.rect(cell.x, cell.y, cell.w, cell.h);
      context.clip();
      const draw = card.image
        ? cellCoverDraw(cell, card.image.naturalWidth, card.image.naturalHeight, offsetFor(card.id))
        : null;
      if (card.image && draw) {
        context.drawImage(card.image, draw.dx, draw.dy, draw.dw, draw.dh);
      } else {
        context.fillStyle = "#2b2540";
        context.fillRect(cell.x, cell.y, cell.w, cell.h);
        context.fillStyle = "#e8d4ff";
        context.font = `700 ${Math.round(Math.min(cell.w, cell.h) * 0.28)}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(initials(card.name), cell.x + cell.w / 2, cell.y + cell.h / 2);
      }
      context.restore();
    });
  });

  const toCanvas = (event: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const point = toCanvas(event);
    const hit = hitTestCell(cells, point.x, point.y);
    if (hit >= 0 && gesture.current.pointers.size === 0) setCurrent(hit);
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current.pointers.set(event.pointerId, point);
    if (gesture.current.pointers.size === 2) {
      const [a, b] = [...gesture.current.pointers.values()];
      gesture.current.pinch = {
        distance: Math.hypot(a!.x - b!.x, a!.y - b!.y),
        scale: offsetFor(shown[safeCurrent]?.id ?? "").scale,
      };
    }
  };
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const previous = gesture.current.pointers.get(event.pointerId);
    if (!previous) return;
    const point = toCanvas(event);
    gesture.current.pointers.set(event.pointerId, point);
    const cell = cells[safeCurrent];
    if (!cell) return;
    if (gesture.current.pointers.size === 2 && gesture.current.pinch) {
      const [a, b] = [...gesture.current.pointers.values()];
      const pinch = gesture.current.pinch;
      setOffset(safeCurrent, (offset, floor) => ({
        ...offset,
        scale: pinchScale(pinch.scale, pinch.distance, Math.hypot(a!.x - b!.x, a!.y - b!.y), floor),
      }));
      return;
    }
    const dx = ((point.x - previous.x) / cell.w) * 100;
    const dy = ((point.y - previous.y) / cell.h) * 100;
    setOffset(safeCurrent, (offset, floor) => panOffset(offset, dx, dy, floor));
  };
  const onPointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    gesture.current.pointers.delete(event.pointerId);
    if (gesture.current.pointers.size < 2) delete gesture.current.pinch;
  };
  const onWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    const point = toCanvas(event);
    const hit = hitTestCell(cells, point.x, point.y);
    if (hit < 0) return;
    setCurrent(hit);
    setOffset(hit, (offset, floor) =>
      zoomOffset(offset, event.deltaY < 0 ? COMPOSITOR_WHEEL_STEP : -COMPOSITOR_WHEEL_STEP, floor),
    );
  };
  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const pan = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[event.key];
    if (event.key === "Tab" && !event.shiftKey && safeCurrent < shown.length - 1) setCurrent(safeCurrent + 1);
    else if (event.key === "Tab" && event.shiftKey && safeCurrent > 0) setCurrent(safeCurrent - 1);
    else if (pan) setOffset(safeCurrent, (offset, floor) => panOffset(offset, pan[0]!, pan[1]!, floor));
    else if (event.key === "+" || event.key === "=")
      setOffset(safeCurrent, (offset, floor) => zoomOffset(offset, COMPOSITOR_WHEEL_STEP, floor));
    else if (event.key === "-")
      setOffset(safeCurrent, (offset, floor) => zoomOffset(offset, -COMPOSITOR_WHEEL_STEP, floor));
    else if (event.key === "0") setOffset(safeCurrent, () => DEFAULT_OFFSET);
    else return;
    event.preventDefault();
  };

  const moveSource = (id: string, delta: -1 | 1) =>
    setOrder((currentOrder) => {
      const index = currentOrder.indexOf(id);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= currentOrder.length) return currentOrder;
      const next = [...currentOrder];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const apply = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !targetId || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await uploadHostAvatar(targetId, canvas.toDataURL("image/png"));
      setMessage({ tone: "ok", text: t("cardEditor.avatar.applied", { name: byId.get(targetId)?.name ?? targetId }) });
    } catch (cause) {
      setMessage({ tone: "error", text: cause instanceof Error ? cause.message : String(cause) });
    } finally {
      setBusy(false);
    }
  };

  const currentCard = shown[safeCurrent];
  const currentScale = currentCard ? normalizeOffset(offsetFor(currentCard.id), floorFor(safeCurrent)).scale : 100;
  const segment = <T extends string | number>(value: T, active: T, label: string, onSelect: (value: T) => void) => (
    <button
      key={String(value)}
      type="button"
      role="radio"
      className="ce-segment"
      aria-checked={value === active}
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );

  return (
    <div className="ce-overlay" role="presentation" onClick={() => (!busy ? onClose() : undefined)}>
      <section
        ref={dialogRef}
        className="ce-dialog ce-shell ce-avatar-studio"
        role="dialog"
        aria-modal="true"
        aria-label={t("cardEditor.avatar.title")}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ce-dialog-head">
          <strong>{t("cardEditor.avatar.title")}</strong>
          <button
            type="button"
            className="ce-dialog-close"
            onClick={onClose}
            disabled={busy}
            aria-label={t("cardEditor.avatar.close")}
          >
            <X className="ce-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="ce-avatar-body">
          <div className="ce-avatar-sources">
            <span className="ce-label-title">{t("cardEditor.avatar.images")}</span>
            {cards === null ? <p className="ce-caption">{t("cardEditor.avatar.loading")}</p> : null}
            <ul className="ce-avatar-source-list">
              {order.map((id, index) => {
                const card = byId.get(id);
                return (
                  <li key={id} className="ce-avatar-source">
                    <label className="ce-choice">
                      <input
                        type="checkbox"
                        checked={included.has(id)}
                        onChange={(event) =>
                          setIncluded((currentIncluded) => {
                            const next = new Set(currentIncluded);
                            if (event.target.checked) next.add(id);
                            else if (next.size > 1) next.delete(id);
                            return next;
                          })
                        }
                      />
                      <span className="ce-choice-copy">
                        <strong>{card?.name ?? id}</strong>
                        {card && !card.image ? <small>{t("cardEditor.avatar.noImage")}</small> : null}
                      </span>
                    </label>
                    <span className="ce-inline-controls">
                      <button
                        type="button"
                        className="mari-chrome-control mari-chrome-control--small"
                        disabled={index === 0}
                        aria-label={t("cardEditor.avatar.moveUp", { name: card?.name ?? id })}
                        onClick={() => moveSource(id, -1)}
                      >
                        <ArrowUp className="ce-icon" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="mari-chrome-control mari-chrome-control--small"
                        disabled={index === order.length - 1}
                        aria-label={t("cardEditor.avatar.moveDown", { name: card?.name ?? id })}
                        onClick={() => moveSource(id, 1)}
                      >
                        <ArrowDown className="ce-icon" aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="ce-caption">{t("cardEditor.avatar.sourcesHint")}</p>
          </div>
          <div className="ce-avatar-canvas-wrap">
            <canvas
              ref={canvasRef}
              className="ce-avatar-canvas"
              width={size.width}
              height={size.height}
              tabIndex={0}
              aria-label={t("cardEditor.avatar.canvasLabel")}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              onKeyDown={onKeyDown}
            />
            <p className="ce-caption" role="status">
              {currentCard ? t("cardEditor.avatar.selected", { name: currentCard.name, zoom: currentScale }) : ""}
            </p>
          </div>
          <div className="ce-avatar-controls">
            <div className="ce-label">
              <span className="ce-label-title">{t("cardEditor.avatar.layout")}</span>
              <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.avatar.layout")}>
                {(["square", "portrait", "best-fit"] as const).map((method) =>
                  segment(method, layout.method, t(`cardEditor.avatar.method.${method}`), (value) =>
                    setLayout({ ...layout, method: value }),
                  ),
                )}
              </div>
            </div>
            <div className="ce-label">
              <span className="ce-label-title">{t("cardEditor.avatar.columns")}</span>
              <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.avatar.columns")}>
                {[0, 1, 2, 3, 4].map((columns) =>
                  segment(
                    columns,
                    layout.columns,
                    columns === 0 ? t("cardEditor.avatar.columnsAuto") : String(columns),
                    (value) => setLayout({ ...layout, columns: value }),
                  ),
                )}
              </div>
            </div>
            <label className="ce-label" htmlFor="ce-avatar-gap">
              <span className="ce-label-title">{t("cardEditor.avatar.gap", { gap: layout.gap })}</span>
              <input
                id="ce-avatar-gap"
                type="range"
                min={0}
                max={48}
                value={layout.gap}
                onChange={(event) => setLayout({ ...layout, gap: Number(event.target.value) })}
              />
            </label>
            <label className="ce-label" htmlFor="ce-avatar-zoom">
              <span className="ce-label-title">{t("cardEditor.avatar.zoom", { zoom: currentScale })}</span>
              <input
                id="ce-avatar-zoom"
                type="range"
                min={floorFor(safeCurrent)}
                max={200}
                value={currentScale}
                disabled={!currentCard}
                onChange={(event) =>
                  setOffset(safeCurrent, (offset, floor) =>
                    normalizeOffset({ ...offset, scale: Number(event.target.value) }, floor),
                  )
                }
              />
            </label>
            <div className="ce-label">
              <span className="ce-label-title">{t("cardEditor.avatar.resolution")}</span>
              <div className="ce-segmented" role="radiogroup" aria-label={t("cardEditor.avatar.resolution")}>
                {([1, 2, 4] as const).map((resolution) =>
                  segment(resolution, layout.resolution, `${512 * resolution}×${768 * resolution}`, (value) =>
                    setLayout({ ...layout, resolution: value }),
                  ),
                )}
              </div>
            </div>
            <div className="ce-inline-controls">
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--small"
                disabled={!currentCard}
                onClick={() => setOffset(safeCurrent, () => DEFAULT_OFFSET)}
              >
                {t("cardEditor.avatar.resetCell")}
              </button>
              <button
                type="button"
                className="mari-chrome-control mari-chrome-control--small"
                onClick={() => setOffsets({})}
              >
                {t("cardEditor.avatar.resetAll")}
              </button>
            </div>
            <p className="ce-caption">{t("cardEditor.avatar.keys")}</p>
          </div>
        </div>
        <div className="ce-dialog-foot">
          {message ? (
            <div
              className={`ce-status${message.tone === "error" ? " ce-status--error" : ""} ce-foot-error`}
              role={message.tone === "error" ? "alert" : "status"}
            >
              {message.text}
            </div>
          ) : null}
          <label className="ce-label ce-studio-name" htmlFor="ce-avatar-target">
            <span className="ce-sr-only">{t("cardEditor.avatar.target")}</span>
            <select
              id="ce-avatar-target"
              className="mari-chrome-field ce-field"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              {targets.length === 0 ? <option value="">{t("cardEditor.avatar.noTargets")}</option> : null}
              {targets.map((id) => (
                <option key={id} value={id}>
                  {t("cardEditor.avatar.targetOption", { name: byId.get(id)?.name ?? id })}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small"
            disabled={busy || !targetId || cards === null}
            onClick={() => void apply()}
          >
            {busy ? t("cardEditor.avatar.applying") : t("cardEditor.avatar.apply")}
          </button>
        </div>
      </section>
    </div>
  );
}
