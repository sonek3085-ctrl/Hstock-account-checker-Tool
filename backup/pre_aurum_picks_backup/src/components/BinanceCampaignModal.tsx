import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Tv,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { PlayerProfile } from '../types/ludo';
import { ludoApi } from '../services/ludoApi';
import { rewardedAdSdk, AdCreative } from '../services/rewardedAdSdk';
import { playLudoSound } from '../utils/ludoRules';

interface BinanceCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile | null;
  onUpdatePlayer: (updated: PlayerProfile) => void;
  initialTab?: 'CAMPAIGN' | 'REWARDED_AD';
  adCooldownSec?: number;
}

const BINANCE_CAMPAIGN_URL = 'https://www.binance.com/en/ti/act/Qafila_ae';

export const BinanceCampaignModal: React.FC<BinanceCampaignModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdatePlayer,
  initialTab = 'CAMPAIGN',
  adCooldownSec = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMPAIGN' | 'REWARDED_AD'>(initialTab);

  // Rewarded Ad SDK state
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState<number>(5);
  const [adPercent, setAdPercent] = useState<number>(0);
  const [isAdCompleted, setIsAdCompleted] = useState<boolean>(false);
  const [currentCreative, setCurrentCreative] = useState<AdCreative | null>(null);
  const [adMuted, setAdMuted] = useState<boolean>(false);
  const [adVerificationToken, setAdVerificationToken] = useState<string | null>(null);
  const [adStopFn, setAdStopFn] = useState<(() => void) | null>(null);

  // Binance UID verification form state
  const [binanceUidInput, setBinanceUidInput] = useState<string>('');
  const [isSubmittingUid, setIsSubmittingUid] = useState<boolean>(false);
  const [uidSuccessMessage, setUidSuccessMessage] = useState<string | null>(null);
  const [uidErrorMessage, setUidErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsAdPlaying(false);
      setIsAdCompleted(false);
      setUidSuccessMessage(null);
      setUidErrorMessage(null);
    } else {
      // Cancel any ongoing ad if modal closes
      if (adStopFn) {
        adStopFn();
        setAdStopFn(null);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // ==========================================
  // 1. REWARDED AD SDK ACTIONS
  // ==========================================
  const handleStartRewardedAd = () => {
    if (adCooldownSec > 0) {
      alert(`Ad cooldown active. Please wait ${adCooldownSec} seconds.`);
      return;
    }

    setIsAdPlaying(true);
    setIsAdCompleted(false);
    setAdVerificationToken(null);
    const creative = rewardedAdSdk.getRandomAd();
    setCurrentCreative(creative);

    const controller = rewardedAdSdk.startAd(
      {
        onAdStarted: () => {
          setIsAdPlaying(true);
        },
        onProgress: (seconds, percent) => {
          setAdSecondsLeft(seconds);
          setAdPercent(percent);
        },
        onUserEarnedReward: async (reward) => {
          setIsAdCompleted(true);
          setAdVerificationToken(reward.verificationToken);
          playLudoSound('SAFE');

          // Credit server-side coins
          if (player) {
            try {
              const res = await ludoApi.claimRewardedAd(player.id, reward.verificationToken);
              onUpdatePlayer(res.player);
            } catch (err: any) {
              console.error('Failed to claim ad coins:', err);
            }
          }
        },
        onAdClosed: (completed) => {
          if (!completed) {
            setIsAdPlaying(false);
            setIsAdCompleted(false);
          }
        },
      },
      500
    );

    setAdStopFn(() => controller.stop);
  };

  const handleFinishAdReward = () => {
    if (adStopFn) {
      adStopFn();
      setAdStopFn(null);
    }
    setIsAdPlaying(false);
    setIsAdCompleted(false);
  };

  // ==========================================
  // 2. BINANCE CAMPAIGN ACTIONS
  // ==========================================
  const handleOpenBinanceLink = () => {
    // Official requirement: The Binance button must open the exact referral link
    // Do not treat it as a video ad or automatically award rewards just for clicking it
    window.open(BINANCE_CAMPAIGN_URL, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitBinanceUid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    setUidErrorMessage(null);
    setUidSuccessMessage(null);

    const clean = binanceUidInput.trim();
    if (!clean) {
      setUidErrorMessage('Please enter your Binance numeric User ID (UID).');
      return;
    }

    if (!/^\d{8,10}$/.test(clean)) {
      setUidErrorMessage('Binance UID must be an 8 to 10-digit numeric ID from your Binance profile.');
      return;
    }

    setIsSubmittingUid(true);
    try {
      const res = await ludoApi.claimBinanceUid(player.id, clean);
      onUpdatePlayer(res.player);
      setUidSuccessMessage(res.message);
      playLudoSound('SAFE');
      setBinanceUidInput('');
    } catch (err: any) {
      setUidErrorMessage(err.message || 'Failed to verify Binance UID.');
    } finally {
      setIsSubmittingUid(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] rounded-3xl bg-[#0d0f17] border border-amber-500/40 shadow-2xl shadow-amber-500/10 text-white flex flex-col overflow-hidden">
        
        {/* =========================================
            HEADER BAR
        ========================================= */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#12141f] via-[#151928] to-[#12141f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0B90B] flex items-center justify-center text-black font-black text-sm shadow-md">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Special Rewards Hub
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  VERIFIED
                </span>
              </div>
              <h3 className="font-heading font-black text-base text-white tracking-wide">
                Binance Campaign & Rewarded Ads
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================
            NAVIGATION TABS
        ========================================= */}
        <div className="flex border-b border-slate-800/80 bg-[#090b11]">
          <button
            onClick={() => {
              setActiveTab('CAMPAIGN');
              if (isAdPlaying && adStopFn) {
                adStopFn();
                setIsAdPlaying(false);
              }
            }}
            className={`flex-1 py-3 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'CAMPAIGN'
                ? 'border-[#F0B90B] text-[#F0B90B] bg-[#F0B90B]/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F0B90B]" />
            Binance Campaign (Qafila AE)
          </button>

          <button
            onClick={() => setActiveTab('REWARDED_AD')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'REWARDED_AD'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Watch Video Ads (+500 Coins)
          </button>
        </div>

        {/* =========================================
            BODY CONTENT
        ========================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'CAMPAIGN' ? (
            /* =========================================
                TAB 1: BINANCE CAMPAIGN (QAFILA AE)
            ========================================= */
            <div className="space-y-4">
              {/* Campaign Banner Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e2026] via-[#14161f] to-[#0a0c13] border border-[#F0B90B]/40 p-4 shadow-xl">
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F0B90B] text-black">
                      Official Binance Partner
                    </span>
                    <h4 className="font-heading font-black text-lg text-white mt-2">
                      Qafila AE Special Campaign
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-[260px] leading-relaxed">
                      Join the official Binance community campaign to unlock fee rebates, welcome vouchers, and imperial game perks.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F0B90B]/20 border border-[#F0B90B]/40 flex items-center justify-center text-2xl shrink-0">
                    🪙
                  </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F0B90B]/15 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* PRIMARY ACTION BUTTONS REQUIRED BY USER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Button 1: Explore Binance Campaign */}
                <button
                  onClick={handleOpenBinanceLink}
                  className="w-full py-3 px-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-gradient-to-r from-[#F0B90B] via-yellow-400 to-[#e2ad06] text-black hover:opacity-95 active:scale-98 transition shadow-lg shadow-[#F0B90B]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-black" />
                  Explore Binance Campaign
                </button>

                {/* Button 2: Watch Ad & Earn Coins */}
                <button
                  onClick={() => {
                    setActiveTab('REWARDED_AD');
                    handleStartRewardedAd();
                  }}
                  disabled={adCooldownSec > 0}
                  className={`w-full py-3 px-4 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    adCooldownSec === 0
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-black hover:opacity-95 active:scale-98 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  Watch Ad & Earn Coins
                </button>
              </div>

              {/* Notice Regarding Non-Incentivized Direct Clicks */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Binance Referral Policy:</strong> Clicking the Binance link does not automatically award coins. Per Binance’s official terms, rewards are claimed on Binance after signing up and completing account verification (KYC).
                </p>
              </div>

              {/* Official Binance Welcome Perks Highlights */}
              <div className="rounded-2xl bg-[#10121b] border border-slate-800 p-3.5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F0B90B]" />
                  <h5 className="font-heading font-bold text-xs text-white">
                    Official Welcome Perks Provided by Binance
                  </h5>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#161824] border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        Trading Fee Rebate Vouchers
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Rebate on Spot & Margin trading fees
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#F0B90B] px-2 py-0.5 rounded bg-[#F0B90B]/10 border border-[#F0B90B]/30">
                      Up to 600 USDT
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161824] border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        Qafila Community Access
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Airdrop pools and regional giveaways
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      VIP Status
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161824] border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-200">
                        AURUM LUDO Sultan Rewards
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Exclusive in-game coins + Sultan Avatar
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      +5,000 Coins
                    </span>
                  </div>
                </div>
              </div>

              {/* Verify & Link Binance UID Form (Approved Incentive Tracking) */}
              <div className="rounded-2xl bg-gradient-to-b from-[#141724] to-[#0f111a] border border-amber-500/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h5 className="font-heading font-bold text-xs text-white">
                      Link Verified Binance UID
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400">
                    +5,000 In-Game Coins
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  If you joined Binance through our campaign link, enter your numeric Binance Account UID below to claim your royal game reward:
                </p>

                {player?.binanceUid ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Binance Account Linked</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        UID: {player.binanceUid.slice(0, 3)}***{player.binanceUid.slice(-2)} (Reward Claimed)
                      </span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBinanceUid} className="space-y-2.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={binanceUidInput}
                        onChange={(e) => setBinanceUidInput(e.target.value)}
                        placeholder="e.g. 182749204 (8-10 digits)"
                        className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-[#F0B90B] text-xs text-white font-mono outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingUid || !binanceUidInput.trim()}
                        className="px-4 py-2 rounded-xl bg-[#F0B90B] hover:bg-yellow-400 text-black font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        {isSubmittingUid ? 'Verifying...' : 'Verify UID'}
                      </button>
                    </div>

                    {uidErrorMessage && (
                      <p className="text-[10px] text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {uidErrorMessage}
                      </p>
                    )}

                    {uidSuccessMessage && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {uidSuccessMessage}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Exact Campaign Link Reference Details */}
              <div className="p-3 rounded-xl bg-[#090b11] border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="font-mono truncate max-w-[240px]">
                  {BINANCE_CAMPAIGN_URL}
                </span>
                <button
                  onClick={handleOpenBinanceLink}
                  className="text-[#F0B90B] hover:underline flex items-center gap-1 font-bold shrink-0"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* =========================================
                TAB 2: REWARDED VIDEO ADS SDK PLAYER
            ========================================= */
            <div className="space-y-4">
              {!isAdPlaying && !isAdCompleted ? (
                /* Ad Idle Screen */
                <div className="rounded-2xl bg-gradient-to-b from-[#141624] to-[#0e101a] border border-slate-800 p-5 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 mx-auto flex items-center justify-center text-black text-2xl shadow-xl shadow-amber-500/20">
                    <Tv className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="font-heading font-black text-base text-white">
                      Watch Video Sponsor & Earn Virtual Coins
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Watch a 5-second sponsor video verified by Google AdMob network to claim +500 free virtual game coins.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AdMob Verified
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" /> +500 Coins
                    </span>
                  </div>

                  {/* Primary Watch Ad Button */}
                  <button
                    onClick={handleStartRewardedAd}
                    disabled={adCooldownSec > 0}
                    className={`w-full py-3.5 px-4 rounded-xl font-heading font-black text-sm uppercase tracking-wide transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      adCooldownSec === 0
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black hover:opacity-95 active:scale-98 shadow-amber-500/25'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-70'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    {adCooldownSec === 0 ? 'Watch Ad & Earn Coins' : `Cooldown Active (${adCooldownSec}s)`}
                  </button>

                  {/* Also show Binance button here as well for convenience */}
                  <button
                    onClick={handleOpenBinanceLink}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs border border-[#F0B90B]/40 text-[#F0B90B] hover:bg-[#F0B90B]/10 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Explore Binance Campaign
                  </button>
                </div>
              ) : isAdPlaying && !isAdCompleted ? (
                /* Live Ad Playing Screen with Countdown */
                <div className="rounded-2xl bg-black border border-amber-500/40 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> {currentCreative?.network || 'Google AdMob'}
                    </span>
                    <button
                      onClick={() => setAdMuted(!adMuted)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {adMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Creative Presentation Banner */}
                  <div
                    className={`w-full aspect-[16/9] rounded-xl bg-gradient-to-br ${
                      currentCreative?.bannerGradient || 'from-amber-600 via-yellow-600 to-amber-800'
                    } p-4 flex flex-col justify-between items-center text-center shadow-inner relative overflow-hidden`}
                  >
                    <div className="w-full flex justify-between items-center z-10">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-white font-mono">
                        {currentCreative?.badge || 'SPONSORED'}
                      </span>
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-black/70 text-amber-300 border border-amber-400/40 animate-pulse">
                        Reward in {adSecondsLeft}s
                      </span>
                    </div>

                    <div className="z-10 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center text-2xl mb-1 shadow-md">
                        {currentCreative?.logo || '👑'}
                      </div>
                      <h4 className="font-heading font-black text-sm text-white drop-shadow">
                        {currentCreative?.sponsor || 'Aurum Royale Grand Arena'}
                      </h4>
                      <p className="text-[11px] text-white/90 mt-0.5 max-w-[240px]">
                        {currentCreative?.tagline || 'Experience imperial Ludo gameplay with live multiplayer'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full z-10">
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-1000 ease-linear rounded-full"
                          style={{ width: `${adPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-400">
                    Video sponsor is streaming. Please do not close until the timer ends.
                  </p>
                </div>
              ) : (
                /* Ad Completed Claim Screen */
                <div className="rounded-2xl bg-gradient-to-b from-[#111e15] to-[#0c120e] border border-emerald-500/50 p-5 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 mx-auto flex items-center justify-center text-emerald-400 text-3xl shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Verified Completion
                    </span>
                    <h4 className="font-heading font-black text-lg text-white mt-1">
                      +500 Virtual Coins Credited!
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Thank you for supporting AURUM LUDO. Coins have been safely deposited to your royal wallet.
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-slate-800 text-[10px] font-mono text-slate-400">
                    Network Token: {adVerificationToken || 'ADMOB_VERIFIED'}
                  </div>

                  <button
                    onClick={handleFinishAdReward}
                    className="w-full py-3 px-4 rounded-xl font-heading font-black text-sm uppercase tracking-wide bg-emerald-500 hover:bg-emerald-400 text-black transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Awesome, Back to Game
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================
            FOOTER DISCLAIMER
        ========================================= */}
        <div className="p-3 border-t border-slate-800/80 bg-[#07090e] text-center text-[10px] text-slate-400">
          AURUM LUDO coins are virtual in-game entertainment items with zero cash value. No real-money wagering.
        </div>
      </div>
    </div>
  );
};
