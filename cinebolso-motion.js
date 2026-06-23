/* ============================================================
   CINEBOLSO — motion engine
   GSAP + ScrollTrigger + Lenis  (adapted from VOLTZ engine)
   ============================================================ */
(function(){
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const ScrollTrigger = window.ScrollTrigger;

  /* ---------- Native scroll ---------- */
  const lenis = null;

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href'); if(id.length<2) return;
      const el = document.querySelector(id); if(!el) return;
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth'});
    });
  });

  /* ---------- split letters helper ---------- */
  function splitLetters(el){
    const words = el.textContent.trim().split(' ');
    el.textContent='';
    words.forEach((w,wi)=>{
      const word=document.createElement('span'); word.className='word';
      [...w].forEach(ch=>{
        const s=document.createElement('span'); s.textContent=ch; word.appendChild(s);
      });
      el.appendChild(word);
      if(wi<words.length-1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.word span');
  }

  /* ============================================================
     CURTAIN LOADER
  ============================================================ */
  let curtain, heroBg;

  function runCurtain(){
    if(!curtain) return gsap.timeline();
    const letters = curtain.querySelectorAll('.curtain__word span');
    const tl = gsap.timeline();
    tl.to('.curtain__bar i',{scaleX:1, duration:1.1, ease:'power2.inOut'}, 0)
      .to('.curtain__pct',{
        textContent:'100', snap:{textContent:1}, duration:1.1, ease:'power2.inOut',
        onUpdate:function(){ const t=document.querySelector('.curtain__pct'); if(t) t.firstChild.nodeValue=Math.round(this.targets()[0].textContent)+'%'; }
      }, 0)
      .to(letters,{y:'0%', rotate:0, duration:.78, ease:'power4.out', stagger:.055}, .15)
      .to('.curtain__word',{filter:'drop-shadow(0 0 60px rgba(90,140,255,.7))', duration:.4},'-=.4')
      .to({}  ,{duration:.28})
      .to('.curtain__bar, .curtain__pct',{opacity:0, duration:.3},'<')
      .to('.curtain__word',{y:'-2%', scale:1.06, duration:.6, ease:'power3.inOut'},'>-.1')
      .to('.curtain__panel--top',{yPercent:-100, duration:1.0, ease:'expo.inOut'},'>-.15')
      .to('.curtain__panel--bot',{yPercent:100,  duration:1.0, ease:'expo.inOut'},'<')
      .to('.curtain__word',{scale:1.3, opacity:0, filter:'blur(10px)', duration:.7, ease:'power2.in'},'<')
      .set(curtain,{display:'none'})
      .add(heroIntro(),'-=.55');
    return tl;
  }

  /* ============================================================
     HERO INTRO
  ============================================================ */
  function heroIntro(){
    const tl = gsap.timeline();
    tl.fromTo(heroBg,{scale:1.14,opacity:0},{scale:1,opacity:1,duration:1.7,ease:'expo.out'},0);
    const lines = document.querySelectorAll('.hero__title .word span');
    tl.fromTo(lines,{yPercent:120,rotate:9},{yPercent:0,rotate:0,duration:.95,ease:'power4.out',stagger:.032},.45);
    tl.fromTo('.hero__slogan',  {opacity:0,y:18},{opacity:1,y:0,duration:.7,ease:'power3.out'},.3);
    tl.fromTo('.hero__sub',     {opacity:0,y:18},{opacity:1,y:0,duration:.7,ease:'power3.out'}, .95);
    tl.fromTo('.hero__cta-wrap',{opacity:0,y:22},{opacity:1,y:0,duration:.7,ease:'power3.out'},1.05);
    tl.fromTo('.scroll-hint',   {opacity:0},     {opacity:1,        duration:.6},               1.5);
    return tl;
  }

  /* ============================================================
     HERO PARALLAX
  ============================================================ */
  function heroParallax(){
    if(REDUCED) return;
    gsap.fromTo('.hero__bgimg',{yPercent:0},{yPercent:-8,scale:1.08,ease:'none',
      scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero__content',{yPercent:-30,opacity:0,ease:'none',
      scrollTrigger:{trigger:'.hero',start:'25% top',end:'bottom top',scrub:true}});
    const hero=document.querySelector('.hero');
    if(hero) hero.addEventListener('mousemove',e=>{
      const mx=(e.clientX/window.innerWidth-.5), my=(e.clientY/window.innerHeight-.5);
      gsap.to('.hero__bgimg',{x:mx*-20,y:my*-14,duration:1,ease:'power3.out'});
    });
  }

  /* ============================================================
     CINEMATIC FLICKER
  ============================================================ */
  function cinematicFlicker(){
    if(REDUCED||!heroBg) return;
    function strike(){
      const tl=gsap.timeline();
      tl.to(heroBg,{filter:'brightness(1.5) saturate(1.4)',duration:.05,ease:'none'})
        .to(heroBg,{filter:'brightness(1)',duration:.1,ease:'none'})
        .to(heroBg,{filter:'brightness(1.25)',duration:.04,ease:'none'},'+=.05')
        .to(heroBg,{filter:'brightness(1)',duration:.35,ease:'power2.out'});
      gsap.delayedCall(3+Math.random()*7, strike);
    }
    gsap.delayedCall(2.8, strike);
  }

  /* ============================================================
     MAGNETIC BUTTONS
  ============================================================ */
  function magnetic(){
    if(REDUCED) return;
    document.querySelectorAll('.btn-magnetic').forEach(btn=>{
      const s=0.38;
      btn.addEventListener('mousemove',e=>{
        const r=btn.getBoundingClientRect();
        gsap.to(btn,{x:(e.clientX-(r.left+r.width/2))*s,y:(e.clientY-(r.top+r.height/2))*s,duration:.5,ease:'power3.out'});
      });
      btn.addEventListener('mouseleave',()=>gsap.to(btn,{x:0,y:0,duration:.7,ease:'elastic.out(1,.35)'}));
    });
  }

  /* ============================================================
     MARQUEE
  ============================================================ */
  function marquee(){
    document.querySelectorAll('.marquee__row').forEach((row)=>{
      const dir = row.dataset.dir==='r'? 1 : -1;
      const half = row.scrollWidth/2;
      let x=0, base=(REDUCED?0:0.48)*dir, boost=0;
      gsap.ticker.add(()=>{
        x += base+boost;
        if(x<=-half) x+=half; if(x>=0&&dir>0) x-=half;
        row.style.transform=`translate3d(${x}px,0,0)`;
        boost*=.9;
      });
      let last=window.scrollY;
      window.addEventListener('scroll',()=>{ const dv=window.scrollY-last; last=window.scrollY; boost=gsap.utils.clamp(-6,6,dv*.28)*dir; },{passive:true});
    });
  }

  /* ============================================================
     CTA RAYS
  ============================================================ */
  function ctaRays(){
    const wrap=document.querySelector('.cta__rays'); if(!wrap) return;
    // blue rays
    for(let i=0;i<16;i++){
      const s=document.createElement('span');
      s.style.cssText=`position:absolute;left:50%;top:55%;width:2px;height:140vh;background:linear-gradient(rgba(90,140,255,.5),transparent);transform-origin:top center;transform:translateX(-50%) rotate(${(i/16)*360}deg);opacity:${(.1+Math.random()*.35).toFixed(2)};`;
      wrap.appendChild(s);
    }
    // amber rays
    for(let i=0;i<8;i++){
      const s=document.createElement('span');
      s.style.cssText=`position:absolute;left:50%;top:55%;width:1px;height:120vh;background:linear-gradient(rgba(245,166,35,.35),transparent);transform-origin:top center;transform:translateX(-50%) rotate(${(i/8)*360+22.5}deg);opacity:${(.08+Math.random()*.18).toFixed(2)};`;
      wrap.appendChild(s);
    }
    if(!REDUCED){
      gsap.to('.cta__rays',{rotate:360,duration:90,ease:'none',repeat:-1,transformOrigin:'50% 55%'});
    }
    gsap.fromTo('.cta__title .word span',{yPercent:120,rotate:8},{yPercent:0,rotate:0,duration:.9,ease:'power4.out',stagger:.03,
      scrollTrigger:{trigger:'.cta',start:'top 65%'}});
    gsap.fromTo('.cta__sub,.cta__price,.cta__inner .btn',{opacity:0,y:24},{opacity:1,y:0,duration:.7,ease:'power3.out',stagger:.1,
      scrollTrigger:{trigger:'.cta',start:'top 55%'}});
  }

  /* ============================================================
     SECTION REVEALS
  ============================================================ */
  function reveals(){
    gsap.utils.toArray('.reveal').forEach(el=>{
      gsap.fromTo(el,{opacity:0,y:40},{opacity:1,y:0,duration:.9,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 86%'}});
    });
    gsap.utils.toArray('.reveal-left').forEach(el=>{
      gsap.fromTo(el,{opacity:0,x:-60},{opacity:1,x:0,duration:.9,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 82%'}});
    });
    gsap.utils.toArray('.reveal-right').forEach(el=>{
      gsap.fromTo(el,{opacity:0,x:60},{opacity:1,x:0,duration:.9,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 82%'}});
    });
    gsap.utils.toArray('.reveal-stagger').forEach(parent=>{
      const children=[...parent.children];
      gsap.fromTo(children,{opacity:0,y:50},{opacity:1,y:0,duration:.7,ease:'power3.out',stagger:.12,
        scrollTrigger:{trigger:parent,start:'top 82%'}});
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init(){
    curtain = document.getElementById('curtain');
    heroBg  = document.querySelector('.hero__bgimg');
    document.querySelectorAll('[data-split]').forEach(splitLetters);
    heroParallax();
    cinematicFlicker();
    magnetic();
    marquee();
    ctaRays();
    reveals();

    if(REDUCED){
      gsap.set('.hero__bgimg',{scale:1,opacity:1});
      gsap.set('.hero__title .word span,.cta__title .word span',{yPercent:0,rotate:0});
      gsap.set('.hero__slogan,.hero__sub,.hero__cta-wrap,.scroll-hint',{opacity:1,y:0});
      gsap.set('.reveal,.reveal-left,.reveal-right',{opacity:1,y:0,x:0});
      document.querySelectorAll('.reveal-stagger').forEach(p=>{
        [...p.children].forEach(c=>{ c.style.opacity=1; c.style.transform='none'; });
      });
      ScrollTrigger.refresh();
      return;
    }
    setTimeout(()=>{ runCurtain(); setTimeout(()=>ScrollTrigger.refresh(),1200); },100);
  }

  function waitForDom(cb, maxTries = 40){
    const el = document.querySelector('.hero__bgimg');
    if(el){ cb(); return; }
    if(maxTries <= 0){ cb(); return; }
    requestAnimationFrame(()=> waitForDom(cb, maxTries - 1));
  }

  if(document.readyState==='complete') waitForDom(init);
  else window.addEventListener('load', ()=> waitForDom(init));
})();
