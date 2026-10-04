import { IconCheck, IconSearch, IconAdjustmentsHorizontal } from "@tabler/icons-solidjs";
import { createDebouncer } from "@tanstack/solid-pacer/debouncer";
import { createEffect, createSignal, createUniqueId, For, Show } from "solid-js";
import { cn } from "@/client/lib/cn";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { m } from "@/paraglide/messages";
import type { ArticleSearch } from "@/client/features/portfolio/articles.query";

export function ArticleSearchFilter(props: {
  search: ArticleSearch;
  tags: string[];
  onChange: (search: ArticleSearch, replace: boolean) => void;
}) {
  const [draft, setDraft] = createSignal(props.search.q ?? "");
  const [expanded, setExpanded] = createSignal(false);
  const filtersId = createUniqueId();
  let submittedQuery = props.search.q ?? "";
  const debouncedSearch = createDebouncer(() => change(props.search.tag, true), { wait: 250 });

  createEffect(() => {
    const query = props.search.q ?? "";

    if (query === submittedQuery) return;
    debouncedSearch.cancel();
    submittedQuery = query;
    setDraft(query);
  });

  function change(tag: string | undefined, replace: boolean) {
    debouncedSearch.cancel();
    submittedQuery = draft().trim();
    props.onChange({ q: submittedQuery || undefined, tag }, replace);
  }

  return (
    <div class="grid">
      <form
        role="search"
        class="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          change(props.search.tag, true);
        }}
      >
        <label class="flex h-11 min-w-0 flex-1 items-center gap-2 border border-line-strong px-2.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2 sm:h-[34px]">
          <IconSearch size={16} class="shrink-0 text-muted" aria-hidden="true" />
          <span class="sr-only">{m.writing_search()}</span>
          <input
            type="search"
            maxLength={200}
            value={draft()}
            placeholder={m.writing_search_placeholder()}
            class="h-full min-w-0 w-full border-0 bg-transparent p-0 font-[inherit] text-base text-fg placeholder:text-faint focus-visible:outline-none sm:text-sm"
            onInput={(event) => {
              setDraft(event.currentTarget.value);
              if (!event.isComposing) debouncedSearch.maybeExecute();
            }}
            onCompositionStart={() => debouncedSearch.cancel()}
            onCompositionEnd={() => debouncedSearch.maybeExecute()}
          />
        </label>
        <Tooltip label={m.writing_filters()}>
          {(triggerProps) => (
            <IconButton
              {...triggerProps({ onClick: () => setExpanded((value) => !value) })}
              aria-label={m.writing_filters()}
              aria-expanded={expanded()}
              aria-controls={filtersId}
              class={cn("size-11 shrink-0 sm:size-[34px]", {
                "border-accent text-accent": expanded() || !!props.search.tag,
              })}
            >
              <IconAdjustmentsHorizontal size={18} aria-hidden="true" />
            </IconButton>
          )}
        </Tooltip>
      </form>
      <div
        id={filtersId}
        role="group"
        aria-label={m.writing_filter_by_tag()}
        aria-hidden={!expanded()}
        inert={!expanded()}
        class={cn(
          "-mx-1 grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none",
          expanded() ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
        )}
      >
        <div class="min-h-0 overflow-hidden">
          <div class="flex flex-wrap gap-1.5 px-1 pt-3 pb-1">
            <For each={["", ...props.tags]}>
              {(tag) => {
                const selected = () => (props.search.tag ?? "") === tag;

                return (
                  <button
                    type="button"
                    aria-pressed={selected()}
                    class={cn(
                      "inline-flex min-h-6 cursor-pointer items-center gap-1 border border-line-strong bg-transparent px-2 font-[inherit] text-xs text-muted hover:border-faint hover:text-fg pointer-coarse:min-h-11",
                      { "border-accent text-accent": selected() },
                    )}
                    onClick={() => change(tag || undefined, false)}
                  >
                    <Show when={selected()}>
                      <IconCheck size={12} aria-hidden="true" />
                    </Show>
                    {tag || m.writing_all_tags()}
                  </button>
                );
              }}
            </For>
          </div>
        </div>
      </div>
      <Show when={draft() || props.search.tag}>
        <button
          type="button"
          class="mt-3 justify-self-end cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-xs text-link pointer-coarse:min-h-11"
          onClick={() => {
            setDraft("");
            change(undefined, false);
          }}
        >
          {m.writing_clear_filters()}
        </button>
      </Show>
    </div>
  );
}
