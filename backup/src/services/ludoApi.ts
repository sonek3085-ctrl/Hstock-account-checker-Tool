import { PlayerProfile, CoinTransaction, GameState, LudoSettings } from '../types/ludo';

const API_BASE = '/api';

export const ludoApi = {
  // Player Auth & Profile
  async authPlayer(params: {
    id?: string;
    name?: string;
    avatar?: string;
    isGuest?: boolean;
    email?: string;
  }): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE}/player/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to authenticate player');
    return res.json();
  },

  async getPlayer(id: string): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE}/player/${id}`);
    if (!res.ok) throw new Error('Player not found');
    return res.json();
  },

  async updateProfile(id: string, updates: { name?: string; avatar?: string }): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE}/player/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async claimDailyBonus(id: string): Promise<{ player: PlayerProfile; bonusAmount: number; txn: CoinTransaction }> {
    const res = await fetch(`${API_BASE}/player/${id}/daily-bonus`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to claim daily bonus');
    return data;
  },

  async claimRewardedAd(id: string): Promise<{ player: PlayerProfile; rewardAmount: number; txn: CoinTransaction }> {
    const res = await fetch(`${API_BASE}/player/${id}/rewarded-ad`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to claim ad reward');
    return data;
  },

  async getTransactions(id: string): Promise<CoinTransaction[]> {
    const res = await fetch(`${API_BASE}/player/${id}/transactions`);
    if (!res.ok) return [];
    return res.json();
  },

  async deleteAccount(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/player/${id}/account`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete account');
  },

  // Admin APIs
  async adminLogin(password: string): Promise<string> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid admin password');
    return data.token;
  },

  async getAdminStats(token: string): Promise<{
    totalUsers: number;
    activeRooms: number;
    completedMatches: number;
    totalCoinsCirculating: number;
    rewardedAdsWatched: number;
    settings: LudoSettings;
  }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminPlayers(token: string, search = ''): Promise<PlayerProfile[]> {
    const res = await fetch(`${API_BASE}/admin/players?q=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
  },

  async adjustPlayerCoins(
    token: string,
    playerId: string,
    amount: number,
    reason: string
  ): Promise<{ player: PlayerProfile; txn: CoinTransaction }> {
    const res = await fetch(`${API_BASE}/admin/players/${playerId}/coins`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to adjust coins');
    return data;
  },

  async getAdminMatches(token: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  },

  async updateAdminSettings(token: string, settings: Partial<LudoSettings>): Promise<LudoSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};

// WebSocket Multiplayer Manager
export class LudoSocketClient {
  private ws: WebSocket | null = null;
  private listeners: ((event: any) => void)[] = [];
  private reconnectTimer: any = null;
  private url: string;
  private isIntentionalClose = false;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws`;
  }

  connect(player: PlayerProfile) {
    this.isIntentionalClose = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.send({
          type: 'JOIN_LOBBY',
          player: { id: player.id, name: player.name, avatar: player.avatar },
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((fn) => fn(data));
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        if (!this.isIntentionalClose) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect(player);
          }, 3000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Ludo WebSocket connection error, will retry...', err);
      };
    } catch (err) {
      console.error('Failed to create WebSocket client:', err);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onMessage(listener: (event: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== listener);
    };
  }

  disconnect() {
    this.isIntentionalClose = true;
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const socketClient = new LudoSocketClient();
