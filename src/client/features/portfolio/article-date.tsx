// Article dates are stored as YYYY.MM.DD; <time> needs the ISO form.
export function ArticleDate(props: { date: string; class?: string }) {
  return (
    <time dateTime={props.date.replaceAll(".", "-")} class={props.class}>
      {props.date}
    </time>
  );
}
