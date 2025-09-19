// footer year 
document.getElementById('year').textContent = new Date().getFullYear();

// smooth scroll
document.querySelectorAll('a[data-nav]').forEach(a => {
    a.addEventListener('click', e=> {
        e.preventDefault();
        const id = a.getAttribute('href');
        setScrollMargin(); // in case nav height changed
        document.querySelector(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
});

// navbar resize on scroll
const siteNav = document.querySelector('.site-nav');
const SHRINK_AT = 80;   //px scrolled

const setScrollMargin = () => {
  if (siteNav) {
    const h = siteNav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--nav-h', `${h}px`);
  }
};
setScrollMargin();
window.addEventListener('resize', setScrollMargin);


let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            siteNav.classList.toggle('nav-shrink', window.scrollY > SHRINK_AT);
            setScrollMargin();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true});

// active section indicator (position indicator)
const headerEl = document.querySelector('.site-header');
const sectionEls = Array.from(document.querySelectorAll('main .stripe[id]'));
const linkEls = Array.from(document.querySelectorAll('.menu a[data-nav]'));
const linkById = new Map(linkEls.map(a => [a.getAttribute('href').slice(1), a]));

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

// ===== Projects Modal (open/close, fill content) =====
(() => {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const dialog  = modal.querySelector('.modal__dialog');
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
    // Fill content from data- attributes on the button
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
    } catch { /* ignore bad JSON */ }

    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    // Focus first focusable in dialog
    const focusables = getFocusable(dialog);
    (focusables[0] || dialog).focus();

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
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Wire up all “open modal” buttons
  openers.forEach(btn => btn.addEventListener('click', () => openModalFrom(btn)));
  // Wire close buttons/backdrop
  modal.querySelectorAll(closeSelectors).forEach(el => el.addEventListener('click', closeModal));
})();


// ===== Carousel =====
(() => {
  const root = document.getElementById('exp-carousel');
  if (!root) return;

  const viewport = root.querySelector('.carousel__viewport');
  const track    = root.querySelector('.carousel__track');
  const slides   = Array.from(root.querySelectorAll('.carousel__slide'));
  const prev     = root.querySelector('.carousel__arrow--prev');
  const next     = root.querySelector('.carousel__arrow--next');

  let index = 0;
  let startX = 0;
  let dragging = false;

  const slideW = () => viewport.clientWidth;

  function snap(i) {
    // clamp (no wrap)
    index = Math.max(0, Math.min(i, slides.length - 1));
    track.style.transition = 'transform .35s ease';
    track.style.transform  = `translateX(${-index * slideW()}px)`;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  }

  function instant(x) {
    track.style.transition = 'none';
    track.style.transform  = `translateX(${x}px)`;
  }

  // buttons
  prev.addEventListener('click', () => snap(index - 1));
  next.addEventListener('click', () => snap(index + 1));

  // keyboard (when viewport focused)
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); snap(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); snap(index + 1); }
  });

  // drag / swipe
  viewport.addEventListener('pointerdown', e => {
    startX = e.clientX;
    dragging = true;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    instant(-index * slideW() + dx);     // smooth tug in pixels
  });

  function endDrag(x) {
    if (!dragging) return;
    dragging = false;
    const dx = x - startX;
    const threshold = Math.min(120, slideW() * 0.15);
    if (dx >  threshold) snap(index - 1);
    else if (dx < -threshold) snap(index + 1);
    else snap(index);
  }

  viewport.addEventListener('pointerup',    e => endDrag(e.clientX));
  viewport.addEventListener('pointercancel',   () => snap(index));

  // keep position on resize
  window.addEventListener('resize', () => snap(index));

  snap(0);
})();

