import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { IconCheck, IconLink, IconShare2 } from "@tabler/icons-solidjs";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { analytics_capture } from "@/client/analytics/analytics";
import type { Article } from "@/lib/articles/article-metadata";
import { site } from "@/shared/seo/site";
import { getLocale } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

// The server renders the copy variant; the share sheet is only detectable after hydration.
export function ArticleShare(props: { article: Article }) {
  const [canShare, setCanShare] = createSignal(false);
  const [copy, setCopy] = createSignal<"idle" | "copied" | "failed">("idle");
  let reset: ReturnType<typeof setTimeout> | undefined;
  onMount(() => setCanShare(typeof navigator.share === "function"));
  onCleanup(() => clearTimeout(reset));

  const url = () => `${site.origin}/writing/${encodeURIComponent(props.article.slug)}`;
  const capture = (method: "native" | "copy") =>
    analytics_capture("article_shared", {
      article_slug: props.article.slug,
      locale: getLocale(),
      method,
    });

  const share = async () => {
    if (canShare()) {
      try {
        await navigator.share({
          title: props.article.title,
          text: props.article.description,
          url: url(),
        });
        capture("native");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(url());
      setCopy("copied");
      capture("copy");
    } catch {
      setCopy("failed");
    }
    reset = setTimeout(() => setCopy("idle"), 2000);
  };

  const label = () => (canShare() ? m.article_share() : m.article_copy_link());
  const status = () =>
    ({ idle: "", copied: m.article_link_copied(), failed: m.article_copy_failed() })[copy()];

  return (
    <>
      <Tooltip label={label()}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps({ onClick: share })}
            aria-label={label()}
            class="size-11 sm:size-[34px]"
          >
            <Show when={copy() !== "copied"} fallback={<IconCheck size={18} aria-hidden="true" />}>
              <Show when={canShare()} fallback={<IconLink size={18} aria-hidden="true" />}>
                <IconShare2 size={18} aria-hidden="true" />
              </Show>
            </Show>
          </IconButton>
        )}
      </Tooltip>
      <span role="status" class="sr-only">
        {status()}
      </span>
    </>
  );
}
