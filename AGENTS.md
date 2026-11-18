# Agent Instructions

## Scope and token efficiency

- Keep work concise and use the lowest-token approach that can safely complete the request.
- Prefer direct source inspection, a focused edit, and one proportional verification command.
- Do not use Chrome or other browser automation unless the user explicitly requests browser testing.
- Do not perform broad searches, extensive visual inspection, repeated verification, or lengthy integration workflows unless requested. If such work is necessary, explain why and ask permission first.
- Stop once the requested outcome is implemented and verified; avoid optional experiments.

## Next.js workflow

- Read the relevant bundled Next.js documentation before changing framework-specific behavior, as required below.
- For small UI changes, inspect the component and its directly related styles; avoid scanning the entire repository.
- Use a focused lint or TypeScript check when appropriate. Run a production build only when the change requires it or the user requests it.
- Do not start or restart the development server solely for optional browser verification.
- Preserve existing user edits and keep changes within the requested scope.
- Homepage media, headings, descriptions, and buttons are managed by the Laravel backend. Do not introduce replacement content, hardcoded marketing copy, or filters that exclude backend media types unless explicitly requested.
- For autoplay changes, handle rejected playback promises and provide interaction-based retries. Do not claim playback was verified on Apple devices without testing there.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
