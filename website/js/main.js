// ===== 步骤折叠/展开 =====
document.addEventListener('DOMContentLoaded', function() {
  // 步骤区域
  document.querySelectorAll('.step-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var step = this.closest('.step');
      step.classList.toggle('open');
    });
  });

  // 生词卡片折叠
  document.querySelectorAll('.vocab-header').forEach(function(header) {
    header.addEventListener('click', function(e) {
      // 如果点击的是音频按钮，不触发折叠
      if (e.target.closest('.vocab-audio-btn')) return;
      var card = this.closest('.vocab-card');
      card.classList.toggle('open');
    });
  });

  // 例句折叠
  document.querySelectorAll('.example-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function() {
      var item = this.closest('.example-item');
      item.classList.toggle('open');
    });
  });

  // 口头填空 - 点击显示/隐藏答案
  document.querySelectorAll('.blank').forEach(function(blank) {
    blank.addEventListener('click', function() {
      this.classList.toggle('revealed');
    });
  });

  // 默认展开第一个步骤
  var firstStep = document.querySelector('.step');
  if (firstStep) {
    firstStep.classList.add('open');
  }

  // ===== 韩语TTS工具函数 =====
  function getKoreanVoice() {
    var voices = window.speechSynthesis.getVoices();
    var koVoices = voices.filter(function(v) {
      return v.lang.indexOf('ko') === 0;
    });
    // 优先：名字中含 Yuna/Female/여 的女声
    var femaleVoice = koVoices.find(function(v) {
      var n = v.name.toLowerCase();
      return n.indexOf('yuna') >= 0 || n.indexOf('female') >= 0 || n.indexOf('여') >= 0;
    });
    if (!femaleVoice) {
      femaleVoice = koVoices.find(function(v) {
        return v.name.indexOf('Yuna') >= 0;
      });
    }
    return femaleVoice || koVoices[0] || null;
  }

  function speakKorean(text, rate, onStart, onEnd) {
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    utter.rate = rate || 1.0;
    utter.pitch = 1.05;
    var voice = getKoreanVoice();
    if (voice) utter.voice = voice;
    if (onStart) onStart();
    utter.onend = function() { if (onEnd) onEnd(); };
    utter.onerror = function() { if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utter);
  }

  // ===== 词汇音频按钮 (Step 3) =====
  document.querySelectorAll('.vocab-word').forEach(function(wordEl) {
    var krEl = wordEl.querySelector('.kr');
    if (!krEl) return;
    var krText = krEl.textContent.split('/')[0].trim(); // 取第一个词（如 "붓다 / 부어주다" → "붓다"）

    var btn = document.createElement('button');
    btn.className = 'vocab-audio-btn';
    btn.innerHTML = '&#9654;';
    btn.title = '发音';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // 重置所有词汇音频按钮
      document.querySelectorAll('.vocab-audio-btn').forEach(function(b) {
        b.classList.remove('playing');
        b.innerHTML = '&#9654;';
      });
      speakKorean(krText, 0.9,
        function() {
          btn.classList.add('playing');
          btn.innerHTML = '&#9632;';
        },
        function() {
          btn.classList.remove('playing');
          btn.innerHTML = '&#9654;';
        }
      );
    });
    wordEl.appendChild(btn);
  });

  // ===== 逐句跟读 (Step 4) =====
  var currentSpeed = 1.0;

  // 为每个句子项添加序号和音频控件
  document.querySelectorAll('.sentence-item').forEach(function(item, index) {
    var krEl = item.querySelector('.kr');
    var krText = krEl.textContent;

    // 添加序号
    var numSpan = document.createElement('span');
    numSpan.className = 'sentence-num';
    numSpan.textContent = (index + 1);
    krEl.insertBefore(numSpan, krEl.firstChild);

    // 添加音频控件
    var audioDiv = document.createElement('div');
    audioDiv.className = 'sentence-audio';

    // 播放按钮
    var playBtn = document.createElement('button');
    playBtn.className = 'btn-play';
    playBtn.innerHTML = '&#9654;';
    playBtn.title = '播放';
    audioDiv.appendChild(playBtn);

    // 倍速按钮组
    var speedGroup = document.createElement('div');
    speedGroup.className = 'speed-group';

    var speeds = [0.5, 0.75, 1, 1.25];
    speeds.forEach(function(spd) {
      var btn = document.createElement('button');
      btn.className = 'btn-speed' + (spd === 1 ? ' active' : '');
      btn.textContent = spd === 1 ? '1x' : spd + 'x';
      btn.dataset.speed = spd;
      btn.addEventListener('click', function() {
        speedGroup.querySelectorAll('.btn-speed').forEach(function(b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        currentSpeed = spd;
      });
      speedGroup.appendChild(btn);
    });

    audioDiv.appendChild(speedGroup);
    item.appendChild(audioDiv);

    // 播放点击事件
    playBtn.addEventListener('click', function() {
      // 重置所有状态
      document.querySelectorAll('.btn-play').forEach(function(b) {
        b.classList.remove('playing');
        b.innerHTML = '&#9654;';
      });
      document.querySelectorAll('.sentence-item').forEach(function(s) {
        s.classList.remove('active');
      });

      // 高亮当前句并滚动到可见
      item.classList.add('active');
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      speakKorean(krText, currentSpeed,
        function() {
          playBtn.classList.add('playing');
          playBtn.innerHTML = '&#9632;';
        },
        function() {
          playBtn.classList.remove('playing');
          playBtn.innerHTML = '&#9654;';
          item.classList.remove('active');
        }
      );
    });
  });

  // 预加载语音列表
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() {
      window.speechSynthesis.getVoices();
    };
  }
});
