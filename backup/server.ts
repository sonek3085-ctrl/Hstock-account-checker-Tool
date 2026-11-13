import express, { Request, Response } from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  LudoColor,
  Token,
  GameState,
  PlayerProfile,
  CoinTransaction,
  LudoSettings,
  RoomPlayer,
} from './src/types/ludo';
import {
  createInitialTokens,
  calculateNewTokenPosition,
  calculateTokenStepPath,
  getMovableTokenIds,
  isSafeSquare,
  COLOR_ORDER,
  TWO_PLAYER_COLORS,
} from './src/utils/ludoRules';

const app = express();
const PORT = 3000;
const DB_PATH = path.resolve(process.cwd(), 'data', 'db.json');

app.use(express.json());

interface DbSchema {
  players: PlayerProfile[];
  transactions: CoinTransaction[];
  matches: any[];
  reports: any[];
  settings: LudoSettings;
}

const DEFAULT_SETTINGS: LudoSettings = {
  startingCoins: 5000,
  dailyBonusCoins: 1000,
  rewardedAdCoins: 500,
  turnTimeoutSeconds: 15,
  minAdCooldownSeconds: 30,
  adminPassword: 'aass1100$',
};

function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: DbSchema = {
        players: [],
        transactions: [],
        matches: [],
        reports: [],
        settings: DEFAULT_SETTINGS,
      };
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.players)) parsed.players = [];
    if (!Array.isArray(parsed.transactions)) parsed.transactions = [];
    if (!Array.isArray(parsed.matches)) parsed.matches = [];
    if (!Array.isArray(parsed.reports)) parsed.reports = [];
    if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS;
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return {
      players: [],
      transactions: [],
      matches: [],
      reports: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

function writeDb(data: DbSchema): boolean {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Token helper for admin authentication
const TOKEN_SECRET = 'aurum_ludo_secret_key_2026';
function createAdminToken(): string {
  const payload = { role: 'admin', ts: Date.now() };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(base64).digest('hex');
  return `${base64}.${signature}`;
}

function verifyAdminToken(tokenString?: string): boolean {
  if (!tokenString) return false;
  try {
    const raw = tokenString.startsWith('Bearer ') ? tokenString.slice(7) : tokenString;
    const [base64, signature] = raw.split('.');
    if (!base64 || !signature) return false;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(base64).digest('hex');
    if (signature !== expected) return false;
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  if (!verifyAdminToken(authHeader)) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    return;
  }
  next();
}

// ==========================================
// 1. HTTP REST API
// ==========================================

// Authenticate or Create Player (Guest or Google mock)
app.post('/api/player/auth', (req: Request, res: Response) => {
  const { id, name, avatar, email, isGuest } = req.body;
  const db = readDb();

  let player = db.players.find((p) => p.id === id);

  if (!player) {
    const newId = id || `AL_${Math.floor(100000 + Math.random() * 900000)}`;
    const startingCoins = db.settings.startingCoins || 5000;
    player = {
      id: newId,
      name: name?.trim() || `Player_${newId.slice(-4)}`,
      avatar: avatar || 'crown',
      coins: startingCoins,
      isGuest: isGuest ?? true,
      email: email?.trim(),
      stats: {
        matchesPlayed: 0,
        wins: 0,
        twoPlayerWins: 0,
        fourPlayerWins: 0,
        tokensCaptured: 0,
        coinsEarned: startingCoins,
      },
      createdAt: new Date().toISOString(),
    };

    // Log Starting Coins transaction
    db.transactions.unshift({
      id: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      playerId: newId,
      type: 'STARTING_BONUS',
      amount: startingCoins,
      balanceAfter: startingCoins,
      description: 'Welcome starting virtual coins bonus',
      timestamp: new Date().toISOString(),
    });

    db.players.unshift(player);
    writeDb(db);
  }

  res.json(player);
});

// Get current player profile
app.get('/api/player/:id', (req: Request, res: Response) => {
  const db = readDb();
  const player = db.players.find((p) => p.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }
  res.json(player);
});

// Update player profile
app.put('/api/player/:id', (req: Request, res: Response) => {
  const db = readDb();
  const player = db.players.find((p) => p.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }
  const { name, avatar } = req.body;
  if (name) player.name = name.trim();
  if (avatar) player.avatar = avatar;
  writeDb(db);
  res.json(player);
});

// Claim Daily Bonus
app.post('/api/player/:id/daily-bonus', (req: Request, res: Response) => {
  const db = readDb();
  const player = db.players.find((p) => p.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const now = Date.now();
  if (player.lastDailyBonusAt) {
    const lastClaim = new Date(player.lastDailyBonusAt).getTime();
    const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      const waitHours = Math.ceil(24 - hoursSince);
      res.status(400).json({ error: `Daily bonus on cooldown. Available in ${waitHours} hours.` });
      return;
    }
  }

  const bonusAmount = db.settings.dailyBonusCoins || 1000;
  player.coins += bonusAmount;
  player.stats.coinsEarned += bonusAmount;
  player.lastDailyBonusAt = new Date().toISOString();

  const txn: CoinTransaction = {
    id: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    playerId: player.id,
    type: 'DAILY_BONUS',
    amount: bonusAmount,
    balanceAfter: player.coins,
    description: 'Daily login bonus reward',
    timestamp: new Date().toISOString(),
  };

  db.transactions.unshift(txn);
  writeDb(db);

  res.json({ player, bonusAmount, txn });
});

// Claim Rewarded Ad Coins
app.post('/api/player/:id/rewarded-ad', (req: Request, res: Response) => {
  const db = readDb();
  const player = db.players.find((p) => p.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }

  const now = Date.now();
  const cooldownSec = db.settings.minAdCooldownSeconds || 30;
  if (player.lastAdWatchedAt) {
    const lastAd = new Date(player.lastAdWatchedAt).getTime();
    const secSince = (now - lastAd) / 1000;
    if (secSince < cooldownSec) {
      res.status(400).json({ error: `Please wait ${Math.ceil(cooldownSec - secSince)}s before watching another ad.` });
      return;
    }
  }

  const rewardAmount = db.settings.rewardedAdCoins || 500;
  player.coins += rewardAmount;
  player.stats.coinsEarned += rewardAmount;
  player.lastAdWatchedAt = new Date().toISOString();

  const txn: CoinTransaction = {
    id: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    playerId: player.id,
    type: 'REWARDED_AD',
    amount: rewardAmount,
    balanceAfter: player.coins,
    description: 'Rewarded video advertisement bonus',
    timestamp: new Date().toISOString(),
  };

  db.transactions.unshift(txn);
  writeDb(db);

  res.json({ player, rewardAmount, txn });
});

// Get Player Transactions
app.get('/api/player/:id/transactions', (req: Request, res: Response) => {
  const db = readDb();
  const txns = db.transactions.filter((t) => t.playerId === req.params.id);
  res.json(txns.slice(0, 50));
});

// Delete Player Account & Associated Data
app.delete('/api/player/:id/account', (req: Request, res: Response) => {
  const db = readDb();
  db.players = db.players.filter((p) => p.id !== req.params.id);
  db.transactions = db.transactions.filter((t) => t.playerId !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Account and associated data deleted permanently.' });
});

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const db = readDb();
  const expected = db.settings.adminPassword || 'aass1100$';
  if (password && password.trim() === expected) {
    const token = createAdminToken();
    res.json({ success: true, token });
    return;
  }
  res.status(401).json({ error: 'Incorrect administrator password' });
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  const totalCoins = db.players.reduce((sum, p) => sum + (p.coins || 0), 0);
  const rewardedAdsWatched = db.transactions.filter((t) => t.type === 'REWARDED_AD').length;

  res.json({
    totalUsers: db.players.length,
    activeRooms: activeGames.size,
    completedMatches: db.matches.length,
    totalCoinsCirculating: totalCoins,
    rewardedAdsWatched,
    settings: db.settings,
  });
});

// Admin Players List & Search
app.get('/api/admin/players', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  const q = (req.query.q as string || '').toLowerCase();
  const filtered = db.players.filter(
    (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  );
  res.json(filtered);
});

// Admin Coin Adjustment
app.put('/api/admin/players/:id/coins', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  const player = db.players.find((p) => p.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: 'Player not found' });
    return;
  }
  const { amount, reason } = req.body;
  if (typeof amount !== 'number') {
    res.status(400).json({ error: 'Amount is required' });
    return;
  }

  player.coins = Math.max(0, player.coins + amount);

  const txn: CoinTransaction = {
    id: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    playerId: player.id,
    type: 'ADMIN_ADJUSTMENT',
    amount,
    balanceAfter: player.coins,
    description: `Admin Adjustment: ${reason || 'Manual correction'}`,
    timestamp: new Date().toISOString(),
  };

  db.transactions.unshift(txn);
  writeDb(db);
  res.json({ player, txn });
});

// Admin Match History
app.get('/api/admin/matches', requireAdmin, (_req: Request, res: Response) => {
  const db = readDb();
  res.json(db.matches.slice(0, 50));
});

// Admin Settings
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

// ==========================================
// 2. REAL-TIME MULTIPLAYER WEBSOCKET ENGINE
// ==========================================
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || 'localhost';
    const parsed = new URL(request.url || '', `http://${host}`);
    if (parsed.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
      return;
    }
  } catch {
    // ignore
  }
  // Allow Vite's upgrade listener to handle vite-hmr requests
});

interface ExtendedWebSocket extends WebSocket {
  playerId?: string;
  playerName?: string;
  roomId?: string;
  isAlive?: boolean;
}

const activeGames = new Map<string, GameState>();
const privateRooms = new Map<string, string>(); // code -> roomId
const playerSockets = new Map<string, ExtendedWebSocket>();

// Matchmaking Queues
const queue2P: { ws: ExtendedWebSocket; player: RoomPlayer }[] = [];
const queue4P: { ws: ExtendedWebSocket; player: RoomPlayer }[] = [];

function broadcastToRoom(roomId: string, message: any) {
  const str = JSON.stringify(message);
  wss.clients.forEach((client) => {
    const ext = client as ExtendedWebSocket;
    if (ext.roomId === roomId && ext.readyState === WebSocket.OPEN) {
      ext.send(str);
    }
  });
}

function initializeRoom(
  mode: '2_PLAYER' | '4_PLAYER' | 'PRIVATE_ROOM' | 'VS_BOT',
  maxPlayers: 2 | 4,
  roomCode?: string
): GameState {
  const roomId = `LUDO_${Date.now().toString(36)}_${Math.floor(100 + Math.random() * 900)}`;
  const code = roomCode || Math.floor(100000 + Math.random() * 900000).toString();

  const tokens: Record<LudoColor, Token[]> = {
    RED: createInitialTokens('RED'),
    GREEN: createInitialTokens('GREEN'),
    YELLOW: createInitialTokens('YELLOW'),
    BLUE: createInitialTokens('BLUE'),
  };

  const state: GameState = {
    roomId,
    roomCode: code,
    mode,
    status: 'WAITING',
    maxPlayers,
    players: [],
    currentTurnColor: 'RED',
    diceValue: null,
    hasRolled: false,
    sixCount: 0,
    turnTimeLeft: 15,
    tokens,
    movableTokens: [],
    winners: [],
    isMoving: false,
    createdAt: new Date().toISOString(),
  };

  activeGames.set(roomId, state);
  privateRooms.set(code, roomId);
  return state;
}

function getNextTurnColor(
  currentColor: LudoColor,
  players: RoomPlayer[],
  winners: { color: LudoColor }[]
): LudoColor {
  const activeColors = players.map((p) => p.color);
  const remainingColors = activeColors.filter((c) => !winners.some((w) => w.color === c));
  if (remainingColors.length <= 1) return currentColor;

  let idx = COLOR_ORDER.indexOf(currentColor);
  for (let i = 1; i <= 4; i++) {
    const nextCandidate = COLOR_ORDER[(idx + i) % 4];
    if (remainingColors.includes(nextCandidate)) {
      return nextCandidate;
    }
  }
  return currentColor;
}

// Turn Timeout Interval - paused while tokens are physically moving
setInterval(() => {
  activeGames.forEach((game) => {
    if (game.status !== 'IN_PROGRESS' || game.isMoving) return;

    if (game.turnTimeLeft > 0) {
      game.turnTimeLeft -= 1;
      broadcastToRoom(game.roomId, {
        type: 'TURN_TIMER',
        turnTimeLeft: game.turnTimeLeft,
      });
    } else {
      // Timeout: auto-roll or auto-move
      handleTurnTimeout(game);
    }
  });
}, 1000);

function handleTurnTimeout(game: GameState) {
  if (game.isMoving) return;

  if (!game.hasRolled) {
    // Auto roll for player
    const roll = Math.floor(1 + Math.random() * 6);
    game.diceValue = roll;
    game.hasRolled = true;

    if (roll === 6) game.sixCount += 1;
    else game.sixCount = 0;

    const activeTokens = game.tokens[game.currentTurnColor];
    const movable = getMovableTokenIds(activeTokens, roll);
    game.movableTokens = movable;

    console.log(`[LUDO TIMEOUT] Auto-rolled ${roll} for ${game.currentTurnColor}. Movable: [${movable.join(', ')}]`);

    broadcastToRoom(game.roomId, {
      type: 'DICE_ROLLED',
      diceValue: roll,
      currentTurnColor: game.currentTurnColor,
      movableTokens: movable,
      auto: true,
    });

    if (movable.length === 0 || game.sixCount >= 3) {
      setTimeout(() => {
        if (activeGames.has(game.roomId) && !game.isMoving) {
          advanceTurn(game, false);
        }
      }, 1600);
    } else {
      // Allow 1.4s to view dice before auto-moving first valid token
      setTimeout(() => {
        if (activeGames.has(game.roomId) && game.hasRolled && !game.isMoving && game.movableTokens.length > 0) {
          executeTokenMove(game, game.movableTokens[0]);
        }
      }, 1400);
    }
  } else {
    // Had rolled but didn't pick token: pick first movable
    if (game.movableTokens.length > 0 && !game.isMoving) {
      executeTokenMove(game, game.movableTokens[0]);
    } else {
      advanceTurn(game, false);
    }
  }
}

function advanceTurn(game: GameState, grantExtraTurn: boolean) {
  if (grantExtraTurn && game.sixCount < 3) {
    game.hasRolled = false;
    game.diceValue = null;
    game.movableTokens = [];
    game.turnTimeLeft = 15;
    broadcastToRoom(game.roomId, {
      type: 'EXTRA_TURN',
      currentTurnColor: game.currentTurnColor,
      turnTimeLeft: 15,
    });
  } else {
    game.sixCount = 0;
    game.hasRolled = false;
    game.diceValue = null;
    game.movableTokens = [];
    game.turnTimeLeft = 15;
    game.currentTurnColor = getNextTurnColor(game.currentTurnColor, game.players, game.winners);
    broadcastToRoom(game.roomId, {
      type: 'TURN_CHANGED',
      currentTurnColor: game.currentTurnColor,
      turnTimeLeft: 15,
    });
  }

  // If next player is a bot, trigger auto play with human-like natural pacing
  const nextPlayer = game.players.find((p) => p.color === game.currentTurnColor);
  if (nextPlayer?.isBot && game.status === 'IN_PROGRESS') {
    setTimeout(() => {
      triggerBotTurn(game);
    }, 1500); // 1.5s natural pause before bot rolls
  }
}

function triggerBotTurn(game: GameState) {
  if (game.status !== 'IN_PROGRESS' || game.isMoving) return;
  const roll = Math.floor(1 + Math.random() * 6);
  game.diceValue = roll;
  game.hasRolled = true;

  if (roll === 6) game.sixCount += 1;
  else game.sixCount = 0;

  const activeTokens = game.tokens[game.currentTurnColor];
  const movable = getMovableTokenIds(activeTokens, roll);
  game.movableTokens = movable;

  console.log(`[LUDO BOT] Bot ${game.currentTurnColor} rolled ${roll}. Movable: [${movable.join(', ')}]`);

  broadcastToRoom(game.roomId, {
    type: 'DICE_ROLLED',
    diceValue: roll,
    currentTurnColor: game.currentTurnColor,
    movableTokens: movable,
    isBot: true,
  });

  if (movable.length === 0 || game.sixCount >= 3) {
    setTimeout(() => {
      if (activeGames.has(game.roomId) && !game.isMoving) {
        advanceTurn(game, false);
      }
    }, 1600);
    return;
  }

  // Bot selects best token after 1.4s delay so players can see the dice clearly
  setTimeout(() => {
    if (!activeGames.has(game.roomId) || game.isMoving) return;
    // Prefer tokens that can capture an opponent or advance closest to home
    let chosenId = movable[0];
    executeTokenMove(game, chosenId);
  }, 1400);
}

function executeTokenMove(game: GameState, tokenId: number) {
  if (game.isMoving) return;
  const activeColor = game.currentTurnColor;
  const token = game.tokens[activeColor].find((t) => t.id === tokenId);
  if (!token || !game.diceValue) return;

  // Mutex lock to prevent duplicate moves or race conditions
  game.isMoving = true;

  // Calculate full step-by-step path coordinates
  const { path, finalToken, isHome } = calculateTokenStepPath(token, game.diceValue);

  console.log(
    `[LUDO MOVE] Room ${game.roomId}: ${activeColor} moving token ${tokenId} from step ${token.stepCount} -> ${finalToken.stepCount} (Dice ${game.diceValue}). Total path steps: ${path.length}`
  );

  let capturedColor: LudoColor | null = null;
  let capturedTokenId: number | null = null;

  // Check capture on final step position
  if (finalToken.state === 'TRACK' && !isSafeSquare(finalToken.trackPos)) {
    COLOR_ORDER.forEach((c) => {
      if (c !== activeColor) {
        game.tokens[c].forEach((oppToken) => {
          if (oppToken.state === 'TRACK' && oppToken.trackPos === finalToken.trackPos) {
            capturedColor = c;
            capturedTokenId = oppToken.id;
          }
        });
      }
    });
  }

  // Smooth frame duration: ~320ms per step + pause for landing/capture
  const stepDelay = 320;
  const animDuration = Math.max(900, path.length * stepDelay) + (capturedColor ? 600 : 0) + 400;

  broadcastToRoom(game.roomId, {
    type: 'TOKEN_MOVE_STARTED',
    color: activeColor,
    tokenId,
    path,
    finalToken,
    captured: capturedColor ? { color: capturedColor, tokenId: capturedTokenId } : null,
    isHome,
    animDuration,
    diceValue: game.diceValue,
  });

  // Hold server turn until physical movement animation completes
  setTimeout(() => {
    if (!activeGames.has(game.roomId)) return;

    // Apply final token position
    game.tokens[activeColor] = game.tokens[activeColor].map((t) =>
      t.id === tokenId ? finalToken : t
    );

    // If opponent was captured, send back to yard
    if (capturedColor && capturedTokenId !== null) {
      game.tokens[capturedColor] = game.tokens[capturedColor].map((t) =>
        t.id === capturedTokenId ? { ...t, state: 'YARD', stepCount: 0, trackPos: -1 } : t
      );
      console.log(`[LUDO CAPTURE] ${activeColor} captured ${capturedColor} token ${capturedTokenId}!`);
    }

    // Check if player has finished all 4 tokens
    const allHome = game.tokens[activeColor].every((t) => t.state === 'HOME');
    if (allHome && !game.winners.some((w) => w.color === activeColor)) {
      const rank = game.winners.length + 1;
      const playerObj = game.players.find((p) => p.color === activeColor);
      game.winners.push({
        playerId: playerObj?.id || 'bot',
        color: activeColor,
        rank,
      });

      broadcastToRoom(game.roomId, {
        type: 'PLAYER_FINISHED',
        color: activeColor,
        rank,
        playerName: playerObj?.name || 'Player',
      });

      if (game.winners.length >= game.players.length - 1) {
        game.isMoving = false;
        completeGame(game);
        return;
      }
    }

    // Unlock move mutex
    game.isMoving = false;

    broadcastToRoom(game.roomId, {
      type: 'TOKEN_MOVE_FINISHED',
      color: activeColor,
      tokenId,
      tokens: game.tokens,
    });

    // Extra turn if: rolled 6 (max 2 consecutive), captured opponent, or scored home
    const getsExtraTurn =
      (game.diceValue === 6 && game.sixCount < 3) || Boolean(capturedColor) || isHome;
    advanceTurn(game, getsExtraTurn);
  }, animDuration);
}

function completeGame(game: GameState) {
  game.status = 'COMPLETED';

  // Settle virtual coin rewards for winners
  const db = readDb();
  game.winners.forEach((w) => {
    if (w.playerId && !w.playerId.startsWith('bot_')) {
      const reward = w.rank === 1 ? 2000 : w.rank === 2 ? 1000 : 500;
      const player = db.players.find((p) => p.id === w.playerId);
      if (player) {
        player.coins += reward;
        player.stats.wins += 1;
        player.stats.coinsEarned += reward;
        db.transactions.unshift({
          id: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          playerId: player.id,
          type: 'MATCH_WIN',
          amount: reward,
          balanceAfter: player.coins,
          description: `Virtual coins victory reward for ${w.rank === 1 ? '1st' : '2nd'} place in ${game.mode}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  // Record match history
  db.matches.unshift({
    roomId: game.roomId,
    mode: game.mode,
    players: game.players.map((p) => ({ name: p.name, color: p.color })),
    winners: game.winners,
    timestamp: new Date().toISOString(),
  });
  writeDb(db);

  broadcastToRoom(game.roomId, {
    type: 'GAME_OVER',
    winners: game.winners,
  });
}

wss.on('connection', (ws: ExtendedWebSocket) => {
  ws.isAlive = true;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'JOIN_LOBBY': {
          ws.playerId = data.player.id;
          ws.playerName = data.player.name;
          playerSockets.set(data.player.id, ws);
          ws.send(JSON.stringify({ type: 'LOBBY_JOINED', playerId: data.player.id }));
          break;
        }

        case 'FIND_MATCH': {
          const mode: '2_PLAYER' | '4_PLAYER' = data.mode === '4_PLAYER' ? '4_PLAYER' : '2_PLAYER';
          const max = mode === '4_PLAYER' ? 4 : 2;
          const queue = mode === '4_PLAYER' ? queue4P : queue2P;

          // Remove any stale/closed sockets from queue
          for (let i = queue.length - 1; i >= 0; i--) {
            if (queue[i].ws.readyState !== WebSocket.OPEN) {
              queue.splice(i, 1);
            }
          }

          // Search for a real waiting human opponent (not the same user)
          const opponentIdx = queue.findIndex(
            (entry) => entry.player.id !== data.player.id && entry.ws.readyState === WebSocket.OPEN
          );

          if (opponentIdx !== -1 && max === 2) {
            // Real live match found!
            const waiting = queue.splice(opponentIdx, 1)[0];
            const room = initializeRoom('2_PLAYER', 2);

            const hostPlayer: RoomPlayer = {
              ...waiting.player,
              color: 'RED',
              isReady: true,
              isConnected: true,
            };
            const opponentPlayer: RoomPlayer = {
              id: data.player.id,
              name: data.player.name,
              avatar: data.player.avatar || 'crown',
              color: 'YELLOW',
              isReady: true,
              isConnected: true,
            };

            room.players = [hostPlayer, opponentPlayer];
            room.status = 'IN_PROGRESS';
            waiting.ws.roomId = room.roomId;
            ws.roomId = room.roomId;

            console.log(
              `[LUDO MULTIPLAYER] Matched 2 LIVE real players: ${hostPlayer.name} (RED) vs ${opponentPlayer.name} (YELLOW) in Room ${room.roomId}`
            );

            waiting.ws.send(JSON.stringify({ type: 'MATCH_FOUND', game: room }));
            ws.send(JSON.stringify({ type: 'MATCH_FOUND', game: room }));
            break;
          }

          // If no waiting human opponent, place player in queue
          const existingIdx = queue.findIndex((e) => e.player.id === data.player.id);
          if (existingIdx !== -1) {
            queue[existingIdx] = { ws, player: data.player };
          } else {
            queue.push({ ws, player: data.player });
          }

          console.log(`[LUDO QUEUE] ${data.player.name} queued for ${mode}. Queue size: ${queue.length}`);

          ws.send(
            JSON.stringify({
              type: 'WAITING_FOR_MATCH',
              mode,
              message: 'Searching for a live online opponent... You will be matched automatically.',
            })
          );
          break;
        }

        case 'CANCEL_MATCHMAKING': {
          const idx2 = queue2P.findIndex((e) => e.player.id === ws.playerId);
          if (idx2 !== -1) queue2P.splice(idx2, 1);
          const idx4 = queue4P.findIndex((e) => e.player.id === ws.playerId);
          if (idx4 !== -1) queue4P.splice(idx4, 1);
          console.log(`[LUDO QUEUE] Player ${ws.playerName || ws.playerId} cancelled matchmaking`);
          ws.send(JSON.stringify({ type: 'MATCHMAKING_CANCELLED' }));
          break;
        }

        case 'START_BOT_GAME': {
          // Remove from human matchmaking queues if queued
          const idx2 = queue2P.findIndex((e) => e.player.id === ws.playerId);
          if (idx2 !== -1) queue2P.splice(idx2, 1);
          const idx4 = queue4P.findIndex((e) => e.player.id === ws.playerId);
          if (idx4 !== -1) queue4P.splice(idx4, 1);

          const max = data.maxPlayers === 4 ? 4 : 2;
          const room = initializeRoom('VS_BOT', max);

          const hostPlayer: RoomPlayer = {
            id: data.player.id,
            name: data.player.name,
            avatar: data.player.avatar || 'crown',
            color: 'RED',
            isReady: true,
            isConnected: true,
          };
          room.players.push(hostPlayer);
          ws.roomId = room.roomId;

          if (max === 2) {
            room.players.push({
              id: 'bot_yellow',
              name: 'Aurum AI 🤖',
              avatar: 'tiger',
              color: 'YELLOW',
              isReady: true,
              isConnected: true,
              isBot: true,
            });
          } else {
            room.players.push({
              id: 'bot_green',
              name: 'Raja Ludo ⚡',
              avatar: 'king',
              color: 'GREEN',
              isReady: true,
              isConnected: true,
              isBot: true,
            });
            room.players.push({
              id: 'bot_yellow',
              name: 'Aurum AI 🤖',
              avatar: 'tiger',
              color: 'YELLOW',
              isReady: true,
              isConnected: true,
              isBot: true,
            });
            room.players.push({
              id: 'bot_blue',
              name: 'Sultan Pro 👑',
              avatar: 'crown',
              color: 'BLUE',
              isReady: true,
              isConnected: true,
              isBot: true,
            });
          }

          room.status = 'IN_PROGRESS';
          console.log(`[LUDO BOT MATCH] Started practice bot match for ${data.player.name} in Room ${room.roomId}`);
          ws.send(JSON.stringify({ type: 'MATCH_FOUND', game: room }));
          break;
        }

        case 'CREATE_PRIVATE_ROOM': {
          const max = data.maxPlayers === 4 ? 4 : 2;
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const room = initializeRoom('PRIVATE_ROOM', max, code);

          const hostPlayer: RoomPlayer = {
            id: data.player.id,
            name: data.player.name,
            avatar: data.player.avatar || 'crown',
            color: 'RED',
            isReady: true,
            isConnected: true,
          };

          room.players.push(hostPlayer);
          ws.roomId = room.roomId;

          console.log(`[LUDO ROOM CREATED] Room ${room.roomId} (Code: ${code}) created by ${data.player.name}`);
          ws.send(JSON.stringify({ type: 'ROOM_CREATED', game: room, roomCode: code }));
          break;
        }

        case 'JOIN_PRIVATE_ROOM': {
          const cleanCode = String(data.code || '').trim();
          const roomId = privateRooms.get(cleanCode);
          const room = roomId ? activeGames.get(roomId) : null;

          if (!room) {
            console.warn(`[LUDO JOIN FAIL] Room code "${cleanCode}" not found.`);
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                message: `Room code "${cleanCode}" not found or expired. Please verify with your friend.`,
              })
            );
            return;
          }

          if (room.status === 'COMPLETED') {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'This room match has already completed.' }));
            return;
          }

          // Check if player is already registered in this room (reconnection)
          const existingPlayer = room.players.find((p) => p.id === data.player.id);
          if (existingPlayer) {
            existingPlayer.isConnected = true;
            ws.roomId = room.roomId;
            ws.send(JSON.stringify({ type: 'MATCH_FOUND', game: room }));
            broadcastToRoom(room.roomId, { type: 'ROOM_UPDATED', game: room });
            return;
          }

          if (room.players.length >= room.maxPlayers) {
            ws.send(JSON.stringify({ type: 'ERROR', message: `Room "${cleanCode}" is already full (${room.maxPlayers} players).` }));
            return;
          }

          const usedColors = room.players.map((p) => p.color);
          const availableColors = room.maxPlayers === 2 ? TWO_PLAYER_COLORS : COLOR_ORDER;
          const assignedColor = availableColors.find((c) => !usedColors.includes(c)) || 'YELLOW';

          const newPlayer: RoomPlayer = {
            id: data.player.id,
            name: data.player.name,
            avatar: data.player.avatar || 'crown',
            color: assignedColor,
            isReady: true,
            isConnected: true,
          };

          room.players.push(newPlayer);
          ws.roomId = room.roomId;

          console.log(
            `[LUDO JOIN SUCCESS] ${data.player.name} joined room ${cleanCode} as ${assignedColor}. Total players: ${room.players.length}/${room.maxPlayers}`
          );

          // Auto-start if all player slots are filled
          if (room.players.length === room.maxPlayers) {
            room.status = 'IN_PROGRESS';
            console.log(`[LUDO START] Room ${cleanCode} is now FULL and starting match!`);
          }

          broadcastToRoom(room.roomId, { type: 'ROOM_UPDATED', game: room });
          break;
        }

        case 'RECONNECT_GAME': {
          let foundRoom: GameState | null = null;
          activeGames.forEach((g) => {
            if (g.status === 'IN_PROGRESS' && g.players.some((p) => p.id === data.playerId)) {
              foundRoom = g;
            }
          });

          if (foundRoom) {
            const activeRoom: GameState = foundRoom;
            ws.roomId = activeRoom.roomId;
            const p = activeRoom.players.find((pl) => pl.id === data.playerId);
            if (p) p.isConnected = true;
            console.log(`[LUDO RECONNECT] Restored active game for player ${data.playerId} in room ${activeRoom.roomId}`);
            ws.send(JSON.stringify({ type: 'MATCH_FOUND', game: activeRoom }));
            broadcastToRoom(activeRoom.roomId, { type: 'ROOM_UPDATED', game: activeRoom });
          }
          break;
        }

        case 'ROLL_DICE': {
          const game = activeGames.get(data.roomId);
          if (!game || game.status !== 'IN_PROGRESS') return;

          // Disallow roll if moving or out of turn
          if (game.isMoving) {
            console.warn(`[LUDO ROLL REJECTED] Cannot roll while token is moving in room ${game.roomId}`);
            return;
          }

          const playerObj = game.players.find((p) => p.id === data.playerId);
          if (!playerObj || playerObj.color !== game.currentTurnColor) {
            console.warn(`[LUDO ROLL REJECTED] Not player ${data.playerId}'s turn (Current: ${game.currentTurnColor})`);
            return;
          }
          if (game.hasRolled) return;

          const roll = Math.floor(1 + Math.random() * 6);
          game.diceValue = roll;
          game.hasRolled = true;

          if (roll === 6) game.sixCount += 1;
          else game.sixCount = 0;

          const activeTokens = game.tokens[game.currentTurnColor];
          const movable = getMovableTokenIds(activeTokens, roll);
          game.movableTokens = movable;

          console.log(`[LUDO ROLL] Room ${game.roomId}: ${game.currentTurnColor} rolled ${roll}. Movable: [${movable.join(', ')}]`);

          broadcastToRoom(game.roomId, {
            type: 'DICE_ROLLED',
            diceValue: roll,
            currentTurnColor: game.currentTurnColor,
            movableTokens: movable,
          });

          // If no movable tokens or three 6s, pass turn after 1.8s delay
          if (movable.length === 0 || game.sixCount >= 3) {
            setTimeout(() => {
              if (activeGames.has(game.roomId) && !game.isMoving) {
                advanceTurn(game, false);
              }
            }, 1800);
          }
          break;
        }

        case 'MOVE_TOKEN': {
          const game = activeGames.get(data.roomId);
          if (!game || game.status !== 'IN_PROGRESS') return;

          // Disallow move while another move animation is playing
          if (game.isMoving) {
            console.warn(`[LUDO MOVE REJECTED] Mutex lock active: token already moving in room ${game.roomId}`);
            return;
          }

          const playerObj = game.players.find((p) => p.id === data.playerId);
          if (!playerObj || playerObj.color !== game.currentTurnColor) return;
          if (!game.hasRolled || !game.movableTokens.includes(data.tokenId)) return;

          executeTokenMove(game, data.tokenId);
          break;
        }

        case 'SEND_CHAT': {
          if (ws.roomId) {
            broadcastToRoom(ws.roomId, {
              type: 'CHAT_MESSAGE',
              sender: ws.playerName,
              message: data.message,
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    if (ws.playerId) playerSockets.delete(ws.playerId);
  });
});

// ==========================================
// 3. START SERVER WITH VITE MIDDLEWARE
// ==========================================
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`👑 AURUM LUDO Server & WebSocket Engine listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start AURUM LUDO server:', err);
});
