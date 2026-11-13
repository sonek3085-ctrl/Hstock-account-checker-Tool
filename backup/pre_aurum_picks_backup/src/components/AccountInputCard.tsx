import React, { useState, useMemo, useRef } from 'react';
import { SocialPlatform } from '../types/status';
import { InstagramIcon, FacebookIcon, YouTubeIcon, TikTokIcon, GmailIcon } from './PlatformIcons';
import { Play, Trash2, Sparkles, AlertCircle, Info, CheckSquare, Upload, Zap, FileText } from 'lucide-react';

interface AccountInputCardProps {
  currentPlatform: SocialPlatform;
  onSelectPlatform: (platform: SocialPlatform) => void;
  onCheckAccounts: (inputs: string[], platform: SocialPlatform) => void;
  isChecking: boolean;
}

export const AccountInputCard: React.FC<AccountInputCardProps> = ({
  currentPlatform,
  onSelectPlatform,
  onCheckAccounts,
  isChecking,
}) => {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample presets for quick testing
  const SAMPLE_PRESETS: Record<SocialPlatform, string[]> = {
    instagram: [
      '@natgeo',
      'cristiano',
      'nasa',
      'leomessi',
      'https://www.instagram.com/instagram/',
      'nonexistent_fake_acc_xyz89218731',
    ],
    gmail: [
      'google@gmail.com',
      'support@gmail.com',
      'usmanalikhanchandio@gmail.com',
      'gmail@gmail.com',
      'test:suspended_account@gmail.com',
      'fake_never_registered_user991823@gmail.com',
    ],
    tiktok: [
      '@tiktok',
      '@charlidamelio',
      '@khaby.lame',
      '@mrbeast',
      'https://www.tiktok.com/@tiktok',
      'nonexistent_fake_tiktok_acc_9921',
    ],
    facebook: [
      'Google',
      'facebook',
      'https://www.facebook.com/Microsoft',
      'nonexistent_page_identifier_xyz999_404',
    ],
    youtube: [
      '@Google',
      '@MrBeast',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      '@channel_does_not_exist_404_verified_test',
    ],
  };

  // Generate 100 real & structured test usernames for Instagram / general testing
  const generate100Accounts = (): string[] => {
    const liveAccounts = [
      'cristiano', 'leomessi', 'selenagomez', 'natgeo', 'nike',
      'nasa', 'taylorswift', 'mrbeast', 'virat.kohli', 'therock',
      'kyliejenner', 'arianagrande', 'kimkardashian', 'beyonce', 'khloekardashian',
      'justinbieber', 'kendalljenner', 'neymarjr', 'jlo', 'billieeilish',
      'dualipa', 'zendaya', 'kingjames', 'fcbarcelona', 'realmadrid',
      'championsleague', 'apple', 'google', 'netflix', 'marvel',
      'disney', 'nba', 'instagram', 'badgalriri', 'champagnepapi',
      'shakira', 'chrisbrownofficial', 'gigihadid', 'priyankachopra', 'snoopdogg'
    ]; // 40 LIVE accounts

    const suspendedAccounts: string[] = [];
    for (let i = 1; i <= 25; i++) {
      suspendedAccounts.push(i % 2 === 0 ? `test:suspended_${i}` : `test:banned_${i}`);
    } // 25 SUSPENDED test accounts

    const notFoundAccounts: string[] = [];
    for (let i = 1; i <= 25; i++) {
      notFoundAccounts.push(`nonexistent_user_verified_404_${i}_xyz`);
    } // 25 NOT FOUND accounts

    const unverifiedAccounts: string[] = [];
    for (let i = 1; i <= 10; i++) {
      unverifiedAccounts.push(`test:unverified_${i}`);
    } // 10 UNVERIFIED test accounts

    return [...liveAccounts, ...suspendedAccounts, ...notFoundAccounts, ...unverifiedAccounts]; // Exactly 100 accounts!
  };

  // Parse lines, trim, and filter duplicates
  const parsedInputs = useMemo(() => {
    const rawLines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const uniqueSet = new Set<string>();
    const uniqueList: string[] = [];
    let duplicatesCount = 0;

    for (const line of rawLines) {
      const lower = line.toLowerCase();
      if (uniqueSet.has(lower)) {
        duplicatesCount += 1;
      } else {
        uniqueSet.add(lower);
        uniqueList.push(line);
      }
    }

    return {
      rawCount: rawLines.length,
      uniqueList,
      duplicatesCount,
    };
  }, [inputText]);

  const handleClear = () => {
    setInputText('');
  };

  const handleLoadSamples = () => {
    setInputText(SAMPLE_PRESETS[currentPlatform].join('\n'));
  };

  const handleLoad100Accounts = () => {
    const list100 = generate100Accounts();
    setInputText(list100.join('\n'));
  };

  const handleLoadTestSuite = () => {
    setInputText('test:live\ntest:suspended\ntest:notfound\ntest:unverified\ntest:private');
  };

  const handleLoadLiveAndBanned = () => {
    if (currentPlatform === 'youtube') {
      setInputText('@Google\n@MrBeast\ntest:suspended\ntest:live');
    } else if (currentPlatform === 'instagram') {
      setInputText('@natgeo\ntest:suspended\nnasa\ntest:banned');
    } else if (currentPlatform === 'gmail') {
      setInputText('google@gmail.com\nusmanalikhanchandio@gmail.com\ntest:suspended\ntest:banned\nsupport@gmail.com');
    } else {
      setInputText('Google\nfacebook\ntest:suspended\ntest:live');
    }
  };

  // Handle file upload (.txt or .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content
        .split(/[\r\n,]+/)
        .map((l) => l.replace(/["']/g, '').trim())
        .filter((l) => l.length > 0 && !l.toLowerCase().startsWith('category') && !l.toLowerCase().startsWith('username'));

      // Limit to 1,000 max as required
      const limited = lines.slice(0, 1000);
      setInputText(limited.join('\n'));
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedInputs.uniqueList.length === 0 || isChecking) return;
    onCheckAccounts(parsedInputs.uniqueList, currentPlatform);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Platform Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <button
          type="button"
          onClick={() => onSelectPlatform('instagram')}
          className={`flex-1 min-w-[120px] flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
            currentPlatform === 'instagram'
              ? 'border-pink-600 text-pink-700 dark:text-pink-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <InstagramIcon className="w-4 h-4 text-pink-600 shrink-0" />
          <span className="truncate">Instagram</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatform('gmail')}
          className={`flex-1 min-w-[140px] flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
            currentPlatform === 'gmail'
              ? 'border-red-500 text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <GmailIcon className="w-4 h-4 text-red-500 shrink-0" />
          <span className="truncate">Gmail Live/Banned</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatform('tiktok')}
          className={`flex-1 min-w-[100px] flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
            currentPlatform === 'tiktok'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TikTokIcon className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className="truncate">TikTok</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatform('youtube')}
          className={`flex-1 min-w-[100px] flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
            currentPlatform === 'youtube'
              ? 'border-red-600 text-red-700 dark:text-red-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <YouTubeIcon className="w-4 h-4 text-red-600 shrink-0" />
          <span className="truncate">YouTube</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPlatform('facebook')}
          className={`flex-1 min-w-[100px] flex items-center justify-center space-x-1.5 sm:space-x-2 py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
            currentPlatform === 'facebook'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FacebookIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">Facebook</span>
        </button>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>
                Enter {currentPlatform === 'gmail' ? 'Gmail Accounts / Emails' : `${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)} Usernames`}{' '}
                (100 to 1,000 supported)
              </span>
              <span className="text-slate-400 text-xs font-normal">(One per line)</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentPlatform === 'gmail'
                ? 'Paste user@gmail.com, bare usernames, or combos. Categorized strictly into LIVE, SUSPENDED, NOT FOUND, or UNVERIFIED.'
                : 'Paste @usernames, raw handles, or URLs. Categorized strictly into LIVE, SUSPENDED, NOT FOUND, or UNVERIFIED.'}
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* 100 Accounts Preset */}
            <button
              type="button"
              onClick={handleLoad100Accounts}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white shadow-xs transition-all active:scale-95"
              title="Instantly load 100 real & structured test accounts"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Load 100 Test Accounts</span>
            </button>

            {/* Upload File */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Upload accounts list from .txt or .csv"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            {/* Quick Samples */}
            <button
              type="button"
              onClick={handleLoadSamples}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Load small sample batch"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Samples</span>
            </button>

            {/* 4-Category Test Suite */}
            <button
              type="button"
              onClick={handleLoadTestSuite}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 transition-colors"
              title="Test LIVE, SUSPENDED, NOT FOUND, and UNVERIFIED categories"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>4-Category Test</span>
            </button>
          </div>
        </div>

        {/* Multi-line Textarea */}
        <div className="relative">
          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isChecking}
            placeholder={
              currentPlatform === 'instagram'
                ? '@natgeo\ncristiano\nleomessi\nnasa\nhttps://www.instagram.com/instagram/\nnonexistent_fake_acc_xyz89218731'
                : currentPlatform === 'facebook'
                ? 'Google\nfacebook\nhttps://www.facebook.com/Microsoft'
                : '@Google\n@MrBeast\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ'
            }
            className="w-full p-3.5 text-xs sm:text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
          />
        </div>

        {/* Validation summary & Duplicate Detection Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span>
              Total entered: <strong className="text-slate-800 dark:text-slate-200">{parsedInputs.rawCount}</strong>
            </span>
            {parsedInputs.duplicatesCount > 0 && (
              <span className="inline-flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                <AlertCircle className="w-3 h-3 mr-1" />
                {parsedInputs.duplicatesCount} duplicate{parsedInputs.duplicatesCount > 1 ? 's' : ''} filtered
              </span>
            )}
            <span>
              New to check: <strong className="text-slate-800 dark:text-slate-200">{parsedInputs.uniqueList.length}</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Info className="w-3 h-3" />
            <span>Automatic batch verification &bull; Max 1,000 per run</span>
          </div>
        </div>

        {/* Action Buttons: Check Accounts & Clear List */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClear}
            disabled={!inputText.trim() || isChecking}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <button
            type="submit"
            disabled={parsedInputs.uniqueList.length === 0 || isChecking}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isChecking
                ? 'Checking In Progress...'
                : `Check ${parsedInputs.uniqueList.length > 0 ? `${parsedInputs.uniqueList.length} ` : ''}Accounts`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
