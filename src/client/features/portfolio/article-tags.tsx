import { For, Show } from "solid-js";
import { Tags } from "@/client/ui/tags";

export function ArticleTags(props: { tags: string[] }) {
  return (
    <Show when={props.tags.length > 0}>
      <Tags.List>
        <For each={props.tags}>{(tag) => <Tags.Item>{tag}</Tags.Item>}</For>
      </Tags.List>
    </Show>
  );
}
