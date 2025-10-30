# Golf Statistics Tracker

A comprehensive personal golf statistics dashboard with advanced analytics and visualizations.

## Features

- **Dashboard**: Overview of scoring summary, shot statistics, and recent form
- **Goals Tracking**: Burndown chart showing progress toward handicap goals
- **Scoring Analysis**: Handicap trends, score history, and performance heatmaps
- **Performance Analytics**: Personal records, momentum tracking, and hole-type analysis
- **Shot Analytics**: Accuracy metrics, putting performance, and strokes gained estimates
- **Course Performance**: Track improvement at specific courses

## Tech Stack

- TypeScript
- Vanilla JavaScript (no frameworks)
- SVG-based charts and visualizations
- GHIN API integration for handicap data

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- A GHIN account for data fetching

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env` (if applicable)
2. Add your GHIN credentials

### Development

```bash
# Fetch latest data from GHIN
npm run fetch-data

# Build the project
npm run build

# Serve locally
npm run serve
```

### Deployment

#### Initial Setup

1. **Create GitHub Repository Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add two secrets:
     - `GHIN_USERNAME`: Your GHIN username/email
     - `GHIN_PASSWORD`: Your GHIN password

2. **Deploy manually the first time:**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source should be set to `gh-pages` branch

#### Automatic Updates

The site will automatically update daily at midnight Pacific Time via GitHub Actions. The workflow:
- Fetches latest data from GHIN
- Rebuilds the site
- Deploys to GitHub Pages

You can also trigger a manual update from the Actions tab in GitHub.

## Project Structure

```
├── src/
│   ├── data/          # Data processing logic
│   ├── ui/            # UI rendering functions
│   ├── types.ts       # TypeScript type definitions
│   └── app.ts         # Main application entry
├── dist/              # Built files (served by GitHub Pages)
├── scripts/           # Build and data fetching scripts
└── ghin-data.json     # Cached GHIN data
```

## License

MIT
