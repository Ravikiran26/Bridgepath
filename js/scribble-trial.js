/* MINDOW — Interactive Scribble Trial */
(function () {
  'use strict';

  var trial = document.querySelector('.scribble-trial');
  if (!trial) return;

  var workspace = trial.querySelector('.trial-workspace');
  var canvas    = trial.querySelector('.trial-canvas');
  var ctx       = canvas.getContext('2d');
  var textLayer = trial.querySelector('.trial-text-layer');
  var hint      = trial.querySelector('.trial-hint');

  /* ---- canvas sizing ---- */
  function resizeCanvas() {
    var rect = workspace.getBoundingClientRect();
    if (!rect.width) return;
    var tmp = document.createElement('canvas');
    tmp.width  = canvas.width;
    tmp.height = canvas.height;
    tmp.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width  = rect.width;
    canvas.height = rect.height;
    ctx.drawImage(tmp, 0, 0);
  }
  setTimeout(resizeCanvas, 60);
  window.addEventListener('resize', resizeCanvas);

  /* ---- tool switching ---- */
  var currentTool = 'draw';
  trial.querySelectorAll('.trial-tool').forEach(function (btn) {
    btn.addEventListener('click', function () {
      trial.querySelectorAll('.trial-tool').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTool = btn.getAttribute('data-tool');
      trial.querySelectorAll('.tool-panel').forEach(function (p) { p.classList.remove('active'); });
      var panel = trial.querySelector('[data-panel="' + currentTool + '"]');
      if (panel) panel.classList.add('active');
      canvas.style.cursor = currentTool === 'draw' ? 'crosshair' : 'default';
      canvas.style.pointerEvents = currentTool === 'draw' ? 'auto' : 'none';
    });
  });

  /* ---- freehand drawing ---- */
  var isDrawing = false;
  var lastX = 0, lastY = 0;
  var drawColor = '#059669';
  var brushSize = 4;

  function getPos(e) {
    var rect = canvas.getBoundingClientRect();
    var src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function startDraw(e) {
    isDrawing = true;
    var p = getPos(e);
    lastX = p.x; lastY = p.y;
    ctx.beginPath();
    ctx.arc(lastX, lastY, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = drawColor;
    ctx.fill();
    if (hint) hint.classList.add('hidden');
  }

  function drawMove(e) {
    if (!isDrawing) return;
    var p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth   = brushSize;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    lastX = p.x; lastY = p.y;
  }

  function stopDraw() { isDrawing = false; }

  canvas.addEventListener('mousedown',  startDraw);
  canvas.addEventListener('mousemove',  drawMove);
  canvas.addEventListener('mouseup',    stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);
  canvas.addEventListener('touchstart', function (e) { e.preventDefault(); startDraw(e); }, { passive: false });
  canvas.addEventListener('touchmove',  function (e) { e.preventDefault(); drawMove(e);  }, { passive: false });
  canvas.addEventListener('touchend',   stopDraw);

  /* ---- color swatches ---- */
  trial.querySelectorAll('.color-swatch').forEach(function (sw) {
    sw.addEventListener('click', function () {
      trial.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('active'); });
      sw.classList.add('active');
      drawColor = sw.getAttribute('data-color');
    });
  });

  /* ---- brush size ---- */
  var sizeInput = trial.querySelector('.brush-size');
  if (sizeInput) sizeInput.addEventListener('input', function () { brushSize = +this.value; });

  /* ---- text notes ---- */
  var textInput = trial.querySelector('.trial-text-input');
  var addBtn    = trial.querySelector('.add-text-btn');

  function addText() {
    if (!textInput) return;
    var val = textInput.value.trim();
    if (!val) return;
    var chip = document.createElement('div');
    chip.className = 'trial-text-chip';
    chip.textContent = val;
    chip.title = 'Click to remove';
    chip.addEventListener('click', function () { chip.remove(); });
    textLayer.appendChild(chip);
    textInput.value = '';
    textInput.focus();
    if (hint) hint.classList.add('hidden');
  }

  if (addBtn)    addBtn.addEventListener('click', addText);
  if (textInput) textInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); addText(); }
  });

  /* ---- image upload ---- */
  var imageInput = trial.querySelector('.image-input');
  if (imageInput) {
    imageInput.addEventListener('change', function () {
      var file = this.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var maxW  = canvas.width  * 0.6;
          var maxH  = canvas.height * 0.6;
          var scale = Math.min(maxW / img.width, maxH / img.height, 1);
          var w = img.width  * scale;
          var h = img.height * scale;
          ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
          if (hint) hint.classList.add('hidden');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      imageInput.value = '';
    });
  }

  /* ---- voice recording ---- */
  var recordBtn   = trial.querySelector('.record-btn');
  var recordLabel = trial.querySelector('.record-btn-label');
  var voiceClips  = trial.querySelector('.voice-clips');
  var mediaRecorder = null;
  var chunks = [];
  var isRecording = false;

  if (recordBtn) {
    recordBtn.addEventListener('click', function () {
      if (!isRecording) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Voice recording requires a modern browser with microphone support.');
          return;
        }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          chunks = [];
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };
          mediaRecorder.onstop = function () {
            var blob  = new Blob(chunks, { type: 'audio/webm' });
            var url   = URL.createObjectURL(blob);
            var clip  = document.createElement('div');
            clip.className = 'voice-clip';
            var audio = document.createElement('audio');
            audio.controls = true;
            audio.src = url;
            clip.appendChild(audio);
            voiceClips.appendChild(clip);
            stream.getTracks().forEach(function (t) { t.stop(); });
          };
          mediaRecorder.start();
          isRecording = true;
          if (recordLabel) recordLabel.textContent = 'Stop Recording';
          recordBtn.classList.add('recording');
        }).catch(function () {
          alert('Microphone access was denied. Please allow access and try again.');
        });
      } else {
        if (mediaRecorder) mediaRecorder.stop();
        isRecording = false;
        if (recordLabel) recordLabel.textContent = 'Start Recording';
        recordBtn.classList.remove('recording');
      }
    });
  }

  /* ---- clear ---- */
  var clearBtn = trial.querySelector('.trial-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      textLayer.innerHTML = '';
      if (voiceClips) voiceClips.innerHTML = '';
      if (hint) hint.classList.remove('hidden');
    });
  }

})();
