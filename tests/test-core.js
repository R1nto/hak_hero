/*
 * test-core.js — Pengujian logika inti HAK HERO
 * Dijalankan dengan perintah: node tests/test-core.js
 */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var root = path.join(__dirname, '..');
var passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); passed++; console.log('   OK   ' + name); }
  catch (e) { failed++; console.log('  ❌ GAGAL ' + name + '\n        ' + e.message); }
}

function loadEnv(storage) {
  var store = {};
  var sandbox = {
    console: console,
    localStorage: storage || {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
      setItem: function (k, v) { store[k] = String(v); },
      removeItem: function (k) { delete store[k]; }
    },
    _store: store
  };
  vm.createContext(sandbox);
  ['data.js', 'progress.js', 'quiz.js'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', f), 'utf8'), sandbox, { filename: f });
  });
  return sandbox;
}

console.log('\n🔍 Pengujian Inti Logika & Data HAK HERO\n' + '='.repeat(40));

var env = loadEnv();
var HH = env.HakHero;

test('Integritas Level & Bank Soal', function () {
  assert.strictEqual(HH.LEVELS.length, 4, 'Harus ada 4 level');
  assert.strictEqual(HH.QUESTIONS.length, 20, 'Harus ada 20 total soal');
  [1, 2, 3, 4].forEach(function (lvl) {
    var qLvl = HH.QUESTIONS.filter(function (q) { return q.level === lvl; });
    assert.strictEqual(qLvl.length, 5, 'Level ' + lvl + ' harus memiliki 5 soal');
  });
});

test('Alur Kuis & Perhitungan Skor', function () {
  var session = HH.Quiz.createSession(1);
  assert.strictEqual(session.getTotal(), 5);
  var item = session.getCurrentItem();
  var res = session.submitAnswer(item.answer);
  assert.strictEqual(res.isCorrect, true);
  var results = session.getResults();
  assert.strictEqual(results.score, 10);
});

test('Penyimpanan Progres LocalStorage & Lencana', function () {
  var state = HH.Progress.recordResult(1, 50);
  assert.strictEqual(state.completed[1], true);
  assert.strictEqual(state.best[1], 50);
  assert.ok(state.badges.indexOf('pendidikan') !== -1);
  assert.ok(state.badges.indexOf('sempurna') !== -1);
});

console.log('\n' + '='.repeat(40));
console.log(' Ringkasan Uji Coba: ' + passed + ' Berhasil, ' + failed + ' Gagal.\n');