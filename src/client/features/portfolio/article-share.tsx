import { createSignal, onCleanup, Show } from "solid-js";
import { IconCheck, IconLink } from "@tabler/icons-solidjs";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { analytics_capture } from "@/client/analytics/analytics";
import type { Article } from "@/lib/articles/article-metadata";
import { site } from "@/shared/seo/site";
import { getLocale } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

export function ArticleShare(props: { article: Article }) {
  const [copy, setCopy] = createSignal<"idle" | "copied" | "failed">("idle");
  let reset: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(reset));

  const url = () => `${site.origin}/writing/${encodeURIComponent(props.article.slug)}`;

  const copyLink = async () => {
    clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(url());
      setCopy("copied");
      analytics_capture("article_shared", {
        article_slug: props.article.slug,
        locale: getLocale(),
        method: "copy",
      });
    } catch {
      setCopy("failed");
    }
    reset = setTimeout(() => setCopy("idle"), 2000);
  };

  const status = () =>
    ({ idle: "", copied: m.article_link_copied(), failed: m.article_copy_failed() })[copy()];

  return (
    <>
      <Tooltip label={m.article_copy_link()}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps({ onClick: copyLink })}
            aria-label={m.article_copy_link()}
            class="size-11 sm:size-[34px]"
          >
            <Show when={copy() === "copied"} fallback={<IconLink size={18} aria-hidden="true" />}>
              <IconCheck size={18} aria-hidden="true" />
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
