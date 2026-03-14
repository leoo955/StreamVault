// Popup script - fetches detected links from background and displays them

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('links-container');
  const clearBtn = document.getElementById('btn-clear');

  // Fetch links from background
  chrome.runtime.sendMessage({ type: 'GET_LINKS' }, (response) => {
    const links = response?.links || [];
    
    // Filter to only master.m3u8 links
    const masterLinks = links.filter(url => url.includes('master.m3u8'));

    if (masterLinks.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <div class="icon">📡</div>
          Aucun lien détecté pour l'instant.<br>
          <small>Ouvre cinepulse.lol et lance une vidéo !</small>
        </div>
      `;
      return;
    }

    container.innerHTML = masterLinks.map((url, i) => {
      const isMovie = url.includes('/movie/');
      const isTv = url.includes('/tv/');
      let label = `Lien #${i + 1}`;
      let icon = '🔗';

      if (isMovie) {
        const match = url.match(/\/movie\/(\d+)\//);
        label = `Film (TMDB: ${match ? match[1] : '?'})`;
        icon = '🎬';
      } else if (isTv) {
        const match = url.match(/\/tv\/(\d+)\/S(\d+)\/E(\d+)\//);
        label = match ? `Série S${match[2]}E${match[3]} (TMDB: ${match[1]})` : `Série`;
        icon = '📺';
      }

      return `
        <div class="link-item">
          <div class="link-label">${icon} ${label}</div>
          <div class="link-url">${url}</div>
          <div class="link-actions">
            <button class="btn btn-copy" data-url="${url}">📋 Copier</button>
            <button class="btn btn-send" data-url="${url}">🚀 StreamVault</button>
          </div>
        </div>
      `;
    }).join('');

    // Copy handlers
    container.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.url).then(() => {
          btn.textContent = '✅ Copié !';
          setTimeout(() => btn.textContent = '📋 Copier', 2000);
        });
      });
    });

    // Send to StreamVault handlers
    container.querySelectorAll('.btn-send').forEach(btn => {
      btn.addEventListener('click', () => {
        const streamUrl = btn.dataset.url;
        const svUrl = `http://localhost:3001/admin/add?streamUrl=${encodeURIComponent(streamUrl)}`;
        chrome.tabs.create({ url: svUrl });
        btn.textContent = '✅ Ouvert !';
        setTimeout(() => btn.textContent = '🚀 StreamVault', 2000);
      });
    });

    // Copy ALL handler
    const copyAllBtn = document.getElementById('btn-copy-all');
    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', () => {
        const allUrls = masterLinks.join('\n');
        navigator.clipboard.writeText(allUrls).then(() => {
          copyAllBtn.textContent = '✅ Tous copiés !';
          setTimeout(() => copyAllBtn.textContent = '📋 Copier TOUT (Masse)', 2000);
        });
      });
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_LINKS' }, () => {
      container.innerHTML = `
        <div class="empty">
          <div class="icon">📡</div>
          Liens effacés ! Relance une vidéo.<br>
        </div>
      `;
    });
  });
});
