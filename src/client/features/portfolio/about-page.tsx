import { Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { Facts } from "@/client/ui/facts";
import { LocalTime } from "@/client/ui/local-time";
import { Page, PageTitle, Paragraphs } from "@/client/ui/page";
import { profile } from "./portfolio.data";

export function AboutPage() {
  return (
    <Page class="max-w-[60ch]">
      <PageTitle>{profile.name}</PageTitle>
      <Facts.List>
        <Facts.Item label="role">{profile.role}</Facts.Item>
        <Facts.Item label="based">{profile.location}</Facts.Item>
        <Facts.Item label="time">
          <LocalTime utcOffset={profile.utcOffset} />
        </Facts.Item>
        <Facts.Item label="mail">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </Facts.Item>
      </Facts.List>
      <Paragraphs items={profile.about} />
      <p class="m-0">
        More in <Link to="/work">work</Link>; find me on <ProfileLinks />
      </p>
    </Page>
  );
}

function ProfileLinks() {
  return (
    <For each={profile.links}>
      {(link, index) => (
        <>
          <a href={link.href}>{link.label}</a>
          {index() < profile.links.length - 1 ? ", " : "."}
        </>
      )}
    </For>
  );
}
