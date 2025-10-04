# Learning Tracker Backend# Vibe Coding - Backend API



A simplified Express API for fetching learning practice data from Supabase.Backend service for the Vibe Coding practice tracker application. Aggregates data from ChatGPT exports, GitHub activity, and LeetCode submissions.



## Features## Features



- ✅ Read-only API for practice data- 📊 Parse ChatGPT export files to detect writing and speaking practice

- ✅ Simple GET endpoint- 🐙 Check GitHub for commits and pushes

- ✅ Supabase integration- 💻 Check LeetCode for problem submissions

- ✅ CORS enabled- 🗄️ Store practice data in Supabase

- ✅ Ready for serverless deployment- 🔐 Secure API with rate limiting and optional API keys

- 📤 File upload support for ChatGPT exports

## API Endpoints

## Setup

### GET /health

Health check endpoint### 1. Install Dependencies

```bash

curl http://localhost:3001/health```bash

```npm install

```

### GET /api/practice

Get practice data with optional date filtering### 2. Configure Environment Variables

```bash

# Get all dataCopy `.env.example` to `.env` and fill in your values:

curl http://localhost:3001/api/practice

```bash

# Get data for specific date rangecp .env.example .env

curl "http://localhost:3001/api/practice?startDate=2024-01-01&endDate=2024-12-31"```

```

Required variables:

## Local Development- `PORT` - Server port (default: 3001)

- `FRONTEND_URL` - Your frontend URL for CORS

1. **Install dependencies**- `SUPABASE_URL` - Your Supabase project URL

```bash- `SUPABASE_KEY` - Your Supabase service role key

npm install- `GITHUB_USERNAME` - Your GitHub username

```- `LEETCODE_USERNAME` - Your LeetCode username



2. **Configure environment variables**Optional:

```bash- `GITHUB_TOKEN` - GitHub personal access token (for private repos)

cp .env.example .env- `API_KEY` - API key for endpoint security

# Edit .env with your Supabase credentials- `WRITING_MIN_CHARS` - Minimum characters to count as writing practice (default: 200)

```

### 3. Database Setup

3. **Start development server**

```bashCreate a Supabase table with this schema:

npm run dev

``````sql

CREATE TABLE daily_practice (

Server runs on `http://localhost:3001`  id BIGSERIAL PRIMARY KEY,

  date DATE UNIQUE NOT NULL,

## Environment Variables  leetcode BOOLEAN DEFAULT FALSE,

  github BOOLEAN DEFAULT FALSE,

- `SUPABASE_URL` - Your Supabase project URL (required)  writing_submitted BOOLEAN DEFAULT FALSE,

- `SUPABASE_KEY` - Your Supabase anon key (required)  writing_chars INTEGER DEFAULT 0,

- `PORT` - Server port (default: 3001)  speaking_detected BOOLEAN DEFAULT FALSE,

- `NODE_ENV` - Environment mode (development/production)  notes TEXT,

- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)  created_at TIMESTAMPTZ DEFAULT NOW(),

  updated_at TIMESTAMPTZ DEFAULT NOW()

## Database Schema);



Expected Supabase table: `practice_data`CREATE INDEX idx_daily_practice_date ON daily_practice(date DESC);

```

Columns:

- `date` (date, primary key)## Running the Server

- `github` (boolean)

- `leetcode` (boolean)### Development Mode (with auto-reload)

- `writing_submitted` (boolean)

- `writing_chars` (integer)```bash

- `speaking_detected` (boolean)npm run dev

- `notes` (text)```

- `created_at` (timestamp)

- `updated_at` (timestamp)### Production Mode



## Deploy to Vercel (Free)```bash

npm start

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)```



1. **Push code to GitHub**The server will start on `http://localhost:3001` (or your configured PORT).

```bash

git init## API Endpoints

git add .

git commit -m "Initial commit"### Health Check

git remote add origin YOUR_REPO_URL```

git push -u origin mainGET /health

``````



2. **Deploy on Vercel**### Get Practice Data

   - Go to [vercel.com](https://vercel.com)```

   - Click "Add New Project"GET /api/practice?startDate=2024-01-01&endDate=2024-12-31

   - Import your GitHub repository```

   - Select the `backend` folder as the root directory

   - Add environment variables:### Mark Practice Manually

     - `SUPABASE_URL````

     - `SUPABASE_KEY`POST /api/practice/mark

     - `FRONTEND_URL` (your frontend URL)Content-Type: application/json

   - Click "Deploy"

{

3. **Get your API URL**  "date": "2024-10-04",

   - After deployment, copy the provided URL (e.g., `https://your-api.vercel.app`)  "leetcode": true,

   - Use this URL in your frontend's `VITE_API_URL`  "github": true,

  "writing_submitted": false,

## Alternative: Deploy to Railway (Free Tier)  "writing_chars": 0,

  "speaking_detected": false,

1. Go to [railway.app](https://railway.app)  "notes": "Manual entry"

2. Click "Start a New Project"}

3. Select "Deploy from GitHub repo"```

4. Choose your repository

5. Add environment variables### Check Today's Activity

6. Click "Deploy"```

POST /api/practice/check-today

## Alternative: Deploy to Render (Free Tier)```



1. Go to [render.com](https://render.com)### Upload ChatGPT Export

2. Click "New +" → "Web Service"```

3. Connect your GitHub repositoryPOST /api/practice/upload

4. Configure:Content-Type: multipart/form-data

   - **Build Command**: `npm install`

   - **Start Command**: `npm start`file: [ChatGPT export JSON file]

   - **Root Directory**: `backend````

5. Add environment variables

6. Click "Create Web Service"### Delete Practice Data

```

## Project StructureDELETE /api/practice/:date

```

```

backend/## Standalone Script

├── src/

│   ├── server.js              # Express serverYou can also run the parser as a standalone script:

│   ├── routes/

│   │   └── practiceRoutes.js  # API routes```bash

│   └── services/npm run parse path/to/chat_export.json

│       └── supabaseService.js # Database service```

├── package.json

├── vercel.json                # Vercel deployment configOr directly:

├── .env.example               # Environment template

└── README.md```bash

```node src/parse-export.js path/to/chat_export.json

```

## Troubleshooting

This will parse the export file, check GitHub and LeetCode, and update the database.

### CORS Issues

Make sure `FRONTEND_URL` is set correctly in your environment variables.## Project Structure



### Supabase Connection```

Verify your `SUPABASE_URL` and `SUPABASE_KEY` are correct.backend/

├── src/

### Vercel Deployment│   ├── routes/

- Ensure `vercel.json` is present│   │   └── practiceRoutes.js    # API route handlers

- Check that environment variables are set in Vercel dashboard│   ├── services/

- Review deployment logs for errors│   │   ├── githubService.js     # GitHub API integration

│   │   ├── leetcodeService.js   # LeetCode API integration

## License│   │   └── supabaseService.js   # Database operations

│   ├── utils/

MIT│   │   └── chatParser.js        # ChatGPT export parser

│   ├── server.js                # Main Express server
│   └── parse-export.js          # Standalone parser script
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Security Notes

- Keep your `.env` file private and never commit it
- Use a service role key for Supabase only in secure environments
- Consider using API keys in production
- Rate limiting is enabled by default (100 requests per 15 minutes)

## Troubleshooting

### GitHub API rate limits
If you hit GitHub API rate limits, add a personal access token to `GITHUB_TOKEN`.

### LeetCode API unavailable
The LeetCode endpoint is public and unofficial. If it changes, you may need to update the service.

### Supabase connection issues
Verify your `SUPABASE_URL` and `SUPABASE_KEY` are correct and the table exists.

## License

MIT
