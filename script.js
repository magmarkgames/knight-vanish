(() => {
  'use strict';

  const LEVELS = window.KNIGHT_VANISH_LEVELS || [];
  const STORAGE_KEY = 'knight-vanish-v0.1-unlocked';
  const $ = (id) => document.getElementById(id);
  const screens = {home: $('home-screen'), levels: $('levels-screen'), game: $('game-screen')};
  const board = $('board');

  let unlocked = 1;
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(saved) && saved >= 1) unlocked = Math.min(LEVELS.length + 1, saved);
  } catch (_) { /* Private Browsing: play without persistence. */ }

  let currentLevel = null;
  let position = null;
  let visited = new Set();
  let result = '';
  let activeFlight = null;
  let resultTimer = null;

  function knightMove(from, to, size) {
    const dx = Math.abs((from % size) - (to % size));
    const dy = Math.abs(Math.floor(from / size) - Math.floor(to / size));
    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
  }

  function legalDestinations() {
    if (!currentLevel) return [];
    return currentLevel.cells.filter(cell => {
      if (visited.has(cell) || !knightMove(position, cell, currentLevel.size)) return false;
      // Die Krone darf ausschließlich als letzte Plattform betreten werden.
      if (cell === currentLevel.goal && visited.size !== currentLevel.cells.length - 1) return false;
      return true;
    });
  }

  function saveProgress() {
    try { window.localStorage.setItem(STORAGE_KEY, String(unlocked)); } catch (_) { /* optional */ }
  }

  function showScreen(name) {
    cancelFlight();
    if (resultTimer !== null) { clearTimeout(resultTimer); resultTimer = null; }
    hideResult();
    Object.entries(screens).forEach(([key, element]) => { element.hidden = key !== name; });
    if (name === 'home') renderHome();
    if (name === 'levels') renderLevels();
    window.scrollTo(0, 0);
  }

  function renderHome() {
    const completed = Math.min(unlocked - 1, LEVELS.length);
    $('home-progress-number').textContent = `${completed} / ${LEVELS.length}`;
    $('home-progress-fill').style.width = `${completed / LEVELS.length * 100}%`;
    $('home-progress-message').textContent = completed === LEVELS.length
      ? 'Du hast alle 25 Level geschafft. Stark gespielt!'
      : `${LEVELS.length - completed} Level ${LEVELS.length - completed === 1 ? 'wartet' : 'warten'} noch auf dich.`;
    $('continue-button').innerHTML = completed === LEVELS.length
      ? 'Level erneut spielen <span aria-hidden="true">→</span>'
      : `Level ${Math.max(1, unlocked)} spielen <span aria-hidden="true">→</span>`;
  }

  function renderLevels() {
    const list = $('levels-list');
    list.replaceChildren();
    const chapterNames = ['Die ersten Sprünge', 'Neue Wege', 'Gut vorausdenken', 'Schwierige Pfade', 'Die letzte Prüfung'];
    LEVELS.forEach((level, index) => {
      if (index % 5 === 0) {
        const heading = document.createElement('h3');
        heading.className = 'chapter-label';
        heading.textContent = chapterNames[Math.floor(index / 5)];
        list.appendChild(heading);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'level-button';
      button.textContent = String(level.id).padStart(2, '0');
      const complete = level.id < unlocked;
      const locked = level.id > unlocked;
      if (complete) {
        button.classList.add('complete');
        const check = document.createElement('span');
        check.className = 'level-check';
        check.textContent = '✓';
        check.setAttribute('aria-hidden', 'true');
        button.appendChild(check);
      } else if (locked) {
        button.classList.add('locked');
        const lock = document.createElement('svg');
        lock.classList.add('level-lock');
        lock.innerHTML = '<rect width="14" height="11" x="5" y="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/>';
        lock.setAttribute('viewBox','0 0 24 24');
        lock.setAttribute('aria-hidden','true');
        button.appendChild(lock);
      } else {
        button.classList.add('current');
      }
      button.disabled = locked;
      button.setAttribute('aria-label', `Level ${level.id}${locked ? ', gesperrt' : complete ? ', abgeschlossen' : ', verfügbar'}`);
      if (!locked) button.addEventListener('click', () => startLevel(index));
      list.appendChild(button);
    });
  }

  const crownSVG = '<svg class="crown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true"><path d="m6 15 10 10 8-15 8 15 10-10-3.5 23h-29L6 15Z"/><path d="M10 41h28" stroke-linecap="round" stroke-width="3" fill="none"/><circle cx="6" cy="14" r="2.5"/><circle cx="24" cy="9" r="2.5"/><circle cx="42" cy="14" r="2.5"/></svg>';

  // Die Felder werden einmal pro Level angelegt. Bei einem Zug werden nur
  // ihre Zustände aktualisiert; keine Buttons werden während der Animation gesperrt.
  function buildBoard() {
    const size = currentLevel.size;
    const cells = new Set(currentLevel.cells);
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < size * size; i++) {
      const holder = document.createElement('div');
      holder.className = 'board-cell';
      if (cells.has(i)) {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'tile';
        tile.dataset.cell = String(i);
        const row = Math.floor(i / size) + 1, col = i % size + 1;
        tile.setAttribute('aria-label', `Plattform, Reihe ${row}, Spalte ${col}`);
        holder.appendChild(tile);
      }
      fragment.appendChild(holder);
    }
    board.replaceChildren(fragment);
    updateBoard();
    requestAnimationFrame(syncBoardSize);
  }

  function updateBoard() {
    if (!currentLevel) return;
    const reachable = new Set(result ? [] : legalDestinations());
    board.querySelectorAll('.tile').forEach(tile => {
      const i = Number(tile.dataset.cell);
      const gone = visited.has(i) && i !== position;
      const here = i === position;
      const goal = i === currentLevel.goal;
      const canJump = reachable.has(i);
      tile.classList.toggle('tile--blocked', gone);
      tile.classList.toggle('tile--goal', goal);
      tile.classList.toggle('tile--knight', here);
      tile.classList.toggle('tile--reachable', canJump);
      tile.disabled = !canJump || !!result;
      if (here) tile.innerHTML = '<span class="knight" aria-hidden="true">♞</span>';
      else if (goal && !gone) tile.innerHTML = crownSVG;
      else if (canJump) tile.innerHTML = '<span class="move-dot" aria-hidden="true"></span>';
      else tile.replaceChildren();
    });
  }

  // Das Spielfeld nutzt die komplette verfügbare Breite ODER Höhe.
  // Gerade bei 4x4-Leveln gibt es keine künstliche Größenbegrenzung mehr.
  function syncBoardSize() {
    const zone = $('board-zone');
    if (screens.game.hidden || !zone.clientWidth || !zone.clientHeight) return;
    const side = Math.max(100, Math.floor(Math.min(zone.clientWidth - 16, zone.clientHeight - 16, 750)));
    board.style.width = `${side}px`;
  }

  function cancelFlight() {
    if (!activeFlight) return;
    const flight = activeFlight;
    activeFlight = null;
    flight.animation?.cancel();
    flight.tileKnight.style.visibility = '';
    flight.element.remove();
  }

  function startLevel(index) {
    if (index < 0 || index >= LEVELS.length || index + 1 > unlocked) return;
    cancelFlight();
    currentLevel = LEVELS[index];
    position = currentLevel.start;
    visited = new Set([position]);
    result = '';
    $('level-number').textContent = String(currentLevel.id);
    showScreen('game');
    buildBoard();
  }

  function resetLevel() {
    if (!currentLevel) return;
    cancelFlight();
    if (resultTimer !== null) { clearTimeout(resultTimer); resultTimer = null; }
    position = currentLevel.start;
    visited = new Set([position]);
    result = '';
    hideResult();
    buildBoard();
  }

  function hideResult() { $('result-overlay').hidden = true; }

  function showResult(won) {
    result = won ? 'won' : 'lost';
    $('result-overlay').hidden = false;
    $('result-symbol').textContent = won ? '♛' : '♞';
    $('result-kicker').textContent = won ? 'LEVEL ABGESCHLOSSEN' : 'KEIN WEG MEHR';
    $('result-title').textContent = won ? 'Geschafft!' : 'Sackgasse!';
    $('result-description').textContent = won
      ? (currentLevel.id === LEVELS.length ? 'Alle 25 Level geschafft – du bist ein echter Springer-Profi!' : 'Alle Plattformen sind verschwunden. Du hast die Krone erreicht!')
      : 'Es gibt keinen gültigen Sprung mehr. Versuch es mit einem anderen Weg.';
    $('result-main').innerHTML = won
      ? (currentLevel.id === LEVELS.length ? 'Zur Levelübersicht <span aria-hidden="true">→</span>' : 'Nächstes Level <span aria-hidden="true">→</span>')
      : 'Erneut versuchen <span aria-hidden="true">↻</span>';
    $('result-secondary').textContent = 'Levelübersicht';
    $('result-main').focus();
  }

  function makeMove(next) {
    // Der Spielzustand wird SOFORT aktualisiert; die Grafik läuft parallel.
    // Dadurch lassen sich auch die letzten drei Plattformen schnell antippen.
    if (result || !legalDestinations().includes(next)) return;
    cancelFlight();
    const fromTile = board.querySelector(`[data-cell="${position}"]`);
    const toTile = board.querySelector(`[data-cell="${next}"]`);
    const a = fromTile?.getBoundingClientRect();
    const b = toTile?.getBoundingClientRect();
    const rect = board.getBoundingClientRect();

    position = next;
    visited.add(next);
    updateBoard();

    if (a && b && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const knight = toTile.querySelector('.knight');
      if (knight) {
        knight.style.visibility = 'hidden';
        const flying = document.createElement('div');
        flying.className = 'flying-knight';
        flying.innerHTML = '<span class="knight" aria-hidden="true">♞</span>';
        flying.style.width = `${a.width}px`;
        flying.style.height = `${a.height}px`;
        flying.style.left = `${a.left - rect.left}px`;
        flying.style.top = `${a.top - rect.top}px`;
        board.appendChild(flying);
        const dx = b.left - a.left;
        const dy = b.top - a.top;
        const animation = flying.animate([
          {transform: 'translate(0px, 0px) scale(1)', offset: 0},
          {transform: `translate(${dx / 2}px, ${dy / 2 - 12}px) scale(1.06)`, offset: .5},
          {transform: `translate(${dx}px, ${dy}px) scale(1)`, offset: 1}
        ], {duration: 140, easing: 'ease-out'});
        const flight = {element: flying, animation, tileKnight: knight};
        activeFlight = flight;
        animation.finished.catch(() => {}).then(() => {
          if (activeFlight !== flight) return;
          activeFlight = null;
          knight.style.visibility = '';
          flying.remove();
        });
      }
    }

    const won = visited.size === currentLevel.cells.length && next === currentLevel.goal;
    const stuck = !won && legalDestinations().length === 0;
    if (won && currentLevel.id === unlocked) {
      unlocked = Math.min(LEVELS.length + 1, unlocked + 1);
      saveProgress();
    }
    if (won || stuck) {
      // Nur die Ergebnisanzeige wartet kurz, niemals die Eingabe während des Spiels.
      result = won ? 'won' : 'lost';
      updateBoard();
      resultTimer = window.setTimeout(() => {
        resultTimer = null;
        showResult(won);
      }, 155);
    }
  }

  function resultPrimary() {
    if (result === 'lost') { resetLevel(); return; }
    if (result === 'won') {
      if (currentLevel.id < LEVELS.length) startLevel(currentLevel.id);
      else showScreen('levels');
    }
  }

  $('continue-button').addEventListener('click', () => startLevel(Math.min(unlocked, LEVELS.length) - 1));
  $('select-level-button').addEventListener('click', () => showScreen('levels'));
  $('levels-back').addEventListener('click', () => showScreen('home'));
  $('game-back').addEventListener('click', () => showScreen('levels'));
  $('restart-bottom').addEventListener('click', resetLevel);

  // pointerdown reagiert unmittelbar auf schnelle Touch-Folgen; Click bleibt
  // für Tastatur/Screenreader verfügbar (Enter/Leertaste, detail === 0).
  board.addEventListener('pointerdown', (event) => {
    const tile = event.target.closest('.tile');
    if (!tile || tile.disabled) return;
    event.preventDefault();
    makeMove(Number(tile.dataset.cell));
  });
  board.addEventListener('click', (event) => {
    if (event.detail !== 0) return;
    const tile = event.target.closest('.tile');
    if (!tile || tile.disabled) return;
    makeMove(Number(tile.dataset.cell));
  });

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncBoardSize).observe($('board-zone'));
  } else {
    window.addEventListener('resize', syncBoardSize);
  }
  $('result-main').addEventListener('click', resultPrimary);
  $('result-secondary').addEventListener('click', () => showScreen('levels'));

  renderHome();
})();
