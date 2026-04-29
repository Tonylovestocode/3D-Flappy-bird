# 3D Flappy Bird

A simple browser-based **3D Flappy Bird** clone built with Three.js.

## Play on GitHub Pages (recommended)

This repo includes a GitHub Actions workflow that deploys the game automatically when you push to `main`.

### One-time setup

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **GitHub Actions**.
4. Push to `main` (or run the workflow manually from **Actions**).

After deployment, your game will be live at:

- `https://tonylovestocode.github.io/3D-Flappy-bird/`

## Open and run in VS Code

1. Open this folder in VS Code.
2. Press **F5** and choose **"Launch 3D Flappy Bird (Chrome)"**.
3. VS Code runs `npx --yes http-server . -p 8000 -c-1` from the workspace folder and opens `http://localhost:8000/index.html`.

Alternative in VS Code:

- `Terminal` → `Run Task...` → **Run 3D Flappy Bird**
- Or install **Live Server** extension and click **Go Live**.

## Run locally without VS Code

Use Node.js + npm (works on Windows/macOS/Linux):

```bash
npx --yes http-server . -p 8000 -c-1
```

Then open <http://localhost:8000/index.html> in your browser.

## If you still get HTTP 404

Verify you are in the right folder before starting the server:

```powershell
Get-Location
Get-ChildItem .\index.html
Get-ChildItem .\game.js
```

If those files are missing, `cd` into the project root and run the server again.

## Controls

- **Space** or **Click/Tap**: flap
- Avoid the pipes and ground.
- Press **Space** or click after game over to restart.
