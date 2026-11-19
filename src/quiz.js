function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class Quiz {
  constructor({ states, rounds = 10, timeLimit = 12, onChange, onTick, onAnswer, onFinish }) {
    this.pool = states;
    this.rounds = rounds;
    this.timeLimit = timeLimit;
    this.onChange = onChange;
    this.onTick = onTick;
    this.onAnswer = onAnswer;
    this.onFinish = onFinish;

    this.status = 'idle';
    this.mode = 'find';
    this.reset();
  }

  reset() {
    this.stopTimer();
    clearTimeout(this.advanceTimer);
    this.status = 'idle';
    this.queue = [];
    this.roundIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correct = 0;
    this.wrong = 0;
    this.results = [];
    this.current = null;
    this.answered = false;
    this.timeLeft = this.timeLimit * 1000;
    this.pendingAdvance = false;
    this.paused = false;
  }

  get isPlaying() {
    return this.status === 'playing';
  }

  get snapshot() {
    return {
      status: this.status,
      mode: this.mode,
      round: Math.min(this.roundIndex + 1, this.rounds),
      rounds: this.rounds,
      score: this.score,
      streak: this.streak,
      bestStreak: this.bestStreak,
      correct: this.correct,
      wrong: this.wrong,
      results: this.results,
      current: this.current,
      timeLeft: this.timeLeft,
      timeLimit: this.timeLimit,
      answered: this.answered
    };
  }

  start(mode = this.mode) {
    this.reset();
    this.mode = mode;
    this.queue = shuffle(this.pool).slice(0, this.rounds);
    this.status = 'playing';
    this.roundIndex = 0;
    this.current = this.queue[0];
    this.timeLeft = this.timeLimit * 1000;
    this.answered = false;
    this.emitChange();
    this.startTimer();
  }

  emitChange() {
    this.onChange?.(this.snapshot);
  }

  emitTick() {
    this.onTick?.({
      timeLeft: this.timeLeft,
      timeLimit: this.timeLimit,
      score: this.score,
      streak: this.streak,
      round: this.roundIndex + 1
    });
  }

  startTimer() {
    this.stopTimer();
    this.lastTick = performance.now();
    this.timer = setInterval(() => {
      if (this.status !== 'playing' || this.answered) return;
      const now = performance.now();
      this.timeLeft -= now - this.lastTick;
      this.lastTick = now;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.timeout();
      } else {
        this.emitTick();
      }
    }, 100);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  pause() {
    if (this.status !== 'playing') return;
    this.pausedFrom = this.timeLeft;
    this.stopTimer();
    this.paused = true;
    // Don't let a locked-in answer advance the quiz while the player is away.
    if (this.answered) {
      clearTimeout(this.advanceTimer);
      this.pendingAdvance = true;
    }
  }

  resume() {
    if (this.status !== 'playing' || !this.paused) return;
    this.paused = false;
    if (this.pendingAdvance) {
      this.pendingAdvance = false;
      this.scheduleNext(350);
      return;
    }
    this.timeLeft = this.pausedFrom;
    this.startTimer();
  }

  answer(fips) {
    if (this.status !== 'playing' || this.answered) return null;
    this.answered = true;
    this.stopTimer();

    const picked = this.pool.find((s) => s.fips === fips) || null;
    const target = this.current;
    const correct = picked?.fips === target.fips;
    let delta = 0;

    if (correct) {
      delta = 10 + Math.ceil(this.timeLeft / 1000) + this.streak * 2;
      this.score += delta;
      this.correct += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
    } else {
      this.wrong += 1;
      this.streak = 0;
    }

    this.results.push({ fips: target.fips, picked: picked?.fips || null, correct });
    this.emitChange();
    const result = { correct, picked, target, delta, timedOut: false };
    this.onAnswer?.(result);
    this.scheduleNext(correct ? 1150 : 1650);
    return result;
  }

  timeout() {
    if (this.status !== 'playing' || this.answered) return;
    this.answered = true;
    this.stopTimer();
    this.wrong += 1;
    this.streak = 0;
    this.results.push({ fips: this.current.fips, picked: null, correct: false });
    this.emitChange();
    this.onAnswer?.({ correct: false, picked: null, target: this.current, delta: 0, timedOut: true });
    this.scheduleNext(1750);
  }

  scheduleNext(delay) {
    clearTimeout(this.advanceTimer);
    this.advanceTimer = setTimeout(() => this.next(), delay);
  }

  next() {
    if (this.status !== 'playing') return;
    this.pendingAdvance = false;
    this.roundIndex += 1;
    if (this.roundIndex >= this.rounds) {
      this.finish();
      return;
    }
    this.current = this.queue[this.roundIndex];
    this.answered = false;
    this.timeLeft = this.timeLimit * 1000;
    this.paused = false;
    this.emitChange();
    this.startTimer();
  }

  finish() {
    this.stopTimer();
    clearTimeout(this.advanceTimer);
    this.status = 'over';
    this.emitChange();
    this.onFinish?.(this.snapshot);
  }

  abandon() {
    this.reset();
    this.onChange?.(this.snapshot);
  }
}
