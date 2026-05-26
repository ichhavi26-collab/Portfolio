// ============================================================
// CHHAVI — Portfolio | Main Application Logic
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();

  // Try loading from Google Drive first, then render gallery
  const driveLoaded = await loadPortfolioFromDrive();
  initGallery();
  initLightbox();
  initScrollReveal();
  initContactForm();
});

// ---------- Navigation ----------
function initNavigation() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = current;
  });

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Close mobile menu on link click
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link highlight
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.style.color = 'var(--text-primary)';
        } else {
          link.style.color = '';
        }
      }
    });
  });
}

// ---------- Gallery ----------
function initGallery() {
  const galleryContainer = document.getElementById('gallery-grid');
  const filtersContainer = document.getElementById('filters');
  
  if (!galleryContainer || !filtersContainer) return;

  // Render filters (hide if no categories from Drive)
  if (categories.length > 0) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn${cat.id === 'all' ? ' active' : ''}`;
      btn.dataset.filter = cat.id;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => filterGallery(cat.id));
      filtersContainer.appendChild(btn);
    });
  } else {
    filtersContainer.style.display = 'none';
  }

  // Render gallery items
  renderGallery(portfolioItems);
}

function renderGallery(items) {
  const galleryContainer = document.getElementById('gallery-grid');
  galleryContainer.innerHTML = '';

  if (items.length === 0) {
    galleryContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">No designs found.</p>';
    return;
  }

  items.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.dataset.category = item.category;
    el.dataset.index = index;
    el.style.animationDelay = `${Math.min(index * 0.08, 0.6)}s`;

    el.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy"
           crossorigin="anonymous"
           referrerpolicy="no-referrer">
      <div class="gallery-overlay">
        <span class="category-tag">${item.category.replace('-', ' ')}</span>
        <h3>${item.title}</h3>
      </div>
    `;

    // Image error handling with fallback URLs
    const img = el.querySelector('img');
    img.addEventListener('error', function() {
      if (item.directImage && this.src !== item.directImage) {
        // Try direct Drive URL
        this.src = item.directImage;
      } else if (item.lh3Image && this.src !== item.lh3Image) {
        // Try lh3 URL
        this.src = item.lh3Image;
      } else {
        // All URLs failed — show a styled title placeholder
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `
          width: 100%; height: 100%; display: flex; align-items: center;
          justify-content: center; background: linear-gradient(135deg, #2C2C2C 0%, #4a3f35 100%);
          color: #d4c4b5; font-family: var(--font-heading); font-size: 1.4rem;
          text-align: center; padding: 24px; font-style: italic;
        `;
        placeholder.textContent = item.title;
        el.insertBefore(placeholder, el.firstChild);
        // Make overlay always visible on placeholder items
        el.querySelector('.gallery-overlay').style.opacity = '1';
      }
    });

    // Handle images that load but are tiny/empty (Drive sometimes returns 1x1 pixel)
    img.addEventListener('load', function() {
      if (this.naturalWidth < 10 || this.naturalHeight < 10) {
        this.dispatchEvent(new Event('error'));
      }
    });

    el.addEventListener('click', () => openLightbox(item, items));
    galleryContainer.appendChild(el);
  });
}

function filterGallery(category) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  // Filter items
  const filtered = category === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === category);
  
  // Animate out, then render new items
  const grid = document.getElementById('gallery-grid');
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    renderGallery(filtered);
    // Force reflow
    grid.offsetHeight;
    grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';
  }, 250);
}

// ---------- Lightbox ----------
let currentLightboxItems = [];
let currentLightboxIndex = 0;

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  // Close button
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Navigation
  lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });

  lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(item, items) {
  const lightbox = document.getElementById('lightbox');
  currentLightboxItems = items;
  currentLightboxIndex = items.indexOf(item);
  
  updateLightboxContent(item);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  currentLightboxIndex = (currentLightboxIndex + direction + currentLightboxItems.length) % currentLightboxItems.length;
  const item = currentLightboxItems[currentLightboxIndex];
  
  const content = document.querySelector('.lightbox-content');
  content.style.opacity = '0';
  content.style.transform = `translateX(${direction * 30}px)`;
  
  setTimeout(() => {
    updateLightboxContent(item);
    content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    content.style.opacity = '1';
    content.style.transform = 'translateX(0)';
  }, 200);
}

function updateLightboxContent(item) {
  const img = document.getElementById('lightbox-img');
  // Use direct URL for higher quality in lightbox, fall back to thumbnail
  img.src = item.directImage || item.image;
  img.alt = item.title;
  img.onerror = function() {
    if (this.src !== item.image) {
      this.src = item.image;
    } else if (item.lh3Image && this.src !== item.lh3Image) {
      this.src = item.lh3Image;
    }
  };
  document.getElementById('lightbox-title').textContent = item.title;
  document.getElementById('lightbox-desc').textContent = item.description;
}

// ---------- Scroll Reveal ----------
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ---------- Contact Form ----------
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    // Simulate form submission (replace with real endpoint like Formspree)
    setTimeout(() => {
      btn.textContent = 'Message Sent! ✓';
      btn.style.background = 'var(--accent-dark)';
      form.reset();
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1200);
  });
}

// ---------- Smooth scroll for anchor links ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
