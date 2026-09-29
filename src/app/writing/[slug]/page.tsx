import type { Metadata } from "next";
import { getPost, getSlugs } from "@/lib/writing";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getSlugs()).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { meta } = await getPost(slug);
  return { title: meta.title, description: meta.summary };
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const { default: Content, meta } = await getPost(slug);

  const date = new Date(meta.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-24">
      <header>
        <h1 className="font-medium tracking-tight">{meta.title}</h1>
        <time dateTime={meta.date} className="text-muted">
          {date}
        </time>
      </header>
      <article className="mt-10">
        <Content />
      </article>
    </main>
  );
}
