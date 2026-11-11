This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/](http://localhost:3000/) with your browser to see the result.

The storefront is at [https://nihan.glifnode.com/](https://nihan.glifnode.com/). Existing storefront links under `/dashboard/` redirect to the corresponding root paths.

The storefront reads active products and variants from Laravel. Set `NIHAN_CATALOG_API_URL` to the Laravel origin reachable from the Next.js server. It defaults to `http://localhost:97` for local development. Laravel's `APP_URL` must point to the browser-accessible Laravel origin so uploaded images load.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy to the VPS

Clone this repository on the VPS and ensure the deployment user can pull `main` and run Docker Compose with `up --wait`.

Copy `.env.example` to `.env` in the VPS checkout and configure these values.

- `NIHAN_CATALOG_API_URL` is the Laravel origin reachable from the container. Use the production Laravel origin when deploying.
- `PORT` is the VPS loopback port used by the reverse proxy. It defaults to `1008`, and production uses `1013`. Forward the storefront domain to Next.js with paths intact.
- `NIHAN_HERO_VIDEO_ID` optionally overrides the storefront's default YouTube video. Deploy again after changing it so the build includes the new ID.

Set these GitHub Actions repository secrets.

- `VPS_ROOT_ACCESS` is the SSH destination, for example `ssh root@example.com`.
- `VPS_PASSWORD` is the password for that SSH user.
- `VPS_PROJECT_DIR` is the absolute path to this repository on the VPS.

Every push to `main` triggers the deployment. You can also run **CI/CD** manually from the Actions tab on `main`. The workflow builds the image on the VPS and checks container health at `/`.

To use the same command-line deployment flow as Zaxcode, run `./bash/git_bash.sh local "your commit message"` to commit your changes and `./bash/git_bash.sh production` to push `main` and watch the deployment with the authenticated GitHub CLI.
