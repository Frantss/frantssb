# Compound components with a reactive contract

The context object below is stable; `state.text` is an explicitly typed accessor. This is intentional dependency injection, distinct from ordinary value props at JSX call sites. A store-backed provider could implement `text: () => store.text` and the same `setText` action.

```tsx
import {
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type ParentProps,
  type Ref,
} from "solid-js";

interface ComposerValue {
  state: { text: Accessor<string> };
  actions: {
    setText: (value: string) => void;
    submit: () => void;
  };
}

const ComposerContext = createContext<ComposerValue>();

function useComposer() {
  const composer = useContext(ComposerContext);
  if (!composer) throw new Error("Composer components must be rendered inside Composer.Provider");
  return composer;
}

function ComposerProvider(props: ParentProps<{ onSubmit: (text: string) => void }>) {
  const [text, setText] = createSignal("");
  const value: ComposerValue = {
    state: { text },
    actions: {
      setText: (next) => {
        setText(next);
      },
      submit: () => props.onSubmit(text()),
    },
  };

  return <ComposerContext.Provider value={value}>{props.children}</ComposerContext.Provider>;
}

function ComposerFrame(props: ParentProps) {
  const composer = useComposer();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        composer.actions.submit();
      }}
    >
      {props.children}
    </form>
  );
}

function ComposerInput(props: { ref?: Ref<HTMLTextAreaElement> }) {
  const composer = useComposer();
  return (
    <textarea
      aria-label="Message"
      ref={props.ref}
      value={composer.state.text()}
      onInput={(event) => composer.actions.setText(event.currentTarget.value)}
    />
  );
}

function ComposerSubmit(props: ParentProps) {
  const composer = useComposer();
  return (
    <button type="submit" disabled={!composer.state.text().trim()}>
      {props.children}
    </button>
  );
}

function ComposerFooter(props: ParentProps) {
  return <footer>{props.children}</footer>;
}

const Composer = {
  Provider: ComposerProvider,
  Frame: ComposerFrame,
  Input: ComposerInput,
  Submit: ComposerSubmit,
  Footer: ComposerFooter,
};

function MessagePreview() {
  const composer = useComposer();
  return <output>{composer.state.text()}</output>;
}

export function MessageComposer(props: { onSend: (text: string) => void }) {
  return (
    <Composer.Provider onSubmit={props.onSend}>
      <Composer.Frame>
        <Composer.Input />
        <Composer.Footer>
          <Composer.Submit>Send</Composer.Submit>
        </Composer.Footer>
      </Composer.Frame>
      <MessagePreview />
    </Composer.Provider>
  );
}

export function ForwardComposer(props: { onForward: (text: string) => void }) {
  return (
    <Composer.Provider onSubmit={props.onForward}>
      <MessagePreview />
      <Composer.Frame>
        <Composer.Input />
        <Composer.Submit>Forward</Composer.Submit>
      </Composer.Frame>
    </Composer.Provider>
  );
}
```

`Composer.Provider` is an application-defined compound component. It owns the state and renders Solid's `<ComposerContext.Provider value={value}>`.

The preview is outside the form but inside the provider. Its state updates through the same accessor as the input. Each provider invocation owns a separate signal. The explicit variants choose layout and submit behavior without structural boolean flags.

`Composer.Submit` belongs inside the form. An action outside the form can use a `type="button"` button calling `composer.actions.submit`, or an explicit native form association; it must not depend on a nonexistent form ancestor.

For a controlled variant, let the provider adapt current parent props into the contract with an accessor such as `text: () => props.text` and an action invoking `props.onTextChange(next)`. Keep one state owner rather than copying parent state into a second signal and synchronizing with an effect.

When an entity identifier changes, decide whether the draft should persist or reset. Keep the owner for persistence; use a verified keyed boundary or an explicit reset action for reset behavior. A React `key` convention does not establish Solid ownership semantics.

## Source checks

Verified against the installed 1.9.15 package:

- `node_modules/solid-js/types/reactive/signal.d.ts`: signals, context, lifecycle, and children.
- `node_modules/solid-js/types/render/component.d.ts`: `ParentProps`, `Ref`, `mergeProps`, and `splitProps`.
- `node_modules/solid-js/types/jsx.d.ts`: DOM event, class, and ref types.

Paths are relative to the project root. Revalidate against the installed package on upgrades.
