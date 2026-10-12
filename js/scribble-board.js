/* MINDOW — Scribble app demo: one page where drawing, text, photos, links,
   voice and diagrams live together. Everything stays in the visitor's browser. */
(function(){
  'use strict';

  var board = document.querySelector('.sboard');
  if(!board) return;

  var page    = board.querySelector('.sb-page');
  var canvas  = board.querySelector('.sb-ink');
  var ctx     = canvas.getContext('2d');
  var layer   = board.querySelector('.sb-items');
  var tip     = board.querySelector('.sb-tip');
  var countEl = board.querySelector('.sb-count');
  var filePhoto = board.querySelector('.sb-file-photo');
  var exampleHTML = layer.innerHTML;          // for "show the example again"

  var mobile = window.matchMedia('(max-width: 760px)');
  var tool = 'pen', color = '#18151f';
  var strokes = [];                            // [{color, pts:[[x,y] normalised 0..1]}]
  var placeCount = 0;

  var TIPS = {
    pen:     'Draw anywhere on the page.',
    text:    'Tap anywhere on the page to write.',
    photo:   'Choose a photo — it lands on the page.',
    link:    'Paste a link into the card.',
    voice:   'Press record on the voice note.',
    diagram: 'Click a step to rename it, or add more.'
  };

  /* ---------- ink ---------- */
  function size(){
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(page.offsetWidth * dpr);
    canvas.height = Math.round(page.offsetHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  function redraw(){
    var w = page.offsetWidth, h = page.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;
    strokes.forEach(function(s){
      ctx.strokeStyle = s.color; ctx.beginPath();
      s.pts.forEach(function(p, i){ var x = p[0] * w, y = p[1] * h; if(i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      if(s.pts.length === 1) ctx.lineTo(s.pts[0][0] * w + .1, s.pts[0][1] * h);
      ctx.stroke();
    });
  }
  function point(e){
    var r = page.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }
  var current = null;
  canvas.addEventListener('pointerdown', function(e){
    if(tool === 'text'){ addText(point(e)); e.preventDefault(); return; }
    if(tool !== 'pen') setTool('pen');
    current = { color: color, pts: [point(e)] };
    strokes.push(current);
    try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
    redraw(); update(); e.preventDefault();
  });
  canvas.addEventListener('pointermove', function(e){
    if(!current) return;
    current.pts.push(point(e)); redraw(); e.preventDefault();
  });
  ['pointerup', 'pointercancel'].forEach(function(ev){ canvas.addEventListener(ev, function(){ current = null; }); });

  /* ---------- items ---------- */
  function enhance(el){
    // every item gets a drag bar (desktop) and a remove button
    for(var c = el.firstElementChild; c; c = c.nextElementSibling){ if(c.classList.contains('sb-bar')) return el; }
    var bar = document.createElement('div');
    bar.className = 'sb-bar';
    bar.innerHTML = '<span class="sb-grip" title="Drag to move" aria-hidden="true">⠿</span><button type="button" class="sb-del" aria-label="Remove">×</button>';
    el.insertBefore(bar, el.firstChild);
    bar.querySelector('.sb-del').addEventListener('click', function(){
      var media = el.querySelector('img,audio');
      if(media && media.src && media.src.indexOf('blob:') === 0) URL.revokeObjectURL(media.src);
      if(el._stop) el._stop();
      el.remove(); update();
    });
    drag(el, bar);
    return el;
  }
  function place(el, pos){
    if(!mobile.matches){
      if(!pos){ var k = placeCount++ % 5; pos = [0.30 + k * 0.06, 0.18 + k * 0.09]; }
      el.style.left = (pos[0] * 100) + '%';
      el.style.top  = (pos[1] * 100) + '%';
    } else { placeCount++; }
    el.classList.add('sb-new');
    layer.appendChild(el);
    enhance(el);
    if(!mobile.matches) keepInside(el);
    else el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    update();
    return el;
  }
  function keepInside(el){
    if(mobile.matches) return;
    var pw = page.offsetWidth, ph = page.offsetHeight;
    var x = Math.min(Math.max(el.offsetLeft, 0), Math.max(pw - el.offsetWidth, 0));
    var y = Math.min(Math.max(el.offsetTop, 0), Math.max(ph - el.offsetHeight, 0));
    el.style.left = (x / pw * 100) + '%';
    el.style.top  = (y / ph * 100) + '%';
  }
  function drag(el, handle){
    var start = null;
    handle.addEventListener('pointerdown', function(e){
      if(mobile.matches || e.target.closest('.sb-del')) return;
      start = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop };
      try{ handle.setPointerCapture(e.pointerId); }catch(err){}
      el.classList.add('dragging');
      layer.appendChild(el);                       // bring to front
      e.preventDefault();
    });
    handle.addEventListener('pointermove', function(e){
      if(!start) return;
      el.style.left = (start.l + e.clientX - start.x) + 'px';
      el.style.top  = (start.t + e.clientY - start.y) + 'px';
    });
    ['pointerup', 'pointercancel'].forEach(function(ev){
      handle.addEventListener(ev, function(){ if(!start) return; start = null; el.classList.remove('dragging'); keepInside(el); });
    });
  }
  function item(type, cls, inner){
    var el = document.createElement('div');
    el.className = 'sb-item ' + cls;
    el.setAttribute('data-type', type);
    el.innerHTML = inner;
    return el;
  }

  function addText(pos, value, sticky){
    var el = item('text', sticky ? 'sb-sticky sb-' + sticky : 'sb-note',
                  '<div class="sb-text" contenteditable="true" spellcheck="false"></div>');
    var t = el.querySelector('.sb-text');
    t.textContent = value || '';
    if(!value) t.style.color = color;
    place(el, pos);
    if(!value) t.focus();
    t.addEventListener('blur', function(){ if(!t.textContent.trim()){ el.remove(); update(); } });
    return el;
  }
  function addPhoto(file){
    var el = item('photo', 'sb-pic sb-upload', '<img alt="Photo on the Scribble">');
    var img = el.querySelector('img');
    img.src = URL.createObjectURL(file);          // stays in the browser, nothing is uploaded
    img.addEventListener('load', function(){ keepInside(el); });
    place(el);
  }
  function addLink(){
    var el = item('link', 'sb-explore sb-linkcard',
      '<div class="sb-explore-head"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>Link</div>' +
      '<div class="sb-text sb-url" contenteditable="true" spellcheck="false" data-placeholder="Paste a link…"></div>');
    place(el);
    var u = el.querySelector('.sb-url'); u.focus();
    u.addEventListener('blur', function(){
      var v = u.textContent.trim();
      if(/^https?:\/\//i.test(v)){
        try{ u.setAttribute('data-host', new URL(v).hostname.replace(/^www\./, '')); }catch(err){}
      }
    });
  }
  function addDiagram(){
    var el = item('diagram', 'sb-diagram',
      '<div class="sb-flow"><span class="sb-node" contenteditable="true" spellcheck="false">Idea</span>' +
      '<span class="sb-node" contenteditable="true" spellcheck="false">Try it</span>' +
      '<button type="button" class="sb-add" aria-label="Add step">+</button></div>');
    el.querySelector('.sb-add').addEventListener('click', function(){
      var flow = el.querySelector('.sb-flow');
      if(flow.querySelectorAll('.sb-node').length >= 5) return;
      var n = document.createElement('span'); n.className = 'sb-node'; n.contentEditable = 'true'; n.textContent = 'Next step';
      flow.insertBefore(n, this); n.focus(); keepInside(el);
    });
    place(el);
  }
  function addVoice(){
    var el = item('voice', 'sb-voice',
      '<div class="sb-voice-row"><button type="button" class="sb-rec"><i></i><span>Record</span></button>' +
      '<span class="sb-wave" aria-hidden="true"><b></b><b></b><b></b><b></b><b></b><b></b><b></b></span><span class="sb-time">0:00</span></div>' +
      '<audio class="sb-audio" controls hidden></audio><p class="sb-note-msg" hidden></p>');
    var btn = el.querySelector('.sb-rec'), label = btn.querySelector('span'), time = el.querySelector('.sb-time');
    var audio = el.querySelector('.sb-audio'), note = el.querySelector('.sb-note-msg');
    var rec = null, chunks = [], t0 = 0, tick = null, stream = null;
    function say(msg){ note.textContent = msg; note.hidden = false; keepInside(el); }
    el._stop = function(){ if(rec && rec.state === 'recording') rec.stop(); if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); };
    if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)){
      btn.disabled = true; say('Voice needs a secure (https) page and microphone support.');
    } else {
      btn.addEventListener('click', function(){
        if(rec && rec.state === 'recording'){ rec.stop(); return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(s){
          stream = s; chunks = []; rec = new MediaRecorder(s);
          rec.ondataavailable = function(e){ if(e.data.size) chunks.push(e.data); };
          rec.onstop = function(){
            s.getTracks().forEach(function(t){ t.stop(); });
            clearInterval(tick); el.classList.remove('recording'); label.textContent = 'Record again';
            if(audio.src) URL.revokeObjectURL(audio.src);
            audio.src = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
            audio.hidden = false; keepInside(el);
          };
          rec.start(); t0 = Date.now(); el.classList.add('recording'); label.textContent = 'Stop'; note.hidden = true;
          tick = setInterval(function(){
            var sec = Math.floor((Date.now() - t0) / 1000);
            time.textContent = Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
            if(sec >= 60) rec.stop();
          }, 250);
        }).catch(function(){ say('Microphone access was blocked. Allow it to record.'); });
      });
    }
    place(el);
  }

  /* ---------- Mindow Suggestions: tap to pin the question onto the page ---------- */
  function wireSuggestions(){
    layer.querySelectorAll('.sb-suggest').forEach(function(b){
      b.addEventListener('click', function(){
        var el = addText(null, b.getAttribute('data-q'), ['green', 'yellow', 'pink'][placeCount % 3]);
        el.classList.add('sb-from-ai');
        b.classList.add('used');
      });
    });
  }

  /* ---------- toolbar ---------- */
  function setTool(t){
    tool = t;
    board.querySelectorAll('.sb-tool').forEach(function(b){
      var on = b.getAttribute('data-tool') === t && (t === 'pen' || t === 'text');
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    page.setAttribute('data-tool', t);
    tip.textContent = TIPS[t] || '';
  }
  board.querySelectorAll('.sb-tool').forEach(function(b){
    b.addEventListener('click', function(){
      var t = b.getAttribute('data-tool');
      if(t === 'pen' || t === 'text'){ setTool(t); return; }
      tip.textContent = TIPS[t];
      if(t === 'photo') filePhoto.click();
      else if(t === 'link') addLink();
      else if(t === 'voice') addVoice();
      else if(t === 'diagram') addDiagram();
    });
  });
  filePhoto.addEventListener('change', function(){ if(filePhoto.files[0]) addPhoto(filePhoto.files[0]); filePhoto.value = ''; });
  board.querySelectorAll('.sb-color').forEach(function(b){
    b.style.background = b.getAttribute('data-color');
    b.addEventListener('click', function(){
      color = b.getAttribute('data-color');
      board.querySelectorAll('.sb-color').forEach(function(x){ x.classList.toggle('active', x === b); });
      if(tool !== 'text') setTool('pen');
    });
  });
  board.querySelector('.sb-clear').addEventListener('click', function(){
    strokes = []; redraw();
    layer.querySelectorAll('.sb-item').forEach(function(el){ if(el._stop) el._stop(); el.remove(); });
    placeCount = 0; setTool('pen'); update();
  });
  board.querySelector('.sb-restore').addEventListener('click', function(){
    layer.querySelectorAll('.sb-item').forEach(function(el){ if(el._stop) el._stop(); });
    layer.innerHTML = exampleHTML;
    strokes = []; placeCount = 0;
    init(); setTool('pen');
  });

  /* ---------- "N forms · one Scribble" ---------- */
  function update(){
    var forms = {};
    if(strokes.length) forms.drawing = 1;
    layer.querySelectorAll('.sb-item').forEach(function(el){
      var t = el.getAttribute('data-type'); if(t && t !== 'ai') forms[t] = 1;
    });
    var n = Object.keys(forms).length;
    countEl.textContent = n ? n + (n === 1 ? ' form' : ' forms') + ' · one Scribble' : 'Empty page';
  }

  function init(){
    layer.querySelectorAll('.sb-item').forEach(enhance);
    wireSuggestions();
    size(); update();
  }

  init();
  setTool('pen');
  var rt;
  function relayout(){ size(); layer.querySelectorAll('.sb-item[style*="left"]').forEach(function(el){ if(el.classList.contains('sb-new') || el.style.left) keepInside(el); }); }
  window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(relayout, 120); });
  if('ResizeObserver' in window) new ResizeObserver(function(){ clearTimeout(rt); rt = setTimeout(size, 60); }).observe(page);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(size);
})();
