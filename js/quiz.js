(function (root) {
  'use strict';
  var HakHero = root.HakHero = root.HakHero || {};

  function shuffle(list, rng) {
    var a = list.slice();
    var rand = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function createSession(levelId, rng) {
    var level = HakHero.LEVELS.filter(function (l) { return l.id === levelId; })[0];
    if (!level) throw new Error('Level tidak dikenal: ' + levelId);

    var bank = HakHero.QUESTIONS.filter(function (q) { return q.level === levelId; });
    if (bank.length === 0) throw new Error('Level ' + levelId + ' belum memiliki soal.');

    var items = shuffle(bank, rng).slice(0, 5).map(function (q) {
      var order = shuffle(q.options.map(function (_, i) { return i; }), rng);
      return {
        id: q.id,
        topic: q.topic,
        question: q.question,
        explanation: q.explanation,
        law: q.law || '',
        options: order.map(function (i) { return q.options[i]; }),
        answer: order.indexOf(q.answer)
      };
    });

    var currentIndex = 0;
    var userAnswers = new Array(items.length);

    return {
      level: level,
      items: items,
      getCurrentIndex: function () { return currentIndex; },
      getTotal: function () { return items.length; },
      getCurrentItem: function () { return items[currentIndex]; },
      
      submitAnswer: function (optionIndex) {
        if (userAnswers[currentIndex] !== undefined) {
          return { alreadyAnswered: true };
        }
        userAnswers[currentIndex] = optionIndex;
        var item = items[currentIndex];
        var isCorrect = (optionIndex === item.answer);

        return {
          isCorrect: isCorrect,
          correctAnswerIndex: item.answer,
          explanation: item.explanation,
          law: item.law
        };
      },

      nextQuestion: function () {
        if (currentIndex < items.length - 1) {
          currentIndex++;
          return true;
        }
        return false;
      },

      getResults: function () {
        var correctCount = 0;
        userAnswers.forEach(function (ans, idx) {
          if (ans === items[idx].answer) correctCount++;
        });

        var total = items.length;
        var score = correctCount * HakHero.POINTS_PER_CORRECT;
        var percentage = Math.round((correctCount / total) * 100);

        return {
          levelId: levelId,
          total: total,
          correct: correctCount,
          wrong: total - correctCount,
          score: score,
          percentage: percentage
        };
      }
    };
  }

  HakHero.Quiz = {
    createSession: createSession
  };
})(this);