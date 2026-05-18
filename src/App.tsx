import { useState, useEffect, useRef } from 'react'
import HiddenGame from './HiddenGame'
import Loader from './components/Loader'
import { Rocket, Video, Bot, Satellite, Zap, Globe, Infinity as InfinityIcon, Mail, Plane, Award } from 'lucide-react';

/* ========================
   PHYSICS ENGINE (Matter.js CDN loaded dynamically)
   ======================== */
function usePhysicsCanvas(canvasRef, containerRef) {
  useEffect(() => {
    // If already loaded, init immediately; else load from CDN
    const init = () => {
      const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint } = window.Matter;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return () => { };

      const W = container.offsetWidth;
      const H = 260; // fixed height
      canvas.width = W;
      canvas.height = H;

      const engine = Engine.create({ gravity: { y: 1.2 } });
      const render = Render.create({
        canvas, engine,
        options: { width: W, height: H, wireframes: false, background: 'transparent' }
      });

      // Static bodies
      const ground = Bodies.rectangle(W / 2, H - 5, W * 2, 20, { isStatic: true, render: { fillStyle: 'transparent', strokeStyle: 'transparent' } });
      const wallL = Bodies.rectangle(-10, H / 2, 20, H * 2, { isStatic: true, render: { fillStyle: 'transparent', strokeStyle: 'transparent' } });
      const wallR = Bodies.rectangle(W + 10, H / 2, 20, H * 2, { isStatic: true, render: { fillStyle: 'transparent', strokeStyle: 'transparent' } });
      World.add(engine.world, [ground, wallL, wallR]);

      // Drop shapes from different X positions staggered in time
      const colors = ['#FF5A00', '#7C3AED', '#22d3ee', '#FACC15', '#F43F5E', '#4ade80', '#a78bfa', '#fb923c', '#f472b6', '#34d399'];
      const makeShape = (x, y, color, i) => {
        const isCircle = i % 2 === 0;
        const size = 22 + Math.random() * 18;
        const opts = { restitution: 0.6, friction: 0.3, frictionAir: 0.015, render: { fillStyle: color, strokeStyle: 'transparent', lineWidth: 0 } };
        return isCircle
          ? Bodies.circle(x, y, size / 2, opts)
          : Bodies.rectangle(x, y, size, size, { ...opts, angle: Math.random() * Math.PI });
      };

      const shapeCount = 12;
      const shapes = Array.from({ length: shapeCount }, (_, i) => {
        const x = (W / shapeCount) * i + (W / shapeCount / 2) + (Math.random() - 0.5) * 40;
        const y = -20 - i * 18;
        return makeShape(x, y, colors[i % colors.length], i);
      });
      World.add(engine.world, shapes);

      // Mouse drag
      const mouse = Mouse.create(canvas);
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.25, render: { visible: false } } });
      World.add(engine.world, mc);
      render.mouse = mouse;

      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);

      const handleResize = () => {
        const nW = container.offsetWidth;
        render.options.width = nW;
        canvas.width = nW;
        Body.setPosition(ground, { x: nW / 2, y: H - 5 });
        Body.setPosition(wallR, { x: nW + 10, y: H / 2 });
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        Render.stop(render);
        Runner.stop(runner);
        World.clear(engine.world);
        Engine.clear(engine);
      };
    };

    let cleanup = () => { };
    if (window.Matter) {
      cleanup = init() || (() => { });
    } else {
      const existing = document.querySelector('script[data-matter]');
      if (existing) {
        existing.addEventListener('load', () => { cleanup = init() || (() => { }); });
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
        script.setAttribute('data-matter', 'true');
        script.onload = () => { cleanup = init() || (() => { }); };
        document.head.appendChild(script);
      }
    }
    return () => cleanup();
  }, [canvasRef, containerRef]);
}

/* ========================
   SCROLL REVEAL
   ======================== */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ========================
   PHYSICS CANVAS COMPONENT
   ======================== */
function PhysicsPlayground() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  usePhysicsCanvas(canvasRef, containerRef);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '260px',
        overflow: 'hidden',
      }}
    >
      {/* Labels that sit on top of canvas */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        zIndex: 3,
        pointerEvents: 'none',
      }}>
        <span style={{
          background: '#FF5A00',
          color: '#fff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.5px',
          padding: '0.5rem 1.2rem',
          borderRadius: '8px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>DRONE BUILD ↗</span>
        <span style={{
          background: '#7C3AED',
          color: '#fff',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.5px',
          padding: '0.5rem 1.2rem',
          borderRadius: '8px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>FPV PILOT ↗</span>
      </div>

      {/* Drag hint */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 24,
        fontFamily: 'Dancing Script, cursive',
        fontSize: '1rem',
        color: 'rgba(255,255,255,0.2)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        ↙ drag to play
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

/* ========================
   POLAROID STACK
   ======================== */
function PolaroidStack() {
  const images = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `/port_pic/${n}.jpeg`);
  const [drops, setDrops] = useState([{ id: 0, imgIdx: 0 }]);
  const [isVisible, setIsVisible] = useState(false);
  const nextIdRef = useRef(1);
  const stackRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([ent]) => {
      if (ent.isIntersecting) setIsVisible(true);
    }, { threshold: 0.2 });
    if (stackRef.current) observer.observe(stackRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setDrops(prev => {
        if (prev.length === 0) return [{ id: nextIdRef.current++, imgIdx: 0 }];
        const lastDrop = prev[prev.length - 1];
        const nextIdx = (lastDrop.imgIdx + 1) % images.length;
        const newDrop = { id: nextIdRef.current++, imgIdx: nextIdx };
        const nextPool = [...prev, newDrop];
        return nextPool.slice(-24); // Larger pool for smoother transitions
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible, images.length]);

  return (
    <div className="about-center" ref={stackRef}>
      <div className="polaroid-stack">
        {drops.map((drop, i) => {
          const rotation = ((drop.id * 7) % 20) - 10;
          const currentMaxId = nextIdRef.current - 1;
          const depth = currentMaxId - drop.id;

          if (depth > 12) return null; // Keep in DOM for smooth transition, delete later

          // Gradually fade. At depth 8, opacity becomes 0.
          const opacity = depth >= 8 ? 0 : 1 - (depth / 8);

          return (
            <div
              key={drop.id}
              className={`about-polaroid stacked-card is-active ${depth === 0 ? 'top-card' : ''}`}
              style={{
                zIndex: drop.id, // Absolute ID-based stability
                '--rot': `${rotation}deg`,
                opacity: opacity,
                transition: 'opacity 2s ease-in-out',
                pointerEvents: depth === 0 ? 'auto' : 'none'
              }}
            >
              <img src={images[drop.imgIdx]} alt={`Flight Log ${drop.imgIdx + 1}`} />
              <div className="about-polaroid-label">LOG #{drop.imgIdx + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========================
   MAIN APP
   ======================== */
function App() {
  // TOGGLE THEME HERE: 'dark' or 'light'
  const [theme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  const [showHireBox, setShowHireBox] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [, setLogoClicks] = useState(0);

  // Apply theme to HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Reset scroll to top on reload/access
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);



  useScrollReveal();

  // Scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Konami
  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let idx = 0;
    const handler = (e) => {
      if (e.key === code[idx]) { idx++; if (idx === code.length) { setShowGame(true); idx = 0; } }
      else idx = 0;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogoClick = () => {
    setShowGame(true);
  };

  const projects = [
    {
      id: 'sector', span: 'bento-wide', number: '01',
      tags: ['Freestyle', 'Self Build'],
      title: 'SECTOR', icon: <Rocket size={48} strokeWidth={1.5} />,
      desc: 'High-speed FPV racing drone. Fine-tuned for extreme precision and freestyle maneuvers. 0 to 200 km/h in under a second.',
      specs: ['Product Design', '0→200 km/h', 'Custom ESC'],
    },
    {
      id: 'cinelog', span: 'bento-narrow', number: '02',
      tags: ['Cinematic FPV'],
      title: 'CINELOG 35', icon: <Video size={48} strokeWidth={1.5} />,
      desc: 'Compact cinewhoop designed for smooth cinematic tracking shots in tight spaces.',
      specs: ['Stable', 'ND Filters', 'Agile'],
    },
    {
      id: 'goldeneye', span: 'bento-wide', number: '03',
      tags: ['Autonomous', 'Rescue'],
      title: 'GOLDEN EYE', icon: <Bot size={48} strokeWidth={1.5} />,
      desc: 'Autonomous rescue drone designed for medicine delivery in disaster zones. Built with custom electronics and flight controllers.',
      specs: ['Product Design', 'Payload', 'Auto Nav'],
    },
  ];

  const experiences = [
    { year: 'Aug 2025 - Present', title: 'Learning Coordinator', org: 'TinkerHub', desc: '', tag: null },
    { year: 'Oct 2024 - Aug 2025', title: 'Co Lead', org: 'TinkerHub', desc: '', tag: null },
    { year: 'Apr 2025 - Present', title: 'MDC', org: 'IEEE', desc: '', tag: null },
  ];

  const achievements = [
    {
      title: 'NASA Space Apps Global Nominee',
      desc: 'Selected for the global nomination in the NASA Space Apps Challenge 2024 with Team Clean-Enviro.',
      img: '/achievements/nasa.jpg',
      tags: ['NASA', 'AI', 'Aerospace']
    },
    {
      title: 'TinkerHub Co-Lead',
      desc: 'Co-lead of TinkerHub TOC-H campus team, promoting tech learning & innovation.',
      img: '/achievements/tinkerhub.jpg',
      tags: ['Community', 'Leadership']
    },
    {
      title: 'Exhibition at Central University',
      desc: 'Showcased innovative drone technologies and autonomous UAV projects at Kasaragod Central University.',
      img: '/achievements/kazz.png',
      tags: ['Exhibition', 'UAV']
    },
    {
      title: 'Electronics Workshops',
      desc: 'Completed advanced certification in modern web technologies and responsive design principles.',
      img: '/achievements/certificate.png',
      tags: ['Certification', 'Web']
    },
    {
      title: 'Tech Innovation Workshops',
      desc: 'Attended multiple hands-on workshops on advanced electronics and embedded systems.',
      img: '/achievements/aisat.jpg',
      tags: ['Workshop', 'Electronics']
    },
    {
      title: 'Innovation Excellence Award',
      desc: 'Recognized for outstanding contributions to emerging drone technology applications.',
      img: '/achievements/award.png',
      tags: ['Award', 'Excellence']
    }
  ];

  const skills = ['Drone Engineering', 'FPV Piloting', 'Product Design', 'Embedded Systems', 'Arduino & Electronics', 'Python', 'React', 'Betaflight', 'ArduPilot'];

  const softwareTools = [
    { name: 'Fusion 360', icon: '/fusion360.png' },
    { name: 'Arduino', icon: '/arduino.png' },
    { name: 'Betaflight', icon: '/betaflight.png' },
    { name: 'QGroundControl', icon: '/qgroundcontrol.png' },
    { name: 'VS Code', icon: '/vscode.png' },
  ];

  const marqueeItems = ['Drone Engineer', '•', 'FPV Pilot', '•', 'Aerospace Innovator', '•', 'AI Systems', '•', 'NASA Nominee', '•', 'Embedded Tech', '•'];

  return (
    <div>
      {isLoading && <Loader onComplete={() => {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }} />}

      {/* BG */}
      <div className="dot-grid" />
      <div className="ambient-glow" />

      {showGame && <HiddenGame onClose={() => setShowGame(false)} />}

      <div className="app">
        {/* ===== NAVBAR ===== */}
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-logo" onClick={handleLogoClick}>
            SREEH<span>A</span>RI
          </div>
          <div className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#projects" className="nav-link">Works</a>
            <a href="#experience" className="nav-link">Experience</a>
            <a href="#achievements" className="nav-link">Achievements</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
        </nav>

        {/* ===== HERO ===== */}
        <section className="hero" id="home">

          {/* Handwritten greeting — top right */}


          {/* Polaroid Group */}
          <div className="hero-polaroid">
            <img src="/sreeharinandanan.webp" alt="Sreehari Nandanan" />
            <div className="hero-polaroid-label">Sreehari<br />Nandanan</div>
          </div>

          <div className="hero-polaroid secondary">
            <img src="/sreehari.webp" alt="Sreehari Profile" />
            <div className="hero-polaroid-label">Engineering<br />Mindset</div>
          </div>

          {/* HERO MAIN CONTENT */}
          <div className="hero-content">
            {/* Name block */}
            <div className="hero-name-block">
              <span className="hero-script">hello, i am</span>
              <h1 className="hero-name">SREEHARI</h1>
              <div className="hero-name-outline">NANDANAN</div>
            </div>

            <p className="hero-desc" style={{ marginTop: '0.2rem' }}>
              <strong>Building next-gen autonomous flight systems.</strong><br />
              Racing drones, cinematic UAVs &amp; AI-powered rescue vehicles —
              one breakthrough at a time.
            </p>
          </div>


        </section>

        {/* ===== MARQUEE ===== */}
        <div className="marquee-section">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">
                {item === '•' ? <span className="marquee-dot" /> : item}
              </span>
            ))}
          </div>
        </div>

        {/* ===== ABOUT ===== */}
        <section id="about" className="about-section">
          {/* Decorative Floaters */}
          <img src="/elements/el1.png" className="about-float el1" alt="" />
          <img src="/elements/el2.png" className="about-float el2" alt="" />
          <img src="/elements/el3.png" className="about-float el3" alt="" />
          <img src="/elements/el4.png" className="about-float el4" alt="" />
          <div className="about-left reveal">
            <span className="section-label">/ about me</span>
            <div className="section-display">
              <div>WHO</div>
              <div className="outlined-text">AM I?</div>
            </div>


            <div className="software-section" style={{ marginTop: '3rem' }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '1rem', letterSpacing: '4px', textTransform: 'uppercase' }}>tools</span>
              <div className="software-grid">
                {softwareTools.map(tool => (
                  <div key={tool.name} className={`software-item ${tool.name === 'QGroundControl' ? 'rounded-icon' : ''}`} title={tool.name}>
                    <img src={tool.icon} alt={tool.name} className="software-icon" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PolaroidStack />

          <div className="about-right reveal">
            <p className="about-body">
              <span className="highlight-text">Pushing ideas forward</span>, exploring new possibilities,
              and building what matters. Shaping a path in drones, tech, and
              innovation — one project at a time.
            </p>
            <p className="about-body" style={{ marginTop: '1.5rem' }}>
              My expertise bridges <span className="highlight-text">hardware and software</span> — crafting
              high-speed racing drones, autonomous rescue solutions, and cinematic
              aerial rigs. From intricate product design to custom Arduino-based electronics.
            </p>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-num">10+</span>
                <span className="stat-lbl">Drone Builds</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">20+</span>
                <span className="stat-lbl">Projects</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">4+</span>
                <span className="stat-lbl">Years Exp</span>
              </div>
              <div className="stat-item">
                <span className="stat-num" style={{ display: 'flex', alignItems: 'center' }}><InfinityIcon size={46} strokeWidth={3} style={{ marginTop: '2px' }} /></span>
                <span className="stat-lbl">FPV Hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PROJECTS BENTO ===== */}
        <section id="projects" className="projects-section">
          <div className="projects-header reveal">
            <div>
              <span className="section-label">/ works</span>
              <div className="section-display">
                <div>FEATURED</div>
                <div className="outlined-text">PROJECTS</div>
              </div>
            </div>
            <img src="/elements/el6.png" className="work-el el6" alt="" />
            <p className="projects-sub">
              Drone builds, AI systems &amp; aerospace projects defining my journey.
            </p>
          </div>

          <div className="bento-grid">
            {projects.map((p, i) => (
              <div key={p.id} className={`bento-card ${p.span} reveal`} style={{ '--delay': `${i * 80}ms` }}>
                <div className="card-num">{p.number}</div>
                <div className="card-tags">
                  {p.tags.map(t => <span key={t} className="card-tag">{t}</span>)}
                </div>
                <div className="card-icon">{p.icon}</div>
                <h3 className="card-title">{p.title}</h3>
                <p className="card-desc">{p.desc}</p>
                <div className="card-specs">
                  {p.specs.map(s => <span key={s} className="card-spec">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== EXPERIENCE ===== */}
        <section id="experience" className="exp-section">
          <div className="exp-layout-wrapper">
            <div className="exp-header-side">
              <div className="sticky-header-content reveal">
                <span className="section-label">/ experience</span>
                <div className="section-display">
                  <div>MY</div>
                  <div className="outlined-text">JOURNEY</div>
                </div>
              </div>
            </div>

            <div className="exp-list-container">
              <div className="exp-list">
                {/* TinkerHub grouped block */}
                <div className="exp-item exp-group-block">
                  <div className="exp-body">
                    <div className="exp-group-header">
                      <div className="exp-group-company">TinkerHub</div>
                      <div className="exp-group-tenure">Full‑time · 1 yr 8 mos</div>
                    </div>
                    <div className="exp-group-roles">
                      {experiences.filter(e => e.org === 'TinkerHub').map((e, i, arr) => (
                        <div key={i} className="exp-role-row">
                          <div className="exp-role-connector">
                            <div className="exp-role-dot" />
                            {i < arr.length - 1 && <div className="exp-role-line" />}
                          </div>
                          <div className="exp-role-body" style={{ paddingBottom: i === arr.length - 1 ? '0' : '1.8rem' }}>
                            <div className="exp-title">{e.title}</div>
                            <div className="exp-year exp-role-year">{e.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* IEEE grouped block (same layout) */}
                <div className="exp-item exp-group-block">
                  <div className="exp-body">
                    <div className="exp-group-header">
                      <div className="exp-group-company">IEEE</div>
                      <div className="exp-group-tenure">Apr 2025 - Present · 1 yr 2 mos</div>
                    </div>
                    <div className="exp-group-roles">
                      {experiences.filter(e => e.org === 'IEEE').map((e, i, arr) => (
                        <div key={i} className="exp-role-row">
                          <div className="exp-role-connector">
                            <div className="exp-role-dot" />
                            {i < arr.length - 1 && <div className="exp-role-line" />}
                          </div>
                          <div className="exp-role-body" style={{ paddingBottom: i === arr.length - 1 ? '0' : '1.8rem' }}>
                            <div className="exp-title">{e.title}</div>
                            <div className="exp-year exp-role-year">{e.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ACHIEVEMENTS ===== */}
        <section id="achievements" className="achievements-section">
          <div>
            <span className="section-label">/ milestones</span>
            <div className="section-display">
              <div>MAJOR</div>
              <div className="outlined-text">ACHIEVEMENTS</div>
            </div>
          </div>
          <div className="achievements-list">
            {achievements.map((a, i) => (
              <div
                key={i}
                className="achievement-row reveal"
              >
                <div className="achievement-row-num">{(i + 1).toString().padStart(2, '0')}</div>
                <div className="achievement-row-title">
                  {a.title}
                </div>
                <div className="achievement-item-preview">
                  <img src={a.img} alt={a.title} />
                </div>
                <div className="achievement-row-desc">{a.desc}</div>
                <div className="achievement-row-border" />
              </div>
            ))}
          </div>
        </section>


        {/* ===== CONTACT ===== */}
        <section id="contact" className="contact-section">
          <div className="contact-ghost">LET'S FLY</div>
          <div className="contact-inner reveal">
            <span className="section-label" style={{ fontSize: '1.8rem' }}>/ reach out</span>
            <div className="section-display" style={{ textAlign: 'center' }}>
              <div>LET'S BUILD</div>
              <div className="outlined-text">SOMETHING</div>
            </div>
            <p className="contact-sub">
              Custom drone build, skilled FPV pilot, or AI hardware innovation — let's bring your vision to life.
            </p>
            <a href="mailto:sreeharinandanan3690@gmail.com" className="contact-email">
              <Mail size={20} />
              sreeharinandanan3690@gmail.com
            </a>
            <div className="social-links">
              {[
                { label: 'GH', title: 'GitHub', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg> },
                { label: 'LI', title: 'LinkedIn', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" /></svg> },
                { label: 'IG', title: 'Instagram', href: '#', svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} className="social-icon" title={s.title}>{s.svg}</a>
              ))}
            </div>
          </div>
        </section>
      </div>


    </div>
  );
}

export default App
