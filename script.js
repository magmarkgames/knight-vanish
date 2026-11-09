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
  let busy = false;
  let result = '';

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

  function renderBoard() {
    if (!currentLevel) return;
    const size = currentLevel.size;
    const cells = new Set(currentLevel.cells);
    const reachable = new Set(result ? [] : legalDestinations());
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    // 4x4 und 5x5 dürfen auf großen Bildschirmen nicht unnötig riesig werden.
    board.style.maxWidth = `${Math.min(530, size * 77)}px`;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < size * size; i++) {
      const holder = document.createElement('div');
      holder.className = 'board-cell';
      if (!cells.has(i)) {
        fragment.appendChild(holder);
        continue;
      }
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.dataset.cell = String(i);
      const gone = visited.has(i) && i !== position;
      if (gone) tile.classList.add('tile--blocked');
      if (i === currentLevel.goal) tile.classList.add('tile--goal');
      if (i === position) tile.classList.add('tile--knight');
      if (reachable.has(i)) tile.classList.add('tile--reachable');
      if (i === position) tile.innerHTML = '<span class="knight" aria-hidden="true">♞</span>';
      else if (i === currentLevel.goal) tile.innerHTML = crownSVG;
      else if (reachable.has(i)) tile.innerHTML = '<span class="move-dot" aria-hidden="true"></span>';
      const row = Math.floor(i / size) + 1, col = i % size + 1;
      tile.setAttribute('aria-label', i === position ? `Springer, Reihe ${row}, Spalte ${col}` :
        gone ? `Verschwundene Plattform, Reihe ${row}, Spalte ${col}` :
        i === currentLevel.goal ? `Krone, Ziel, Reihe ${row}, Spalte ${col}` :
        `Plattform, Reihe ${row}, Spalte ${col}${reachable.has(i) ? ', erreichbarer Sprung' : ''}`);
      tile.disabled = !reachable.has(i) || busy || !!result;
      tile.addEventListener('click', () => makeMove(i));
      holder.appendChild(tile);
      fragment.appendChild(holder);
    }
    board.replaceChildren(fragment);
    const remaining = currentLevel.cells.length - visited.size;
    $('remaining-count').textContent = String(remaining);
    $('game-tip').textContent = remaining === 0 ? 'Alle Plattformen geschafft.' :
      remaining === 1 ? 'Nur noch die Krone!' : 'Tippe auf einen markierten Sprung.';
  }

  function startLevel(index) {
    if (index < 0 || index >= LEVELS.length || index + 1 > unlocked) return;
    currentLevel = LEVELS[index];
    position = currentLevel.start;
    visited = new Set([position]);
    busy = false;
    result = '';
    $('level-number').textContent = String(currentLevel.id).padStart(2,'0');
    showScreen('game');
    renderBoard();
  }

  function resetLevel() {
    if (!currentLevel || busy) return;
    position = currentLevel.start;
    visited = new Set([position]);
    result = '';
    hideResult();
    renderBoard();
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

  function finishMove(next) {
    position = next;
    visited.add(next);
    busy = false;
    renderBoard();
    if (visited.size === currentLevel.cells.length && next === currentLevel.goal) {
      if (currentLevel.id === unlocked) {
        unlocked = Math.min(LEVELS.length + 1, unlocked + 1);
        saveProgress();
      }
      showResult(true);
    } else if (legalDestinations().length === 0) {
      showResult(false);
    }
  }

  function makeMove(next) {
    if (busy || result || !legalDestinations().includes(next)) return;
    busy = true;
    const sourceTile = board.querySelector(`[data-cell="${position}"]`);
    const destTile = board.querySelector(`[data-cell="${next}"]`);
    if (!sourceTile || !destTile) { finishMove(next); return; }
    const a = sourceTile.getBoundingClientRect();
    const b = destTile.getBoundingClientRect();
    const r = board.getBoundingClientRect();
    const flying = document.createElement('div');
    flying.className = 'flying-knight';
    flying.innerHTML = '<span class="knight" aria-hidden="true">♞</span>';
    flying.style.width = `${a.width}px`;
    flying.style.height = `${a.height}px`;
    flying.style.left = `${a.left - r.left}px`;
    flying.style.top = `${a.top - r.top}px`;
    board.appendChild(flying);
    sourceTile.querySelector('.knight')?.classList.add('knight--hidden');
    sourceTile.classList.add('tile--vanish');
    const dx = b.left - a.left;
    const dy = b.top - a.top;
    // Dekorative Animation. Die Spielzustände ändern sich erst nach der Landung.
    const animation = flying.animate([
      {transform:'translate(0px,0px) scale(1)',offset:0},
      {transform:`translate(${dx / 2}px,${dy / 2 - 22}px) scale(1.08)`,offset:.5},
      {transform:`translate(${dx}px,${dy}px) scale(1)`,offset:1}
    ], {duration:340,easing:'ease-in-out'});
    animation.finished.catch(() => {}).then(() => {
      flying.remove();
      finishMove(next);
    });
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
  $('game-back').addEventListener('click', () => { if (!busy) showScreen('levels'); });
  $('restart-button').addEventListener('click', resetLevel);
  $('restart-bottom').addEventListener('click', resetLevel);
  $('result-main').addEventListener('click', resultPrimary);
  $('result-secondary').addEventListener('click', () => showScreen('levels'));

  renderHome();
})();
