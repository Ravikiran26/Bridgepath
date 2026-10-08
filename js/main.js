/* MINDOW — shared interactions */
(function(){
  "use strict";

  /* ---------- theme toggle ---------- */
  var THEME_KEY = 'mindow-theme';
  function getTheme(){
    try{ return localStorage.getItem(THEME_KEY) || 'light'; }catch(e){ return 'light'; }   // light by default for first-time visitors
  }
  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
  }
  setTheme(getTheme());
  document.querySelectorAll('.theme-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  });

  /* ---------- header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  if(toggle && panel){
    toggle.addEventListener('click', function(){
      panel.classList.toggle('open');
      document.body.style.overflow = panel.classList.contains('open') ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        panel.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- motion layer ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero headline: wrap each word so it can rise in one after another; underline the accent words
  var heroTitle = document.querySelector('.hero--text h1');
  if(heroTitle){
    var n = 0, frag = document.createDocumentFragment();
    function wordSpan(content){
      var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', n++);
      if(typeof content === 'string') w.textContent = content; else w.appendChild(content);
      return w;
    }
    Array.prototype.slice.call(heroTitle.childNodes).forEach(function(node){
      if(node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(function(part){
          if(!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wordSpan(part));
        });
      } else {
        if(node.classList && node.classList.contains('hl')){
          var swash = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          swash.setAttribute('class', 'hl-swash'); swash.setAttribute('viewBox', '0 0 100 12');
          swash.setAttribute('preserveAspectRatio', 'none'); swash.setAttribute('aria-hidden', 'true');
          swash.innerHTML = '<path pathLength="100" d="M2 8 C 22 3, 55 2, 98 5"/>';
          node.appendChild(swash);
        }
        frag.appendChild(wordSpan(node));
      }
    });
    heroTitle.textContent = ''; heroTitle.appendChild(frag);
  }
  // start the hero sequence once fonts are ready (no flash of fallback font), with a time limit
  var heroSection = document.querySelector('.hero--text');
  if(heroSection){
    var started = false;
    var go = function(){ if(!started){ started = true; heroSection.classList.add('go'); } };
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 900);
  }

  // Stagger: cards inside these groups appear one after another instead of all at once
  ['.grid-3', '.wall', '.xs-cats', '.check-grid', '.evolve-flow', '.flow-strip', '.product-grid', '.audience-grid', '.shelf-grid'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(group){
      group.removeAttribute('data-reveal');
      Array.prototype.slice.call(group.children).forEach(function(child, i){
        child.setAttribute('data-reveal', '');
        child.style.transitionDelay = Math.min(i * 0.09, 0.6) + 's';
      });
    });
  });
  // Section headings unfold: label lines draw, then heading, then text
  document.querySelectorAll('.section-head').forEach(function(head){ head.setAttribute('data-reveal', ''); });

  // Thin reading-progress line under the header
  if(header && !reduceMotion){
    var bar = document.createElement('div'); bar.className = 'scroll-progress'; header.appendChild(bar);
    var ticking = false;
    document.addEventListener('scroll', function(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(function(){
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
        ticking = false;
      });
    }, { passive:true });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          // after the entrance, drop any stagger delay so hover effects respond instantly
          (function(t){ setTimeout(function(){ t.style.transitionDelay = ''; }, 1700); })(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0, rootMargin:'0px 0px 15% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- circular learning diagram node placement ---------- */
  document.querySelectorAll('.cl-wrap').forEach(function(wrap){
    var nodes = wrap.querySelectorAll('.cl-node');
    var n = nodes.length;
    nodes.forEach(function(node, i){
      var angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      var radius = 44;
      var x = 50 + radius * Math.cos(angle);
      var y = 50 + radius * Math.sin(angle);
      node.style.left = x + '%';
      node.style.top  = y + '%';
    });
  });

  /* ---------- identity loop node placement (hero) ---------- */
  document.querySelectorAll('.identity-loop').forEach(function(loop){
    var nodes = loop.querySelectorAll('.node');
    var n = nodes.length;
    nodes.forEach(function(node, i){
      var angle = (i / n) * Math.PI * 2 - Math.PI/2;
      var radius = 46; // percent
      var x = 50 + radius * Math.cos(angle);
      var y = 50 + radius * Math.sin(angle);
      node.style.left = x + '%';
      node.style.top = y + '%';
      node.style.animationDelay = (i * 0.5) + 's';
    });
  });

  /* ---------- generic loop diagram (circular nodes around a center) ---------- */
  document.querySelectorAll('.loop-wrap').forEach(function(wrap, w){
    var nodes = wrap.querySelectorAll('.loop-node');
    var n = nodes.length;
    if(!n) return;
    nodes.forEach(function(node, i){
      var angle = (i / n) * Math.PI * 2 - Math.PI/2;
      var radius = 44;
      var x = 50 + radius * Math.cos(angle);
      var y = 50 + radius * Math.sin(angle);
      node.style.left = x + '%';
      node.style.top = y + '%';
    });

    // Direction arrows: one per gap between nodes, drawn only through clear space
    // (measured against the real label boxes, so long labels never get crossed).
    var svg = wrap.querySelector('.loop-svg');
    if(!svg) return;
    svg.querySelectorAll('.arc').forEach(function(a){ a.style.display = 'none'; });
    var NS = 'http://www.w3.org/2000/svg', id = 'loopArrAuto' + w;
    var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
    var marker = document.createElementNS(NS, 'marker');
    marker.setAttribute('id', id); marker.setAttribute('markerWidth', '6'); marker.setAttribute('markerHeight', '6');
    marker.setAttribute('refX', '4.5'); marker.setAttribute('refY', '3'); marker.setAttribute('orient', 'auto');
    marker.innerHTML = '<path d="M1 1L4.8 3L1 5" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>';
    defs.appendChild(marker);
    var center = wrap.querySelector('.loop-center');

    function drawArrows(){
      svg.querySelectorAll('.loop-arrow').forEach(function(p){ p.remove(); });
      var box = wrap.getBoundingClientRect();
      if(!box.width) return;
      var k = box.width / 200;                                   // px per viewBox unit
      var M = 8;                                                  // clearance around labels (px)
      var rects = Array.prototype.map.call(nodes, function(nd){ return nd.getBoundingClientRect(); });
      var cr = center ? center.getBoundingClientRect().width / 2 + 10 : 0;
      var R = 68, C = 100, step = Math.PI * 2 / n, SAMPLES = 80;
      function clear(a){
        var x = box.left + (C + R * Math.cos(a)) * k, y = box.top + (C + R * Math.sin(a)) * k;
        if(Math.hypot(x - (box.left + box.width/2), y - (box.top + box.height/2)) < cr) return false;
        return !rects.some(function(r){ return x > r.left - M && x < r.right + M && y > r.top - M && y < r.bottom + M; });
      }
      for(var i = 0; i < n; i++){
        var g0 = i * step - Math.PI/2, best = null, run = null;
        for(var j = 0; j <= SAMPLES; j++){
          var a = g0 + step * j / SAMPLES;
          if(clear(a)){ if(!run) run = [a, a]; else run[1] = a; }
          else if(run){ if(!best || run[1]-run[0] > best[1]-best[0]) best = run; run = null; }
        }
        if(run && (!best || run[1]-run[0] > best[1]-best[0])) best = run;
        if(!best || best[1] - best[0] < 0.14) continue;          // too little room: skip this arrow
        var a0 = best[0] + 0.04, a1 = best[1] - 0.06;
        var path = document.createElementNS(NS, 'path');
        path.setAttribute('class', 'loop-arrow');
        path.setAttribute('d', 'M ' + (C + R*Math.cos(a0)).toFixed(2) + ' ' + (C + R*Math.sin(a0)).toFixed(2) +
          ' A ' + R + ' ' + R + ' 0 0 1 ' + (C + R*Math.cos(a1)).toFixed(2) + ' ' + (C + R*Math.sin(a1)).toFixed(2));
        path.setAttribute('marker-end', 'url(#' + id + ')');
        path.style.setProperty('--d', (i * 0.12) + 's');
        svg.appendChild(path);
      }
    }
    drawArrows();
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(drawArrows);
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(drawArrows, 150); });
  });

  /* ---------- Scribble builder demo ---------- */
  var scribbleDemo = document.querySelector('.scribble-demo');
  if(scribbleDemo){
    var toggles = scribbleDemo.querySelectorAll('.layer-toggle');
    var canvas = scribbleDemo.querySelector('.scribble-canvas');
    var placeholder = canvas.querySelector('.placeholder');
    var banner = scribbleDemo.querySelector('.one-expression-banner');

    var templates = {
      text: '<div class="chip text">"Why do leaves change color in autumn?"</div>',
      drawing: '<div class="chip drawing"><svg viewBox="0 0 64 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 32 C 14 6, 22 38, 32 20 S 50 4, 62 18"/></svg></div>',
      image: '<div class="chip image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-4 4-3-3-6 6"/></svg> Leaf photo</div>',
      voice: '<div class="chip voice"><div class="wave"><i style="animation-delay:0s;height:40%"></i><i style="animation-delay:.1s;height:80%"></i><i style="animation-delay:.2s;height:50%"></i><i style="animation-delay:.3s;height:90%"></i><i style="animation-delay:.4s;height:35%"></i><i style="animation-delay:.5s;height:70%"></i></div> Voice note</div>',
      diagram: '<div class="chip diagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l7-.5M8.5 8l3 8M15.5 8l-3 8"/></svg> Process map</div>',
      media: '<div class="chip media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg> Video clip</div>'
    };

    function refreshBanner(){
      var active = scribbleDemo.querySelectorAll('.layer-toggle.active').length;
      banner.classList.toggle('show', active >= 2);
      placeholder.style.display = active === 0 ? 'block' : 'none';
    }

    toggles.forEach(function(btn){
      btn.addEventListener('click', function(){
        var key = btn.getAttribute('data-layer');
        var existing = canvas.querySelector('[data-chip="' + key + '"]');
        if(existing){
          existing.remove();
          btn.classList.remove('active');
        } else {
          var wrap = document.createElement('div');
          wrap.innerHTML = templates[key];
          var el = wrap.firstElementChild;
          el.setAttribute('data-chip', key);
          canvas.insertBefore(el, banner);
          btn.classList.add('active');
        }
        refreshBanner();
      });
    });
    refreshBanner();
  }

  /* ---------- Shelf demo ---------- */
  document.querySelectorAll('.shelf-card').forEach(function(card){
    if(card.classList.contains('own')) return;
    card.addEventListener('click', function(){
      card.classList.toggle('open');
    });
  });

  /* ---------- Mode of Expression stepper (auto-cycle + click) ---------- */
  document.querySelectorAll('.stepper').forEach(function(stepper){
    var steps = stepper.querySelectorAll('.stepper-step');
    var idx = 0;
    // optional visual demo right after the stepper, one panel per step
    var demo = stepper.nextElementSibling && stepper.nextElementSibling.classList.contains('mode-demo') ? stepper.nextElementSibling : null;
    var panels = demo ? demo.querySelectorAll('.md-panel') : [];
    var modeLabel = demo ? demo.querySelector('.md-mode-label') : null;
    function activate(i){
      steps.forEach(function(s){ s.classList.remove('active'); });
      steps[i].classList.add('active');
      panels.forEach(function(p, j){
        p.classList.toggle('active', j === i);
        p.setAttribute('aria-hidden', j === i ? 'false' : 'true');
      });
      if(modeLabel && panels[i]) modeLabel.textContent = panels[i].getAttribute('data-mode');
    }
    steps.forEach(function(step, i){
      step.addEventListener('click', function(){ idx = i; activate(idx); restart(); });
    });
    var timer;
    function restart(){
      clearInterval(timer);
      timer = setInterval(function(){
        idx = (idx + 1) % steps.length;
        activate(idx);
      }, demo ? 4200 : 2200);   // slower when the demo needs time to play
    }
    if(demo){
      // pause auto-cycling while someone is looking at the demo
      demo.addEventListener('mouseenter', function(){ clearInterval(timer); });
      demo.addEventListener('mouseleave', restart);
    }
    activate(0);
    restart();
  });

  /* ---------- Mindow Ecosystem: 5 stages (auto-cycle + click, pause on hover) ---------- */
  document.querySelectorAll('[data-eco]').forEach(function(eco){
    var tabs = eco.querySelectorAll('.eco-tab');
    var panels = eco.querySelectorAll('.eco-panel');
    var idx = 0, timer;
    function activate(i, scrollTab){
      tabs.forEach(function(t, j){
        t.classList.toggle('active', j === i);
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });
      panels.forEach(function(p, j){
        p.classList.toggle('active', j === i);
        p.setAttribute('aria-hidden', j === i ? 'false' : 'true');
      });
      // keep the active tab visible when the tab row scrolls (tablet / mobile)
      var row = tabs[i].parentElement;
      if(scrollTab && row.scrollWidth > row.clientWidth){
        row.scrollTo({ left: tabs[i].offsetLeft - row.offsetLeft - 8, behavior:'smooth' });
      }
    }
    function restart(){
      clearInterval(timer);
      timer = setInterval(function(){ idx = (idx + 1) % tabs.length; activate(idx, true); }, 5500);
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ idx = i; activate(idx, true); restart(); });
    });
    eco.addEventListener('mouseenter', function(){ clearInterval(timer); });
    eco.addEventListener('mouseleave', restart);
    activate(0, false);
    restart();
  });

  /* ---------- Intent Interactive Scribble timeline ---------- */
  document.querySelectorAll('.timeline').forEach(function(tl){
    var steps = tl.querySelectorAll('.tl-step');
    steps.forEach(function(step, i){
      step.addEventListener('click', function(){
        steps.forEach(function(s){ s.classList.remove('active'); });
        step.classList.add('active');
      });
    });
    if(steps[0]) steps[0].classList.add('active');
  });

  /* ---------- Scribble chain: add new node ---------- */
  document.querySelectorAll('.chain-add').forEach(function(addBtn){
    addBtn.addEventListener('click', function(){
      var row = addBtn.parentElement;
      var count = row.querySelectorAll('.chain-node').length;
      if(count >= 8) return;
      var link = document.createElement('div');
      link.className = 'chain-link';
      var node = document.createElement('div');
      node.className = 'chain-node active';
      node.innerHTML = '<b>' + String(count+1).padStart(2,'0') + '</b><span>New idea</span>';
      row.querySelectorAll('.chain-node').forEach(function(n){ n.classList.remove('active'); });
      row.insertBefore(link, addBtn);
      row.insertBefore(node, addBtn);
      addBtn.scrollIntoView({ behavior:'smooth', inline:'end', block:'nearest' });
    });
  });

  /* ---------- Hero product card: subtle cursor tilt ---------- */
  var hv2Card = document.getElementById('hv2-card');
  if(hv2Card){
    hv2Card.addEventListener('mousemove', function(e){
      var rect = hv2Card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top  + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);
      var dy = (e.clientY - cy) / (rect.height / 2);
      hv2Card.style.transform = 'perspective(900px) rotateY(' + (dx * 3) + 'deg) rotateX(' + (-dy * 2) + 'deg) translateY(-5px) scale(1.006)';
    });
    hv2Card.addEventListener('mouseleave', function(){
      hv2Card.style.transform = '';
    });
  }

  /* ---------- Contact / demo request forms ---------- */
  document.querySelectorAll('form[data-static-form]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var success = form.parentElement.querySelector('.form-success') || form.querySelector('.form-success');
      form.reset();
      if(success) success.classList.add('show');
      else alert('Thank you — the Mindow team will be in touch shortly.');
    });
  });

})();
