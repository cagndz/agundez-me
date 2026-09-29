import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

export type PostMeta = { title: string; date: string; summary: string };

const dir = path.join(process.cwd(), "src/content/writing");

export async function getSlugs() {
  const files = await readdir(dir);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function getPost(slug: string) {
  return (await import(`@/content/writing/${slug}.mdx`)) as {
    default: ComponentType;
    meta: PostMeta;
  };
}
