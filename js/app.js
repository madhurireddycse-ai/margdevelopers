/* ========== App Logic ========== */

/**
 * Render project cards into a container
 * @param {string} containerId - DOM element ID
 * @param {string} filterStatus - "active", "completed", or "all"
 */
function renderProjects(containerId, filterStatus) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = PROJECTS;
  if (filterStatus !== "all") {
    filtered = PROJECTS.filter(p => p.status === filterStatus);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-projects">
        <h3>No projects to show</h3>
        <p>Check back soon for new upcoming projects!</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(project => `
    <div class="project-card">
      <div class="card-image">
        <img src="${encodeURI(project.image)}" alt="${escapeHtml(project.name)}" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22220%22><rect fill=%22%23e8e8e0%22 width=%22400%22 height=%22220%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2218%22>${encodeURIComponent(escapeHtml(project.name))}</text></svg>'">
        <span class="badge ${project.status === 'active' ? 'badge-active' : 'badge-completed'}">
          ${project.status === 'active' ? '🟢 Open for Sale' : '✅ Completed'}
        </span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(project.name)}</h3>
        <p class="location">${escapeHtml(project.location)}</p>
        <p class="desc">${escapeHtml(project.shortDesc)}</p>
        <p class="price">${escapeHtml(project.price)}</p>
        <div class="card-footer">
          <a href="project-detail.html?id=${encodeURIComponent(project.id)}" class="btn btn-primary btn-sm">View Details</a>
          <a href="contact.html?project=${encodeURIComponent(project.id)}" class="btn btn-outline btn-sm">Enquire Now</a>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Render a single project's detail page
 */
function renderProjectDetail() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const project = PROJECTS.find(p => p.id === projectId);

  if (!project) {
    document.getElementById('detail-content').innerHTML = `
      <div class="no-projects">
        <h3>Project not found</h3>
        <p><a href="index.html" class="btn btn-primary">Go to Homepage</a></p>
      </div>`;
    return;
  }

  // Set page title
  document.title = `${project.name} - ${project.location} | Dream Plots Realty`;

  // Set meta description for SEO / social sharing
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = project.shortDesc;

  // Set OG tags for social sharing
  setMetaTag('og:title', `${project.name} - ${project.location}`);
  setMetaTag('og:description', project.shortDesc);
  setMetaTag('og:image', project.image);

  // Hero
  document.getElementById('detail-hero-title').textContent = project.name;
  document.getElementById('detail-hero-location').textContent = '📍 ' + project.location;
  document.getElementById('detail-hero-badge').textContent =
    project.status === 'active' ? '🟢 Open for Sale' : '✅ Completed';
  document.getElementById('detail-hero-badge').className =
    'badge ' + (project.status === 'active' ? 'badge-active' : 'badge-completed');

  // Main image
  const mainImg = document.getElementById('detail-main-image');
  mainImg.src = project.image;
  mainImg.alt = project.name;

  // Gallery
  const galleryContainer = document.getElementById('detail-gallery');
  let currentImageIndex = 0;
  const galleryImages = project.gallery && project.gallery.length > 0 ? project.gallery : [project.image];

  function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCounter = document.getElementById('lightbox-counter');
    lbImg.src = galleryImages[index];
    lbCounter.textContent = (index + 1) + ' / ' + galleryImages.length;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = '';
  }

  function lightboxNav(dir) {
    currentImageIndex = (currentImageIndex + dir + galleryImages.length) % galleryImages.length;
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
    document.getElementById('lightbox-counter').textContent = (currentImageIndex + 1) + ' / ' + galleryImages.length;
    // Update main image and active thumbnail
    mainImg.src = galleryImages[currentImageIndex];
    galleryContainer.querySelectorAll('img').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentImageIndex);
    });
  }

  if (galleryContainer) {
    galleryContainer.innerHTML = galleryImages.map((img, i) => `
      <img src="${encodeURI(img)}" alt="${escapeHtml(project.name)} photo ${i+1}" 
           onerror="this.style.display='none'">
    `).join('');

    galleryContainer.querySelectorAll('img').forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        mainImg.src = galleryImages[i];
        currentImageIndex = i;
        galleryContainer.querySelectorAll('img').forEach((t, j) => t.classList.toggle('active', j === i));
        openLightbox(i);
      });
    });

    // Click main image to open lightbox
    document.getElementById('open-lightbox').addEventListener('click', () => openLightbox(currentImageIndex));

    // Lightbox controls
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => lightboxNav(-1));
    document.getElementById('lightbox-next').addEventListener('click', () => lightboxNav(1));

    // Close on overlay click
    document.getElementById('lightbox').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('lightbox').style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxNav(-1);
        if (e.key === 'ArrowRight') lightboxNav(1);
      }
    });

    // Gallery scroll buttons
    const scrollLeft = document.getElementById('gallery-scroll-left');
    const scrollRight = document.getElementById('gallery-scroll-right');
    if (scrollLeft) scrollLeft.addEventListener('click', () => {
      galleryContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });
    if (scrollRight) scrollRight.addEventListener('click', () => {
      galleryContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });

    // Highlight first thumbnail
    const firstThumb = galleryContainer.querySelector('img');
    if (firstThumb) firstThumb.classList.add('active');

    // Auto-slide main image every 3 seconds
    let autoSlide = setInterval(() => {
      currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
      mainImg.src = galleryImages[currentImageIndex];
      galleryContainer.querySelectorAll('img').forEach((t, i) => t.classList.toggle('active', i === currentImageIndex));
    }, 3000);

    // Pause auto-slide on hover, resume on leave
    const imageWrapper = document.getElementById('open-lightbox');
    imageWrapper.addEventListener('mouseenter', () => clearInterval(autoSlide));
    imageWrapper.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        mainImg.src = galleryImages[currentImageIndex];
        galleryContainer.querySelectorAll('img').forEach((t, i) => t.classList.toggle('active', i === currentImageIndex));
      }, 3000);
    });
  }

  // Info table
  document.getElementById('detail-info-table').innerHTML = `
    <tr><td>Price</td><td>${escapeHtml(project.price)}</td></tr>
    <tr><td>Total Plots</td><td>${project.totalPlots}</td></tr>
    <tr><td>Plot Sizes</td><td>${escapeHtml(project.plotSizes)}</td></tr>
    <tr><td>Approvals</td><td>${escapeHtml(project.approvals)}</td></tr>
    <tr><td>Status</td><td>${project.status === 'active' ? 'Available for Sale' : 'Completed - Sold Out'}</td></tr>
  `;

  // Description
  document.getElementById('detail-description').innerHTML = formatDescription(project.description);

  // Action buttons
  const actionsEl = document.getElementById('detail-actions');
  let actionsHtml = '';
  if (project.status === 'active') {
    actionsHtml += `<a href="contact.html?project=${encodeURIComponent(project.id)}" class="btn btn-primary">Enquire Now</a>`;
  }
  if (project.mapLink) {
    actionsHtml += `<a href="${encodeURI(project.mapLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">📍 View on Map</a>`;
  }
  if (project.brochureLink && project.brochureLink !== '#') {
    actionsHtml += `<a href="${encodeURI(project.brochureLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">📄 Download Brochure</a>`;
  }
  actionsEl.innerHTML = actionsHtml;
}

/**
 * Populate project dropdown in contact form
 */
function populateProjectDropdown() {
  const select = document.getElementById('inquiry-project');
  if (!select) return;

  const activeProjects = PROJECTS.filter(p => p.status === 'active');
  activeProjects.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.name} - ${p.location}`;
    select.appendChild(option);
  });

  // Pre-select if coming from a project page
  const params = new URLSearchParams(window.location.search);
  const preselect = params.get('project');
  if (preselect) select.value = preselect;
}

/**
 * Navbar toggle for mobile
 */
function initNavbar() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

/**
 * Set active nav link based on current page
 */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Update hero stats from project data
 */
function updateHeroStats() {
  const active = PROJECTS.filter(p => p.status === 'active').length;
  const completed = PROJECTS.filter(p => p.status === 'completed').length;
  const totalPlots = PROJECTS.reduce((sum, p) => sum + (p.totalPlots || 0), 0);

  const el = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  el('stat-active', active);
  el('stat-completed', completed);
  el('stat-plots', totalPlots + '+');
}

/**
 * Helper: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/**
 * Helper: Format project description with bold headings and styled bullet points
 */
function formatDescription(text) {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }
    // Bullet point line (starts with • or ✔)
    if (/^[•✔✓►▸\-]\s*/.test(trimmed)) {
      if (!inList) { html += '<ul class="desc-list">'; inList = true; }
      html += '<li>' + escapeHtml(trimmed.replace(/^[•✔✓►▸\-]\s*/, '')) + '</li>';
    }
    // Heading line (ends with : like "Project Highlights:")
    else if (/:\s*$/.test(trimmed) && trimmed.length < 80) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p class="desc-heading">' + escapeHtml(trimmed) + '</p>';
    }
    // Regular text
    else {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p class="desc-text">' + escapeHtml(trimmed) + '</p>';
    }
  }
  if (inList) html += '</ul>';
  return html;
}

/**
 * Helper: Set or create a meta tag
 */
function setMetaTag(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

// Init navbar on every page
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  setActiveNav();
});
