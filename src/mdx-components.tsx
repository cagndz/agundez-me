import type { MDXComponents } from "mdx/types";
import { ModalDemo } from "@/components/modal-demo";

const components: MDXComponents = {
  ModalDemo,
  h2: (props) => (
    <h2 className="mt-12 mb-3 font-medium tracking-tight" {...props} />
  ),
  p: (props) => <p className="mt-5 leading-7" {...props} />,
  a: ({ href, ...props }) => {
    const external = href?.startsWith("http");
    return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="underline decoration-border underline-offset-4 transition-colors duration-150 ease-out-strong hover:decoration-accent"
      {...props}
    />
    );
  },
  ul: (props) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-5 leading-7 marker:text-muted"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-border/60 px-1.5 py-0.5 font-mono text-[0.9em] in-[pre]:bg-transparent in-[pre]:p-0 in-[pre]:text-[1em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-5 overflow-x-auto rounded-xs p-4 font-mono text-sm leading-6"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
