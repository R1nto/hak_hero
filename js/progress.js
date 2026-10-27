(function (root) {
  'use strict';
  var HakHero = root.HakHero = root.HakHero || {};

  var memoryStore = {};
  var useMemory = false;

  function readRaw() {
    if (!useMemory) {
      try { return root.localStorage.getItem(HakHero.STORAGE_KEY); }
      catch (e) { useMemory = true; }
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, HakHero.STORAGE_KEY) ? memoryStore[HakHero.STORAGE_KEY] : null;
  }

  function writeRaw(text) {
    if (!useMemory) {
      try { root.localStorage.setItem(HakHero.STORAGE_KEY, text); return; }
      catch (e) { useMemory = true; }
    }
    memoryStore[HakHero.STORAGE_KEY] = text;
  }

  function removeRaw() {
    if (!useMemory) {
      try { root.localStorage.removeItem(HakHero.STORAGE_KEY); }
      catch (e) { useMemory = true; }
    }
    delete memoryStore[HakHero.STORAGE_KEY];
  }

  function emptyState() {
    return { version: 1, completed: {}, best: {}, badges: [] };
  }

  function sanitize(data) {
    if (!data || typeof data !== 'object') return emptyState();
    var clean = emptyState();
    
    if (data.completed && typeof data.completed === 'object') {
      [1, 2, 3, 4].forEach(function (id) {
        if (data.completed[id] === true) clean.completed[id] = true;
      });
    }

    if (data.best && typeof data.best === 'object') {
      [1, 2, 3, 4].forEach(function (id) {
        var val = Number(data.best[id]);
        if (!isNaN(val) && val >= 0 && val <= 50) clean.best[id] = val;
      });
    }

    if (Array.isArray(data.badges)) {
      var validIds = HakHero.BADGES.map(function (b) { return b.id; });
      clean.badges = data.badges.filter(function (bId) {
        return validIds.indexOf(bId) !== -1;
      });
    }

    return clean;
  }

  var Progress = HakHero.Progress = {
    load: function () {
      var raw = readRaw();
      if (!raw) return emptyState();
      try {
        var parsed = JSON.parse(raw);
        return sanitize(parsed);
      } catch (e) {
        return emptyState();
      }
    },

    save: function (state) {
      var clean = sanitize(state);
      writeRaw(JSON.stringify(clean));
      return clean;
    },

    reset: function () {
      removeRaw();
      return emptyState();
    },

    isUnlocked: function (levelId, state) {
      if (levelId === 1) return true;
      return state.completed[levelId - 1] === true;
    },

    evaluateBadges: function (state) {
      var badges = state.badges.slice();
      
      // Kriteria lencana per level
      if (state.best[1] >= 40 && badges.indexOf('pendidikan') === -1) badges.push('pendidikan');
      if (state.best[2] >= 40 && badges.indexOf('detektif') === -1) badges.push('detektif');
      if (state.best[3] >= 40 && badges.indexOf('kerukunan') === -1) badges.push('kerukunan');
      if (state.best[4] >= 40 && badges.indexOf('konstitusi') === -1) badges.push('konstitusi');

      // Sempurna (50 poin)
      var maxed = [1, 2, 3, 4].some(function (id) { return state.best[id] === 50; });
      if (maxed && badges.indexOf('sempurna') === -1) badges.push('sempurna');

      state.badges = badges;
      return state;
    },

    recordResult: function (levelId, score) {
      var state = Progress.load();
      state.completed[levelId] = true;

      var currentBest = state.best[levelId] || 0;
      if (score > currentBest) {
        state.best[levelId] = score;
      }

      Progress.evaluateBadges(state);
      Progress.save(state);
      return state;
    }
  };
})(this);