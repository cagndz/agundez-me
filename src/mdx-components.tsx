import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-12 mb-3 font-medium tracking-tight" {...props} />
  ),
  p: (props) => <p className="mt-5 leading-7" {...props} />,
  a: (props) => (
    <a
      className="underline decoration-border underline-offset-4 transition-colors duration-150 ease-out-strong hover:decoration-accent"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-5 leading-7 marker:text-muted"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-border/60 px-1.5 py-0.5 font-mono text-[0.9em]"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
