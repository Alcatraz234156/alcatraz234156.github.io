const mySkills = [
    { name: 'Python',                        category: 'languages', url: 'https://www.python.org/',                                    level: 85 },
    { name: 'C',                             category: 'languages', url: 'https://www.iso.org/standard/74528.html',                    level: 75 },
    { name: 'C++',                           category: 'languages', url: 'https://isocpp.org/',                                        level: 70 },
    { name: 'JavaScript',                    category: 'web',       url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',    level: 80 },
    { name: 'HTML',                          category: 'web',       url: 'https://html.spec.whatwg.org/',                              level: 90 },
    { name: 'CSS',                           category: 'web',       url: 'https://www.w3.org/Style/CSS/',                              level: 85 },
    { name: 'Web Development',               category: 'web',       url: 'https://w3.org/',                                            level: 80 },
    { name: 'MySQL',                         category: 'web',       url: 'https://www.mysql.com/',                                     level: 65 },
    { name: 'Hardware Description Language', category: 'hardware',  url: 'https://ieee.org/',                                          level: 70 },
    { name: 'Solid Edge',                    category: 'hardware',  url: 'https://solidedge.siemens.com/',                             level: 60 }
];

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundAnimation();
    populateSkills();
    initCursorTrail();
    initHeroTyping();
    initNavGlowPill();
    initScrollProgress();
    initMobileNav();
});

function switchPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeSection = document.getElementById(pageId);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.scrollTop = 0;
    }

    const activeLink = document.querySelector(`.nav-item[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile drawer when a nav item is tapped
    const navLinks   = document.getElementById('nav-links');
    const hamburger  = document.getElementById('nav-hamburger');
    if (navLinks && hamburger) {
        navLinks.classList.remove('mobile-open');
        hamburger.classList.remove('open');
    }
}

function initMobileNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    const mq = window.matchMedia('(max-width: 768px)');

    function applyMobile(matches) {
        hamburger.style.display = matches ? 'flex' : 'none';
        if (!matches) {
            navLinks.classList.remove('mobile-open');
            hamburger.classList.remove('open');
        }
    }

    applyMobile(mq.matches);
    mq.addEventListener('change', e => applyMobile(e.matches));

    hamburger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('mobile-open');
        hamburger.classList.toggle('open', open);
    });

    // Close drawer on outside tap
    document.addEventListener('click', e => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('mobile-open');
            hamburger.classList.remove('open');
        }
    });
}

function populateSkills() {
    const containers = {
        languages: document.getElementById('languages-container'),
        web: document.getElementById('web-container'),
        hardware: document.getElementById('hardware-container')
    };

    mySkills.forEach(skill => {
        const targetContainer = containers[skill.category];
        if (targetContainer) {
            const element = document.createElement('a');
            element.href = skill.url;
            element.target = '_blank';
            element.className = 'skill-card';
            element.innerHTML = `
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <div class="skill-bar-track">
                        <div class="skill-bar-fill" data-level="${skill.level}" style="width:0%"></div>
                    </div>
                    <span class="skill-level-label">${skill.level}%</span>
                </div>
            `;
            targetContainer.appendChild(element);
        }
    });

    // Animate bars when Skills section becomes visible
    const skillsSection = document.getElementById('skills');
    const observer = new MutationObserver(() => {
        if (skillsSection.classList.contains('active')) {
            document.querySelectorAll('.skill-bar-fill').forEach(bar => {
                const lvl = bar.dataset.level;
                setTimeout(() => { bar.style.width = lvl + '%'; }, 120);
            });
        } else {
            // Reset so they re-animate next visit
            document.querySelectorAll('.skill-bar-fill').forEach(bar => {
                bar.style.width = '0%';
            });
        }
    });
    observer.observe(skillsSection, { attributes: true, attributeFilter: ['class'] });
}

function initBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');

    let W, H;

    // ── Default accent colour (matches CSS --accent: #10b981) ──────────────
    // window.__eggParticleRGB is set by the colour-theme easter egg as "r,g,b"
    function accentRGB() {
        return window.__eggParticleRGB || '16,185,129';
    }

    // ── Grid config ────────────────────────────────────────────────────────
    const CELL   = 48;    // px between grid nodes
    let   COLS, ROWS;

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        COLS = Math.ceil(W / CELL) + 1;
        ROWS = Math.ceil(H / CELL) + 1;
        buildGrid();
    }

    // ── Node pool ──────────────────────────────────────────────────────────
    // Each node can be a junction (rendered dot) or an empty cross-point.
    let nodes = [];

    function buildGrid() {
        nodes = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                nodes.push({
                    x: c * CELL,
                    y: r * CELL,
                    // is this node a visible junction?
                    junction: Math.random() < 0.18,
                    // pulse phase offset for breathing glow
                    phase: Math.random() * Math.PI * 2,
                    // right-edge and bottom-edge trace existence
                    traceRight:  Math.random() < 0.45,
                    traceBottom: Math.random() < 0.45,
                });
            }
        }
    }

    // ── Signal pulses travelling along traces ──────────────────────────────
    // A pulse has an origin node index, a direction ('h'|'v'), and a 0-1 progress.
    const PULSE_COUNT = 28;
    let pulses = [];

    function spawnPulse() {
        // pick a random node that has at least one valid trace
        const candidates = nodes.filter(n => n.traceRight || n.traceBottom);
        if (!candidates.length) return;
        const n = candidates[Math.floor(Math.random() * candidates.length)];
        const dir = (n.traceRight && n.traceBottom)
            ? (Math.random() < 0.5 ? 'h' : 'v')
            : n.traceRight ? 'h' : 'v';
        pulses.push({
            nodeIdx: nodes.indexOf(n),
            dir,
            t: 0,
            speed: 0.004 + Math.random() * 0.006,
            // each pulse picks up the current accent colour when spawned
            rgb: accentRGB(),
        });
    }

    function initPulses() {
        pulses = [];
        for (let i = 0; i < PULSE_COUNT; i++) spawnPulse();
    }

    // ── Scanline (horizontal sweep) ────────────────────────────────────────
    let scanY = 0;

    // ── Main render ────────────────────────────────────────────────────────
    let lastTime = 0;

    function animate(ts) {
        const dt = Math.min(ts - lastTime, 32); // cap at ~30fps delta
        lastTime = ts;

        ctx.clearRect(0, 0, W, H);

        // --- 1. Dark base ---
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, W, H);

        const rgb = accentRGB();
        const time = ts * 0.001;

        // --- 2. Faint grid dots (every intersection) ---
        ctx.fillStyle = `rgba(${rgb},0.04)`;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                ctx.beginPath();
                ctx.arc(c * CELL, r * CELL, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // --- 3. Horizontal trace lines ---
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS - 1; c++) {
                const n = nodes[r * COLS + c];
                if (!n || !n.traceRight) continue;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(n.x + CELL, n.y);
                ctx.strokeStyle = `rgba(${rgb},0.07)`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }

        // --- 4. Vertical trace lines ---
        for (let r = 0; r < ROWS - 1; r++) {
            for (let c = 0; c < COLS; c++) {
                const n = nodes[r * COLS + c];
                if (!n || !n.traceBottom) continue;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(n.x, n.y + CELL);
                ctx.strokeStyle = `rgba(${rgb},0.07)`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }

        // --- 5. Junction nodes (pulsing rings + dots) ---
        for (const n of nodes) {
            if (!n.junction) continue;
            const glow = 0.5 + 0.5 * Math.sin(time * 1.6 + n.phase);

            // outer ring
            ctx.beginPath();
            ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${rgb},${0.12 + 0.08 * glow})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // inner dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb},${0.25 + 0.25 * glow})`;
            ctx.fill();

            // glow halo (shadow trick)
            ctx.shadowColor  = `rgba(${rgb},${0.4 * glow})`;
            ctx.shadowBlur   = 6;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb},${0.5 * glow})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // --- 6. Signal pulses ---
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.t += p.speed;

            if (p.t >= 1) {
                // re-spawn with fresh colour
                pulses.splice(i, 1);
                spawnPulse();
                continue;
            }

            const n = nodes[p.nodeIdx];
            if (!n) continue;

            let x1, y1, x2, y2;
            if (p.dir === 'h') {
                x1 = n.x; y1 = n.y;
                x2 = n.x + CELL; y2 = n.y;
            } else {
                x1 = n.x; y1 = n.y;
                x2 = n.x; y2 = n.y + CELL;
            }

            // head position
            const hx = x1 + (x2 - x1) * p.t;
            const hy = y1 + (y2 - y1) * p.t;

            // trail gradient
            const trail = ctx.createLinearGradient(x1, y1, hx, hy);
            trail.addColorStop(0,   `rgba(${p.rgb},0)`);
            trail.addColorStop(0.6, `rgba(${p.rgb},0.08)`);
            trail.addColorStop(1,   `rgba(${p.rgb},0.55)`);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(hx, hy);
            ctx.strokeStyle = trail;
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // bright head dot
            ctx.shadowColor = `rgba(${p.rgb},0.9)`;
            ctx.shadowBlur  = 8;
            ctx.beginPath();
            ctx.arc(hx, hy, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.rgb},1)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // --- 7. Subtle moving scanline ---
        scanY = (scanY + 0.25) % H;
        const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
        scanGrad.addColorStop(0,   `rgba(${rgb},0)`);
        scanGrad.addColorStop(0.5, `rgba(${rgb},0.025)`);
        scanGrad.addColorStop(1,   `rgba(${rgb},0)`);
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 60, W, 120);

        // --- 8. Vignette ---
        const vig = ctx.createRadialGradient(W/2, H/2, H * 0.15, W/2, H/2, H * 0.9);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initPulses();
    requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'y') {
        triggerDoomEgg();
    }
});

function triggerDoomEgg() {
    const overlay = document.getElementById('easter-egg-overlay');
    const audio = document.getElementById('doom-theme');
    
    // Local file — place doom_e1m1.mp3 in the same folder as index.html
    audio.src = "./doom_e1m1.mp3";
    audio.load();
    
    overlay.classList.add('active');
    
    var playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            console.log("Audio playing successfully.");
        }).catch(error => {
            console.log("Audio play failed to instantiate:", error);
        });
    }

    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const alphabet = "01010101010101010101010101";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const rainDrops = Array(Math.floor(columns)).fill(1);

    const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0'; 
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };

    const matrixInterval = setInterval(drawMatrix, 30);

    setTimeout(() => {
        clearInterval(matrixInterval);
        window.location.href = "https://dos.zone/doom-dec-1993/";
    }, 4000);
}
/* ============================================================
   EASTER EGG SYSTEM — Chaitanya Jha Portfolio
   ============================================================ */

(function() {
    'use strict';

    // ── Shared key-sequence tracker ──────────────────────────
    let typedBuffer = '';
    const BUFFER_TIMEOUT = 1500; // ms between keystrokes before reset
    let bufferTimer = null;

    function resetBuffer() {
        typedBuffer = '';
        if (bufferTimer) clearTimeout(bufferTimer);
    }

    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in a form field
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        // Ignore modifier combos (except single chars)
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const ch = e.key.length === 1 ? e.key : '';
        if (!ch) { resetBuffer(); return; }

        typedBuffer += ch;

        // Keep buffer to last 12 chars only
        if (typedBuffer.length > 12) {
            typedBuffer = typedBuffer.slice(-12);
        }

        // Reset inactivity timer
        if (bufferTimer) clearTimeout(bufferTimer);
        bufferTimer = setTimeout(resetBuffer, BUFFER_TIMEOUT);

        checkEasterEggs();
    });

    function checkEasterEggs() {
        const buf = typedBuffer.toLowerCase();

        // 1. Colour themes
        const colours = ['red', 'yellow', 'green', 'blue'];
        for (const colour of colours) {
            if (buf.endsWith(colour)) {
                triggerColourTheme(colour);
                resetBuffer();
                return;
            }
        }

        // 2. Greek / Roman (God of War) — Alpha Beta Gamma Delta
        const greek = ['alpha', 'beta', 'gamma', 'delta'];
        for (const word of greek) {
            if (buf.endsWith(word)) {
                triggerGreekEgg();
                resetBuffer();
                return;
            }
        }

        // 3. White Room (Classroom of the Elite)
        if (buf.endsWith('white room') || buf.endsWith('whiteroom')) {
            triggerCoteEgg();
            resetBuffer();
            return;
        }

        // 4. Snake (Metal Gear)
        if (buf.endsWith('snake')) {
            triggerSnakeEgg();
            resetBuffer();
            return;
        }

        // 5. Breaking Bad
        const bbTriggers = ['cook', 'walter', 'walter white', 'heisenberg', 'jessie'];
        for (const word of bbTriggers) {
            if (buf.endsWith(word)) {
                triggerBreakingBadEgg();
                resetBuffer();
                return;
            }
        }
    }

    /* ─────────────────────────────────────────────────────────
       EGG 1 — Colour Themes
    ───────────────────────────────────────────────────────── */
    let currentColourTheme = null;
    let colourToastTimer = null;

    const colourMeta = {
        red:    { label: '🔴 Red Theme Activated',    particle: '239,68,68',     line: '239,68,68' },
        yellow: { label: '🟡 Yellow Theme Activated', particle: '234,179,8',     line: '234,179,8' },
        green:  { label: '🟢 Green Theme Activated',  particle: '34,197,94',     line: '34,197,94' },
        blue:   { label: '🔵 Blue Theme Activated',   particle: '59,130,246',    line: '59,130,246' },
    };

    function triggerColourTheme(colour) {
        // Toggle off if same colour typed again
        if (currentColourTheme === colour) {
            clearColourTheme();
            showToast('↩ Theme reset');
            return;
        }

        // Remove old theme
        const body = document.body;
        ['red','yellow','green','blue'].forEach(c => body.classList.remove('theme-' + c));

        body.classList.add('theme-' + colour);
        currentColourTheme = colour;

        // Re-colour the canvas particles
        repaintParticles(colour);

        showToast(colourMeta[colour].label);
    }

    function clearColourTheme() {
        const body = document.body;
        ['red','yellow','green','blue'].forEach(c => body.classList.remove('theme-' + c));
        currentColourTheme = null;
        repaintParticles(null); // back to default green
    }

    function showToast(msg) {
        let toast = document.getElementById('colour-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'colour-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');

        if (colourToastTimer) clearTimeout(colourToastTimer);
        colourToastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // Patch the particle draw colour at runtime
    // We override the global particleColour variable used by the draw loop.
    window.__eggParticleRGB = null; // null = use default

    function repaintParticles(colour) {
        window.__eggParticleRGB = colour ? colourMeta[colour].particle : null;
    }

    // Monkey-patch the existing animation: we wrap the Particle.draw method
    // by injecting a global colour resolver. We do this after page load.
    function patchParticleRenderer() {
        // The canvas loop calls ctx.fillStyle with hardcoded green.
        // We intercept by overriding the global canvas fillStyle at the
        // CanvasRenderingContext2D prototype level per-frame.
        const origFill = Object.getOwnPropertyDescriptor(
            CanvasRenderingContext2D.prototype, 'fillStyle'
        );
        // We store a flag; the bg-canvas context is the one we want to patch.
        const bgCanvas = document.getElementById('bg-canvas');
        if (!bgCanvas) return;
        const bgCtx = bgCanvas.getContext('2d');

        const originalFillStyleSetter = origFill.set;
        Object.defineProperty(bgCtx, 'fillStyle', {
            set(value) {
                // Replace the hardcoded green particle colour only
                if (window.__eggParticleRGB && typeof value === 'string' && value.startsWith('rgba(16, 185, 129')) {
                    const newVal = value.replace('16, 185, 129', window.__eggParticleRGB);
                    originalFillStyleSetter.call(this, newVal);
                } else {
                    originalFillStyleSetter.call(this, value);
                }
            },
            get() {
                return origFill.get.call(this);
            },
            configurable: true
        });

        // Also patch strokeStyle for connecting lines
        const origStroke = Object.getOwnPropertyDescriptor(
            CanvasRenderingContext2D.prototype, 'strokeStyle'
        );
        const originalStrokeStyleSetter = origStroke.set;
        Object.defineProperty(bgCtx, 'strokeStyle', {
            set(value) {
                if (window.__eggParticleRGB && typeof value === 'string' && value.startsWith('rgba(16, 185, 129')) {
                    const newVal = value.replace('16, 185, 129', window.__eggParticleRGB);
                    originalStrokeStyleSetter.call(this, newVal);
                } else {
                    originalStrokeStyleSetter.call(this, value);
                }
            },
            get() {
                return origStroke.get.call(this);
            },
            configurable: true
        });
    }

    // Run after DOM is ready so bg-canvas exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchParticleRenderer);
    } else {
        patchParticleRenderer();
    }

    /* ─────────────────────────────────────────────────────────
       EGG 2 — Greek / Roman (God of War 2018)
    ───────────────────────────────────────────────────────── */
    function triggerGreekEgg() {
        let overlay = document.getElementById('greek-overlay');
        if (!overlay) buildGreekOverlay();
        overlay = document.getElementById('greek-overlay');
        overlay.classList.add('active');
        startGreekCanvas();
        playGreekAudio();
    }

    function buildGreekOverlay() {
        const el = document.createElement('div');
        el.id = 'greek-overlay';
        el.innerHTML = `
            <canvas id="greek-canvas"></canvas>
            <div class="greek-content">
                <div class="greek-rune">Α Β Γ Δ</div>
                <div class="greek-title">Son. Listen.</div>
                <div class="greek-sub">Click anywhere to return — or face the consequences</div>
            </div>
        `;
        document.body.appendChild(el);
        el.addEventListener('click', closeGreekEgg);
    }

    function closeGreekEgg() {
        const overlay = document.getElementById('greek-overlay');
        if (overlay) overlay.classList.remove('active');
        stopGreekAudio();
    }

    let greekAnimFrame = null;
    let greekAudio = null;

    function startGreekCanvas() {
        const canvas = document.getElementById('greek-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Falling Greek letters
        const LETTERS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω';
        const fontSize = 18;
        const cols = Math.floor(canvas.width / fontSize);
        const drops = Array(cols).fill(0).map(() => Math.random() * -canvas.height / fontSize);

        function drawGreek() {
            ctx.fillStyle = 'rgba(13, 7, 0, 0.07)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#c9a84c';
            ctx.font = fontSize + 'px Georgia, serif';

            for (let i = 0; i < drops.length; i++) {
                const ch = LETTERS[Math.floor(Math.random() * LETTERS.length)];
                ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 0.6;
            }
            greekAnimFrame = requestAnimationFrame(drawGreek);
        }

        if (greekAnimFrame) cancelAnimationFrame(greekAnimFrame);
        drawGreek();
    }

    function playGreekAudio() {
        if (!greekAudio) {
            greekAudio = new Audio();
            greekAudio.loop = true;
            // Local file — place gow_ashes.mp3 in the same folder as index.html
            greekAudio.src = './gow_ashes.mp3';
        }
        greekAudio.currentTime = 0;
        greekAudio.play().catch((err) => {
            console.warn('[GoW Egg] Audio play failed:', err);
            const sub = document.querySelector('.greek-sub');
            if (sub) sub.textContent = 'Press any key to wake the gods… (or click to dismiss)';
            const resumeOnce = () => { greekAudio.play().catch(() => {}); };
            document.addEventListener('keydown', resumeOnce, { once: true });
            document.getElementById('greek-overlay')?.addEventListener('click', resumeOnce, { once: true });
        });
    }

    function resumeGreekAudio() {
        if (greekAudio) greekAudio.play().catch(() => {});
    }

    function stopGreekAudio() {
        if (greekAnimFrame) { cancelAnimationFrame(greekAnimFrame); greekAnimFrame = null; }
        if (greekAudio) { greekAudio.pause(); greekAudio.currentTime = 0; }
    }

    /* ─────────────────────────────────────────────────────────
       EGG 3 — White Room (Classroom of the Elite)
    ───────────────────────────────────────────────────────── */
    function triggerCoteEgg() {
        let overlay = document.getElementById('cote-overlay');
        if (!overlay) buildCoteOverlay();
        overlay = document.getElementById('cote-overlay');
        overlay.classList.add('active');
        playCoteAudio();
    }

    function buildCoteOverlay() {
        const el = document.createElement('div');
        el.id = 'cote-overlay';
        el.innerHTML = `
            <div class="cote-grid"></div>
            <div class="cote-content">
                <div class="cote-logo-ring">🏫</div>
                <div class="cote-school">Advanced Nurturing High School</div>
                <div class="cote-title">The White Room</div>
                <div class="cote-quote">
                    "The true meaning of equality is not treating everyone the same —<br>
                    it is giving each person what they <em>deserve</em>."
                    <br><br>— Kiyotaka Ayanokoji
                </div>
                <div class="cote-points">
                    <div class="cote-point-item"><div class="val">100</div><div class="label">Class Points</div></div>
                    <div class="cote-point-item"><div class="val">S</div><div class="label">Rank</div></div>
                    <div class="cote-point-item"><div class="val">∞</div><div class="label">Potential</div></div>
                </div>
            </div>
            <div class="cote-dismiss">Click anywhere to exit the White Room</div>
        `;
        document.body.appendChild(el);
        el.addEventListener('click', closeCoteEgg);
    }

    function closeCoteEgg() {
        const overlay = document.getElementById('cote-overlay');
        if (overlay) overlay.classList.remove('active');
        stopCoteAudio();
    }

    let coteAudio = null;

    function playCoteAudio() {
        if (!coteAudio) {
            coteAudio = new Audio();
            coteAudio.loop = true;
            // Local file — place cote_white_room.mp3 in the same folder as index.html
            coteAudio.src = './cote_white_room.mp3';
        }
        coteAudio.currentTime = 0;
        coteAudio.play().catch((err) => {
            console.warn('[CoTE Egg] Audio play failed:', err);
            const dismiss = document.querySelector('.cote-dismiss');
            if (dismiss) dismiss.textContent = 'Press any key to enter the White Room… (or click to exit)';
            const resumeOnce = () => { coteAudio.play().catch(() => {}); };
            document.addEventListener('keydown', resumeOnce, { once: true });
            document.getElementById('cote-overlay')?.addEventListener('click', resumeOnce, { once: true });
        });
    }

    function stopCoteAudio() {
        if (coteAudio) { coteAudio.pause(); coteAudio.currentTime = 0; }
    }

})();

    /* ─────────────────────────────────────────────────────────
       EGG 4 — SNAKE (Metal Gear Solid)
       Phase 1: 5s gasp gif + Gasp.mp3
       Phase 2: 50s hallway gif + duran.mp3 (Duran Duran)
    ───────────────────────────────────────────────────────── */
    function triggerSnakeEgg() {
        let overlay = document.getElementById('snake-overlay');
        if (!overlay) buildSnakeOverlay();
        overlay = document.getElementById('snake-overlay');

        // Reset to phase 1
        startSnakePhase1();
        overlay.classList.add('active');
    }

    function buildSnakeOverlay() {
        const el = document.createElement('div');
        el.id = 'snake-overlay';
        el.innerHTML = `
            <img id="snake-gif" src="" alt="Snake" />
            <div id="snake-codec-bar">
                <span id="snake-codec-name">! SNAKE</span>
                <span id="snake-codec-text"></span>
            </div>
        `;
        document.body.appendChild(el);
        // Click to skip / close only after phase 2 starts
        el.addEventListener('click', () => {
            if (el.dataset.phase === '2') closeSnakeEgg();
        });
    }

    // Lazy-init audio: only create objects when the egg is actually triggered.
    // Creating Audio() at parse time caused browsers to preload/autoplay randomly.
    let snakeGaspAudio  = null;
    let snakeDuranAudio = null;

    function ensureSnakeAudio() {
        if (!snakeGaspAudio) {
            snakeGaspAudio = new Audio('./Gasp.mp3');
        }
        if (!snakeDuranAudio) {
            snakeDuranAudio = new Audio('./duran.mp3');
            snakeDuranAudio.loop = true;
        }
    }

    let snakePhaseTimer = null;
    let snakeCodecTimer = null;
    let snakeGifLoopTimer = null;
    let snakeGifDuration = 0;

    function startSnakePhase1() {
        ensureSnakeAudio();

        const overlay = document.getElementById('snake-overlay');
        const gif     = document.getElementById('snake-gif');
        const bar     = document.getElementById('snake-codec-bar');
        const text    = document.getElementById('snake-codec-text');

        overlay.dataset.phase = '1';
        overlay.classList.remove('phase2');
        overlay.classList.add('phase1');

        // Static jpeg — just show it for 5 seconds
        gif.src = './snake_gasp.jpg?t=' + Date.now();
        gif.className = 'gasp';

        bar.style.display = 'flex';
        typeCodecText(text, '!  !  !', 80);

        // Gasp audio
        snakeGaspAudio.currentTime = 0;
        snakeGaspAudio.play().catch(() => {});

        // Stop any leftover duran
        if (snakeDuranAudio) { snakeDuranAudio.pause(); snakeDuranAudio.currentTime = 0; }

        // After 5 seconds → phase 2
        if (snakePhaseTimer) clearTimeout(snakePhaseTimer);
        snakePhaseTimer = setTimeout(startSnakePhase2, 5000);
    }

    function startSnakePhase2() {
        const overlay = document.getElementById('snake-overlay');
        const gif     = document.getElementById('snake-gif');
        const bar     = document.getElementById('snake-codec-bar');
        const text    = document.getElementById('snake-codec-text');

        overlay.dataset.phase = '2';
        overlay.classList.remove('phase1');
        overlay.classList.add('phase2');

        // Loop the hallway gif for the full 50 seconds by restarting it
        function restartHallwayGif() {
            gif.src = './snake_hallway.gif?t=' + Date.now();
        }
        restartHallwayGif();
        gif.className = 'hallway';

        // Measure gif duration on first load, then loop it
        gif.onload = null;
        const measureImg = new Image();
        measureImg.onload = function() {
            // We can't read GIF frame count directly — use a fixed remeasure trick:
            // Re-swap src every N ms. We use 4000ms as a safe conservative loop gap.
            // User can override snakeGifDuration if they know the exact gif length.
            const loopMs = snakeGifDuration > 0 ? snakeGifDuration : 4000;
            if (snakeGifLoopTimer) clearInterval(snakeGifLoopTimer);
            snakeGifLoopTimer = setInterval(() => {
                if (document.getElementById('snake-overlay')?.dataset.phase === '2') {
                    restartHallwayGif();
                }
            }, loopMs);
        };
        measureImg.src = './snake_hallway.gif';

        // Update codec bar
        typeCodecText(text, 'SHADOW MOSES — B2 BASEMENT', 55);

        // Duran Duran music
        snakeDuranAudio.currentTime = 0;
        snakeDuranAudio.play().catch(() => {});

        // Fade out gasp audio
        if (snakeGaspAudio) { snakeGaspAudio.pause(); snakeGaspAudio.currentTime = 0; }

        // Auto-close after 50 seconds
        if (snakePhaseTimer) clearTimeout(snakePhaseTimer);
        snakePhaseTimer = setTimeout(closeSnakeEgg, 50000);

        // Show "click to dismiss" hint after 3s
        setTimeout(() => {
            if (text) typeCodecText(text, 'Click anywhere to extract — or enjoy the walk', 40);
        }, 3000);
    }

    function closeSnakeEgg() {
        const overlay = document.getElementById('snake-overlay');
        if (overlay) overlay.classList.remove('active', 'phase1', 'phase2');
        if (snakePhaseTimer) clearTimeout(snakePhaseTimer);
        if (snakeCodecTimer) clearTimeout(snakeCodecTimer);
        if (snakeGifLoopTimer) { clearInterval(snakeGifLoopTimer); snakeGifLoopTimer = null; }
        if (snakeGaspAudio)  { snakeGaspAudio.pause();  snakeGaspAudio.currentTime  = 0; }
        if (snakeDuranAudio) { snakeDuranAudio.pause(); snakeDuranAudio.currentTime = 0; }
    }

    function typeCodecText(el, str, speed) {
        if (snakeCodecTimer) clearTimeout(snakeCodecTimer);
        el.textContent = '';
        let i = 0;
        function next() {
            if (i < str.length) {
                el.textContent += str[i++];
                snakeCodecTimer = setTimeout(next, speed);
            }
        }
        next();
    }


/* ============================================================
   UI ENHANCEMENTS
   ============================================================ */

/* ── 1. Glowing Cursor Trail ─────────────────────────────── */
function initCursorTrail() {
    const TRAIL_COUNT = 12;
    const dots = [];

    for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.opacity = (1 - i / TRAIL_COUNT) * 0.7;
        dot.style.width = dot.style.height = Math.max(4, 10 - i * 0.6) + 'px';
        document.body.appendChild(dot);
        dots.push({ el: dot, x: -100, y: -100 });
    }

    let mouseX = -100, mouseY = -100;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    // Cursor dot — head follows instantly
    const head = document.createElement('div');
    head.className = 'cursor-head';
    document.body.appendChild(head);
    document.addEventListener('mousemove', e => {
        head.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    // Trail smoothly follows with lag
    function animateTrail() {
        let x = mouseX, y = mouseY;
        dots.forEach((dot, i) => {
            const prev = i === 0 ? { x: mouseX, y: mouseY } : dots[i - 1];
            dot.x += (prev.x - dot.x) * 0.35;
            dot.y += (prev.y - dot.y) * 0.35;
            dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;
        });
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Hide default cursor on the page
    document.documentElement.style.cursor = 'none';
    // Restore on links/buttons
    document.querySelectorAll('a, button, input, textarea, [onclick]').forEach(el => {
        el.style.cursor = 'none';
    });
}

/* ── 2. Hero Typing Animation ────────────────────────────── */
function initHeroTyping() {
    const h1 = document.querySelector('#home .hero-content h1');
    if (!h1) return;

    const fullText = h1.textContent.trim();
    h1.innerHTML = '<span class="typed-text"></span><span class="typed-cursor">_</span>';
    const typedSpan = h1.querySelector('.typed-text');

    let i = 0;
    const speed = 55;

    function typeChar() {
        if (i < fullText.length) {
            typedSpan.textContent += fullText[i++];
            setTimeout(typeChar, speed + Math.random() * 30);
        }
    }
    // Small delay so page has settled
    setTimeout(typeChar, 600);
}

/* ── 4. Terminal-style Section Headings ──────────────────── */
// We inject the prompt prefix into every h2 on page load
(function initTerminalHeadings() {
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.page-section h2').forEach(h2 => {
            const text = h2.childNodes[0];
            if (text && text.nodeType === Node.TEXT_NODE) {
                const span = document.createElement('span');
                span.className = 'terminal-prompt-prefix';
                span.textContent = '> ';
                h2.insertBefore(span, h2.firstChild);

                // Blinking cursor after the text
                const cursor = document.createElement('span');
                cursor.className = 'terminal-heading-cursor';
                cursor.textContent = '_';
                h2.appendChild(cursor);
            }
        });
    });
})();

/* ── 5. Navbar Glow Pill ─────────────────────────────────── */
function initNavGlowPill() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const pill = document.createElement('span');
    pill.className = 'nav-glow-pill';
    navLinks.appendChild(pill);

    function movePillToActive() {
        const active = navLinks.querySelector('.nav-item.active');
        if (!active) { pill.style.opacity = '0'; return; }
        const navRect  = navLinks.getBoundingClientRect();
        const itemRect = active.getBoundingClientRect();
        pill.style.opacity  = '1';
        pill.style.width    = itemRect.width  + 'px';
        pill.style.height   = itemRect.height + 'px';
        pill.style.left     = (itemRect.left - navRect.left) + 'px';
        pill.style.top      = (itemRect.top  - navRect.top)  + 'px';
    }

    // Move on every switchPage call
    const origSwitch = window.switchPage;
    window.switchPage = function(pageId) {
        origSwitch(pageId);
        setTimeout(movePillToActive, 20);
    };
    // Init position on load
    setTimeout(movePillToActive, 100);
}

/* ── Scroll Progress Bar (bonus — tiny, elegant) ─────────── */
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    // Track scroll inside the active page-section
    document.querySelectorAll('.page-section').forEach(section => {
        section.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = section;
            const pct = scrollHeight <= clientHeight ? 100
                      : (scrollTop / (scrollHeight - clientHeight)) * 100;
            bar.style.width = pct + '%';
        });
    });
}


/* ============================================================
   CONTACT FORM — Netlify AJAX submission
   Intercepts the native POST so the SPA never navigates away.
   Shows inline success/error instead of a redirect.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const form   = document.getElementById('contact-form');
    const btn    = document.getElementById('contact-submit');
    const success = document.getElementById('form-success');
    const error   = document.getElementById('form-error');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Hide old messages, show loading state
        success.style.display = 'none';
        error.style.display   = 'none';
        btn.disabled    = true;
        btn.textContent = 'Sending…';

        try {
            const data = new FormData(form);

            const res = await fetch(form.action, {
                method:  'POST',
                headers: { 'Accept': 'application/json' },
                body:    data,
            });

            if (res.ok) {
                success.style.display = 'block';
                form.reset();
                btn.textContent = 'Sent ✓';
                setTimeout(() => {
                    btn.disabled    = false;
                    btn.textContent = 'Send Message';
                }, 4000);
            } else {
                throw new Error('Server returned ' + res.status);
            }
        } catch (err) {
            console.error('Form error:', err);
            error.style.display = 'block';
            btn.disabled    = false;
            btn.textContent = 'Send Message';
        }
    });
});

/* ============================================================
   iOS SAFARI AUDIO UNLOCK
   Safari blocks all audio until the user taps the page.
   This silently unlocks the audio context on first interaction
   so all easter egg sounds fire correctly afterward.
   ============================================================ */
(function() {
    let unlocked = false;

    function unlockAudio() {
        if (unlocked) return;
        unlocked = true;

        // Create and immediately pause a silent buffer — this satisfies
        // Safari's "user gesture required" requirement for all future plays
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        setTimeout(() => ctx.close(), 500);

        // Also silently touch each audio element so Safari registers them
        const silentUnlock = (audio) => {
            if (!audio) return;
            audio.muted = true;
            audio.play().then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
            }).catch(() => { audio.muted = false; });
        };

        // Pre-unlock the doom audio element that already exists in DOM
        silentUnlock(document.getElementById('doom-theme'));

        // Pre-unlock all easter egg audio objects
        [
            './Gasp.mp3',
            './duran.mp3',
            './gow_ashes.mp3',
            './cote_white_room.mp3',
            './doom_e1m1.mp3',
        ].forEach(src => {
            const a = new Audio(src);
            silentUnlock(a);
        });

        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
    }

    document.addEventListener('touchstart', unlockAudio, { passive: true });
    document.addEventListener('click',      unlockAudio, { passive: true });
})();

    /* ─────────────────────────────────────────────────────────
       EGG 5 — BREAKING BAD
       Triggers on: cook / walter / walter white / heisenberg / jessie
       Plays cook.mp4 fullscreen with exit button
    ───────────────────────────────────────────────────────── */
    function triggerBreakingBadEgg() {
        let overlay = document.getElementById('bb-overlay');
        if (!overlay) buildBBOverlay();
        overlay = document.getElementById('bb-overlay');
        overlay.classList.add('active');

        const video = document.getElementById('bb-video');
        video.currentTime = 0;
        video.play().catch(() => {});
    }

    function buildBBOverlay() {
        const el = document.createElement('div');
        el.id = 'bb-overlay';
        el.innerHTML = `
            <video id="bb-video" src="./cook.mp4" playsinline></video>
            <button id="bb-exit-btn" onclick="closeBBEgg()">✕ Exit</button>
            <div id="bb-caption">Say my name.</div>
        `;
        document.body.appendChild(el);

        // Auto-close when video ends
        const video = el.querySelector('#bb-video');
        video.addEventListener('ended', closeBBEgg);
    }

    function closeBBEgg() {
        const overlay = document.getElementById('bb-overlay');
        if (!overlay) return;
        const video = document.getElementById('bb-video');
        if (video) { video.pause(); video.currentTime = 0; }
        overlay.classList.remove('active');
    }


/* ============================================================
   PROJECT CARDS — tap to expand on touch devices
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.flip-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't toggle if they tapped the download button
            if (e.target.closest('.card-action-btn')) return;
            card.classList.toggle('expanded');
        });
    });
});

/* ============================================================
   PROJECT DETAIL MODALS
   ============================================================ */

const PROJECT_DATA = {
    aegis: {
        badge: 'AI & Document Verification',
        title: 'Aegis One',
        overview: 'A multi-phase Python pipeline engineered to analyse academic credentials and identity documents, programmatically detecting deepfakes and flagged authenticity anomalies through layout inspection and metadata analysis.',
        highlights: [
            'Designed a document ingestion module that parses structural layout, font consistency, and metadata signatures across academic and identity document types.',
            'Implemented classification logic to distinguish genuine documents from AI-generated or digitally manipulated counterparts.',
            'Generated structured anomaly reports flagging specific regions of suspicion with confidence scores.',
            'Architected the system in self-contained phases — ingestion, analysis, classification, and reporting — for modularity and easy extension.',
        ],
        stack: ['Python', 'Computer Vision', 'Document Analysis', 'Metadata Parsing', 'Classification Logic'],
        status: 'Prototype — Personal Project',
    },
    codecoach: {
        badge: 'Full Stack / Automation',
        title: 'CodeCoach AI',
        overview: 'A full-stack web platform with persistent session tracking built to help developers identify recurring logic errors, monitor architecture trends in their code, and systematically improve through targeted feedback.',
        highlights: [
            'Built a full-stack interface allowing users to submit code for analysis across multiple sessions with state persistence between visits.',
            'Integrated a backend analysis module that scores submissions, tracks improvement trajectories over time, and surfaces repeating error patterns.',
            'Designed a feedback engine that categorises errors by type — logic, syntax, architecture — and generates targeted improvement suggestions.',
            'Implemented session history and progress dashboards so users can review their improvement curve across sessions.',
        ],
        stack: ['JavaScript', 'HTML', 'CSS', 'Python', 'MySQL', 'REST API'],
        status: 'Prototype — Personal Project',
    },
    sewer: {
        badge: 'IoT / Smart Infrastructure',
        title: 'Smart Sewer Management',
        overview: 'A sensor-integrated automated network prototype designed to map urban drainage load in real time across Bengaluru, dynamically identifying flash-flood risk zones and relaying pre-emptive maintenance alerts.',
        highlights: [
            'Architected a distributed sensor network layout to monitor sewer blockage levels, flow rates, and overflow indicators across multiple urban nodes.',
            'Designed a telemetry pipeline that aggregates sensor readings into a centralised dashboard, flagging high-risk zones before flood onset.',
            'Implemented dynamic threshold logic that adjusts alert sensitivity based on rainfall forecast data and historical blockage patterns.',
            'Structured the system to enable pre-emptive maintenance dispatch, reducing reactive emergency response time for municipal infrastructure teams.',
        ],
        stack: ['IoT Sensors', 'Python', 'Telemetry Pipeline', 'Data Aggregation', 'Dashboard UI'],
        status: 'Prototype — Academic / Personal Project',
    },
};

function openProjectModal(key) {
    const data = PROJECT_DATA[key];
    if (!data) return;

    document.getElementById('modal-badge').textContent   = data.badge;
    document.getElementById('modal-title').textContent   = data.title;

    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <h4>Overview</h4>
        <p>${data.overview}</p>

        <h4>Key Engineering Points</h4>
        <ul>
            ${data.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>

        <h4>Tech Stack</h4>
        <div class="tag-row">
            ${data.stack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>

        <h4>Status</h4>
        <div class="tag-row">
            <span class="status-tag">${data.status}</span>
        </div>
    `;

    const overlay = document.getElementById('project-modal-overlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal(e) {
    // If called from overlay click, only close if the overlay itself was clicked
    if (e && e.target !== document.getElementById('project-modal-overlay')) return;
    document.getElementById('project-modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProjectModal(null);
});
