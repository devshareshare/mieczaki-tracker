const INSTAGRAM_URL = "https://www.instagram.com/zwyklykrzychu/";
const CREATOR_HANDLE = "@zwyklykrzychu";
const AVATAR_PATH = "./creator.jpg";

const INSTAGRAM_ICON = `
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <circle cx="12" cy="12" r="4"></circle>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
`;

export function createFooter(): HTMLElement {
  const footer = document.createElement("footer");
  footer.className = "footer";

  footer.innerHTML = `
    <div class="footer-card">
      <div class="footer-avatar" aria-label="Awatar twórcy">
        <div class="footer-avatar-inner">
          <div class="footer-avatar-fallback" aria-hidden="true">Z</div>
          <img
            class="footer-avatar-img"
            src="${AVATAR_PATH}"
            alt="Zdjęcie profilowe twórcy"
            onerror="this.style.display = 'none';"
          />
        </div>
      </div>
      <p class="footer-text">
        Podoba Ci się? Zaobserwuj twórcę!
      </p>
      <a
        class="footer-handle"
        href="${INSTAGRAM_URL}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${INSTAGRAM_ICON}
        <span>${CREATOR_HANDLE}</span>
      </a>
    </div>
  `;

  return footer;
}

export function renderFooter(container: HTMLElement): HTMLElement {
  const footerElement = createFooter();
  container.appendChild(footerElement);
  return footerElement;
}
