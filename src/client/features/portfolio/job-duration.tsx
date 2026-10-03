import { createSignal, onCleanup, onMount } from "solid-js";
import { m } from "@/paraglide/messages";
import { baseLocale, type Locale } from "@/paraglide/runtime";

function monthIndex(date: string) {
  const [month, year] = date.split(".").map(Number);
  return year * 12 + month - 1;
}

export function jobDuration_format(
  start: string,
  end: string,
  now?: Date,
  locale: Locale = baseLocale,
) {
  let endMonth: number;
  if (end === "∞") {
    if (!now) return "--";
    endMonth = now.getFullYear() * 12 + now.getMonth();
  } else {
    endMonth = monthIndex(end);
  }

  // Job dates have month precision, so both endpoint months count.
  const totalMonths = Math.max(0, endMonth - monthIndex(start) + 1);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const options = { locale };
  if (!years) return m.job_duration_months({ months }, options);
  if (!months) return m.job_duration_years({ years }, options);
  return m.job_duration({ years, months }, options);
}

export function JobDuration(props: { start: string; end: string; locale: Locale }) {
  const [now, setNow] = createSignal<Date>();

  // The visitor's clock keeps ongoing durations current on prerendered pages.
  onMount(() => {
    if (props.end !== "∞") return;
    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 60_000);
    onCleanup(() => clearInterval(interval));
  });

  return <span>{jobDuration_format(props.start, props.end, now(), props.locale)}</span>;
}
