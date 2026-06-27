import React, { useEffect, useMemo, useRef, useState } from 'react';
import { defaultContent } from './defaultContent.js';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// ---- deep merge stored content over defaults ----
function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

function useContent() {
  const [content, setContent] = useState(defaultContent);
  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/website/content`)
      .then((r) => r.json())
      .then((d) => { if (alive && d) setContent(deepMerge(defaultContent, d)); })
      .catch(() => {/* keep defaults */});
    return () => { alive = false; };
  }, []);
  return content;
}

// ---- reveal-on-scroll wrapper ----
function Reveal({ children, delay = 0, style, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('sb-in'); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { setTimeout(() => el.classList.add('sb-in'), delay); io.unobserve(el); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    const safety = setTimeout(() => el.classList.add('sb-in'), 1200 + delay);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [delay]);
  return <div ref={ref} data-reveal="" style={style} {...rest}>{children}</div>;
}

// ---- animated counter ----
function Counter({ value, decimals = 0, thousands = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = parseFloat(value) || 0;
    const fmt = (v) => {
      if (thousands) return Math.round(v).toLocaleString('en-US');
      return decimals ? v.toFixed(decimals) : String(Math.round(v));
    };
    let raf;
    const run = () => {
      const start = performance.now(), dur = 1700;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick); else el.textContent = fmt(target);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(); io.unobserve(el); } });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [value, decimals, thousands]);
  return <span ref={ref}>0</span>;
}

const Arrow = (p) => (
  <svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);

const navLinks = [
  ['#home', 'Home'], ['#plans', 'Plans'], ['#coverage', 'Coverage'],
  ['#features', 'Features'], ['#about', 'About'], ['#contact', 'Contact'],
];

export default function App() {
  const c = useContent();
  const accent = c.theme?.accent || '#0EA5E9';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [planType, setPlanType] = useState('wired');
  const [openFaq, setOpenFaq] = useState(0);
  const [coverage, setCoverage] = useState(null);
  const [submitted, setSubmitted] = useState('');
  const coverageRef = useRef(null);

  const isWired = planType === 'wired';
  const plans = (isWired ? c.plans?.wired : c.plans?.wireless) || [];

  const checkCoverage = () => {
    const q = (coverageRef.current?.value || '').trim();
    if (!q) { setCoverage({ status: 'empty' }); return; }
    const areas = c.coverage?.areas || [];
    const ql = q.toLowerCase();
    const hit = areas.find((a) => a.toLowerCase().includes(ql) || ql.includes(a.toLowerCase()));
    setCoverage(hit ? { status: 'yes', city: hit } : { status: 'no', q });
  };

  const submitForm = (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    const name = String(payload.name || '').trim();
    e.target.reset();
    setSubmitted(name ? ', ' + name : ' ');
    // fire-and-forget: deliver the lead to the business WhatsApp via the billing API
    fetch(`${API_BASE}/api/website/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {/* visitor already saw the thank-you */});
  };

  const tabBase = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 999, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', transition: 'all .2s ease' };
  const tabActive = { ...tabBase, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', boxShadow: '0 10px 22px -10px rgba(14,165,233,.8)' };
  const tabIdle = { ...tabBase, background: 'transparent', color: '#475569' };

  return (
    <main id="sky-root" style={{ '--sky': accent, '--line': '#E2E8F0', '--radius': '20px', fontFamily: "'Manrope',system-ui,sans-serif", color: '#0F172A', background: '#fff', overflowX: 'hidden' }}>

      {/* PROMO */}
      {c.promo?.show && (
        <div style={{ background: 'linear-gradient(90deg,#0F172A,#0c2a44)', color: '#e2f3ff', fontSize: 13.5, fontWeight: 600, textAlign: 'center', padding: '9px 16px' }}>
          {c.promo.text} <a href="#plans" style={{ color: '#7dd3fc', textDecoration: 'underline' }}>See plans</a>
        </div>
      )}

      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'saturate(160%) blur(14px)', background: 'rgba(255,255,255,0.82)', borderBottom: '1px solid rgba(226,232,240,0.9)' }}>
        <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {c.brand?.logoUrl
              ? <img src={c.brand.logoUrl} alt={c.brand?.name} style={{ height: 42, width: 'auto' }} />
              : <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#0F172A' }}>{c.brand?.name}</span>}
          </a>
          <div className="sb-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} style={{ padding: '9px 14px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#334155' }}>{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="#plans" className="sb-hide-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', fontWeight: 700, fontSize: 14.5, padding: '11px 20px', borderRadius: 12, boxShadow: '0 10px 24px -10px rgba(14,165,233,.8)' }}>Get Connected <Arrow s={16} /></a>
            <button className="sb-nav-toggle" type="button" aria-label="Menu" onClick={() => setMobileOpen((v) => !v)} style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></svg>
            </button>
          </div>
        </nav>
        <div style={{ overflow: 'hidden', maxHeight: mobileOpen ? 460 : 0, opacity: mobileOpen ? 1 : 0, transition: 'max-height .35s ease, opacity .3s ease', background: 'rgba(255,255,255,0.98)' }}>
          <div style={{ padding: '8px 18px 18px', display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid #E2E8F0' }}>
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)} style={{ padding: '13px 12px', borderRadius: 10, fontWeight: 600, color: '#1E293B' }}>{label}</a>
            ))}
            <a href="#plans" onClick={() => setMobileOpen(false)} style={{ marginTop: 8, textAlign: 'center', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', fontWeight: 700, padding: 14, borderRadius: 12 }}>Get Connected</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" style={{ position: 'relative', background: 'radial-gradient(1100px 600px at 78% -8%, #0c3a63 0%, rgba(12,58,99,0) 60%), linear-gradient(180deg,#0F172A 0%,#0b1426 100%)', color: '#fff', overflow: 'hidden' }}>
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'clamp(56px,8vw,104px) 24px clamp(72px,9vw,120px)', display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: '1 1 460px', minWidth: 300 }}>
            <Reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(34,211,238,.12)', border: '1px solid rgba(34,211,238,.34)', color: '#7dd3fc', padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 0 4px rgba(34,211,238,.25)' }} />
              {c.hero?.badge}
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(38px,6vw,68px)', lineHeight: 1.03, letterSpacing: '-1.5px', margin: '20px 0 0' }}>
                {c.hero?.titleTop}<br /><span style={{ background: 'linear-gradient(120deg,#38BDF8,#22D3EE 50%,#5eead4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{c.hero?.titleHighlight}</span>
              </h1>
            </Reveal>
            <Reveal delay={130}>
              <p style={{ fontSize: 'clamp(16px,2vw,19px)', lineHeight: 1.6, color: '#cbd5e1', maxWidth: 540, margin: '22px 0 0' }}>{c.hero?.subtitle}</p>
            </Reveal>
            <Reveal delay={200} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 32 }}>
              <a href="#plans" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', fontWeight: 700, fontSize: 16, padding: '15px 28px', borderRadius: 14, boxShadow: '0 16px 34px -12px rgba(14,165,233,.85)' }}>View Plans <Arrow s={18} /></a>
              <a href="#coverage" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.22)', color: '#fff', fontWeight: 700, fontSize: 16, padding: '15px 26px', borderRadius: 14 }}>Check Coverage</a>
            </Reveal>
            <Reveal delay={270} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 34 }}>
              <div style={{ color: '#fbbf24' }} aria-hidden>★★★★★</div>
              <div style={{ fontSize: 13.5, color: '#94a3b8' }}><strong style={{ color: '#fff' }}>{c.hero?.rating}/5</strong> from {c.hero?.ratingCount} happy customers</div>
            </Reveal>
          </div>

          {/* hero illustration */}
          <Reveal delay={120} style={{ flex: '1 1 380px', minWidth: 300 }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', maxWidth: 460, margin: '0 auto' }}>
              <div style={{ position: 'absolute', inset: '6%', borderRadius: '50%', border: '1px solid rgba(56,189,248,.18)', animation: 'sb-spin 38s linear infinite' }} />
              <div style={{ position: 'absolute', inset: '18%', borderRadius: '50%', border: '1px dashed rgba(34,211,238,.22)', animation: 'sb-spin 26s linear infinite reverse' }} />
              <div style={{ position: 'absolute', inset: '39%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #38BDF8, #0EA5E9 45%, #0369a1 90%)', boxShadow: '0 0 60px -6px rgba(14,165,233,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg>
              </div>
              <div style={{ position: 'absolute', top: '6%', left: '-6%', background: 'rgba(255,255,255,.97)', borderRadius: 18, padding: '14px 16px', boxShadow: '0 24px 50px -18px rgba(0,0,0,.55)', animation: 'sb-floaty 5.5s ease-in-out infinite' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>DOWNLOAD</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>187.4<span style={{ fontSize: 13, color: '#0EA5E9', marginLeft: 3 }}>Mbps</span></div>
              </div>
              <div style={{ position: 'absolute', bottom: '8%', right: '-4%', background: 'rgba(255,255,255,.97)', borderRadius: 16, padding: '12px 15px', boxShadow: '0 24px 50px -18px rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', gap: 11, animation: 'sb-floaty2 6s ease-in-out infinite' }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4"><path d="m5 13 4 4L19 7" /></svg>
                </span>
                <div><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>99.9%</div><div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>Uptime SLA</div></div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* TRUST BAR */}
        <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.02)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '30px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 18 }}>
            {(c.stats || []).map((s, i) => {
              const dec = String(s.value).includes('.') ? 1 : 0;
              const thousands = parseFloat(s.value) >= 1000;
              return (
                <Reveal key={i} delay={i * 80} style={{ textAlign: 'center', borderLeft: i ? '1px solid rgba(255,255,255,.08)' : 'none' }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4vw,42px)', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                    <Counter value={s.value} decimals={dec} thousands={thousands} /><span style={{ color: '#22D3EE', fontSize: s.suffix === 'Mbps' ? '.5em' : undefined, marginLeft: 3 }}>{s.suffix}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600, marginTop: 6 }}>{s.label}</div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" style={{ background: '#F8FAFC', padding: 'clamp(64px,9vw,116px) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>Internet Plans</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>Simple plans, no hidden fees</h2>
            <p style={{ color: '#64748B', fontSize: 17, lineHeight: 1.6, margin: '14px 0 0' }}>{c.plansIntro}</p>
          </Reveal>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <div style={{ display: 'inline-flex', gap: 6, background: '#fff', border: '1px solid var(--line)', padding: 6, borderRadius: 999, boxShadow: '0 8px 24px -18px rgba(15,23,42,.4)' }}>
              <button type="button" onClick={() => setPlanType('wired')} style={isWired ? tabActive : tabIdle}>Wired Fiber</button>
              <button type="button" onClick={() => setPlanType('wireless')} style={!isWired ? tabActive : tabIdle}>Wireless</button>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: 14.5, margin: '16px 0 0' }}>
            {isWired ? 'Pure fiber-to-the-home — the most stable, lowest-latency connection.' : "Fast wireless internet where fiber hasn't reached yet — quick to install."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 18, marginTop: 30, alignItems: 'stretch' }}>
            {plans.map((p, i) => {
              const pop = !!p.popular;
              return (
                <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: pop ? '28px 24px 24px' : '26px 24px', borderRadius: 'var(--radius)', background: pop ? 'linear-gradient(180deg,#0F172A,#1e293b)' : '#fff', border: pop ? 'none' : '1px solid var(--line)', boxShadow: pop ? '0 30px 60px -24px rgba(14,165,233,.55)' : '0 12px 30px -22px rgba(15,23,42,.25)', transform: pop ? 'translateY(-6px)' : 'none' }}>
                  {pop && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#22D3EE,#0EA5E9)', color: '#04293f', fontWeight: 800, fontSize: 11, padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>★ POPULAR</div>}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 700, lineHeight: 1, color: pop ? '#fff' : '#0F172A' }}>{p.speed}</span><span style={{ color: pop ? '#22D3EE' : '#0EA5E9', fontWeight: 700, fontSize: 16 }}>Mbps</span></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: pop ? '#7dd3fc' : '#0EA5E9', marginTop: 7, textTransform: 'uppercase', letterSpacing: .5 }}>{isWired ? 'Wired Fiber' : 'Wireless'}</div>
                  <div style={{ height: 1, background: pop ? 'rgba(255,255,255,.12)' : 'var(--line)', margin: '18px 0' }} />
                  <div style={{ fontSize: 13, color: pop ? '#94a3b8' : '#64748B' }}>PKR</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 2 }}><strong style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, color: pop ? '#fff' : '#0F172A' }}>{p.price}</strong><span style={{ fontSize: 13, color: pop ? '#94a3b8' : '#64748B' }}>/month</span></div>
                  <a href="#contact" style={pop
                    ? { marginTop: 20, textAlign: 'center', background: 'linear-gradient(135deg,#0EA5E9,#22D3EE)', color: '#04293f', fontWeight: 800, padding: 12, borderRadius: 12 }
                    : { marginTop: 20, textAlign: 'center', border: '1.5px solid #0EA5E9', color: '#0284C7', fontWeight: 700, padding: 12, borderRadius: 12 }}>Subscribe</a>
                </div>
              );
            })}
          </div>
          <Reveal style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13.5, marginTop: 26 }}>All plans include free installation, unlimited data with no FUP, and a 7-day money-back guarantee.</Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: '#fff', padding: 'clamp(64px,9vw,116px) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>Why Choose Us</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>Built for the way Raiwind connects</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginTop: 48 }}>
            {(c.features || []).map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 70} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28, background: '#fff' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4.5 13.5H11l-1 8.5L20 10h-7l1-8Z" /></svg>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, margin: '18px 0 8px' }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{f.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ background: '#F8FAFC', padding: 'clamp(64px,9vw,116px) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 54, alignItems: 'center' }}>
          <Reveal style={{ flex: '1 1 380px', minWidth: 300, position: 'relative' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 60px -28px rgba(15,23,42,.45)' }}>
              <img src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1100&q=80" alt="Fiber hub" loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: -22, right: -10, background: '#fff', borderRadius: 18, padding: '18px 22px', boxShadow: '0 24px 50px -22px rgba(15,23,42,.4)', display: 'flex', gap: 18 }}>
              {(c.about?.stats || []).map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width: 1, background: 'var(--line)' }} />}
                  <div><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: '#0EA5E9', lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>{s.label}</div></div>
                </React.Fragment>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100} style={{ flex: '1 1 380px', minWidth: 300 }}>
            <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>About {c.brand?.name}</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>{c.about?.title}</h2>
            <p style={{ color: '#475569', fontSize: 16.5, lineHeight: 1.7, margin: '18px 0 0' }}>{c.about?.text}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(c.about?.bullets || []).map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, background: '#dcfce7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</span>
                  <span style={{ color: '#334155', fontSize: 15.5, lineHeight: 1.5 }}>{b}</span>
                </li>
              ))}
            </ul>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 28, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', fontWeight: 700, padding: '14px 26px', borderRadius: 13 }}>Talk to our team <Arrow s={17} /></a>
          </Reveal>
        </div>
      </section>

      {/* COVERAGE */}
      <section id="coverage" style={{ position: 'relative', background: 'linear-gradient(180deg,#0F172A,#0b1426)', color: '#fff', padding: 'clamp(64px,9vw,116px) 0', overflow: 'hidden' }}>
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
          <Reveal style={{ flex: '1 1 420px', minWidth: 300 }}>
            <div style={{ color: '#22D3EE', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>Coverage</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>Is {c.brand?.name} live in your area?</h2>
            <p style={{ color: '#cbd5e1', fontSize: 17, lineHeight: 1.6, margin: '14px 0 22px', maxWidth: 520 }}>Enter your area to check instant availability.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 540 }}>
              <input ref={coverageRef} type="text" placeholder="e.g. Raiwind Road, Manga Mandi" onKeyDown={(e) => { if (e.key === 'Enter') checkCoverage(); }} style={{ flex: '1 1 240px', minWidth: 0, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 16, padding: '15px 18px', borderRadius: 13, outline: 'none' }} />
              <button type="button" onClick={checkCoverage} style={{ flex: 'none', background: 'linear-gradient(135deg,#0EA5E9,#22D3EE)', color: '#04293f', fontWeight: 800, fontSize: 15, padding: '15px 26px', border: 'none', borderRadius: 13, cursor: 'pointer' }}>Check availability</button>
            </div>
            {coverage && (
              <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 13, fontSize: 14.5, fontWeight: 600, lineHeight: 1.5, maxWidth: 540, background: coverage.status === 'yes' ? 'rgba(16,185,129,.14)' : 'rgba(34,211,238,.1)', border: '1px solid ' + (coverage.status === 'yes' ? 'rgba(16,185,129,.45)' : 'rgba(34,211,238,.35)'), color: coverage.status === 'yes' ? '#a7f3d0' : '#bae6fd' }}>
                {coverage.status === 'yes' && `🎉 Great news! ${c.brand?.name} fiber is live in ${coverage.city}. Pick a plan below to get connected.`}
                {coverage.status === 'empty' && 'Please enter your city or area name to check availability.'}
                {coverage.status === 'no' && `We're expanding fast — "${coverage.q}" isn't live yet. Leave your details below and we'll notify you.`}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 26 }}>
              <span style={{ fontSize: 13, color: '#7dd3fc', fontWeight: 700, alignSelf: 'center', marginRight: 4 }}>Live in:</span>
              {(c.coverage?.areas || []).map((a) => (
                <span key={a} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', padding: '7px 13px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, color: '#e2e8f0' }}>{a}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120} style={{ flex: '1 1 340px', minWidth: 300 }}>
            <div style={{ position: 'relative', aspectRatio: '4/3.4', background: 'linear-gradient(160deg,#0c2238,#0a1a2e)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '30%', left: '24%', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,211,238,.5),transparent 70%)', animation: 'sb-pulse 4s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', top: '55%', left: '60%', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle,rgba(14,165,233,.5),transparent 70%)', animation: 'sb-pulse 5s ease-in-out .8s infinite' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 18px', background: 'linear-gradient(0deg,rgba(8,17,30,.92),transparent)', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>📍 Live fiber coverage — Raiwind</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ background: '#F8FAFC', padding: 'clamp(64px,9vw,116px) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
            <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>Testimonials</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>Loved by local customers</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 22, marginTop: 48 }}>
            {(c.testimonials || []).map((t, i) => (
              <Reveal key={i} delay={(i % 3) * 100} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 28, boxShadow: '0 12px 30px -20px rgba(15,23,42,.25)' }}>
                <div style={{ color: '#fbbf24', fontSize: 17 }}>★★★★★</div>
                <blockquote style={{ margin: '16px 0 0', color: '#334155', fontSize: 15.5, lineHeight: 1.65 }}>"{t.quote}"</blockquote>
                <figcaption style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 22 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#bae6fd,#7dd3fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0369a1' }}>{(t.name || '?').charAt(0)}</div>
                  <div><div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div><div style={{ fontSize: 13, color: '#64748B' }}>{t.area}</div></div>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: '#fff', padding: 'clamp(64px,9vw,116px) 0' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center' }}>
            <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>FAQ</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>Frequently asked questions</h2>
          </Reveal>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(c.faqs || []).map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                  <button type="button" onClick={() => setOpenFaq(open ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 22px', fontWeight: 700, fontSize: 16.5, color: '#0F172A' }}>
                    <span>{f.q}</span>
                    <span style={{ display: 'inline-flex', flex: 'none', transition: 'transform .3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </button>
                  <div style={{ maxHeight: open ? 320 : 0, opacity: open ? 1 : 0, overflow: 'hidden', transition: 'max-height .35s ease, opacity .3s ease' }}>
                    <p style={{ margin: 0, padding: '0 22px 22px', color: '#475569', fontSize: 15.5, lineHeight: 1.65 }}>{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ background: '#F8FAFC', padding: 'clamp(64px,9vw,116px) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>Get Connected</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(30px,4.5vw,46px)', fontWeight: 700, letterSpacing: '-1px', margin: '12px 0 0' }}>Ready for faster internet?</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 26, alignItems: 'start' }}>
            <Reveal style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24, padding: 30, boxShadow: '0 24px 50px -28px rgba(15,23,42,.3)' }}>
              {submitted && (
                <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                  <span style={{ flex: 'none', width: 30, height: 30, borderRadius: 9, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✓</span>
                  <div style={{ fontSize: 14.5, color: '#065f46', lineHeight: 1.5 }}><strong>Thank you{submitted.trim() ? submitted : ''}!</strong> A specialist will call you within 24 hours.</div>
                </div>
              )}
              <form onSubmit={submitForm} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[['name', 'Full name', 'text', 'Your name'], ['phone', 'Phone', 'tel', '03xx-xxxxxxx'], ['email', 'Email', 'email', 'you@email.com'], ['city', 'City', 'text', 'e.g. Raiwind']].map(([n, label, type, ph]) => (
                    <label key={n} style={{ display: 'block' }}><span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#334155', marginBottom: 7 }}>{label}</span>
                      <input name={n} type={type} required placeholder={ph} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--line)', borderRadius: 11, padding: '13px 14px', fontSize: 15, outline: 'none' }} /></label>
                  ))}
                </div>
                <label style={{ display: 'block', marginTop: 14 }}><span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#334155', marginBottom: 7 }}>Message</span>
                  <textarea name="message" rows="4" placeholder="Which plan are you interested in?" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--line)', borderRadius: 11, padding: '13px 14px', fontSize: 15, outline: 'none', resize: 'vertical' }} /></label>
                <button type="submit" style={{ width: '100%', marginTop: 18, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#fff', fontWeight: 800, fontSize: 16, padding: 15, border: 'none', borderRadius: 13, cursor: 'pointer' }}>Get Connected</button>
              </form>
            </Reveal>

            <Reveal delay={120} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Call us 24/7', c.contact?.phone, `tel:${c.contact?.phoneHref}`],
                ['WhatsApp', c.contact?.whatsapp, `https://wa.me/${c.contact?.whatsappHref}`],
                ['Email us', c.contact?.email, `mailto:${c.contact?.email}`],
              ].map(([label, val, href]) => (
                <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 15, background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '18px 20px' }}>
                  <span style={{ flex: 'none', width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', fontWeight: 800 }}>{label[0]}</span>
                  <div><div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>{label}</div><div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>{val}</div></div>
                </a>
              ))}
              <div style={{ position: 'relative', flex: 1, minHeight: 160, border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(160deg,#e0f2fe,#f0f9ff)' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 16px', background: 'linear-gradient(0deg,rgba(255,255,255,.95),transparent)', fontSize: 13.5, color: '#0f172a', fontWeight: 700 }}>{c.brand?.name} Office · {c.contact?.address}</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', color: '#cbd5e1', padding: '64px 0 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 38 }}>
            <div>
              <div style={{ marginBottom: 18, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#fff' }}>
                {c.brand?.logoUrl ? <img src={c.brand.logoUrl} alt={c.brand?.name} style={{ height: 34, background: '#fff', padding: '8px 12px', borderRadius: 12 }} /> : c.brand?.name}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#94a3b8', margin: '0 0 18px', maxWidth: 280 }}>{c.footer?.about}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['facebook', c.social?.facebook], ['twitter', c.social?.twitter], ['instagram', c.social?.instagram], ['linkedin', c.social?.linkedin]]
                  .filter(([, url]) => url).map(([k, url]) => (
                    <a key={k} href={url} aria-label={k} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textTransform: 'capitalize', fontSize: 12, fontWeight: 700 }}>{k[0].toUpperCase()}</a>
                  ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Company</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14.5 }}>
                {[['#about', 'About Us'], ['#features', 'Why Choose Us'], ['#testimonials', 'Testimonials'], ['#faq', 'FAQ']].map(([h, l]) => (
                  <li key={h}><a href={h} style={{ color: '#94a3b8' }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Get in touch</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14.5, color: '#94a3b8' }}>
                <li>📞 {c.contact?.phone}</li>
                <li>✉️ {c.contact?.email}</li>
                <li>📍 {c.contact?.address}</li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 13.5, color: '#64748B' }}>{c.footer?.copyright}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
