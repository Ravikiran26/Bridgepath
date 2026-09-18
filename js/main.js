/* MINDOW — shared interactions */
(function(){
  "use strict";

  /* ---------- theme toggle ---------- */
  var THEME_KEY = 'mindow-theme';
  function getTheme(){
    try{ return localStorage.getItem(THEME_KEY) || 'dark'; }catch(e){ return 'dark'; }
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

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.14, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

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
  document.querySelectorAll('.loop-wrap').forEach(function(wrap){
    var nodes = wrap.querySelectorAll('.loop-node');
    var n = nodes.length;
    nodes.forEach(function(node, i){
      var angle = (i / n) * Math.PI * 2 - Math.PI/2;
      var radius = 44;
      var x = 50 + radius * Math.cos(angle);
      var y = 50 + radius * Math.sin(angle);
      node.style.left = x + '%';
      node.style.top = y + '%';
    });
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
    function activate(i){
      steps.forEach(function(s){ s.classList.remove('active'); });
      steps[i].classList.add('active');
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
      }, 2200);
    }
    activate(0);
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
