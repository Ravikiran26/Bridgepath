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

    var ICON = {
      text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
      image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-4 4-3-3-6 6"/></svg>',
      voice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
      diagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l7-.5M8.5 8l3 8M15.5 8l-3 8"/></svg>',
      media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>'
    };
    function card(key, title, body, wide){
      return '<div class="chip layer-card' + (wide ? ' wide' : '') + '"><div class="lc-head">' + ICON[key] + '<span>' + title + '</span></div>' + body + '</div>';
    }
    var templates = {
      text: card('text', 'Text', '<textarea class="lc-text" rows="2" aria-label="Your thought">Why do leaves change color in autumn?</textarea>', true),
      drawing: '<div class="chip drawing sketch-pad"><canvas aria-label="Drawing area"></canvas><span class="sketch-hint">✎ Draw here</span>' +
               '<div class="sketch-tools"><button type="button" class="sketch-color active" data-color="#18151f" aria-label="Black ink"></button>' +
               '<button type="button" class="sketch-color" data-color="#0a5549" aria-label="Green ink"></button>' +
               '<button type="button" class="sketch-color" data-color="#c8734f" aria-label="Terracotta ink"></button>' +
               '<button type="button" class="sketch-clear">Clear</button></div></div>',
      image: card('image', 'Image', '<label class="lc-drop"><input type="file" accept="image/*" capture="environment"><span>Choose or take a photo</span></label><img class="lc-preview" alt="Your photo" hidden>'),
      voice: card('voice', 'Voice', '<div class="lc-voice"><button type="button" class="lc-rec"><i></i><span>Record</span></button><span class="lc-time">0:00</span></div><audio class="lc-audio" controls hidden></audio><p class="lc-note" hidden></p>'),
      diagram: card('diagram', 'Diagram', '<div class="lc-flow"><span class="lc-node" contenteditable="true">Sunlight</span><span class="lc-node" contenteditable="true">Chlorophyll fades</span><span class="lc-node" contenteditable="true">Colours appear</span><button type="button" class="lc-add">+ Step</button></div>', true),
      media: card('media', 'Media', '<label class="lc-drop"><input type="file" accept="video/*"><span>Choose a video clip</span></label><video class="lc-preview" controls playsinline hidden></video>')
    };

    /* --- make each layer actually usable --- */
    function initText(el){
      var ta = el.querySelector('textarea');
      function fit(){ ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
      ta.addEventListener('input', fit); fit(); ta.focus(); ta.select();
    }
    function initFilePreview(el){
      var input = el.querySelector('input[type=file]'), prev = el.querySelector('.lc-preview'), label = el.querySelector('.lc-drop span');
      input.addEventListener('change', function(){
        var f = input.files && input.files[0]; if(!f) return;
        if(prev.src) URL.revokeObjectURL(prev.src);
        prev.src = URL.createObjectURL(f); prev.hidden = false;      // stays in the browser, nothing is uploaded
        label.textContent = 'Change';
        el.classList.add('filled');
      });
    }
    function initVoice(el){
      var btn = el.querySelector('.lc-rec'), label = btn.querySelector('span'), time = el.querySelector('.lc-time');
      var audio = el.querySelector('.lc-audio'), note = el.querySelector('.lc-note');
      var rec = null, chunks = [], t0 = 0, tick = null;
      function say(msg){ note.textContent = msg; note.hidden = false; }
      if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)){
        btn.disabled = true; say('Voice recording needs a secure (https) page and a browser with microphone support.'); return;
      }
      btn.addEventListener('click', function(){
        if(rec && rec.state === 'recording'){ rec.stop(); return; }
        navigator.mediaDevices.getUserMedia({ audio:true }).then(function(stream){
          chunks = []; rec = new MediaRecorder(stream);
          rec.ondataavailable = function(e){ if(e.data.size) chunks.push(e.data); };
          rec.onstop = function(){
            stream.getTracks().forEach(function(t){ t.stop(); });
            clearInterval(tick); el.classList.remove('recording'); label.textContent = 'Record again';
            if(audio.src) URL.revokeObjectURL(audio.src);
            audio.src = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })); audio.hidden = false;
          };
          rec.start(); t0 = Date.now(); el.classList.add('recording'); label.textContent = 'Stop'; note.hidden = true;
          tick = setInterval(function(){
            var s = Math.floor((Date.now() - t0) / 1000);
            time.textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
            if(s >= 60) rec.stop();                                   // keep demo clips short
          }, 250);
        }).catch(function(){ say('Microphone access was blocked. Allow it in the browser to record.'); });
      });
    }
    function initDiagram(el){
      var flow = el.querySelector('.lc-flow'), add = el.querySelector('.lc-add');
      add.addEventListener('click', function(){
        if(flow.querySelectorAll('.lc-node').length >= 6) return;
        var n = document.createElement('span'); n.className = 'lc-node'; n.contentEditable = 'true'; n.textContent = 'New step';
        flow.insertBefore(n, add); n.focus();
        var r = document.createRange(); r.selectNodeContents(n); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      });
    }
    var INIT = { text: initText, image: initFilePreview, media: initFilePreview, voice: initVoice, diagram: initDiagram };

    // Real drawing pad for the Drawing layer (mouse, pen and touch)
    function initSketchPad(pad){
      var cv = pad.querySelector('canvas'), ctx = cv.getContext('2d');
      var hint = pad.querySelector('.sketch-hint');
      var color = '#18151f', drawing = false, last = null;
      function size(){
        // layout size (unaffected by the pop-in scale animation)
        var r = { width: cv.offsetWidth, height: cv.offsetHeight }, dpr = window.devicePixelRatio || 1;
        if(!r.width) return;
        var keep = document.createElement('canvas'); keep.width = cv.width; keep.height = cv.height;
        if(cv.width) keep.getContext('2d').drawImage(cv, 0, 0);
        cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if(keep.width) ctx.drawImage(keep, 0, 0, cv.width, cv.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;
      }
      function pos(e){
        var r = cv.getBoundingClientRect(), sx = cv.offsetWidth / r.width, sy = cv.offsetHeight / r.height;   // undo any CSS scale
        return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
      }
      cv.addEventListener('pointerdown', function(e){
        drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId);
        pad.classList.add('drawn');
        ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(last.x, last.y, 1.2, 0, Math.PI * 2); ctx.stroke();
        e.preventDefault();
      });
      cv.addEventListener('pointermove', function(e){
        if(!drawing) return;
        var p = pos(e);
        ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        last = p; e.preventDefault();
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(ev){ cv.addEventListener(ev, function(){ drawing = false; }); });
      pad.querySelectorAll('.sketch-color').forEach(function(b){
        b.style.background = b.getAttribute('data-color');
        b.addEventListener('click', function(){
          color = b.getAttribute('data-color');
          pad.querySelectorAll('.sketch-color').forEach(function(x){ x.classList.toggle('active', x === b); });
        });
      });
      pad.querySelector('.sketch-clear').addEventListener('click', function(){
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore();
        pad.classList.remove('drawn');
      });
      size();   // element is already in the DOM, so it can be measured right away
      var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(size, 150); });
    }

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
          if(key === 'drawing') initSketchPad(el);
          else if(INIT[key]) INIT[key](el);
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

  /* ---------- Face → Mind: build-your-identity (tap dimensions to add them) ---------- */
  document.querySelectorAll('.fm-card').forEach(function(card){
    var tiles = card.querySelectorAll('.fm-tile');
    var list = card.querySelector('.fm-entries');
    var count = card.querySelector('.fm-count');
    var meter = card.querySelector('.fm-meter span');
    if(!tiles.length || !list) return;
    function render(){
      var chosen = Array.prototype.filter.call(tiles, function(t){ return t.getAttribute('aria-pressed') === 'true'; });
      list.innerHTML = '';
      chosen.forEach(function(t){
        var li = document.createElement('li');
        li.appendChild(t.querySelector('svg').cloneNode(true));
        var text = document.createElement('span');
        var label = document.createElement('b'); label.textContent = t.querySelector('span').textContent;
        var ex = document.createElement('em'); ex.textContent = t.getAttribute('data-example');
        text.appendChild(label); text.appendChild(ex); li.appendChild(text);
        list.appendChild(li);
      });
      card.classList.toggle('has-entries', chosen.length > 0);
      list.scrollTop = list.scrollHeight;   // keep the newest entry in view
      if(count) count.textContent = chosen.length + ' of ' + tiles.length + ' added';
      if(meter) meter.style.transform = 'scaleX(' + (chosen.length / tiles.length) + ')';
    }
    tiles.forEach(function(t){
      t.addEventListener('click', function(){
        t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        render();
      });
    });
    // start with two dimensions chosen so the idea is visible at a glance
    [0, 2].forEach(function(i){ if(tiles[i]) tiles[i].setAttribute('aria-pressed', 'true'); });
    render();
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
