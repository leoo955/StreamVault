// Content script - injects a floating button on cinepulse pages

let floatingButton = null;
let linkPanel = null;
let detectedLinks = [];

function createFloatingUI() {
  // Floating button
  floatingButton = document.createElement('div');
  floatingButton.id = 'sv-grab-btn';
  floatingButton.innerHTML = `
    <div class="sv-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    </div>
    <span class="sv-badge" id="sv-badge">0</span>
  `;
  floatingButton.addEventListener('click', togglePanel);
  document.body.appendChild(floatingButton);

  // Link panel
  linkPanel = document.createElement('div');
  linkPanel.id = 'sv-link-panel';
  linkPanel.classList.add('sv-hidden');
  linkPanel.innerHTML = `
    <div class="sv-panel-header">
      <span class="sv-panel-title">🎬 StreamVault Grabber</span>
      <button class="sv-close-btn" id="sv-close-panel">&times;</button>
    </div>
    <div class="sv-panel-body" id="sv-panel-body">
      <p class="sv-empty">En attente de liens vidéo...<br><small>Lance une vidéo sur la page pour détecter le lien .m3u8</small></p>
    </div>
  `;
  document.body.appendChild(linkPanel);

  document.getElementById('sv-close-panel').addEventListener('click', togglePanel);
}

function togglePanel() {
  linkPanel.classList.toggle('sv-hidden');
}

function updatePanel() {
  const body = document.getElementById('sv-panel-body');
  const badge = document.getElementById('sv-badge');

  if (!body || !badge) return;

  badge.textContent = detectedLinks.length;

  if (detectedLinks.length === 0) {
    body.innerHTML = `<p class="sv-empty">En attente de liens vidéo...<br><small>Lance une vidéo sur la page pour détecter le lien .m3u8</small></p>`;
    return;
  }

  body.innerHTML = detectedLinks.map((url, i) => {
    // Extract useful info from URL
    const isMovie = url.includes('/movie/');
    const isTv = url.includes('/tv/');
    let label = `Lien #${i + 1}`;

    if (isMovie) {
      const match = url.match(/\/movie\/(\d+)\//);
      label = `🎬 Film (TMDB: ${match ? match[1] : '?'})`;
    } else if (isTv) {
      const match = url.match(/\/tv\/(\d+)\/S(\d+)\/E(\d+)\//);
      label = match ? `📺 Série S${match[2]}E${match[3]} (TMDB: ${match[1]})` : `📺 Série`;
    }

    // Only show master.m3u8 links (not sub-playlists)
    if (!url.includes('master.m3u8')) return '';

    return `
      <div class="sv-link-item">
        <div class="sv-link-label">${label}</div>
        <div class="sv-link-url">${url.substring(0, 60)}...</div>
        <div class="sv-link-actions">
          <button class="sv-copy-btn" data-url="${url}">📋 Copier</button>
          <button class="sv-send-btn" data-url="${url}">🚀 Envoyer à StreamVault</button>
        </div>
      </div>
    `;
  }).join('');

  // Add copy handlers
  body.querySelectorAll('.sv-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.url).then(() => {
        btn.textContent = '✅ Copié !';
        setTimeout(() => btn.textContent = '📋 Copier', 2000);
      });
    });
  });

  // Add send-to-StreamVault handlers
  body.querySelectorAll('.sv-send-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const streamUrl = btn.dataset.url;
      // Open StreamVault add page with the stream URL pre-filled
      const svUrl = `http://localhost:3001/admin/add?streamUrl=${encodeURIComponent(streamUrl)}`;
      window.open(svUrl, '_blank');
      btn.textContent = '✅ Ouvert !';
      setTimeout(() => btn.textContent = '🚀 Envoyer à StreamVault', 2000);
    });
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'M3U8_DETECTED') {
    detectedLinks = message.allLinks;
    updatePanel();

    // Flash the button to draw attention
    if (floatingButton) {
      floatingButton.classList.add('sv-pulse');
      setTimeout(() => floatingButton.classList.remove('sv-pulse'), 2000);
    }
  }
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingUI);
} else {
  createFloatingUI();
}
