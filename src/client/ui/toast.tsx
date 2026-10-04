import { createToaster, Toast, Toaster, type CreateToasterReturn } from "@ark-ui/solid/toast";
import { IconX } from "@tabler/icons-solidjs";
import { createContext, onCleanup, useContext, type ParentProps } from "solid-js";
import { Portal } from "solid-js/web";
import { IconButton } from "@/client/ui/icon-button";
import { m } from "@/paraglide/messages";

export function ToastProvider(props: ParentProps) {
  const toaster = createToaster({
    placement: "bottom-end",
    duration: 5000,
    max: 3,
    offsets: {
      bottom: "calc(5rem + env(safe-area-inset-bottom))",
      top: "1rem",
      left: "1rem",
      right: "1rem",
    },
  });

  onCleanup(() => toaster.remove());

  return (
    <ToastContext.Provider value={toaster}>
      {props.children}
      <Portal>
        <Toaster toaster={toaster} aria-label={m.toast_notifications()}>
          {(toast) => (
            <Toast.Root class="toast flex w-[min(24rem,calc(100vw-2rem))] items-center gap-3 border border-line-strong bg-surface p-3 text-sm text-fg">
              <Toast.Title class="min-w-0 flex-1">{toast().title}</Toast.Title>
              <Toast.CloseTrigger
                asChild={(triggerProps) => (
                  <IconButton
                    {...triggerProps()}
                    aria-label={m.toast_dismiss()}
                    class="shrink-0 pointer-coarse:size-11"
                  >
                    <IconX size={16} aria-hidden="true" />
                  </IconButton>
                )}
              />
            </Toast.Root>
          )}
        </Toaster>
      </Portal>
    </ToastContext.Provider>
  );
}

const ToastContext = createContext<CreateToasterReturn>();

export function useToast() {
  const toaster = useContext(ToastContext);

  if (!toaster) throw new Error("useToast requires ToastProvider");

  return toaster;
}
