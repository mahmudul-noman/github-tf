
# 🚀 GitHub CMS - Content Management System

<div align="center">

**A modern, professional content management system built with Next.js that seamlessly integrates with GitHub repositories for blog post management.**

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Powered by GitHub](https://img.shields.io/badge/Powered%20by-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[📖 Documentation](#-installation--setup-guide) • [🎯 Quick Start](#-quick-usage) • [🛠 Tech Stack](#-technical-stack) • [📁 Structure](#-project-structure)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 **Content Management**
- ✅ **Rich Markdown Editor** with live preview
- ✅ **Auto-save functionality** for drafts
- ✅ **Batch publishing** for multiple posts
- ✅ **Draft management** with search & filter

</td>
<td width="50%">

### 🔗 **GitHub Integration**
- ✅ **Seamless GitHub sync** for version control
- ✅ **Direct repository publishing**
- ✅ **File management** through GitHub API
- ✅ **Real-time status updates**

</td>
</tr>
</table>

---

## 🚀 Installation & Setup Guide

### 📋 Prerequisites

<table>
<tr>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="50" height="50"/>
<br><strong>Node.js 18+</strong>
</td>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="50" height="50"/>
<br><strong>npm</strong>
</td>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="50" height="50"/>
<br><strong>GitHub Account</strong>
</td>
</tr>
</table>

---

### 📦 Step 1: Clone & Install

```bash
# 📥 Clone the repository
git clone https://github.com/mahmudul-noman/github-tf.git
cd github-cms

# 📦 Install dependencies
npm install
```

---

### 🔑 Step 2: GitHub Token Setup

<details>
<summary><strong>🔒 Click to expand GitHub Token Setup</strong></summary>

#### **Create Personal Access Token:**

1. **Navigate to GitHub Settings:**
   ```
   GitHub Profile → Settings → Developer Settings → Personal Access Tokens
   ```

2. **Generate New Token:**
   - Click **"Generate new token (classic)"**
   - **Name:** `GitHub CMS Token`
   - **Expiration:** Choose appropriate duration

3. **Select Required Scopes:**
   ```
   ✅ repo (Full control of private repositories)
   ✅ public_repo (Access public repositories)
   ```

4. **Save Token:**
   ```
   ⚠️ Copy and save the token immediately!
   📝 You won't be able to see it again.
   ```

#### **Prepare Your Repository:**
- 📁 Create a new GitHub repository OR use existing one
- 📝 Note your GitHub username and repository name
- 🔓 Repository can be public or private

</details>

---

### ⚙️ Step 3: Environment Configuration

Create `.env.local` file in your project root:

```bash
# 🔧 Required: GitHub API Configuration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name

# 🌐 Required: Frontend Configuration
NEXT_PUBLIC_GITHUB_OWNER=your_github_username
NEXT_PUBLIC_GITHUB_REPO=your_repository_name
```

<details>
<summary><strong>📄 Example Configuration</strong></summary>

```bash
GITHUB_TOKEN=ghp_1234567890abcdef1234567890abcdef12345678
GITHUB_OWNER=johndoe
GITHUB_REPO=my-blog

NEXT_PUBLIC_GITHUB_OWNER=johndoe
NEXT_PUBLIC_GITHUB_REPO=my-blog
```

</details>

---

### 🔧 Step 4: Development

```bash
# 🚀 Start development server
npm run dev

# 🌐 Open browser and navigate to:
# http://localhost:3000
```

---

### 🚀 Step 5: Production Deployment

<details>
<summary><strong>🔵 Option A: Vercel (Recommended)</strong></summary>

1. 📤 Push code to GitHub
2. 🔗 Connect repository to [Vercel](https://vercel.com)
3. ⚙️ Add environment variables in Vercel dashboard
4. 🚀 Deploy automatically

</details>

<details>
<summary><strong>🟢 Option B: Netlify</strong></summary>

1. 📤 Push code to GitHub
2. 🔗 Connect repository to [Netlify](https://netlify.com)
3. ⚙️ Add environment variables in site settings
4. 🚀 Deploy

</details>

<details>
<summary><strong>⚪ Option C: Manual Build</strong></summary>

```bash
# 🔨 Build for production
npm run build

# ▶️ Start production server
npm start
```

</details>

---

## 🎯 Quick Usage

<table>
<tr>
<td align="center" width="25%">
📝
<br><strong>Create Draft</strong>
<br>Click "New Draft" on dashboard
</td>
<td align="center" width="25%">
✍️
<br><strong>Write Content</strong>
<br>Use markdown editor with live preview
</td>
<td align="center" width="25%">
💾
<br><strong>Auto-Save</strong>
<br>Drafts save automatically as you type
</td>
<td align="center" width="25%">
➡️
<br><strong>Publish</strong>
<br>Click "Publish" to commit to GitHub repository
</td>
</tr>
</table>

---

## 📁 Repository Structure

After publishing, your GitHub repository will contain:

```
📁 your-repo/
├── 📂 posts/
│   ├── 📄 2024-01-15-my-first-post.md
│   ├── 📄 2024-01-20-another-post.md
│   └── 📄 ...
└── 📄 README.md
```

---

## 🛠 Technical Stack

<div align="center">

### **Frontend Technologies**

<table>
<tr>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="60" height="60"/>
<br><strong>Next.js 14</strong>
<br><small>App Router</small>
</td>
<td align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/2560px-Tailwind_CSS_Logo.svg.png" width="60" height="60"/>
<br><strong>Tailwind CSS</strong>
<br><small>+ shadcn/ui</small>
</td>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg" width="60" height="60"/>
<br><strong>Markdown</strong>
<br><small>Unified ecosystem</small>
</td>
<td align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="60" height="60"/>
<br><strong>GitHub API</strong>
<br><small>REST API v4</small>
</td>
</tr>
</table>

### **Key Features**

| Technology | Purpose | Benefits |
|------------|---------|----------|
| **🚀 Next.js 14** | Framework | App Router, Server Components, Optimized Performance |
| **🎨 Tailwind CSS** | Styling | Utility-first, Responsive Design, Custom Components |
| **📝 Unified Markdown** | Content Processing | remark/rehype ecosystem, Extensible Plugins |
| **💾 localStorage** | Draft Storage | Client-side persistence, Auto-save functionality |
| **🔗 GitHub REST API** | Version Control | Direct repository integration, File management |

</div>

---

## 📁 Project Structure

<details>
<summary><strong>🗂️ Click to expand full project structure</strong></summary>

```
📁 github-cms/
├── 🚫 .gitignore
├── 📄 README.md
├── 📂 app/
│   ├── 📂 api/
│   │   ├── 📂 github/
│   │   │   ├── 📂 content/
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📂 files/
│   │   │       └── 📄 route.ts
│   │   └── 📂 publish/
│   │       ├── 📂 batch/
│   │       │   └── 📄 route.ts
│   │       └── 📄 route.ts
│   ├── 📂 editor/
│   │   └── 📂 [id]/
│   │       └── 📄 page.tsx
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── ⏳ loading.tsx
│   ├── 🏠 page.tsx
│   └── 📂 preview/
│       ├── 📂 [...path]/
│       │   └── 📄 page.tsx
│       └── 📂 draft/
│           └── 📂 [id]/
│               └── 📄 page.tsx
├── ⚙️ components.json
├── 📂 components/
│   ├── ✏️ markdown-editor.tsx
│   ├── 📖 markdown-renderer.tsx
│   ├── 🚀 publish-all-dialog.tsx
│   ├── 📤 publish-dialog.tsx
│   ├── 🌙 theme-provider.tsx
│   └── 📂 ui/
│       ├── 🎵 accordion.tsx
│       ├── ⚠️ alert-dialog.tsx
│       ├── 🚨 alert.tsx
│       ├── 📐 aspect-ratio.tsx
│       ├── 👤 avatar.tsx
│       ├── 🏷️ badge.tsx
│       ├── 🍞 breadcrumb.tsx
│       ├── 🔘 button.tsx
│       ├── 📅 calendar.tsx
│       ├── 📇 card.tsx
│       ├── 🎠 carousel.tsx
│       ├── 📊 chart.tsx
│       ├── ☑️ checkbox.tsx
│       ├── 📁 collapsible.tsx
│       ├── 💻 command.tsx
│       ├── 📋 context-menu.tsx
│       ├── 💬 dialog.tsx
│       ├── 🗂️ drawer.tsx
│       ├── 📜 dropdown-menu.tsx
│       ├── 📝 form.tsx
│       ├── 🎯 hover-card.tsx
│       ├── 🔢 input-otp.tsx
│       ├── ⌨️ input.tsx
│       ├── 🏷️ label.tsx
│       ├── 📋 menubar.tsx
│       ├── 🧭 navigation-menu.tsx
│       ├── 📄 pagination.tsx
│       ├── 💭 popover.tsx
│       ├── 📈 progress.tsx
│       ├── 🔘 radio-group.tsx
│       ├── 📏 resizable.tsx
│       ├── 📜 scroll-area.tsx
│       ├── 📋 select.tsx
│       ├── ➖ separator.tsx
│       ├── 📋 sheet.tsx
│       ├── 🎯 sidebar.tsx
│       ├── 💀 skeleton.tsx
│       ├── 🎚️ slider.tsx
│       ├── 🔔 sonner.tsx
│       ├── 🔄 switch.tsx
│       ├── 📊 table.tsx
│       ├── 📑 tabs.tsx
│       ├── 📝 textarea.tsx
│       ├── 🍞 toast.tsx
│       ├── 📢 toaster.tsx
│       ├── 🔄 toggle-group.tsx
│       ├── ⏯️ toggle.tsx
│       ├── 💡 tooltip.tsx
│       ├── 📱 use-mobile.tsx
│       └── 🔔 use-toast.ts
├── 📂 hooks/
│   ├── 📄 use-drafts.ts
│   ├── 📱 use-mobile.ts
│   └── 🔔 use-toast.ts
├── 📂 lib/
│   ├── 💾 auto-save.ts
│   ├── 📄 drafts.ts
│   ├── 🐙 github.ts
│   ├── 📝 markdown.ts
│   └── 🛠️ utils.ts
├── ⚙️ next.config.mjs
├── 🔒 package-lock.json
├── 📦 package.json
├── 🔒 pnpm-lock.yaml
├── 🎨 postcss.config.mjs
├── 📂 public/
│   ├── 🖼️ placeholder-logo.png
│   ├── 🖼️ placeholder-logo.svg
│   ├── 👤 placeholder-user.jpg
│   ├── 🖼️ placeholder.jpg
│   └── 🖼️ placeholder.svg
├── 📂 styles/
│   └── 🎨 globals.css
└── ⚙️ tsconfig.json
```

</details>

---

## 📄 License

<div align="center">

**MIT License** - see [LICENSE](LICENSE) file for details.

---

<div style="margin-top: 40px;">

### 🌟 **Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/mahmudul-noman/github-tf?style=social)](https://github.com/mahmudul-noman/github-tf)
[![GitHub forks](https://img.shields.io/github/forks/mahmudul-noman/github-tf?style=social)](https://github.com/mahmudul-noman/github-tf/fork)

**Made with ❤️ by [Mahmudul Noman](https://github.com/mahmudul-noman)**

</div>

</div>