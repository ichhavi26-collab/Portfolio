// ============================================================
// 🎨 CHHAVI'S PORTFOLIO DATA
// ============================================================
//
// 🔄 AUTO MODE (Google Drive):
//    Images are fetched automatically from Google Drive!
//    Just upload new designs to the Drive folder and they appear here.
//
// 📝 MANUAL MODE (Fallback):
//    If Drive isn't set up, the items below are shown instead.
//
// ============================================================

// ⚙️ CONFIGURATION — Set your Google Apps Script URL here after setup
const DRIVE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwAmzlH2OCXSl9pTf2aCivZOz8v1eWhWep_Z2czzjzTJUif-D3ztVRteC6L9Xj1TkVk/exec";

// Google Drive Folder ID (extracted from your sharing link)
const DRIVE_FOLDER_ID = "1--UIBZ3gTOKXsGkhWuaazs8JQwGvUI92";

// ---------- Fallback / Manual Portfolio Items ----------
// These are shown if Drive auto-fetch isn't configured yet
const manualPortfolioItems = [
  {
    id: 1,
    title: "Cafe Bloom — Brand Identity",
    category: "branding",
    image: "assets/images/branding.png",
    description: "Complete visual identity for an artisan coffee shop — logo, business cards, and packaging design with warm, earthy aesthetics."
  },
  {
    id: 2,
    title: "Harmony Fest — Event Poster",
    category: "posters",
    image: "assets/images/poster.png",
    description: "Vibrant music festival poster featuring bold typography and abstract geometric forms in a warm gradient palette."
  },
  {
    id: 3,
    title: "Aura Lifestyle — Social Media Kit",
    category: "social-media",
    image: "assets/images/social-media.png",
    description: "Cohesive Instagram content design system for a lifestyle brand — stories, posts, and carousel templates."
  },
  {
    id: 4,
    title: "Vogue Noir — Editorial Layout",
    category: "editorial",
    image: "assets/images/editorial.png",
    description: "Magazine spread design with elegant typography and generous whitespace for a premium fashion editorial."
  },
  {
    id: 5,
    title: "Petal & Co. — Packaging Design",
    category: "branding",
    image: "assets/images/packaging.png",
    description: "Minimalist skincare packaging with soft pink and cream palette — boxes, bottles, and label design."
  },
  {
    id: 6,
    title: "Create with Purpose — Typographic Art",
    category: "posters",
    image: "assets/images/typography.png",
    description: "Hand-lettered motivational poster with artistic typography on a warm, textured background."
  }
];

// Available filter categories (auto-updated when loading from Drive)
let categories = [
  { id: "all", label: "All Work" },
  { id: "branding", label: "Branding" },
  { id: "posters", label: "Posters" },
  { id: "social-media", label: "Social Media" },
  { id: "editorial", label: "Editorial" }
];

// ---------- Auto-fetch from Google Drive ----------
let portfolioItems = [...manualPortfolioItems]; // Start with manual items

async function loadPortfolioFromDrive() {
  if (!DRIVE_SCRIPT_URL) {
    console.log("📁 Drive auto-fetch not configured. Using manual portfolio items.");
    return false;
  }

  try {
    console.log("🔄 Fetching portfolio from Google Drive...");
    const response = await fetch(DRIVE_SCRIPT_URL);
    if (!response.ok) throw new Error("Failed to fetch from Drive");

    const driveItems = await response.json();

    if (driveItems && driveItems.length > 0) {
      portfolioItems = driveItems.map((item, index) => ({
        id: index + 1,
        title: item.title || `Design ${index + 1}`,
        category: item.category || "all",
        image: item.image,
        directImage: item.directImage || item.image.replace('thumbnail?id=', 'uc?export=view&id=').replace('&sz=w800', ''),
        lh3Image: item.lh3Image || '',
        description: item.description || ""
      }));

      // Auto-build categories from the fetched data
      const uniqueCats = [...new Set(portfolioItems.map(i => i.category))];
      if (uniqueCats.length > 1 || (uniqueCats.length === 1 && uniqueCats[0] !== "all")) {
        categories = [{ id: "all", label: "All Work" }];
        uniqueCats.forEach(cat => {
          if (cat !== "all") {
            categories.push({
              id: cat,
              label: cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            });
          }
        });
      } else {
        // All items are "all" category — hide filters
        categories = [];
      }

      console.log(`✅ Loaded ${portfolioItems.length} items from Google Drive!`);
      return true;
    }
  } catch (error) {
    console.warn("⚠️ Could not fetch from Drive. Using manual items.", error);
  }
  return false;
}

