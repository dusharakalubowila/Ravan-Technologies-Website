document.addEventListener('DOMContentLoaded', () => {

    // --- Shared utilities ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function debounce(fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Track whether the document is visible — RAF loops pause when hidden
    let docVisible = !document.hidden;
    document.addEventListener('visibilitychange', () => {
        docVisible = !document.hidden;
    });


    // --- 1. DATA VORTEX ANIMATION (Hero) ---
    const canvas = document.getElementById('vortexCanvas');
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let width, height, centerX, centerY;
        let particles = [];

        const particleCount = 400;
        const speedBase = 15;
        const colorRed = '#ff2a2a';
        const colorBlue = '#2a8dff';

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
        }
        window.addEventListener('resize', debounce(resize, 150));
        resize();

        class Particle {
            constructor() { this.reset(true); }
            reset(initial = false) {
                this.x = (Math.random() - 0.5) * width * 2;
                this.y = (Math.random() - 0.5) * height * 2;
                this.z = initial ? Math.random() * 2000 : 2000;
                this.prevZ = this.z;
                this.color = Math.random() > 0.5 ? colorRed : colorBlue;
                this.speed = speedBase + Math.random() * 5;
            }
            update() {
                this.prevZ = this.z;
                this.z -= this.speed;
                if (this.z <= 1) {
                    this.reset();
                    this.prevZ = this.z;
                }
            }
            draw() {
                const focalLength = 250;
                const sx = (this.x / this.z) * focalLength + centerX;
                const sy = (this.y / this.z) * focalLength + centerY;
                const px = (this.x / this.prevZ) * focalLength + centerX;
                const py = (this.y / this.prevZ) * focalLength + centerY;
                const size = (1 - (this.z / 2000)) * 3;

                if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) return;

                ctx.beginPath();
                ctx.lineWidth = size;
                ctx.strokeStyle = this.color;
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.stroke();

                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        function animate() {
            if (docVisible) {
                ctx.fillStyle = 'rgba(2, 2, 5, 0.3)';
                ctx.fillRect(0, 0, width, height);
                for (const p of particles) {
                    p.update();
                    p.draw();
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }


    // --- 2. NEURAL NETWORK BACKGROUND ---
    const netCanvas = document.getElementById('networkCanvas');
    if (netCanvas && !prefersReducedMotion) {
        const ctx = netCanvas.getContext('2d');
        let w, h;
        const netParticles = [];
        const netCount = 60;
        const connectionDistance = 150;

        function resizeNet() {
            w = netCanvas.width = window.innerWidth;
            h = netCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', debounce(resizeNet, 150));
        resizeNet();

        class NetParticle {
            constructor() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
            draw() {
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < netCount; i++) netParticles.push(new NetParticle());

        function animateNet() {
            if (docVisible) {
                ctx.clearRect(0, 0, w, h);
                for (let i = 0; i < netParticles.length; i++) {
                    for (let j = i; j < netParticles.length; j++) {
                        const dx = netParticles[i].x - netParticles[j].x;
                        const dy = netParticles[i].y - netParticles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < connectionDistance) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(50, 50, 50, ${1 - distance / connectionDistance})`;
                            ctx.lineWidth = 1;
                            ctx.moveTo(netParticles[i].x, netParticles[i].y);
                            ctx.lineTo(netParticles[j].x, netParticles[j].y);
                            ctx.stroke();
                        }
                    }
                    netParticles[i].update();
                    netParticles[i].draw();
                }
            }
            requestAnimationFrame(animateNet);
        }
        animateNet();
    }


    // --- 3. SCRAMBLE TEXT DECODER ---
    const hackerChars = '!<>-_\\/[]{}—=+*^?#________';

    function scrambleText(element) {
        if (prefersReducedMotion) return;
        const originalHTML = element.innerHTML;
        const originalText = element.innerText;
        const length = originalText.length;
        let iterations = 0;

        const interval = setInterval(() => {
            element.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iterations) return originalText[index];
                    return hackerChars[Math.floor(Math.random() * hackerChars.length)];
                })
                .join("");

            if (iterations >= length) {
                clearInterval(interval);
                element.innerHTML = originalHTML;
            }
            iterations += 1 / 2;
        }, 30);
    }

    if ('IntersectionObserver' in window) {
        const scrambleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrambleText(entry.target);
                    scrambleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.decode-effect').forEach(el => scrambleObserver.observe(el));
    }


    // --- 4. HOLOGRAPHIC 3D TILT ---
    if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.tilt-card, .service-col').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotateX = ((y - cy) / cy) * -5;
                const rotateY = ((x - cx) / cx) * 5;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });
        });
    }


    // --- 5. ROBOTIC AUDIO FX (with mute persistence) ---
    let audioContext = null;
    let audioReady = false;
    const AUDIO_PREF_KEY = 'ravan-audio-enabled';
    const storedPref = (() => {
        try { return localStorage.getItem(AUDIO_PREF_KEY); }
        catch { return null; }
    })();
    let audioEnabled = storedPref !== 'false';

    function initAudio() {
        if (!audioEnabled) return;
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioReady = true;
            } catch { /* Web Audio unsupported */ }
        } else if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    document.body.addEventListener('click', initAudio, { once: true });

    function playBeep() {
        if (!audioEnabled || !audioReady || !audioContext) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    }

    document.querySelectorAll('.audio-hover, .tilt-card, .service-col').forEach(el => {
        el.addEventListener('mouseenter', playBeep);
    });

    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.setAttribute('aria-pressed', String(audioEnabled));
        audioToggle.title = audioEnabled ? 'Sound on (click to mute)' : 'Sound off (click to enable)';
        audioToggle.addEventListener('click', () => {
            audioEnabled = !audioEnabled;
            try { localStorage.setItem(AUDIO_PREF_KEY, String(audioEnabled)); } catch { /* ignore */ }
            audioToggle.setAttribute('aria-pressed', String(audioEnabled));
            audioToggle.title = audioEnabled ? 'Sound on (click to mute)' : 'Sound off (click to enable)';
            if (audioEnabled) initAudio();
        });
    }


    // --- 6. MOBILE MENU (with Escape close + outside click) ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    function closeMobileMenu() {
        if (!navLinks || !mobileMenuBtn) return;
        navLinks.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
            navLinks.classList.toggle('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
                mobileMenuBtn.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.classList.contains('active')) return;
            if (navLinks.contains(e.target) || mobileMenuBtn.contains(e.target)) return;
            closeMobileMenu();
        });
    }


    // --- 7. ROTATING TAGLINE ---
    const taglines = [
        "Where Intelligence Dominates",
        "Systems That Think",
        "Evolution Under Pressure",
        "Data > Instinct"
    ];
    const tagElement = document.getElementById('rotating-tagline');
    if (tagElement && !prefersReducedMotion) {
        let tagIndex = 0;
        setInterval(() => {
            if (document.hidden) return;
            tagElement.style.opacity = '0';
            setTimeout(() => {
                tagIndex = (tagIndex + 1) % taglines.length;
                tagElement.textContent = taglines[tagIndex];
                tagElement.style.opacity = '1';
            }, 500);
        }, 4000);
    }


    // --- 8. SCROLL REVEAL ---
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('is-visible'));
    }


    // --- 9. STAT COUNTER ---
    function animateCount(el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        if (prefersReducedMotion) {
            el.textContent = target + suffix;
            return;
        }
        const duration = 1400;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));
    }


    // --- 10. CONTACT FORM (validation, honeypot, mailto fallback) ---
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    function showFormMessage(text, type) {
        if (!formMessage) return;
        formMessage.textContent = text;
        formMessage.classList.remove('hidden', 'success', 'error');
        formMessage.classList.add(type);
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Honeypot — if filled, silently drop
            const hp = form.querySelector('[name="website"]');
            if (hp && hp.value.trim() !== '') {
                showFormMessage('Transmission queued.', 'success');
                form.reset();
                return;
            }

            // Native validation
            if (!form.checkValidity()) {
                form.reportValidity();
                showFormMessage('Please complete all required fields correctly.', 'error');
                return;
            }

            const data = new FormData(form);
            const name = (data.get('name') || '').toString().trim();
            const email = (data.get('email') || '').toString().trim();
            const budget = (data.get('budget') || '').toString().trim();
            const message = (data.get('message') || '').toString().trim();

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Transmitting…';
            btn.disabled = true;

            // Build a mailto fallback so the message actually leaves the browser.
            // Replace this block with a fetch() to your form endpoint when you have one.
            const subject = encodeURIComponent(`New project inquiry — ${name}`);
            const body = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\nBudget: ${budget || 'n/a'}\n\nMessage:\n${message}`
            );
            const mailto = `mailto:contact@ravantechnologies.com?subject=${subject}&body=${body}`;

            setTimeout(() => {
                window.location.href = mailto;
                btn.textContent = originalText;
                btn.disabled = false;
                form.reset();
                showFormMessage(
                    'Transmission ready. Your email client should now open — if not, email us directly at contact@ravantechnologies.com.',
                    'success'
                );
            }, 600);
        });
    }


    // --- 11. SMOOTH SCROLL (null-safe) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return; // fall through to default if anchor doesn't exist
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            if (navLinks && navLinks.classList.contains('active')) closeMobileMenu();
        });
    });


    // --- 12. ACTIVE NAV LINK ON SCROLL ---
    const sections = document.querySelectorAll('main section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navAnchors.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                });
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(s => navObserver.observe(s));
    }


    // --- 13. AUTO-UPDATE FOOTER YEAR ---
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
