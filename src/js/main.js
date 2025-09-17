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
        window.requestAnimationFrame(() => {
            if (window.scrollY > SHRINK_AT) {
                siteNav.classList.add('nav-shrink');
            } else {
                siteNav.classList.remove('nav-shrink');
            }
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
