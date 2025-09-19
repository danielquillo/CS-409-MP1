// footer year 
document.getElementById('year').textContent = new Date().getFullYear();

// smooth scroll
document.querySelectorAll('a[data-nav]').forEach(a => {
    a.addEventListener('click', e=> {
        e.preventDefault();
        const id = a.getAttribute('href');
        document.querySelector(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
});

// navbar resize on scroll
const siteNav = document.querySelector('.site-nav');
const SHRINK_AT = 80;   //px scrolled

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            siteNav.classList.toggle('nav-shrink', window.scrollY > SHRINK_AT);
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true});

// active section indicator (position indicator)
const headerEl = document.querySelector('.site-header');
const sectionEls = Array.from(document.querySelectorAll('main .stripe[id]'));
const linkEls = Array.from(document.querySelectorAll('.menu a[data-nav]'));
const linkById = new Map(linkEls.map(a => [a.getAttribute('href'.slice(1), a)]));

function setActive(id) {
    linkEls.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        if (a.classList.contains('active')) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
    });
}

function updateActiveByNavPosition() {
    if (!headerEl || sectionEls.length === 0) return;

    const navBottom = headerEl.getBoundingClientRect().bottom;

    // if scrolled to (or past) the bottom, force last section active
    const nearBottom = 
        Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight;

    if(nearBottom) {
        setActive(sectionEls[sectionEls.length - 1].id);
        return;
    }

    // find the section whose rect contains navBottom
    let currentId = null;
    for (const sec of sectionEls) {
        const r = sec.getBoundingClientRect();
        if (r.top <= navBottom && r.bottom > navBottom) {
            currentId = sec.id;
            break;
        }
    }

    // if nothing matches (like if we at the top), pick the first visible
    if (!currentId) currentId = sectionEls[0].id;

    setActive(currentId);
}

let tickingPI = false;
function onScrollOrResize() {
    if (!tickingPI) {
        window.requestAnimationFrame(() => {
            updateActiveByNavPosition();
            tickingPI = false;
        });
        tickingPI = true;
    }
}

window.addEventListener('scroll', onScrollOrResize, {passive: true});
window.addEventListener('resize', onScrollOrResize);

updateActiveByNavPosition();

// == Hero Role Rotator ==
const roles = ["Software Developer", "CS Undergrad"];
const rotator = document.getElementById('role-rotator');

if (rotator) {
    let i = 0;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const swap = () => {
        i = (i + 1) % roles.length;
        rotator.classList.remove("role-swap");
        rotator.offsetHeight; // trigger reflow
        rotator.textContent = roles[i];
        rotator.classList.add("role-swap");
    };

    if (!prefersReduced) {
        setInterval(swap, 2500);
    } else {
        rotator.textContent = roles[0];
    }
}

// ===== Modal: Projects =====
(() => {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const dialog = modal.querySelector('.modal__dialog');
  const titleEl = modal.querySelector('#modal-title');
  const descEl  = modal.querySelector('#modal-desc');
  const linksEl = modal.querySelector('.modal__links');
  const openers = document.querySelectorAll('[data-open-modal]');
  const closeSelectors = '[data-close-modal]';
  let lastFocus = null;

  const getFocusable = (root) =>
    root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

  function openModalFrom(btn) {
    // fill content from data attributes
    titleEl.textContent = btn.getAttribute('data-title') || 'Project';
    descEl.textContent  = btn.getAttribute('data-desc')  || '';
    linksEl.innerHTML = '';
    try {
      const linkData = JSON.parse(btn.getAttribute('data-links') || '[]');
      linkData.forEach(({ label, href }) => {
        const a = document.createElement('a');
        a.href = href; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = label;
        linksEl.appendChild(a);
      });
    } catch { /* ignore malformed JSON */ }

    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    // focus the first focusable element in the dialog
    const focusables = getFocusable(dialog);
    (focusables[0] || dialog).focus();

    // listeners
    document.addEventListener('keydown', onKeydown);
    modal.addEventListener('click', onBackdrop);
    dialog.addEventListener('keydown', onTrapTab);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');

    document.removeEventListener('keydown', onKeydown);
    modal.removeEventListener('click', onBackdrop);
    dialog.removeEventListener('keydown', onTrapTab);

    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function onBackdrop(e) {
    if (e.target.matches(closeSelectors) || e.target === modal) closeModal();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  function onTrapTab(e) {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(getFocusable(dialog));
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // wire up
  openers.forEach(btn => btn.addEventListener('click', () => openModalFrom(btn)));
  modal.querySelectorAll(closeSelectors).forEach(el => el.addEventListener('click', closeModal));
})();

