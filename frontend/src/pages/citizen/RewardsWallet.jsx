import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  EcoLeafIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  InfoIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '../../components/ui/Icons';
import { rewardsApi } from '../../services/api';

const FALLBACK_DEMO_WALLET = {
  coins: 120,
  totalEarned: 120,
  totalRedeemed: 0,
  availableCoupons: [
    {
      id: 'COUPON_GROCERY_50',
      name: 'EcoMart Groceries Voucher',
      discount: '₹100 Off',
      cost: 50,
      merchant: 'EcoMart Stores & Online',
      isRedeemed: false,
    },
    {
      id: 'COUPON_RIDE_75',
      name: 'GreenRide EV Mobility Pass',
      discount: '20% Off',
      cost: 75,
      merchant: 'GreenRide EV Cab Service',
      isRedeemed: false,
    },
    {
      id: 'COUPON_TECH_100',
      name: 'TechRefurb Spare Parts Voucher',
      discount: '₹250 Off',
      cost: 100,
      merchant: 'Certified TechRefurb Network',
      isRedeemed: false,
    },
    {
      id: 'COUPON_ECOHOME_150',
      name: 'ZeroWaste Home Starter Kit',
      discount: '15% Off',
      cost: 150,
      merchant: 'EarthFirst Sustainable Living',
      isRedeemed: false,
    },
  ],
  transactions: [
    {
      _id: 'tx_seed_1',
      type: 'EARN',
      amount: 50,
      deviceCode: 'EW-2026-000103',
      description: 'Verified collection of TV (EW-2026-000103)',
      createdAt: new Date('2026-10-02T10:00:00Z').toISOString(),
    },
    {
      _id: 'tx_seed_2',
      type: 'EARN',
      amount: 70,
      deviceCode: 'EW-2026-000104',
      description: 'Verified collection of BATTERY (EW-2026-000104)',
      createdAt: new Date('2026-10-04T14:30:00Z').toISOString(),
    },
  ],
};

export function RewardsWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);

  const [redeemingId, setRedeemingId] = useState(null);
  const [redemptionResult, setRedemptionResult] = useState(null);
  const [actionError, setActionError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    setActionError('');
    try {
      const data = await rewardsApi.getWallet();
      setWallet(data);
      setIsDemoFallback(false);
    } catch (err) {
      console.warn('Backend rewards API unavailable, activating demo wallet mode:', err.message);
      // Fallback to sample demo wallet so screen is never broken with "Resource not found"
      setWallet(FALLBACK_DEMO_WALLET);
      setIsDemoFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRedeem = async (couponId) => {
    setRedeemingId(couponId);
    setActionError('');
    setRedemptionResult(null);
    setCopiedCode(false);

    try {
      const res = await rewardsApi.redeemCoupon(couponId);
      setRedemptionResult(res);
      // Refresh wallet
      await fetchWallet();
    } catch (err) {
      console.error('Redemption error:', err);
      // Check if user is in demo fallback mode
      if (isDemoFallback) {
        const coupon = wallet.availableCoupons.find((c) => c.id === couponId);
        if (coupon && wallet.coins >= coupon.cost) {
          const fakeCode = `ECO-${coupon.cost}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const newBalance = wallet.coins - coupon.cost;
          const newTx = {
            _id: `tx_${Date.now()}`,
            type: 'REDEEM',
            amount: coupon.cost,
            couponCode: fakeCode,
            description: `Redeemed ${coupon.name} (${coupon.discount})`,
            createdAt: new Date().toISOString(),
          };
          setWallet({
            ...wallet,
            coins: newBalance,
            totalRedeemed: (wallet.totalRedeemed || 0) + coupon.cost,
            availableCoupons: wallet.availableCoupons.map((c) =>
              c.id === couponId ? { ...c, isRedeemed: true, voucherCode: fakeCode } : c
            ),
            transactions: [newTx, ...wallet.transactions],
          });
          setRedemptionResult({
            success: true,
            voucherCode: fakeCode,
            coupon,
            message: `Coupon redeemed successfully! Use code ${fakeCode} at checkout.`,
          });
          setRedeemingId(null);
          return;
        }
      }
      setActionError(err.message || 'Redemption failed. Check your coin balance.');
    } finally {
      setRedeemingId(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (loading && !wallet) {
    return <LoadingState message="Loading your EcoCoins balance and coupon ledger..." />;
  }

  const currentCoins = wallet?.coins ?? 120;
  const totalEarned = wallet?.totalEarned ?? 120;
  const totalRedeemed = wallet?.totalRedeemed ?? 0;
  const coupons = wallet?.availableCoupons || [];
  const transactions = wallet?.transactions || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest-800">
              Civic Sustainability Incentives
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              DEMO SHOP
            </span>
            {isDemoFallback && (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                SIMULATED LEDGER
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            REWARDS WALLET
          </h1>
          <p className="text-sm text-zinc-600">
            Earn verified EcoCoins every time your old device is collected and verified by an authorized partner.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards: Balance, Earned, Redeemed */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Main Available Balance */}
        <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-2xl p-6 shadow-subtle border border-forest-800 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <EcoLeafIcon className="w-4 h-4 text-emerald-400" />
              <span>EcoCoins Balance</span>
            </div>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {currentCoins}
              </span>
              <span className="text-sm font-bold text-emerald-300 font-mono">Coins</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 pt-3 border-t border-forest-800/80">
            Available for immediate voucher redemption
          </p>
        </div>

        {/* Total Earned */}
        <div className="bg-white rounded-2xl p-6 shadow-subtle border border-zinc-200 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              Total Coins Earned
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-3xl font-black font-mono text-forest-900">
                {totalEarned}
              </span>
              <span className="text-xs font-semibold text-zinc-500 font-mono">Coins</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-100 flex items-center gap-1.5">
            <TruckIcon className="w-3.5 h-3.5 text-forest-700" />
            +50 coins per verified collection event
          </p>
        </div>

        {/* Total Redeemed */}
        <div className="bg-white rounded-2xl p-6 shadow-subtle border border-zinc-200 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              Total Coins Redeemed
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-3xl font-black font-mono text-zinc-800">
                {totalRedeemed}
              </span>
              <span className="text-xs font-semibold text-zinc-500 font-mono">Coins</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-100">
            Applied toward sample partner discount coupons
          </p>
        </div>
      </div>

      {/* Redemption Success Alert / Modal */}
      {redemptionResult && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-subtle space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 text-emerald-950">
              <CheckCircleIcon className="w-6 h-6 text-emerald-700 flex-shrink-0" />
              <strong className="text-base font-extrabold text-emerald-950">
                Coupon Redeemed Successfully!
              </strong>
            </div>
            <button
              onClick={() => setRedemptionResult(null)}
              className="text-xs text-zinc-400 hover:text-zinc-600 font-bold"
            >
              ✕ Dismiss
            </button>
          </div>

          <p className="text-xs text-emerald-900">{redemptionResult.message}</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <div className="flex items-center gap-2 bg-white border border-emerald-300 rounded-xl px-4 py-2 font-mono">
              <span className="text-xs text-zinc-500 font-medium">PROMO CODE:</span>
              <span className="font-mono font-black text-base text-forest-950 tracking-wider">
                {redemptionResult.voucherCode}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopyCode(redemptionResult.voucherCode)}
            >
              {copiedCode ? '✓ Copied to Clipboard!' : 'Copy Code'}
            </Button>
          </div>
        </div>
      )}

      {/* Redemption Error Alert */}
      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-fadeIn">
          <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-700 space-y-0.5">
            <strong className="block font-bold">Redemption Notice:</strong>
            <p>{actionError}</p>
          </div>
        </div>
      )}

      {/* Sample Coupons / Reward Cards Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-950">
              Available Reward Coupons (Sample Demo Catalog)
            </h2>
            <p className="text-xs text-zinc-500">
              Test the full redemption flow: spend coins, receive codes, and observe real-time balance deductions.
            </p>
          </div>
          <span className="text-[11px] font-mono text-forest-800 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200 font-bold self-start sm:self-auto">
            1 Device = 50 Coins
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coupons.map((coupon) => {
            const canAfford = currentCoins >= coupon.cost;
            const isRedeemed = Boolean(coupon.isRedeemed);
            const isRedeeming = redeemingId === coupon.id;

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all shadow-subtle ${
                  isRedeemed
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-zinc-200 hover:border-forest-600/50 hover:shadow-premium'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase bg-forest-50 text-forest-900 px-2 py-0.5 rounded border border-forest-200">
                      {coupon.discount}
                    </span>
                    <span className="text-xs font-mono font-black text-forest-900">
                      {coupon.cost} Coins
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-950">{coupon.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{coupon.merchant}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  {isRedeemed ? (
                    <div className="space-y-1.5 text-center">
                      <span className="inline-block text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300 w-full">
                        ✓ Redeemed
                      </span>
                      {coupon.voucherCode && (
                        <span className="text-[10px] font-mono text-zinc-500 block truncate">
                          Code: {coupon.voucherCode}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant={canAfford ? 'primary' : 'secondary'}
                      size="sm"
                      className="w-full text-xs"
                      disabled={!canAfford || isRedeeming}
                      loading={isRedeeming}
                      onClick={() => handleRedeem(coupon.id)}
                    >
                      {canAfford
                        ? `Redeem (${coupon.cost} Coins)`
                        : `Need ${coupon.cost - currentCoins} More Coins`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <Card>
        <CardHeader
          title="EcoCoins Transaction Ledger"
          subtitle="Audit log of collection rewards earned and coupons redeemed"
        />
        <CardBody className="p-0">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 font-mono">
              No transactions recorded yet. Complete your first e-waste collection to receive coins!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" role="table">
                <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th scope="col" className="p-3.5">Date</th>
                    <th scope="col" className="p-3.5">Event / Description</th>
                    <th scope="col" className="p-3.5">Type</th>
                    <th scope="col" className="p-3.5">Promo Code</th>
                    <th scope="col" className="p-3.5 text-right">Coins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="p-3.5 text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-zinc-900 font-sans font-medium">
                        {tx.description}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.type === 'EARN'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-600 font-bold">
                        {tx.couponCode || '—'}
                      </td>
                      <td className="p-3.5 text-right font-black">
                        <span
                          className={tx.type === 'EARN' ? 'text-forest-900' : 'text-zinc-500'}
                        >
                          {tx.type === 'EARN' ? `+${tx.amount}` : `-${tx.amount}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Demo Disclosure Box */}
      <div className="p-4 bg-zinc-100 rounded-xl text-xs text-zinc-600 border border-zinc-200 flex items-start gap-2.5">
        <InfoIcon className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Demo Shop Disclosure:</strong> EcoCoins are earned strictly upon certified collection of eligible electronic devices (+50 coins per device). Duplicate collection rewards for the same device are prohibited. Sample coupons and discount codes are simulated for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}
