# agundez.me

Personal site of Carlos Agúndez, design engineer based in Spain.

[agundez.me](https://agundez.me)

## Stack

- [Next.js](https://nextjs.org) (App Router) and React 19
- TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Motion](https://motion.dev) for animation
- MDX for the writing
- Deployed on [Vercel](https://vercel.com)

## Run locally

```bash
git clone https://github.com/cagndz/agundez-me.git
cd agundez-me
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (site)/    # public pages: home and writing
│   └── (lab)/     # component experiments
├── components/    # shared UI components
├── content/       # projects, links and MDX posts
├── lab/           # lab experiments (components and demos)
└── lib/           # helpers
```

## License

All rights reserved. The code is public to read and learn from, not to reuse as a template.
