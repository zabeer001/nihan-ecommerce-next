# Deployment helper

This project follows the same GitHub Actions deployment flow as the hospital frontend.

## GitHub repository secrets

Configure these secrets before the first deployment:

- `VPS_ROOT_ACCESS`: SSH destination, for example `ssh root@example.com`.
- `VPS_PASSWORD`: SSH password.
- `VPS_PROJECT_DIR`: absolute path to this repository on the VPS.
- `VPS_APP_CONTAINER`: use `zaxcode-next` unless `container_name` is changed.

The VPS project directory must contain a production `.env` with non-local values for:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_DASHBOARD_URL`
- `LARAVEL_API_BASE_URL`
- `REVALIDATION_SECRET`
- `PORT`

`REVALIDATION_SECRET` must match the value configured in the Laravel application.

For Zaxcode production, use `https://zaxcode.com` for `NEXT_PUBLIC_SITE_URL`
and `https://api.zaxcode.com` for both `NEXT_PUBLIC_DASHBOARD_URL` and
`LARAVEL_API_BASE_URL`.

## Commands

Create a local commit:

```bash
./bash/git_bash.sh local "your commit message"
```

Push `main`, trigger GitHub Actions, and watch the deployment when GitHub CLI is available:

```bash
./bash/git_bash.sh production
```

Every push to `main` also triggers `.github/workflows/deploy.yml` automatically.
