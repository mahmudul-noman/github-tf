# GitHub CMS - Content Management System

A modern, professional content management system built with Next.js that seamlessly integrates with GitHub repositories for blog post management.

## 🚀 Installation & Setup Guide

### Prerequisites
- Node.js 18+ and npm
- GitHub account with a repository
- GitHub Personal Access Token

### Step 1: Clone & Install

\`\`\`bash
# Clone the repository
git clone (https://github.com/mahmudul-noman/github-tf.git)
cd github-cms

# Install dependencies
npm install
\`\`\`

### Step 2: GitHub Token Setup

1. **Create Personal Access Token:**
   - Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `public_repo` (Access public repositories)
   - Copy the generated token (save it securely!)

2. **Prepare Your Repository:**
   - Create a new GitHub repository OR use existing one
   - Note your GitHub username and repository name
   - Repository can be public or private

### Step 3: Environment Configuration

Create `.env.local` file in your project root:

\`\`\`bash
# Required: GitHub API Configuration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name

# Required: Frontend Configuration
NEXT_PUBLIC_GITHUB_OWNER=your_github_username
NEXT_PUBLIC_GITHUB_REPO=your_repository_name
\`\`\`

**Example:**
\`\`\`bash
GITHUB_TOKEN=ghp_1234567890abcdef1234567890abcdef12345678
GITHUB_OWNER=johndoe
GITHUB_REPO=my-blog

NEXT_PUBLIC_GITHUB_OWNER=johndoe
NEXT_PUBLIC_GITHUB_REPO=my-blog
\`\`\`

### Step 4: Development

\`\`\`bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
\`\`\`

### Step 5: Production Deployment

#### Option A: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

#### Option B: Netlify
1. Push code to GitHub
2. Connect repository to [Netlify](https://netlify.com)
3. Add environment variables in site settings
4. Deploy

#### Option C: Manual Build
\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🎯 Quick Usage

1. **Create Draft:** Click "New Draft" on dashboard
2. **Write Content:** Use markdown editor with live preview
3. **Auto-Save:** Drafts save automatically as you type
4. **Publish:** Click "Publish" to commit to GitHub repository

## 📁 Repository Structure

After publishing, your GitHub repository will contain:

\`\`\`
your-repo/
├── posts/
│   ├── 2024-01-15-my-first-post.md
│   ├── 2024-01-20-another-post.md
│   └── ...
└── README.md
\`\`\`

## 🛠 Technical Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Markdown:** Unified ecosystem (remark/rehype)
- **Storage:** Browser localStorage (drafts)
- **API:** GitHub REST API v4

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---
