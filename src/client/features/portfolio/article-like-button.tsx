import { IconHeart, IconHeartFilled } from "@tabler/icons-solidjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import {
  createSignal,
  createUniqueId,
  ErrorBoundary,
  onMount,
  Show,
  splitProps,
  Suspense,
  type ComponentProps,
} from "solid-js";
import { orpc } from "@/client/orpc/orpc.query";
import { IconButton } from "@/client/ui/icon-button";
import { article_likesQueryOptions } from "@/client/features/portfolio/article-likes.query";
import { m } from "@/paraglide/messages";

export function ArticleLikeButton(props: { slug: string }) {
  return (
    <Show when={props.slug} keyed>
      {(slug) => (
        <ErrorBoundary
          fallback={(_error, reset) => (
            <div class="grid justify-items-end gap-2">
              <LikeButton aria-label={m.article_likes_retry()} onClick={reset}>
                {m.article_likes_retry()}
              </LikeButton>
              <p role="alert" class="m-0 max-w-[28ch] text-right text-xs text-muted">
                {m.article_likes_load_error()}
              </p>
            </div>
          )}
        >
          <Suspense
            fallback={
              <LikeButton disabled aria-label={m.article_likes_loading()}>
                …
              </LikeButton>
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
  const [liked, setLiked] = createSignal(false);
  const [animationKey, setAnimationKey] = createSignal(1);
  const errorId = createUniqueId();
  const query = useQuery(() => article_likesQueryOptions(props.slug));
  const mutation = useMutation(() => orpc.articles.likes.add.mutationOptions({ retry: false }));

  onMount(() => {
    try {
      setLiked(localStorage.getItem(`article:liked:${props.slug}`) === "true");
    } catch {
      setLiked(false);
    }
  });

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

      return;
    }
    setLiked(true);
    setAnimationKey((key) => key + 1);
    try {
      localStorage.setItem(`article:liked:${input.slug}`, "true");
    } catch {
      // A saved like still applies to this visit when browser storage is unavailable.
    }
  }

  return (
    <div class="grid justify-items-end gap-2">
      <LikeButton
        liked={liked()}
        animationKey={animationKey()}
        aria-label={m.article_like({ count: query.data?.count ?? 0 })}
        aria-describedby={failed() ? errorId : undefined}
        onClick={addLike}
      >
        {query.data?.count}
      </LikeButton>
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

function LikeButton(
  props: ComponentProps<"button"> & {
    "aria-label": string;
    liked?: boolean;
    animationKey?: number;
  },
) {
  const [local, rest] = splitProps(props, ["children", "liked", "animationKey"]);

  return (
    <IconButton
      {...rest}
      class="inline-flex h-11 w-auto items-center justify-center gap-2 px-2 text-sm disabled:cursor-wait sm:h-[34px]"
    >
      <Show when={local.animationKey ?? 1} keyed>
        {(key) => (
          <span
            class="inline-flex size-[18px] shrink-0"
            classList={{ "article-like-heart": key > 1 }}
            aria-hidden="true"
          >
            <Show when={local.liked} fallback={<IconHeart size={18} />}>
              <IconHeartFilled size={18} class="text-red-500" />
            </Show>
          </span>
        )}
      </Show>
      <span class="tabular-nums" aria-hidden="true">
        {local.children}
      </span>
    </IconButton>
  );
}
