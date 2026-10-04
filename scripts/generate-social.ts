import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Renderer, type Node } from "@takumi-rs/core";
import { site } from "../src/shared/seo/site.ts";
import messages from "../messages/en.json" with { type: "json" };

const renderer = new Renderer();

await renderer.registerFont({
  name: "Geist Mono",
  data: await readFile(
    new URL(
      import.meta
        .resolve("@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2"),
    ),
  ),
});

const image: Node = {
  type: "container",
  style: {
    width: "100%",
    height: "100%",
    display: "flex",
    padding: 32,
    backgroundColor: "#fafafa",
    color: "#171717",
    fontFamily: "Geist Mono",
  },
  children: [
    {
      type: "container",
      style: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        border: "2px solid #cccccc",
        padding: 48,
        justifyContent: "space-between",
      },
      children: [
        {
          type: "container",
          style: { display: "flex", alignItems: "center", gap: 20 },
          children: [
            {
              type: "container",
              style: {
                width: 64,
                height: 64,
                display: "grid",
                placeItems: "center",
                border: "2px solid #737373",
                fontSize: 28,
                fontWeight: 700,
              },
              children: [{ type: "text", text: "FB" }],
            },
            { type: "text", text: site.name, style: { fontSize: 26, fontWeight: 700 } },
          ],
        },
        {
          type: "container",
          style: { display: "flex", flexDirection: "column", gap: 20 },
          children: [
            {
              type: "text",
              text: "Francisco Bongiovanni",
              style: { fontSize: 64, fontWeight: 700, lineHeight: 1.15 },
            },
            {
              type: "text",
              text: messages.profile_role,
              style: { fontSize: 28, color: "#4d4d4d" },
            },
          ],
        },
        {
          type: "text",
          text: new URL(site.origin).host,
          style: { fontSize: 26, color: "#6d28d9" },
        },
      ],
    },
  ],
};

const png = await renderer.render(image, {
  width: site.socialImage.width,
  height: site.socialImage.height,
  format: "png",
});
const publicDirectory = new URL("../public/", import.meta.url);

await mkdir(publicDirectory, { recursive: true });
await writeFile(new URL(`.${site.socialImage.path}`, publicDirectory), png);
