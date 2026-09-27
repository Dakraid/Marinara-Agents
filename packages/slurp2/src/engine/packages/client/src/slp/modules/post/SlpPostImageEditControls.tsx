import { Crop, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { SlpButton } from "../chrome/SlpButton";
import { useEffect, useMemo, type ChangeEvent, type RefObject } from "react";
import type { SlpPostImageCrop } from "../../../../../shared/src/slp/slp-social.types.js";
import { readSlpPostImageCrop } from "../../../../../shared/src/slp/slp-post-images.js";
import { useTranslation as useUiTranslation } from "react-i18next";
import { PostImageCropEditor, PostImageFrame } from "../../base/media/SlpPostImageCropEditor";
import { SLP_TYPE } from "../../base/chrome/SlpChrome";
import type { SlpPostCardModel, SlpPostImageUpdate } from "./SlpPostTypes";

type SlpPostImageCropSource =
  | {
      source: File | string;
      crop: SlpPostImageCrop | null;
      mode: "existing";
    }
  | { source: File; crop: SlpPostImageCrop | null; mode: "replace" };

interface SlpPostCardImageEditingCap {
  update: SlpPostImageUpdate | null;
  cropSource: SlpPostImageCropSource | null;
  loading: boolean;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  beginCrop: (post: SlpPostCardModel) => void;
  selectReplacement: (event: ChangeEvent<HTMLInputElement>) => void;
  applyCrop: (crop: SlpPostImageCrop) => Promise<void>;
  cancelCrop: () => void;
  remove: () => void;
  restore: () => void;
}

/**
 * The post picture in the edit sheet (design step 7): the picture, then labelled Crop · Replace ·
 * Remove. Remove is one tap and the toast offers Undo; the change is only sent on Save.
 */
export function PostImageEditControls({
  post,
  editing,
  disabled,
}: {
  post: SlpPostCardModel;
  editing: SlpPostCardImageEditingCap;
  disabled: boolean;
}) {
  const { t: localizeUi } = useUiTranslation();
  const replacement = editing.update?.kind === "replace" ? editing.update : null;
  const removed = editing.update?.kind === "remove";
  const hasImage = Boolean(replacement || (!removed && post.imageUrl));
  const busy = disabled || editing.loading;

  if (editing.cropSource) {
    return (
      <PostImageCropEditor
        source={editing.cropSource.source}
        crop={editing.cropSource.crop}
        disabled={disabled}
        onCancel={editing.cancelCrop}
        onApply={editing.applyCrop}
      />
    );
  }

  const remove = () => {
    editing.remove();
    toast(localizeUi("ui.slurp.composer.imageRemovedOnSave", { defaultValue: "Picture removed when you save" }), {
      action: {
        label: localizeUi("ui.slurp.wallet.undo", { defaultValue: "Undo" }),
        onClick: () => editing.restore(),
      },
    });
  };
  const chooseFile = () => editing.fileInputRef.current?.click();

  return (
    <section className="space-y-2" aria-label={localizeUi("ui.noodle.postimageeditcontrols.postImage")}>
      <input
        ref={editing.fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={editing.selectReplacement}
      />
      {replacement ? (
        <FileImagePreview file={replacement.file} crop={replacement.crop} />
      ) : hasImage && post.imageUrl ? (
        <PostImageFrame
          src={post.imageUrl}
          crop={editing.update?.kind === "crop" ? editing.update.crop : readSlpPostImageCrop(post.metadata)}
          alt={localizeUi("ui.noodle.postimageeditcontrols.currentPost")}
          maxHeight={320}
        />
      ) : (
        <div className="grid min-h-32 place-items-center rounded-2xl bg-[var(--slurp-surface-raised)] p-4 text-center shadow-[var(--slurp-highlight)] ring-1 ring-inset ring-[var(--noodle-divider)]">
          <div className="space-y-3">
            <p className={cn(SLP_TYPE.meta, "text-[var(--slurp-muted)]")}>
              {removed
                ? localizeUi("ui.noodle.postimageeditcontrols.removedWhenSaved")
                : localizeUi("ui.noodle.postimageeditcontrols.noImageAttached")}
            </p>
            <SlpButton variant="secondary" disabled={busy} onClick={chooseFile} className="min-h-10 px-4 text-[13px]">
              <ImagePlus size={16} aria-hidden="true" />
              {localizeUi("ui.noodle.postimageeditcontrols.addImage")}
            </SlpButton>
          </div>
        </div>
      )}
      {hasImage && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SlpButton
            variant="quiet"
            disabled={busy}
            aria-busy={editing.loading}
            onClick={() => editing.beginCrop(post)}
            className="min-h-10 px-4 text-[13px]"
          >
            {editing.loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Crop size={16} aria-hidden="true" />
            )}
            {editing.loading
              ? localizeUi("ui.noodle.postimageeditcontrols.loadingImage")
              : localizeUi("ui.slurp.composer.crop", { defaultValue: "Crop" })}
          </SlpButton>
          <SlpButton variant="quiet" disabled={busy} onClick={chooseFile} className="min-h-10 px-4 text-[13px]">
            <ImagePlus size={16} aria-hidden="true" />
            {localizeUi("ui.slurp.composer.replace", { defaultValue: "Replace" })}
          </SlpButton>
          <SlpButton variant="danger" disabled={busy} onClick={remove} className="min-h-10 px-4 text-[13px]">
            <Trash2 size={16} aria-hidden="true" />
            {localizeUi("ui.slurp.composer.remove", { defaultValue: "Remove" })}
          </SlpButton>
        </div>
      )}
      {editing.error && (
        <p role="alert" className="text-xs text-[var(--slurp-danger)]">
          {editing.error}
        </p>
      )}
    </section>
  );
}

function FileImagePreview({ file, crop }: { file: File; crop: SlpPostImageCrop }) {
  const { t: localizeUi } = useUiTranslation();
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <PostImageFrame
      src={url}
      crop={crop}
      alt={localizeUi("ui.noodle.fileimagepreview.replacementPostPreview")}
      maxHeight={320}
    />
  );
}
