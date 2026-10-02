---
name: solid-composition-patterns
description: Solid composition patterns for this project. Use when refactoring boolean-driven component variants, designing compound components, sharing state through context, or choosing children and render-prop APIs. Adapted for Solid 1.
license: MIT
metadata:
  upstream: vercel-labs/agent-skills/skills/composition-patterns
  upstream-author: vercel
  upstream-version: "1.0.0"
---

# Solid composition patterns

Project-local adaptation of [Vercel's composition patterns](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns), originally published under MIT. The composition principles are retained; the examples and runtime guidance are rewritten for Solid. This is a local adaptation, not an official Vercel Solid skill.

## Establish the runtime

Read the installed versions in `package.json` and the relevant components before changing their interface. Verify Solid API signatures in `node_modules/solid-js/types` and `node_modules/solid-js/web/types`. These examples were checked against `solid-js` 1.9.15; recheck them after version changes.

## Composition decisions

- Replace combinations of structural mode flags with explicit variants that compose shared parts. Ordinary booleans such as `disabled` and `required` still describe valid state.
- Use compound components when callers need control over layout or included parts. Share context when the parts need a common state owner; keep simple stateless components as props and children.
- Define the state contract independently of its implementation. Expose reactive reads and domain actions; add metadata such as focus access only when a consumer needs it.
- Put shared state in the nearest provider enclosing every consumer, including previews and actions outside the visual frame. Allocate instance state inside that provider. Keep request-specific state out of module singletons in this SSR application.
- Let each provider implement the same contract using local signals, stores, or an existing service. Consumers should not depend on which implementation was chosen.
- Prefer children for structural composition. Use function children when a parent supplies data or controls evaluation, as with Solid control-flow components. Preserve those callback contracts.

Read [the compound component example](references/composition.md) when designing a provider contract, lifting state, or composing variants. It covers all three together without duplicate implementations.

## Solid 1 boundaries

- Read reactive props as `props.value` in JSX or tracked computations. Destructuring or copying their current values in the component body creates snapshots. Pass ordinary values at JSX boundaries, such as `value={text()}`; make accessor-valued APIs explicit in their types.
- Context may carry stable accessors or a store proxy. Read accessors and store properties where tracking occurs, rather than assembling a context from one-time signal reads.
- Use `createContext<T>()` and render `Context.Provider`. A context without a default can return `undefined`; a consumer hook should check for the provider and return the narrowed value.
- Forward `props.children` beneath the intended provider or control-flow boundary. Eagerly resolving children before that boundary can create them under the wrong owner. When inspection or reuse requires resolution, use `children(() => props.children)` inside the intended owner.
- Use `ParentProps` or `JSX.Element` from `solid-js` for children and DOM types. Core primitives come from `solid-js`, stores from `solid-js/store`, and DOM utilities from `solid-js/web`.
- Preserve reactive forwarding with `mergeProps` and `splitProps` when needed; plain object spreads in setup code can capture values too early.
- For DOM references, accept a Solid `Ref<T>` and forward it to the element. Read mounted elements from handlers or the appropriate lifecycle phase. Refs provide element access; shared reactive state belongs in the provider contract.
- Keep derived state in accessors or memos. `createEffect` takes one tracked callback. Use `onMount` for DOM setup and register disposal with `onCleanup`; returning a cleanup from `onMount` does not register it.
- Signal writes are synchronous. Rendering updates are synchronous outside a batch; measure DOM layout after the relevant writes and after leaving any enclosing batch.
- Forward class props as strings. Use `cn` from `@/lib/cn` to combine classes and conditional objects in JSX or reactive getters; raw arrays and objects are not Solid 1 class values.

## Verify a composition change

Check that multiple instances have isolated state, sibling consumers observe updates, input changes reach the correct action, and provider lifetime matches the intended reset behavior. For children and refs, verify creation and disposal under conditional rendering. Follow the repository's checks and browser verification requirements for application changes, including SSR and hydration.
