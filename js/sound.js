(function (root) {
  'use strict';
  var HakHero = root.HakHero = root.HakHero || {};

  var audioCtx = null;
  var soundEnabled = true;

  function getContext() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
    return audioCtx;
  }

  function playPop() {
    if (!soundEnabled) return;
    var ctx = getContext();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  function playCorrect() {
    if (!soundEnabled) return;
    var ctx = getContext();
    if (!ctx) return;
    var notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.18);
    });
  }

  function playWrong() {
    if (!soundEnabled) return;
    var ctx = getContext();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  function playFanfare() {
    if (!soundEnabled) return;
    var ctx = getContext();
    if (!ctx) return;
    var notes = [
      { f: 523.25, t: 0, d: 0.1 },
      { f: 659.25, t: 0.1, d: 0.1 },
      { f: 783.99, t: 0.2, d: 0.1 },
      { f: 1046.50, t: 0.3, d: 0.35 }
    ];
    notes.forEach(function (n) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d);
    });
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) playPop();
    return soundEnabled;
  }

  HakHero.Sound = {
    playPop: playPop,
    playCorrect: playCorrect,
    playWrong: playWrong,
    playFanfare: playFanfare,
    toggleSound: toggleSound
  };
})(typeof window !== 'undefined' ? window : globalThis);