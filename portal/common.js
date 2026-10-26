// Talento Client Portal - v1 (102626) - shared helpers
(function () {
  const cfg = window.TALENTO_PORTAL;

  // Capture invite / recovery links BEFORE supabase-js clears the URL hash
  const hash = new URLSearchParams(location.hash.slice(1));
  const linkType = hash.get('type'); // 'invite' | 'recovery' | 'signup' | null
  const linkError = hash.get('error_description');

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = (d) => d ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T12:00:00' : d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const ago = (d) => {
    if (!d) return '';
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    if (s < 86400 * 14) return Math.round(s / 86400) + 'd ago';
    return fmtDate(d);
  };
  const initials = (n) => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  const safeName = (n) => n.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');

  const BRAND = `
    <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
      <rect x="4" y="6" width="24" height="7" rx="3.5" fill="#1A5CE8"/>
      <rect x="12.5" y="6" width="7" height="22" rx="3.5" fill="#1A5CE8"/>
      <circle cx="27" cy="29" r="6.5" fill="#E8572A"/>
    </svg>
    <span><span class="brand-word">talento<span>.ai</span></span><span class="brand-sub">CONSULTING</span></span>`;

  const STAGES = ['Kickoff', 'Sourcing', 'Interviewing', 'Shortlist', 'Offer', 'Placed'];
  const stagePill = (s) => {
    const m = { Kickoff: 'grey', Sourcing: 'blue', Interviewing: 'blue', Shortlist: 'coral', Offer: 'amber', Placed: 'green', 'On hold': 'grey', Closed: 'grey' };
    return `<span class="pill ${m[s] || 'grey'}">${esc(s)}</span>`;
  };
  const statusPill = (s) => {
    const m = { Presented: 'blue', 'Client interview': 'coral', 'Final round': 'coral', Offer: 'amber', Hired: 'green', 'On hold': 'grey', Declined: 'grey', Withdrawn: 'grey' };
    return `<span class="pill ${m[s] || 'grey'}">${esc(s)}</span>`;
  };

  function toast(text) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  async function signedUrl(path, download) {
    const { data, error } = await sb.storage.from(cfg.bucket).createSignedUrl(path, 120, download ? { download: true } : undefined);
    if (error) { toast('Could not open file'); return null; }
    return data.signedUrl;
  }

  async function openFile(path) {
    const w = window.open('', '_blank');
    const url = await signedUrl(path);
    if (url && w) w.location = url; else if (w) w.close();
  }

  function applyClientTheme(client) {
    const r = document.documentElement.style;
    r.setProperty('--client', client?.primary_color || '#1A5CE8');
    r.setProperty('--client-accent', client?.accent_color || '#E8572A');
  }

  window.TP = { sb, cfg, esc, fmtDate, ago, initials, safeName, BRAND, STAGES, stagePill, statusPill, toast, signedUrl, openFile, applyClientTheme, linkType, linkError };
})();
