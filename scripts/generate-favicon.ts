import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Renderer, type Node } from "@takumi-rs/core";

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

function favicon(size: number): Node {
  return {
    type: "container",
    style: {
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
      backgroundColor: "#fafafa",
      border: `${size / 16}px solid #737373`,
      color: "#171717",
      fontFamily: "Geist Mono",
      fontSize: (size * 5) / 8,
      fontWeight: 700,
      lineHeight: 1,
    },
    children: [{ type: "text", text: "FB" }],
  };
}

const options = { width: 32, height: 32 };
const publicDirectory = new URL("../public/", import.meta.url);
const svg = await renderer.renderSvg(favicon(32), options);
const darkTheme = `<style>
  @media (prefers-color-scheme: dark) {
    rect { fill: #0a0a0a; }
    path[fill-rule="evenodd"] { fill: #7d7d7d; }
    g { fill: #ededed; }
  }
</style>`;
await mkdir(publicDirectory, { recursive: true });
await writeFile(
  new URL("favicon.svg", publicDirectory),
  svg.replace("</svg>", `${darkTheme}\n</svg>`),
);

const sizes = [16, 32];
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
const entries: Buffer[] = [];
const images: Buffer[] = [];
let imageOffset = header.length + sizes.length * 16;

for (const size of sizes) {
  const icon = await renderer.render(favicon(size), { width: size, height: size, format: "ico" });
  const entry = Buffer.from(icon.subarray(6, 22));
  const image = icon.subarray(entry.readUInt32LE(12));
  entry.writeUInt32LE(imageOffset, 12);
  entries.push(entry);
  images.push(image);
  imageOffset += image.length;
}

await writeFile(
  new URL("favicon.ico", publicDirectory),
  Buffer.concat([header, ...entries, ...images]),
);
