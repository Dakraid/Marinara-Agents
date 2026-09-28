import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { SlpDeepDetailsImageRun, SlpDeepDetailsResponse } from "../../../../../shared/src/slp/slp-deep-details.js";
import { readSlpPurpose, type SlpPurpose } from "../../../../../shared/src/slp/slp-post-purpose.js";
import { SLP_GROUP_CLASS, SLP_TYPE } from "../../base/chrome/SlpChrome";
import { Block, formatRate, formatTime, Rows, StepStatus, str, type SlpStepStatus } from "./SlpDeepDetailsParts";

const join = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

/** What the post or Story was for, in plain words (3b). Null on posts made before purposes existed. */
export function slpPurposeSentence(purpose: SlpPurpose | null): string | null {
  if (!purpose) return null;
  switch (purpose.kind) {
    case "tease":
      return purpose.postId
        ? "Teased a locked drop, which is up now"
        : purpose.dropAt
          ? `Teases a locked drop due ${formatTime(purpose.dropAt)}`
          : "Teases what is behind the lock";
    case "drop":
      return purpose.teasePostId ? "The drop an earlier tease promised" : "A new locked drop";
    case "behind_the_scenes":
      return "Behind the scenes of a shoot";
    case "promote":
      return purpose.subject === "brand"
        ? "A paid partnership"
        : purpose.subject === "couple"
          ? "A moment of their couple story"
          : "Promotes a collab";
    case "storyline":
      return "A beat of their storyline";
    case "answer_fans":
      return "Gives fans what they asked for";
    case "thanks":
      return "Thanks fans";
    case "daily_life":
      return "A moment from their day";
    case "poll_answer":
      return `What fans picked in a Story poll: ${purpose.answer ?? "?"}`;
    case "new_post":
      return "Story that points to a new post";
    case "countdown":
      return purpose.postId ? "Story that counted down to a drop, which is up now" : "Story that counts down to a drop";
    case "poll":
      return purpose.answeredAt ? "Story poll, answered in a later post" : "Story poll: fans pick the next post";
    case "day_in_life":
      return `Story ${purpose.part ?? 2} of their day`;
    case "comment_reaction":
      return `Story that answers a comment${purpose.comment?.handle ? ` by @${purpose.comment.handle}` : ""}`;
  }
}

const RESULT_WORD: Record<SlpDeepDetailsImageRun["result"]["status"], string> = {
  saved: "saved",
  preview: "prompt only",
  failed: "failed",
};

/** Seconds the provider worked on the picture, over every attempt: "18.4 s". */
function runSeconds(run: SlpDeepDetailsImageRun) {
  const ms = run.attempts.reduce((sum, attempt) => sum + attempt.durationMs, 0);
  return ms > 0 ? `${(ms / 1000).toFixed(1)} s` : null;
}

function runStatus(run: SlpDeepDetailsImageRun): SlpStepStatus {
  if (run.result.status === "failed") return "failed";
  if (run.attempts.some((attempt) => !attempt.ok || attempt.servedBy)) return "retried";
  return "done";
}

/**
 * The phone view of Deep details (04 §9): five rows, each one line of what happened, each opening
 * to its facts. One group, hairline rows, no box inside a box; the full record stays in "All data".
 */
export function SlpDeepDetailsSummary({ data }: { data: SlpDeepDetailsResponse }) {
  const details = data.details;
  const run = details?.imageRuns?.at(-1) ?? null;
  const plan = details?.plan;
  const meta = data.post.metadata;
  const intent = plan?.intent ?? str(meta.contentIntent);
  const delivery = plan?.delivery ?? str(meta.contentDelivery);
  const planner = details?.planner;
  const claim = planner?.claimCheck;
  const imageModel = run?.connection.model ?? str(meta.imageModel);
  const imageFailed = run ? run.result.status === "failed" : meta.imageGenerationFailed === true;
  const { likes, replies, unlocks } = data.stats;
  const purpose = slpPurposeSentence(readSlpPurpose(meta));
  return (
    <div className={SLP_GROUP_CLASS}>
      <SummaryRow title="Why this post" line={purpose ?? join([intent, delivery, data.post.access])}>
        <Rows
          rows={[
            ["Purpose", purpose],
            ["Intent", intent],
            ["Delivery", delivery],
            [
              "Format",
              plan?.rotatedFormat && plan.rotatedFormat !== plan.format
                ? `${plan.rotatedFormat} → ${plan.format}`
                : (plan?.format ?? str(meta.noodlerContentFormat)),
            ],
            ["Access", data.post.access],
            ["Source", data.post.source],
            ["Free teaser", plan?.teaser ? "yes" : null],
            ["Story", plan?.story ? "yes" : null],
            ["Plan", data.plan ? data.plan.workflow : null],
            ["Planned", data.plan ? formatTime(data.plan.plannedAt) : null],
            ["Player direction", details?.direction ?? null],
            ["Subscribers asked for", plan?.demandTopic ?? null],
            [
              "Project",
              plan?.project ? join([plan.project.title, plan.project.chapter && String(plan.project.chapter)]) : null,
            ],
            ["Campaign", plan?.campaignId ?? null],
            ["Shoot", plan?.shootId ?? str(meta.shootId)],
            ["Reused picture from", plan?.reusedFromPostId ?? str(meta.reusedFromPostId)],
            ["Post number", details ? String(details.sequence + 1) : null],
          ]}
        />
      </SummaryRow>

      <SummaryRow
        title="The angle"
        line={details ? join([details.angle?.place, details.angle?.moment, details.angle?.company]) : null}
        status={details && !details.angle ? "skipped" : claim && !claim.ok ? "rejected" : undefined}
      >
        {details && (
          <Rows
            rows={[
              ["Place", details.angle?.place ?? null],
              ["Moment", details.angle?.moment ?? null],
              ["Company", details.angle?.company ?? null],
              ["Camera", details.camera ?? details.angle?.framing ?? null],
              ["Effort", details.effort],
              ["Planner", planner?.mode ?? null],
              ["Heat", planner?.heat ? `${planner.heat.planned} (dial: ${planner.heat.dial})` : null],
              ["Beat", planner?.beat ? `${planner.beat.type}: ${planner.beat.line}` : null],
              [
                "Claim check",
                claim
                  ? claim.ok
                    ? claim.revised
                      ? "passed after one revision"
                      : "passed"
                    : `${claim.revised ? "still off after revision" : "mismatch"}: ${claim.problems.join("; ")}`
                  : null,
              ],
            ]}
          />
        )}
      </SummaryRow>

      <SummaryRow
        title="The writing"
        line={
          details
            ? join([
                details.model.maxTokens ? `${details.model.maxTokens} tokens` : null,
                details.model.temperature != null ? `temp ${details.model.temperature}` : null,
                details.attempts > 1 ? `${details.attempts} attempts` : null,
              ]) || details.model.model
            : null
        }
        status={details && details.attempts > 1 ? "retried" : undefined}
      >
        {details && (
          <>
            <Rows
              rows={[
                ["Model", details.model.model],
                ["Provider", details.model.provider],
                ["Temperature", details.model.temperature?.toString() ?? null],
                ["Top P", details.model.topP?.toString() ?? null],
                ["Max tokens", details.model.maxTokens?.toString() ?? null],
                ["Attempts", String(details.attempts)],
                ["Written", formatTime(details.generatedAt)],
                ["Production style", details.strategy.style],
                ["Skipped posts", formatRate(details.strategy.skipRate)],
                ["Posts without pictures", formatRate(details.strategy.textOnlyRate)],
              ]}
            />
            <Block
              label="Writing prompt"
              text={details.messages.map((message) => `# ${message.role}\n${message.content}`).join("\n\n")}
              collapsed
            />
            <Block label="Raw response" text={details.rawResponse} collapsed />
          </>
        )}
      </SummaryRow>

      <SummaryRow
        title="The picture"
        line={
          run
            ? join([imageModel, runSeconds(run), RESULT_WORD[run.result.status]])
            : data.post.imageUrl
              ? join([imageModel, "saved"])
              : imageFailed
                ? "failed"
                : "No picture"
        }
        status={run ? runStatus(run) : imageFailed ? "failed" : undefined}
      >
        <Rows
          rows={[
            ["Image model", imageModel],
            ["Connection", run ? (run.connection.name ?? run.connection.id) : str(meta.imageProvider)],
            ["Style profile", run?.styleProfile.name ?? str(meta.imageStyleProfileId)],
            ["Size", run?.size.width && run.size.height ? `${run.size.width} × ${run.size.height}` : null],
            ["Started", run ? formatTime(run.startedAt) : null],
            ["Error", run?.result.error ?? (imageFailed ? (str(meta.imageGenerationError) ?? "yes") : null)],
            ["Image brief", details?.imageBrief ?? null],
          ]}
        />
        {(run?.finalPrompt ?? details?.providerPrompt ?? data.post.imagePrompt) && (
          <Block
            label="Prompt the picture was drawn from"
            text={(run?.finalPrompt ?? details?.providerPrompt ?? data.post.imagePrompt)!}
            collapsed
          />
        )}
      </SummaryRow>

      <SummaryRow
        title="Since it went up"
        line={join([
          `${likes} ${likes === 1 ? "like" : "likes"}`,
          `${replies} ${replies === 1 ? "reply" : "replies"}`,
          unlocks > 0 && `${unlocks} ${unlocks === 1 ? "unlock" : "unlocks"}`,
        ])}
      >
        <Rows
          rows={[
            ["Likes", String(likes)],
            ["Replies", String(replies)],
            ["Unlocks", String(unlocks)],
            ["Last edited", data.post.updatedAt !== data.post.createdAt ? formatTime(data.post.updatedAt) : null],
          ]}
        />
      </SummaryRow>
    </div>
  );
}

/** One 44 px row: title, one line of what happened, and the facts behind it when opened. */
function SummaryRow({
  title,
  line,
  status,
  children,
}: {
  title: string;
  line: string | null;
  status?: SlpStepStatus;
  children?: ReactNode;
}) {
  const open = Boolean(children) && line !== null;
  const head = (
    <>
      <span className="min-w-0 flex-1">
        <span className={`${SLP_TYPE.body} block font-semibold`}>{title}</span>
        <span className={`${SLP_TYPE.meta} block truncate text-[var(--slurp-muted)]`}>{line ?? "Not recorded"}</span>
      </span>
      {status && <StepStatus status={status} />}
    </>
  );
  if (!open) return <div className="flex min-h-14 items-center gap-3 px-4 py-2">{head}</div>;
  return (
    <details className="group">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--slurp-focus)] [&::-webkit-details-marker]:hidden">
        {head}
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-[var(--slurp-muted)] transition-transform duration-[var(--slurp-motion-base)] group-open:rotate-90 motion-reduce:transition-none"
        />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
