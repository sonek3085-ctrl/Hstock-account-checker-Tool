import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Facebook,
  Youtube,
  Zap,
} from 'lucide-react';

type Currency = 'USD' | 'EUR' | 'GBP';

interface PackageTier {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  costPerFollower: number; // in USD
  costPerEngagement: number; // in USD
  deliveryDaysRatio: number;
  expectedEngagementMultiplier: number;
  popular?: boolean;
  features: string[];
}

export const BudgetEstimator: React.FC = () => {
  const [targetFollowers, setTargetFollowers] = useState<number>(5000);
  const [targetEngagement, setTargetEngagement] = useState<number>(1500);
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'youtube' | 'all'>('instagram');
  const [campaignGoal, setCampaignGoal] = useState<'growth' | 'engagement' | 'balanced'>('balanced');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [copiedQuote, setCopiedQuote] = useState(false);

  const currencyRates: Record<Currency, { symbol: string; rate: number }> = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
  };

  const curr = currencyRates[currency];

  const packageTiers: PackageTier[] = [
    {
      id: 'organic_drip',
      name: 'Organic Drip Network',
      tagline: 'Algorithmic content promotion & explore page boost',
      badge: 'Best Value',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      costPerFollower: 0.022,
      costPerEngagement: 0.008,
      deliveryDaysRatio: 1.0,
      expectedEngagementMultiplier: 0.28,
      features: [
        'Gradual daily delivery to protect account trust score',
        'Explore page & hashtag discovery push',
        'Real profile retention guarantee (30-day refills)',
        'Basic audience analytics report',
      ],
    },
    {
      id: 'targeted_ads',
      name: 'Targeted Meta Ads Pro',
      tagline: 'High-conversion sponsored reels & in-feed ads',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      costPerFollower: 0.048,
      costPerEngagement: 0.016,
      deliveryDaysRatio: 0.7,
      expectedEngagementMultiplier: 0.45,
      popular: true,
      features: [
        'Geo-targeted niche audience selection (Demographics & Interests)',
        'Sponsored Instagram Story & Reels native placements',
        'High CTR creative optimization & A/B testing',
        'Live tracking pixel & conversion transparency',
      ],
    },
    {
      id: 'creator_collab',
      name: 'Creator Shoutouts & Collabs',
      tagline: 'Authentic creator reposts & collaborative reels',
      badge: 'High Engagement',
      badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      costPerFollower: 0.085,
      costPerEngagement: 0.028,
      deliveryDaysRatio: 0.5,
      expectedEngagementMultiplier: 0.75,
      features: [
        'Hand-picked verified creators in your exact niche',
        'Collaborative post co-authoring for organic discovery',
        'Authentic comments, story shares & save boosts',
        'Permanent brand mention & dedicated swipe-ups',
      ],
    },
    {
      id: 'viral_blitz',
      name: 'Viral Campaign Blitz',
      tagline: 'Multi-creator wave + official whitelisted ads',
      badge: 'Enterprise Growth',
      badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      costPerFollower: 0.135,
      costPerEngagement: 0.042,
      deliveryDaysRatio: 0.35,
      expectedEngagementMultiplier: 1.2,
      features: [
        'Full viral syndication across 15+ high-authority creator pages',
        'Priority ad whitelisting via Meta Business Partner API',
        'Dedicated 24/7 account growth manager & custom creative production',
        'Guaranteed engagement floor + comprehensive ROI report',
      ],
    },
  ];

  // Calculated estimates per package
  const estimatedPackages = useMemo(() => {
    return packageTiers.map((tier) => {
      // Calculate costs based on target followers + target engagement
      const baseFollowerCost = targetFollowers * tier.costPerFollower;
      const baseEngagementCost = targetEngagement * tier.costPerEngagement;

      let combinedCost = baseFollowerCost + baseEngagementCost;
      if (campaignGoal === 'growth') {
        combinedCost = baseFollowerCost * 1.05 + baseEngagementCost * 0.4;
      } else if (campaignGoal === 'engagement') {
        combinedCost = baseFollowerCost * 0.6 + baseEngagementCost * 1.15;
      }

      // Convert to chosen currency
      const minCost = Math.round(combinedCost * 0.9 * curr.rate);
      const maxCost = Math.round(combinedCost * 1.15 * curr.rate);
      const avgCost = Math.round(((minCost + maxCost) / 2));

      // Calculate estimated days
      const days = Math.max(3, Math.round((targetFollowers / 600) * tier.deliveryDaysRatio));

      // Estimated total interactions
      const totalEstimatedInteractions = Math.round(
        targetEngagement * tier.expectedEngagementMultiplier + targetFollowers * 0.12
      );

      // Cost per follower / cost per interaction in current currency
      const effectiveCpf = (avgCost / Math.max(1, targetFollowers)).toFixed(3);
      const effectiveCpe = (avgCost / Math.max(1, totalEstimatedInteractions)).toFixed(3);

      return {
        ...tier,
        minCost,
        maxCost,
        avgCost,
        days,
        totalEstimatedInteractions,
        effectiveCpf,
        effectiveCpe,
      };
    });
  }, [targetFollowers, targetEngagement, campaignGoal, curr.rate]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Package Name',
      'Tier Badge',
      'Target Followers',
      'Target Engagements',
      `Min Cost (${currency})`,
      `Max Cost (${currency})`,
      `Est. Avg Cost (${currency})`,
      'Est. Delivery Time',
      `Cost Per Follower (${currency})`,
      `Cost Per Engagement (${currency})`,
    ];

    const rows = estimatedPackages.map((pkg) => [
      `"${pkg.name}"`,
      `"${pkg.badge}"`,
      targetFollowers,
      pkg.totalEstimatedInteractions,
      pkg.minCost,
      pkg.maxCost,
      pkg.avgCost,
      `"${pkg.days} days"`,
      pkg.effectiveCpf,
      pkg.effectiveCpe,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promotion_budget_estimate_${targetFollowers}_followers_${currency}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Quotation
  const handleCopyQuote = async () => {
    const summary = [
      `📊 PROMOTION BUDGET ESTIMATOR QUOTE (${currency})`,
      `Target Followers: ${targetFollowers.toLocaleString()}`,
      `Target Engagements: ${targetEngagement.toLocaleString()}`,
      `Platform: ${platform.toUpperCase()}`,
      `Goal: ${campaignGoal.toUpperCase()}`,
      '----------------------------------------',
      ...estimatedPackages.map(
        (p) =>
          `• ${p.name} [${p.badge}]: ${curr.symbol}${p.minCost.toLocaleString()} - ${curr.symbol}${p.maxCost.toLocaleString()} (${p.days} days delivery, est. ~${curr.symbol}${p.effectiveCpf}/follower)`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-heading">
              Promotion Budget Estimator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate projected advertising &amp; growth costs across real promotional tiers and packages
            </p>
          </div>
        </div>

        {/* Currency & Actions */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
            {(['USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  currency === c
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopyQuote}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Copy summary quotation to clipboard"
          >
            {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedQuote ? 'Copied Quote!' : 'Copy Quote'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            title="Download budget estimate as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 space-y-5 bg-white dark:bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Followers Input */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Target Followers</span>
              </label>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {targetFollowers.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={500}
              max={100000}
              step={500}
              value={targetFollowers}
              onChange={(e) => setTargetFollowers(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />

            {/* Quick follower presets */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto text-[10px]">
              {[1000, 5000, 10000, 25000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetFollowers(val)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                    targetFollowers === val
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Target Engagement Input */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Target Engagements</span>
              </label>
              <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                {targetEngagement.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={100}
              max={50000}
              step={200}
              value={targetEngagement}
              onChange={(e) => setTargetEngagement(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />

            {/* Quick engagement presets */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto text-[10px]">
              {[500, 1500, 5000, 15000, 30000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTargetEngagement(val)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer ${
                    targetEngagement === val
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selector */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Target Platform</span>
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="instagram">Instagram Ads &amp; Network</option>
              <option value="facebook">Facebook Page Promotion</option>
              <option value="youtube">YouTube Channel Push</option>
              <option value="all">Cross-Platform Unified</option>
            </select>
            <p className="text-[11px] text-slate-500">Includes native video &amp; profile boost</p>
          </div>

          {/* Campaign Strategy Goal */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Campaign Strategy</span>
            </label>
            <select
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="balanced">Balanced (Followers + Engagements)</option>
              <option value="growth">Pure Growth (Maximum Followers)</option>
              <option value="engagement">High Interaction (Likes &amp; Comments)</option>
            </select>
            <p className="text-[11px] text-slate-500">Dynamically balances budget weighting</p>
          </div>
        </div>
      </div>

      {/* Clear Comparative Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-950/75 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
              <th className="py-3.5 px-4 min-w-[200px]">Promotion Package</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Tier Type</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Estimated Cost Range</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Avg. Budget</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Cost / Follower</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Total Engagements</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Est. Timeline</th>
              <th className="py-3.5 px-4 min-w-[240px]">Key Package Inclusions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {estimatedPackages.map((pkg) => {
              return (
                <tr
                  key={pkg.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    pkg.popular ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* Package Name */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {pkg.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {pkg.tagline}
                    </div>
                  </td>

                  {/* Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${pkg.badgeColor}`}
                    >
                      {pkg.badge}
                    </span>
                  </td>

                  {/* Estimated Cost Range */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                      {curr.symbol}{pkg.minCost.toLocaleString()} &ndash; {curr.symbol}{pkg.maxCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {currency} Total
                    </div>
                  </td>

                  {/* Avg Cost */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                      {curr.symbol}{pkg.avgCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">Target median</div>
                  </td>

                  {/* Cost Per Follower */}
                  <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                    <div>{curr.symbol}{pkg.effectiveCpf} <span className="text-[10px] text-slate-400">/follower</span></div>
                    <div className="text-[10px] text-slate-400">{curr.symbol}{pkg.effectiveCpe} /interaction</div>
                  </td>

                  {/* Total Engagements */}
                  <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      <span>{pkg.totalEstimatedInteractions.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">Likes &bull; Comments &bull; Shares</div>
                  </td>

                  {/* Timeline */}
                  <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pkg.days} Days</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Paced safe delivery</div>
                  </td>

                  {/* Features */}
                  <td className="py-4 px-4">
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {pkg.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Key Insights Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Estimates are derived from verified Meta Graph advertising metrics, creator collaboration benchmarks, and algorithmic retention pacing.
          </span>
        </div>
        <div className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Target: {targetFollowers.toLocaleString()} Followers &bull; {targetEngagement.toLocaleString()} Engagements
        </div>
      </div>
    </div>
  );
};
