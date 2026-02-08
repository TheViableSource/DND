---
description: Deploy the D&D Campaign Manager to a Plesk server using Node.js
---

# Deploy to Plesk

## Prerequisites
- Plesk server with **Node.js** extension installed
- SSH access to the server
- Git repo pushed to GitHub (or files uploaded via FTP)

## Build Steps (run locally or on server)

// turbo-all

1. Install dependencies:
```bash
npm install
```

2. Build the production bundle:
```bash
npm run build
```

3. Copy static assets into the standalone folder (Next.js standalone mode does NOT include these automatically):
```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

## Plesk Configuration

1. Go to **Websites & Domains → [your domain] → Node.js**
2. Set the following:
   - **Node.js Version**: 20.x or higher
   - **Document Root**: `/httpdocs`
   - **Application Root**: `/httpdocs`
   - **Application Startup File**: `server.js`
   - **Application Mode**: `production`
3. Set environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = (leave blank — Plesk auto-assigns)
4. Click **Enable Node.js** then **Run NPM Install**
5. Click **Restart App**

## File Structure on Server

Upload the full project to `/httpdocs/`. The key files Plesk needs:

```
/httpdocs/
├── server.js              ← Plesk entry point
├── .next/
│   └── standalone/
│       ├── server.js      ← Next.js standalone server
│       ├── node_modules/  ← Minimal bundled deps
│       ├── .next/
│       │   └── static/    ← Copied from step 3
│       └── public/        ← Copied from step 3
├── package.json
└── node_modules/          ← Full deps (from npm install)
```

## Troubleshooting

- **502 error**: Check that `server.js` is set as the startup file, not `node_modules/.bin/next`
- **Static assets missing (CSS/JS 404s)**: Make sure you ran the `cp -r` commands in step 3
- **Default Plesk page showing**: Delete the default `index.html` from `/httpdocs/` if it exists
- **Port conflict**: Plesk assigns its own port via the `PORT` env var — the `server.js` entry point handles this automatically
