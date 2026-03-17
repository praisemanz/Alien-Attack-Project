// ============================================================
//  ALIEN ATTACK — Full Web Game
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Logical resolution (scaled to fit screen)
const W = 800;
const H = 600;
canvas.width = W;
canvas.height = H;

// ============================================================
//  CONFIGURATION
// ============================================================

const LEVELS = [
  { name:'First Contact',   rows:2, cols:5,  speed:0.6,  shootRate:0.003, dropChance:0.08, alienTypes:['basic'] },
  { name:'Escalation',      rows:2, cols:6,  speed:0.8,  shootRate:0.004, dropChance:0.10, alienTypes:['basic'] },
  { name:'Reinforcements',  rows:3, cols:6,  speed:0.9,  shootRate:0.005, dropChance:0.10, alienTypes:['basic','fast'] },
  { name:'The Swarm',       rows:3, cols:7,  speed:1.0,  shootRate:0.006, dropChance:0.12, alienTypes:['basic','fast'] },
  { name:'Commander',       rows:3, cols:7,  speed:1.1,  shootRate:0.007, dropChance:0.12, alienTypes:['basic','fast','tank'], boss:true },
  { name:'Dark Skies',      rows:4, cols:7,  speed:1.2,  shootRate:0.008, dropChance:0.14, alienTypes:['basic','fast','tank'] },
  { name:'No Mercy',        rows:4, cols:8,  speed:1.35, shootRate:0.009, dropChance:0.14, alienTypes:['fast','tank','elite'] },
  { name:'Onslaught',       rows:4, cols:8,  speed:1.5,  shootRate:0.010, dropChance:0.16, alienTypes:['fast','tank','elite'] },
  { name:'Last Stand',      rows:5, cols:8,  speed:1.6,  shootRate:0.012, dropChance:0.16, alienTypes:['tank','elite'], boss:true },
  { name:'Extinction',      rows:5, cols:9,  speed:1.8,  shootRate:0.014, dropChance:0.18, alienTypes:['fast','tank','elite'], boss:true },
];

const ALIEN_INFO = {
  basic: { hp:1, color:'#33ff66', score:10,  size:30, glyph:'👾' },
  fast:  { hp:1, color:'#3399ff', score:20,  size:28, glyph:'👽' },
  tank:  { hp:3, color:'#ff4444', score:30,  size:34, glyph:'🛸' },
  elite: { hp:2, color:'#cc66ff', score:50,  size:32, glyph:'💀' },
  boss:  { hp:20, color:'#ff9900', score:500, size:60, glyph:'🛸' },
};

const POWERUP_TYPES = [
  { type:'shield',  color:'#3399ff', glyph:'🛡️', duration:8000 },
  { type:'rapid',   color:'#ffcc00', glyph:'⚡',  duration:8000 },
  { type:'triple',  color:'#33cc66', glyph:'🔱',  duration:8000 },
  { type:'life',    color:'#ff3366', glyph:'❤️',  duration:0 },
];

const SHIP_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_BULLET_SPEED = 3;
const ALIEN_STEP_DOWN = 18;
const MAX_LIVES = 5;
const START_LIVES = 3;
const SHOOT_COOLDOWN = 250;
const RAPID_COOLDOWN = 100;

// ============================================================
//  STATE
// ============================================================

const State = { MENU:'menu', PLAYING:'playing', PAUSED:'paused', LEVEL_COMPLETE:'levelComplete', GAME_OVER:'gameOver', VICTORY:'victory' };

const keys = {};
let game;

// ============================================================
//  UTILITIES
// ============================================================

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function lerp(a, b, t) { return a + (b - a) * t; }

function loadHighScore() {
  try { return parseInt(localStorage.getItem('alienAttackHi')) || 0; } catch { return 0; }
}
function saveHighScore(s) {
  try { localStorage.setItem('alienAttackHi', s); } catch {}
}

// ============================================================
//  PARTICLE SYSTEM
// ============================================================

class Particle {
  constructor(x, y, vx, vy, life, color, size) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.color = color; this.size = size;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 0.05 * dt; // gravity
    this.life -= dt;
  }
  draw(ctx) {
    const alpha = clamp(this.life / this.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    const s = this.size * alpha;
    ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
    ctx.globalAlpha = 1;
  }
  get dead() { return this.life <= 0; }
}

class ParticleSystem {
  constructor() { this.particles = []; }

  emit(x, y, count, color, opts = {}) {
    const { spread = 3, life = 40, size = 4 } = opts;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        x, y,
        rand(-spread, spread), rand(-spread, spread),
        rand(life * 0.5, life),
        color, rand(size * 0.5, size)
      ));
    }
  }

  explosion(x, y, color) {
    this.emit(x, y, 30, color, { spread: 4, life: 50, size: 5 });
    this.emit(x, y, 10, '#fff', { spread: 2, life: 20, size: 3 });
  }

  bigExplosion(x, y, color) {
    this.emit(x, y, 60, color, { spread: 6, life: 70, size: 7 });
    this.emit(x, y, 30, '#fff', { spread: 4, life: 40, size: 4 });
    this.emit(x, y, 15, '#ffcc00', { spread: 5, life: 55, size: 5 });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.particles) p.draw(ctx);
  }
}

// ============================================================
//  STARFIELD BACKGROUND
// ============================================================

class Starfield {
  constructor() {
    this.layers = [
      this._makeLayer(60, 0.3, 1),
      this._makeLayer(30, 0.6, 1.5),
      this._makeLayer(15, 1.0, 2.5),
    ];
  }
  _makeLayer(count, speed, size) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({ x: rand(0, W), y: rand(0, H), speed, size: rand(size * 0.5, size) });
    }
    return stars;
  }
  update(dt) {
    for (const layer of this.layers) {
      for (const s of layer) {
        s.y += s.speed * dt;
        if (s.y > H) { s.y = 0; s.x = rand(0, W); }
      }
    }
  }
  draw(ctx) {
    for (const layer of this.layers) {
      for (const s of layer) {
        const alpha = 0.3 + s.speed * 0.6;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ============================================================
//  PLAYER SHIP
// ============================================================

class Ship {
  constructor() { this.reset(); }
  reset() {
    this.w = 40; this.h = 30;
    this.x = W / 2 - this.w / 2;
    this.y = H - 60;
    this.shieldTimer = 0;
    this.rapidTimer = 0;
    this.tripleTimer = 0;
    this.lastShot = 0;
    this.invincibleTimer = 0;
    this.visible = true;
    this.blinkTimer = 0;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get hitbox() { return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 8 }; }
  get isShielded() { return this.shieldTimer > 0; }
  get isRapid() { return this.rapidTimer > 0; }
  get isTriple() { return this.tripleTimer > 0; }
  get isInvincible() { return this.invincibleTimer > 0; }

  update(dt) {
    if (keys['ArrowLeft'] || keys['a'])  this.x -= SHIP_SPEED * dt;
    if (keys['ArrowRight'] || keys['d']) this.x += SHIP_SPEED * dt;
    this.x = clamp(this.x, 0, W - this.w);

    if (this.shieldTimer > 0) this.shieldTimer -= 16.67;
    if (this.rapidTimer > 0) this.rapidTimer -= 16.67;
    if (this.tripleTimer > 0) this.tripleTimer -= 16.67;
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= 16.67;
      this.blinkTimer += dt;
      this.visible = Math.floor(this.blinkTimer / 4) % 2 === 0;
    } else {
      this.visible = true;
      this.blinkTimer = 0;
    }
  }

  draw(ctx) {
    if (!this.visible) return;

    ctx.save();
    const cx = this.cx;
    const cy = this.cy;

    // Ship body
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();
    ctx.moveTo(cx, this.y);
    ctx.lineTo(this.x, this.y + this.h);
    ctx.lineTo(this.x + this.w, this.y + this.h);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#006655';
    ctx.beginPath();
    ctx.moveTo(cx, this.y + 8);
    ctx.lineTo(cx - 8, this.y + this.h - 4);
    ctx.lineTo(cx + 8, this.y + this.h - 4);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(cx - 6, this.y + this.h - 2, 12, 4 + rand(0, 4));

    // Shield bubble
    if (this.isShielded) {
      ctx.strokeStyle = 'rgba(51,153,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(51,153,255,0.1)';
      ctx.fill();
    }

    ctx.restore();
  }

  canShoot(now) {
    const cd = this.isRapid ? RAPID_COOLDOWN : SHOOT_COOLDOWN;
    return now - this.lastShot >= cd;
  }
}

// ============================================================
//  BULLETS
// ============================================================

class Bullet {
  constructor(x, y, vy, isPlayer, angle = 0) {
    this.w = isPlayer ? 4 : 5;
    this.h = isPlayer ? 12 : 10;
    this.x = x - this.w / 2;
    this.y = y;
    this.vy = vy;
    this.vx = Math.sin(angle) * Math.abs(vy) * 0.3;
    this.isPlayer = isPlayer;
    this.alive = true;
  }
  get hitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  update(dt) {
    this.y += this.vy * dt;
    this.x += this.vx * dt;
    if (this.y < -20 || this.y > H + 20 || this.x < -20 || this.x > W + 20) this.alive = false;
  }
  draw(ctx) {
    if (this.isPlayer) {
      ctx.fillStyle = '#00ffcc';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 8;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 6;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.shadowBlur = 0;
    }
  }
}

// ============================================================
//  ALIENS
// ============================================================

class Alien {
  constructor(x, y, type) {
    const info = ALIEN_INFO[type];
    this.type = type;
    this.x = x; this.y = y;
    this.w = info.size; this.h = info.size;
    this.hp = info.hp;
    this.maxHp = info.hp;
    this.color = info.color;
    this.score = info.score;
    this.glyph = info.glyph;
    this.alive = true;
    this.flashTimer = 0;
    this.wobble = rand(0, Math.PI * 2);
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get hitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  hit(dmg = 1) {
    this.hp -= dmg;
    this.flashTimer = 8;
    if (this.hp <= 0) this.alive = false;
    return !this.alive;
  }

  update(dt) {
    this.wobble += 0.05 * dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
  }

  draw(ctx) {
    ctx.save();

    if (this.flashTimer > 0) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.color;
    }

    const yOff = Math.sin(this.wobble) * 2;

    ctx.font = `${this.w}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.glyph, this.cx, this.cy + yOff);

    // HP bar for multi-hit aliens
    if (this.maxHp > 1) {
      const barW = this.w;
      const barH = 3;
      const bx = this.x;
      const by = this.y + this.h + 2;
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = this.hp / this.maxHp > 0.5 ? '#33ff66' : (this.hp / this.maxHp > 0.25 ? '#ffcc00' : '#ff4444');
      ctx.fillRect(bx, by, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }
}

// ============================================================
//  BOSS ALIEN
// ============================================================

class BossAlien extends Alien {
  constructor(x, y, level) {
    super(x, y, 'boss');
    this.hp = 15 + level * 5;
    this.maxHp = this.hp;
    this.w = 60; this.h = 50;
    this.score = 300 + level * 100;
    this.phase = 0;
    this.moveTimer = 0;
    this.shootTimer = 0;
    this.baseX = x;
    this.entered = false;
    this.targetY = 60;
    this.entryY = -80;
    this.y = this.entryY;
  }

  update(dt) {
    super.update(dt);
    if (!this.entered) {
      this.y = lerp(this.y, this.targetY, 0.03 * dt);
      if (Math.abs(this.y - this.targetY) < 2) { this.y = this.targetY; this.entered = true; }
      return;
    }
    this.moveTimer += 0.02 * dt;
    this.x = this.baseX + Math.sin(this.moveTimer) * 200;
    this.x = clamp(this.x, 10, W - this.w - 10);
  }

  draw(ctx) {
    ctx.save();

    if (this.flashTimer > 0) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.color;
    }

    // Boss body
    ctx.font = `${this.w}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛸', this.cx, this.cy);

    // HP bar
    const barW = 80;
    const barH = 6;
    const bx = this.cx - barW / 2;
    const by = this.y - 14;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(bx, by, barW, barH);
    const ratio = this.hp / this.maxHp;
    ctx.fillStyle = ratio > 0.5 ? '#33ff66' : (ratio > 0.25 ? '#ffcc00' : '#ff4444');
    ctx.fillRect(bx, by, barW * ratio, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(bx, by, barW, barH);

    ctx.restore();
  }
}

// ============================================================
//  POWER-UPS
// ============================================================

class PowerUp {
  constructor(x, y) {
    const info = POWERUP_TYPES[randInt(0, POWERUP_TYPES.length - 1)];
    this.type = info.type;
    this.color = info.color;
    this.glyph = info.glyph;
    this.duration = info.duration;
    this.x = x; this.y = y;
    this.w = 22; this.h = 22;
    this.vy = 1.5;
    this.alive = true;
    this.time = 0;
  }
  get hitbox() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  update(dt) {
    this.y += this.vy * dt;
    this.time += dt;
    if (this.y > H + 30) this.alive = false;
  }

  draw(ctx) {
    ctx.save();
    const pulse = 1 + Math.sin(this.time * 0.15) * 0.15;

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 14 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.glyph, this.x + this.w / 2, this.y + this.h / 2);

    ctx.restore();
  }
}

// ============================================================
//  SCREEN EFFECTS
// ============================================================

class ScreenEffects {
  constructor() {
    this.shakeIntensity = 0;
    this.flashAlpha = 0;
    this.flashColor = '#fff';
  }
  shake(intensity = 5) { this.shakeIntensity = intensity; }
  flash(color = '#fff', alpha = 0.3) { this.flashColor = color; this.flashAlpha = alpha; }

  update(dt) {
    this.shakeIntensity *= 0.9;
    if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;
    this.flashAlpha *= 0.92;
    if (this.flashAlpha < 0.01) this.flashAlpha = 0;
  }

  applyShake(ctx) {
    if (this.shakeIntensity > 0) {
      ctx.translate(rand(-this.shakeIntensity, this.shakeIntensity), rand(-this.shakeIntensity, this.shakeIntensity));
    }
  }

  drawFlash(ctx) {
    if (this.flashAlpha > 0) {
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
}

// ============================================================
//  MAIN GAME
// ============================================================

class Game {
  constructor() {
    this.state = State.MENU;
    this.starfield = new Starfield();
    this.particles = new ParticleSystem();
    this.effects = new ScreenEffects();
    this.highScore = loadHighScore();
    this.reset();
    this._setupUI();
    this._updateHighScoreUI();
  }

  reset() {
    this.ship = new Ship();
    this.bullets = [];
    this.alienBullets = [];
    this.aliens = [];
    this.powerups = [];
    this.boss = null;
    this.lives = START_LIVES;
    this.score = 0;
    this.level = 0;
    this.totalAliensKilled = 0;
    this.levelAliensKilled = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.levelStartTime = 0;
    this.alienDir = 1;
    this.alienMoveTimer = 0;
    this.levelAnnouncementTimer = 0;
    this.levelAnnouncementText = '';
  }

  // ---- UI wiring ----
  _setupUI() {
    const $ = id => document.getElementById(id);
    $('btn-start').onclick = () => this.startGame();
    $('btn-controls').onclick = () => { $('menu-overlay').classList.add('hidden'); $('controls-overlay').classList.remove('hidden'); };
    $('btn-back').onclick = () => { $('controls-overlay').classList.add('hidden'); $('menu-overlay').classList.remove('hidden'); };
    $('btn-resume').onclick = () => this.resume();
    $('btn-quit').onclick = () => this.quitToMenu();
    $('btn-next-level').onclick = () => this.nextLevel();
    $('btn-restart').onclick = () => this.startGame();
    $('btn-menu').onclick = () => this.quitToMenu();
    $('btn-victory-restart').onclick = () => this.startGame();
    $('btn-victory-menu').onclick = () => this.quitToMenu();
  }

  _hideAllOverlays() {
    for (const id of ['menu-overlay','controls-overlay','pause-overlay','level-complete-overlay','gameover-overlay','victory-overlay']) {
      document.getElementById(id).classList.add('hidden');
    }
  }

  _showOverlay(id) {
    this._hideAllOverlays();
    document.getElementById(id).classList.remove('hidden');
  }

  _updateHighScoreUI() {
    document.getElementById('menu-hs-value').textContent = this.highScore;
    document.getElementById('highscore-value').textContent = this.highScore;
  }

  _updateHeartsUI() {
    const container = document.getElementById('hearts-display');
    let html = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      html += i < this.lives ? '<span style="filter: none;">❤️</span>' : '<span style="filter: grayscale(1) opacity(0.3);">❤️</span>';
    }
    container.innerHTML = html;
  }

  _updatePowerupUI() {
    const parts = [];
    if (this.ship.isShielded) parts.push('SHIELD');
    if (this.ship.isRapid) parts.push('RAPID');
    if (this.ship.isTriple) parts.push('TRIPLE');
    document.getElementById('powerup-indicator').textContent = parts.join(' | ');
  }

  // ---- Game flow ----
  startGame() {
    this.reset();
    this.state = State.PLAYING;
    this._hideAllOverlays();
    document.getElementById('hud').classList.add('visible');
    this._updateHeartsUI();
    this.loadLevel(0);
  }

  loadLevel(idx) {
    this.level = idx;
    const cfg = LEVELS[idx];
    this.aliens = [];
    this.alienBullets = [];
    this.powerups = [];
    this.bullets = [];
    this.boss = null;
    this.alienDir = 1;
    this.alienMoveTimer = 0;
    this.levelAliensKilled = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.levelStartTime = performance.now();

    document.getElementById('level-value').textContent = idx + 1;

    // Create alien grid
    const spacing = 50;
    const startX = (W - cfg.cols * spacing) / 2 + spacing / 2;
    const startY = cfg.boss ? 120 : 60;

    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const typeIdx = (r * cfg.cols + c) % cfg.alienTypes.length;
        const type = cfg.alienTypes[typeIdx];
        const info = ALIEN_INFO[type];
        const ax = startX + c * spacing - info.size / 2;
        const ay = startY + r * spacing - info.size / 2;
        this.aliens.push(new Alien(ax, ay, type));
      }
    }

    // Boss
    if (cfg.boss) {
      this.boss = new BossAlien(W / 2 - 30, -80, idx);
    }

    // Level announcement
    this.levelAnnouncementText = `LEVEL ${idx + 1}: ${cfg.name.toUpperCase()}`;
    this.levelAnnouncementTimer = 120;

    this.ship.reset();
  }

  nextLevel() {
    if (this.level + 1 >= LEVELS.length) {
      this.victory();
      return;
    }
    this.state = State.PLAYING;
    this._hideAllOverlays();
    this.loadLevel(this.level + 1);
  }

  pause() {
    if (this.state !== State.PLAYING) return;
    this.state = State.PAUSED;
    this._showOverlay('pause-overlay');
  }

  resume() {
    this.state = State.PLAYING;
    this._hideAllOverlays();
  }

  quitToMenu() {
    this.state = State.MENU;
    document.getElementById('hud').classList.remove('visible');
    this._showOverlay('menu-overlay');
    this._updateHighScoreUI();
  }

  levelComplete() {
    this.state = State.LEVEL_COMPLETE;
    const elapsed = (performance.now() - this.levelStartTime) / 1000;
    const timeBonus = Math.max(0, Math.floor(3000 - elapsed * 50));
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
    const levelScore = this.levelAliensKilled * 10 + timeBonus;
    this.score += timeBonus;

    document.getElementById('lc-aliens').textContent = this.levelAliensKilled;
    document.getElementById('lc-accuracy').textContent = accuracy + '%';
    document.getElementById('lc-time-bonus').textContent = timeBonus;
    document.getElementById('lc-score').textContent = levelScore;

    if (this.level + 1 >= LEVELS.length) {
      document.getElementById('level-complete-title').textContent = 'ALL LEVELS CLEARED!';
    } else {
      document.getElementById('level-complete-title').textContent = 'LEVEL COMPLETE';
    }

    this._showOverlay('level-complete-overlay');
    this._checkHighScore();
  }

  gameOver() {
    this.state = State.GAME_OVER;
    document.getElementById('hud').classList.remove('visible');
    document.getElementById('go-score').textContent = this.score;
    document.getElementById('go-level').textContent = this.level + 1;
    document.getElementById('go-aliens').textContent = this.totalAliensKilled;

    const isNew = this._checkHighScore();
    document.getElementById('new-highscore').classList.toggle('hidden', !isNew);
    this._showOverlay('gameover-overlay');
  }

  victory() {
    this.state = State.VICTORY;
    document.getElementById('hud').classList.remove('visible');
    document.getElementById('v-score').textContent = this.score;
    document.getElementById('v-aliens').textContent = this.totalAliensKilled;
    this._checkHighScore();
    this._showOverlay('victory-overlay');
  }

  _checkHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveHighScore(this.highScore);
      this._updateHighScoreUI();
      return true;
    }
    return false;
  }

  // ---- Shooting ----
  playerShoot() {
    const now = performance.now();
    if (!this.ship.canShoot(now)) return;
    this.ship.lastShot = now;
    this.shotsFired++;

    if (this.ship.isTriple) {
      this.bullets.push(new Bullet(this.ship.cx, this.ship.y, -BULLET_SPEED, true, -0.3));
      this.bullets.push(new Bullet(this.ship.cx, this.ship.y, -BULLET_SPEED, true, 0));
      this.bullets.push(new Bullet(this.ship.cx, this.ship.y, -BULLET_SPEED, true, 0.3));
    } else {
      this.bullets.push(new Bullet(this.ship.cx, this.ship.y, -BULLET_SPEED, true));
    }
  }

  alienShoot(alien) {
    const cfg = LEVELS[this.level];
    const speed = ALIEN_BULLET_SPEED + cfg.speed * 0.5;
    this.alienBullets.push(new Bullet(alien.cx, alien.y + alien.h, speed, false));
  }

  bossShoot() {
    if (!this.boss || !this.boss.entered) return;
    const speed = ALIEN_BULLET_SPEED + 1;
    // Boss fires a spread pattern
    this.alienBullets.push(new Bullet(this.boss.cx, this.boss.y + this.boss.h, speed, false, -0.4));
    this.alienBullets.push(new Bullet(this.boss.cx, this.boss.y + this.boss.h, speed, false, 0));
    this.alienBullets.push(new Bullet(this.boss.cx, this.boss.y + this.boss.h, speed, false, 0.4));
  }

  // ---- Power-up handling ----
  spawnPowerup(x, y) {
    this.powerups.push(new PowerUp(x, y));
  }

  collectPowerup(pu) {
    switch (pu.type) {
      case 'shield': this.ship.shieldTimer = pu.duration; break;
      case 'rapid':  this.ship.rapidTimer = pu.duration; break;
      case 'triple': this.ship.tripleTimer = pu.duration; break;
      case 'life':
        if (this.lives < MAX_LIVES) {
          this.lives++;
          this._updateHeartsUI();
        }
        break;
    }
    this.particles.emit(pu.x + pu.w / 2, pu.y + pu.h / 2, 15, pu.color, { spread: 3, life: 30, size: 4 });
  }

  // ---- Hit / damage ----
  hitShip() {
    if (this.ship.isInvincible) return;
    if (this.ship.isShielded) {
      this.ship.shieldTimer = 0;
      this.effects.flash('#3399ff', 0.2);
      this.effects.shake(3);
      return;
    }
    this.lives--;
    this._updateHeartsUI();
    this.effects.shake(8);
    this.effects.flash('#ff3366', 0.3);
    this.particles.explosion(this.ship.cx, this.ship.cy, '#ff3366');
    this.ship.invincibleTimer = 2000;

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  killAlien(alien, bullet) {
    this.shotsHit++;
    this.levelAliensKilled++;
    this.totalAliensKilled++;
    this.score += alien.score;
    document.getElementById('score-value').textContent = this.score;
    this.particles.explosion(alien.cx, alien.cy, alien.color);
    this.effects.shake(2);

    const cfg = LEVELS[this.level];
    if (Math.random() < cfg.dropChance) {
      this.spawnPowerup(alien.cx - 11, alien.cy - 11);
    }
  }

  // ---- Main update ----
  update(dt) {
    this.starfield.update(dt);

    if (this.state !== State.PLAYING) return;

    const cfg = LEVELS[this.level];

    // Level announcement
    if (this.levelAnnouncementTimer > 0) this.levelAnnouncementTimer -= dt;

    // Ship
    this.ship.update(dt);
    if (keys[' '] || keys['ArrowUp']) this.playerShoot();

    // Player bullets
    for (const b of this.bullets) b.update(dt);
    this.bullets = this.bullets.filter(b => b.alive);

    // Alien bullets
    for (const b of this.alienBullets) b.update(dt);
    this.alienBullets = this.alienBullets.filter(b => b.alive);

    // Aliens update & movement
    this.alienMoveTimer += dt;
    const moveInterval = Math.max(8, 30 - cfg.speed * 5);

    if (this.alienMoveTimer >= moveInterval) {
      this.alienMoveTimer = 0;
      let hitEdge = false;

      for (const a of this.aliens) {
        if (this.alienDir > 0 && a.x + a.w + cfg.speed * 3 >= W - 10) hitEdge = true;
        if (this.alienDir < 0 && a.x - cfg.speed * 3 <= 10) hitEdge = true;
      }

      for (const a of this.aliens) {
        if (hitEdge) {
          a.y += ALIEN_STEP_DOWN;
        } else {
          a.x += this.alienDir * cfg.speed * 3;
        }
        a.update(dt);
      }

      if (hitEdge) this.alienDir *= -1;
    } else {
      for (const a of this.aliens) a.update(dt);
    }

    // Alien shooting
    for (const a of this.aliens) {
      if (Math.random() < cfg.shootRate) this.alienShoot(a);
    }

    // Boss
    if (this.boss && this.boss.alive) {
      this.boss.update(dt);
      if (this.boss.entered && Math.random() < 0.02) this.bossShoot();
    }

    // Power-ups
    for (const p of this.powerups) p.update(dt);
    this.powerups = this.powerups.filter(p => p.alive);

    // --- Collisions ---

    // Player bullets vs aliens
    for (const b of this.bullets) {
      if (!b.alive) continue;
      for (const a of this.aliens) {
        if (!a.alive) continue;
        if (rectsOverlap(b.hitbox, a.hitbox)) {
          b.alive = false;
          if (a.hit()) this.killAlien(a, b);
          else { this.shotsHit++; this.particles.emit(b.x, b.y, 5, a.color, { spread: 2, life: 15, size: 3 }); }
          break;
        }
      }
      // vs boss
      if (b.alive && this.boss && this.boss.alive && rectsOverlap(b.hitbox, this.boss.hitbox)) {
        b.alive = false;
        this.shotsHit++;
        if (this.boss.hit()) {
          this.score += this.boss.score;
          document.getElementById('score-value').textContent = this.score;
          this.totalAliensKilled++;
          this.levelAliensKilled++;
          this.particles.bigExplosion(this.boss.cx, this.boss.cy, '#ff9900');
          this.effects.shake(12);
          this.effects.flash('#ff9900', 0.4);
          this.boss = null;
        } else {
          this.particles.emit(b.x, b.y, 8, '#ff9900', { spread: 2, life: 15, size: 3 });
        }
      }
    }
    this.aliens = this.aliens.filter(a => a.alive);
    this.bullets = this.bullets.filter(b => b.alive);

    // Alien bullets vs player
    for (const b of this.alienBullets) {
      if (!b.alive) continue;
      if (rectsOverlap(b.hitbox, this.ship.hitbox)) {
        b.alive = false;
        this.hitShip();
        if (this.state !== State.PLAYING) return;
      }
    }
    this.alienBullets = this.alienBullets.filter(b => b.alive);

    // Aliens reaching player level
    for (const a of this.aliens) {
      if (a.y + a.h >= this.ship.y) {
        this.hitShip();
        if (this.state !== State.PLAYING) return;
        a.alive = false;
      }
    }
    this.aliens = this.aliens.filter(a => a.alive);

    // Player vs power-ups
    for (const p of this.powerups) {
      if (!p.alive) continue;
      if (rectsOverlap(this.ship.hitbox, p.hitbox)) {
        p.alive = false;
        this.collectPowerup(p);
      }
    }
    this.powerups = this.powerups.filter(p => p.alive);

    // Update power-up UI
    this._updatePowerupUI();

    // Particles & effects
    this.particles.update(dt);
    this.effects.update(dt);

    // Level complete check
    if (this.aliens.length === 0 && (!this.boss || !this.boss.alive)) {
      this.levelComplete();
    }
  }

  // ---- Main draw ----
  draw() {
    ctx.save();
    ctx.fillStyle = '#060618';
    ctx.fillRect(0, 0, W, H);

    this.effects.applyShake(ctx);
    this.starfield.draw(ctx);

    if (this.state === State.PLAYING || this.state === State.PAUSED) {
      // Power-ups
      for (const p of this.powerups) p.draw(ctx);

      // Aliens
      for (const a of this.aliens) a.draw(ctx);

      // Boss
      if (this.boss && this.boss.alive) this.boss.draw(ctx);

      // Bullets
      for (const b of this.bullets) b.draw(ctx);
      for (const b of this.alienBullets) b.draw(ctx);

      // Ship
      this.ship.draw(ctx);

      // Particles
      this.particles.draw(ctx);

      // Screen flash
      this.effects.drawFlash(ctx);

      // Level announcement
      if (this.levelAnnouncementTimer > 0) {
        const alpha = clamp(this.levelAnnouncementTimer / 30, 0, 1);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.levelAnnouncementText, W / 2, H / 2);
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }
}

// ============================================================
//  INPUT
// ============================================================

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === 'p' || e.key === 'P') {
    if (game.state === State.PLAYING) game.pause();
    else if (game.state === State.PAUSED) game.resume();
  }
  if (e.key === 'Escape') {
    if (game.state === State.PAUSED) game.resume();
    else if (game.state === State.PLAYING) game.pause();
  }
  if (e.key === 'Enter' && game.state === State.MENU) game.startGame();
  if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', e => { keys[e.key] = false; });

// Touch controls for mobile
let touchLeft = false, touchRight = false, touchShoot = false;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const t of e.touches) {
    const rect = canvas.getBoundingClientRect();
    const x = (t.clientX - rect.left) / rect.width;
    const y = (t.clientY - rect.top) / rect.height;
    if (y > 0.7) {
      if (x < 0.3) touchLeft = true;
      else if (x > 0.7) touchRight = true;
      else touchShoot = true;
    } else {
      touchShoot = true;
    }
  }
  keys['ArrowLeft'] = touchLeft;
  keys['ArrowRight'] = touchRight;
  keys[' '] = touchShoot;
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  touchLeft = false; touchRight = false; touchShoot = false;
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
  keys[' '] = false;
}, { passive: false });

canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// ============================================================
//  GAME LOOP
// ============================================================

game = new Game();

let lastTime = performance.now();

function gameLoop(now) {
  const rawDt = (now - lastTime) / 16.67;
  const dt = Math.min(rawDt, 3); // cap delta to prevent spiral
  lastTime = now;

  game.update(dt);
  game.draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
