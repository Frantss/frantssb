import { IconHeartFilled } from "@tabler/icons-solidjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import {
  createSignal,
  createUniqueId,
  ErrorBoundary,
  Show,
  splitProps,
  Suspense,
  type ComponentProps,
} from "solid-js";
import { orpc } from "@/client/orpc/orpc.query";
import { article_likesQueryOptions } from "@/client/features/portfolio/article-likes.query";
import { m } from "@/paraglide/messages";

export function ArticleLikeButton(props: { slug: string }) {
  return (
    <Show when={props.slug} keyed>
      {(slug) => (
        <ErrorBoundary
          fallback={(_error, reset) => (
            <div class="grid justify-items-end gap-2">
              <LikePill aria-label={m.article_likes_retry()} onClick={reset}>
                {m.article_likes_retry()}
              </LikePill>
              <p role="alert" class="m-0 max-w-[28ch] text-right text-xs text-muted">
                {m.article_likes_load_error()}
              </p>
            </div>
          )}
        >
          <Suspense
            fallback={
              <LikePill disabled aria-label={m.article_likes_loading()}>
                …
              </LikePill>
            }
          >
            <ArticleLikeCounter slug={slug} />
          </Suspense>
        </ErrorBoundary>
      )}
    </Show>
  );
}

function ArticleLikeCounter(props: { slug: string }) {
  const queryClient = useQueryClient();
  const [failed, setFailed] = createSignal(false);
  const errorId = createUniqueId();
  const query = useQuery(() => article_likesQueryOptions(props.slug));
  const mutation = useMutation(() => orpc.articles.likes.add.mutationOptions({ retry: false }));

  async function addLike() {
    const input = { slug: props.slug };
    const queryKey = orpc.articles.likes.get.queryKey({ input });
    setFailed(false);
    try {
      await queryClient.cancelQueries({ queryKey });
      const output = await mutation.mutateAsync(input);
      queryClient.setQueryData(queryKey, (previous) => ({
        count: Math.max(previous?.count ?? 0, output.count),
      }));
    } catch {
      setFailed(true);
    }
  }

  return (
    <div class="grid justify-items-end gap-2">
      <LikePill
        aria-label={m.article_like({ count: query.data?.count ?? 0 })}
        aria-describedby={failed() ? errorId : undefined}
        onClick={addLike}
      >
        {query.data?.count}
      </LikePill>
      <span role="status" class="sr-only">
        {m.article_likes_count({ count: query.data?.count ?? 0 })}
      </span>
      <Show when={failed()}>
        <p id={errorId} role="alert" class="m-0 max-w-[28ch] text-right text-xs text-muted">
          {m.article_likes_save_error()}
        </p>
      </Show>
    </div>
  );
}

function LikePill(props: ComponentProps<"button"> & { "aria-label": string }) {
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <button
      type="button"
      {...rest}
      class="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-1.5 font-[inherit] text-sm font-semibold text-muted hover:bg-line hover:text-fg disabled:cursor-wait motion-safe:transition-[color,background-color,transform] motion-safe:duration-150 motion-safe:active:scale-95"
    >
      <IconHeartFilled size={20} aria-hidden="true" />
      <span class="tabular-nums" aria-hidden="true">
        {local.children}
      </span>
    </button>
  );
}
