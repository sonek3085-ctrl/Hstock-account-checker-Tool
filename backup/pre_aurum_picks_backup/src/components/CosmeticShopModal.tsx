import React, { useState, useEffect } from 'react';
import { PlayerProfile, CosmeticItem, CosmeticCategory } from '../types/ludo';
import { ludoApi } from '../services/ludoApi';
import { playLudoSound } from '../utils/ludoRules';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Coins,
  Check,
  Sparkles,
  X,
  Crown,
  Palette,
  Gem,
  Flame,
  Zap,
  Shield,
  User,
  Heart,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface CosmeticShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
  onUpdatePlayer: (updated: PlayerProfile) => void;
}

export const CosmeticShopModal: React.FC<CosmeticShopModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
}) => {
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('DICE');
  const [catalog, setCatalog] = useState<CosmeticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);
  const [confirmPurchaseItem, setConfirmPurchaseItem] = useState<CosmeticItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    try {
      const res = await ludoApi.getShopCatalog();
      setCatalog(res.items);
    } catch (err) {
      console.error('Failed to load shop catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inv = player.inventory || {
    diceSkins: ['classic_gold'],
    tokenSkins: ['imperial_crown'],
    boardThemes: ['royal_midnight'],
    avatars: ['crown', 'sultan', 'falcon', 'lion'],
    equippedDice: 'classic_gold',
    equippedToken: 'imperial_crown',
    equippedBoard: 'royal_midnight',
    equippedAvatar: player.avatar || 'crown',
  };

  const isOwned = (item: CosmeticItem) => {
    if (item.category === 'DICE') return inv.diceSkins.includes(item.id);
    if (item.category === 'TOKEN') return inv.tokenSkins.includes(item.id);
    if (item.category === 'BOARD') return inv.boardThemes.includes(item.id);
    if (item.category === 'AVATAR') return inv.avatars.includes(item.id);
    return false;
  };

  const isEquipped = (item: CosmeticItem) => {
    if (item.category === 'DICE') return inv.equippedDice === item.id;
    if (item.category === 'TOKEN') return inv.equippedToken === item.id;
    if (item.category === 'BOARD') return inv.equippedBoard === item.id;
    if (item.category === 'AVATAR') return inv.equippedAvatar === item.id || player.avatar === item.id;
    return false;
  };

  const handleEquip = async (item: CosmeticItem) => {
    try {
      const res = await ludoApi.equipCosmeticItem(player.id, item.category, item.id);
      onUpdatePlayer(res.player);
      playLudoSound('SAFE');
    } catch (err: any) {
      alert(err.message || 'Equip failed');
    }
  };

  const handleConfirmPurchase = async () => {
    if (!confirmPurchaseItem) return;
    try {
      const res = await ludoApi.purchaseShopItem(player.id, confirmPurchaseItem.id);
      onUpdatePlayer(res.player);
      setConfirmPurchaseItem(null);
      playLudoSound('SAFE');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: [confirmPurchaseItem.previewColor, '#fbbf24', '#ffffff'],
      });
    } catch (err: any) {
      alert(err.message || 'Purchase failed');
    }
  };

  const filteredItems = catalog.filter((i) => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#131520] via-[#0b0d14] to-[#07080c] border border-amber-500/40 p-5 shadow-2xl shadow-amber-500/10 text-white flex flex-col max-h-[92vh]">
        
        {/* Top Header: "In-Game Currency Wallet UI" & "Virtual Coin Balance Component" */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white tracking-wide uppercase">
                Royal Boutique & Shop
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                Cosmetics & Premium Skins
              </p>
            </div>
          </div>

          {/* Virtual Coin Balance Component */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121420] border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{player.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Category Tabs: "Premium Dice Skins", "Ludo Token Skins", "Board Theme Selector", "Avatar Customization UI" */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b12] rounded-xl my-3 border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveCategory('DICE')}
            className={`py-2 rounded-lg transition ${
              activeCategory === 'DICE'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dice
          </button>
          <button
            onClick={() => setActiveCategory('TOKEN')}
            className={`py-2 rounded-lg transition ${
              activeCategory === 'TOKEN'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveCategory('BOARD')}
            className={`py-2 rounded-lg transition ${
              activeCategory === 'BOARD'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Boards
          </button>
          <button
            onClick={() => setActiveCategory('AVATAR')}
            className={`py-2 rounded-lg transition ${
              activeCategory === 'AVATAR'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Avatars
          </button>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredItems.map((item) => {
            const owned = isOwned(item);
            const equipped = isEquipped(item);
            const canAfford = player.coins >= item.priceCoins;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                  equipped
                    ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10'
                    : owned
                    ? 'bg-[#10121e] border-emerald-500/30'
                    : 'bg-[#0f111a] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Item Visual & Info */}
                <div className="flex items-center gap-3">
                  {/* Visual Preview Swatch */}
                  <div
                    onClick={() => setPreviewItem(item)}
                    className="w-12 h-12 rounded-xl border flex items-center justify-center text-xl cursor-pointer hover:scale-105 transition shadow-md"
                    style={{
                      backgroundColor: item.previewColor,
                      borderColor: item.accentColor,
                    }}
                    title="Click to Preview"
                  >
                    {item.category === 'DICE' && '🎲'}
                    {item.category === 'TOKEN' && '👑'}
                    {item.category === 'BOARD' && '🏰'}
                    {item.category === 'AVATAR' && '👳'}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono uppercase font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[130px]">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right: Equip / Buy Button */}
                <div>
                  {equipped ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-[10px] uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Equipped</span>
                    </div>
                  ) : owned ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/40 transition"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmPurchaseItem(item)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110 shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                      <span>{item.priceCoins.toLocaleString()}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition"
        >
          Back to Arena
        </button>

        {/* =========================================
            Item Preview Modal
        ========================================= */}
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in zoom-in-95">
            <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#181b28] to-[#0d0e15] border-2 border-amber-400 p-6 text-center shadow-2xl text-white space-y-4">
              <div
                className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-2xl border-2"
                style={{
                  backgroundColor: previewItem.previewColor,
                  borderColor: previewItem.accentColor,
                }}
              >
                {previewItem.category === 'DICE' && '🎲'}
                {previewItem.category === 'TOKEN' && '👑'}
                {previewItem.category === 'BOARD' && '🏰'}
                {previewItem.category === 'AVATAR' && '👳'}
              </div>

              <div>
                <h4 className="font-heading font-black text-base text-amber-300">
                  {previewItem.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {previewItem.description}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-mono text-sm font-bold">
                <Coins className="w-4 h-4" />
                <span>{previewItem.priceCoins === 0 ? 'FREE' : `${previewItem.priceCoins.toLocaleString()} Coins`}</span>
              </div>

              <button
                onClick={() => setPreviewItem(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            Purchase Confirmation Dialog
        ========================================= */}
        {confirmPurchaseItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in zoom-in-95">
            <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-[#181b28] to-[#0d0e15] border-2 border-amber-400 p-6 text-center shadow-2xl text-white space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-heading font-black text-sm text-white">
                  Unlock {confirmPurchaseItem.name}?
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {confirmPurchaseItem.priceCoins.toLocaleString()} virtual coins will be deducted from your royal treasury.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmPurchaseItem(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold hover:brightness-110 shadow-md"
                >
                  Confirm & Equip
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
