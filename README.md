# 🎨 Chhavi's Portfolio

A minimalist, elegant portfolio website that **automatically shows designs from Google Drive**.

---

## 🔄 How It Works

1. **Chhavi uploads** a new design image to her Google Drive folder
2. The portfolio **automatically fetches** and displays it — no coding needed!

---

## ⚡ One-Time Setup: Connect Google Drive (5 minutes)

### Step 1: Create the Script
1. Go to **[script.google.com](https://script.google.com)** (log in with the Google account that owns the Drive folder)
2. Click **"New Project"**
3. Delete the default code
4. Open the file `google-apps-script.js` from this folder
5. **Copy ALL the code** and paste it into the Apps Script editor
6. Click **💾 Save** (name the project "Chhavi Portfolio")

### Step 2: Deploy as Web App
1. Click **"Deploy"** → **"New Deployment"**
2. Click the ⚙️ gear icon → Select **"Web App"**
3. Set:
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
4. Click **"Deploy"**
5. Click **"Authorize access"** → Choose your Google account → Allow
6. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/xxxxx/exec`)

### Step 3: Paste the URL
1. Open `js/portfolio-data.js`
2. Find this line at the top:
   ```js
   const DRIVE_SCRIPT_URL = "";
   ```
3. Paste your URL inside the quotes:
   ```js
   const DRIVE_SCRIPT_URL = "https://script.google.com/macros/s/your-script-id/exec";
   ```
4. Save the file

### ✅ Done! 
Your portfolio now auto-updates from Google Drive!

---

## 📁 Adding New Designs

### Simple Way (just upload):
- Drop any image into the **Google Drive folder**
- The portfolio picks it up automatically
- The file name becomes the title (e.g., `Cafe-Bloom-Logo.png` → "Cafe Bloom Logo")

### With Categories:
Create **subfolders** inside the main Drive folder:
```
Chhavi_Portfolio/
├── Branding/          → shown as "branding" category
├── Posters/           → shown as "posters" category  
├── Social-Media/      → shown as "social-media" category
└── Editorial/         → shown as "editorial" category
```

### With Descriptions:
1. Right-click any file in Google Drive
2. Click **"File information"** → **"Details"**
3. Add a description — it shows up in the portfolio lightbox!
4. Optional: Add a category tag like `[branding]` at the start of the description

---

## 📂 File Structure

```
portfolio/
├── index.html              ← Main website
├── css/style.css           ← Styles
├── js/
│   ├── app.js              ← App logic
│   └── portfolio-data.js   ← ⚙️ Configuration (paste Script URL here)
├── assets/images/          ← Local images (fallback)
├── google-apps-script.js   ← Copy this to Google Apps Script
└── README.md               ← This file
```

---

## 🌐 Hosting (to share the link)

After the Drive connection works, host the site for free:

### GitHub Pages:
1. Create a GitHub account
2. Upload this folder as a repository
3. Enable GitHub Pages in Settings
4. Share: `yourusername.github.io/portfolio`

### Netlify (easiest):
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop this folder
3. Get an instant shareable link!
