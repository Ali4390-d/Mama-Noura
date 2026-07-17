const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Preloader
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('is-loaded');
  }, 600);
});

// Nav scroll state + back-to-top visibility + Hero parallax
const nav = document.getElementById('mainNav');
const backToTop = document.getElementById('backToTop');
const heroBg = document.getElementById('heroBg');

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 50);
  backToTop.classList.toggle('is-visible', y > 600);
  if (y < window.innerHeight && !prefersReducedMotion && window.innerWidth > 900) {
    heroBg.style.transform = `scale(1.1) translateY(${y * 0.4}px)`;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
burger.addEventListener('click', () => {
  burger.classList.toggle('is-open');
  mobileMenu.classList.toggle('is-open');
  document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  });
});

// Scroll reveal via IntersectionObserver
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// Typing effect on hero headline
const typedEl = document.getElementById('typedText');
const typedCursor = document.getElementById('typedCursor');
const headlineAr = 'حبيبة الأولين والتالين';
const headlineEn = 'Beloved of First and Last';

function typeText(text, done) {
  typedEl.textContent = '';
  let i = 0;
  const speed = prefersReducedMotion ? 0 : 70;
  if (prefersReducedMotion) {
    typedEl.textContent = text;
    if (done) done();
    return;
  }
  const tick = () => {
    if (i < text.length) {
      typedEl.textContent += text.charAt(i);
      i++;
      setTimeout(tick, speed + Math.random() * 40);
    } else {
      if (done) done();
    }
  };
  tick();
}

function startTyping() {
  const isAr = document.documentElement.lang === 'ar';
  const text = isAr ? headlineAr : headlineEn;
  typeText(text, () => {
    let blinks = 0;
    const blinkInterval = setInterval(() => {
      typedCursor.style.opacity = typedCursor.style.opacity === '0' ? '1' : '0';
      blinks++;
      if (blinks > 6) {
        clearInterval(blinkInterval);
        typedCursor.style.animation = 'blink 1.2s infinite';
      }
    }, 350);
  });
}
setTimeout(startTyping, 1800);

// Language toggle
const langToggle = document.getElementById('langToggle');
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  document.querySelectorAll('[data-en][data-ar]').forEach(el => {
    const newText = el.getAttribute('data-' + lang);
    if (newText) el.textContent = newText;
  });
  
  langToggle.textContent = lang === 'en' ? 'العربية' : 'English';
  
  if (typedEl) {
    typedEl.textContent = '';
    setTimeout(startTyping, 100);
  }
}
langToggle.addEventListener('click', () => {
  setLang(currentLang === 'en' ? 'ar' : 'en');
});

// Gallery lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCurrent = document.getElementById('lightboxCurrent');
const lightboxTotal = document.getElementById('lightboxTotal');
let currentLightboxIndex = 0;

lightboxTotal.textContent = galleryItems.length;

galleryItems.forEach((item, i) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    currentLightboxIndex = i;
    openLightbox();
  });
});

function openLightbox() {
  const img = galleryItems[currentLightboxIndex].querySelector('img');
  const src = img.src.replace(/w=600/, 'w=1200');
  lightboxImg.src = src;
  lightboxImg.alt = img.alt;
  lightboxCurrent.textContent = currentLightboxIndex + 1;
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

function lightboxNav(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + galleryItems.length) % galleryItems.length;
  openLightbox();
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => lightboxNav(-1));
lightboxNext.addEventListener('click', () => lightboxNav(1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});

// Testimonials slider
const track = document.getElementById('testimonialsTrack');
const testimonials = track.querySelectorAll('.testimonial');
const dotsWrap = document.getElementById('testDots');
const testPrev = document.getElementById('testPrev');
const testNext = document.getElementById('testNext');
let testIndex = 0;
let testInterval = null;

testimonials.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
  dot.addEventListener('click', () => goToTestimonial(i));
  dotsWrap.appendChild(dot);
});

function goToTestimonial(i) {
  testIndex = i;
  track.style.transform = `translateX(-${i * 100}%)`;
  dotsWrap.querySelectorAll('.testimonial-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === i);
  });
}

function nextTestimonial() { goToTestimonial((testIndex + 1) % testimonials.length); }
function prevTestimonial() { goToTestimonial((testIndex - 1 + testimonials.length) % testimonials.length); }

testNext.addEventListener('click', () => { nextTestimonial(); resetTestInterval(); });
testPrev.addEventListener('click', () => { prevTestimonial(); resetTestInterval(); });

function startTestInterval() {
  if (prefersReducedMotion) return;
  testInterval = setInterval(nextTestimonial, 6000);
}
function resetTestInterval() {
  if (testInterval) clearInterval(testInterval);
  startTestInterval();
}
startTestInterval();

document.querySelector('.testimonials-track-wrap').addEventListener('mouseenter', () => {
  if (testInterval) clearInterval(testInterval);
});
document.querySelector('.testimonials-track-wrap').addEventListener('mouseleave', startTestInterval);

// Reservation form: ripple + confetti on submit
const form = document.getElementById('reservationForm');
const formSubmit = document.getElementById('formSubmit');
const formSuccess = document.getElementById('formSuccess');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

function sizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

formSubmit.addEventListener('click', (e) => {
  const rect = formSubmit.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  formSubmit.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

let confettiParticles = [];
let confettiAnimating = false;
const confettiColors = ['#D4AF37', '#E8C766', '#4A2C2A', '#2E5A3B', '#FDF5E6'];

function launchConfetti() {
  if (prefersReducedMotion) return;
  confettiParticles = [];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 14 - 6,
      gravity: 0.4,
      size: Math.random() * 6 + 4,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }
  if (!confettiAnimating) {
    confettiAnimating = true;
    animateConfetti();
  }
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  let alive = 0;
  confettiParticles.forEach(p => {
    if (p.opacity <= 0) return;
    alive++;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.rotation += p.rotSpeed;
    if (p.y > window.innerHeight - 100) p.opacity -= 0.02;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  });
  
  if (alive > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimating = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.classList.add('is-active');
  launchConfetti();
  setTimeout(() => {
    form.reset();
  }, 1000);
  setTimeout(() => {
    formSuccess.classList.remove('is-active');
  }, 6500);
});

// Back to top
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// Set min date on reservation form to today
const dateInput = form.querySelector('input[name="date"]');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;
}
const timeInput = form.querySelector('input[name="time"]');
if (timeInput) timeInput.value = '19:00';
