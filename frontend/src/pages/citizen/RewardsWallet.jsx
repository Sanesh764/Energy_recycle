import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  EcoLeafIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  InfoIcon,
} from '../../components/ui/Icons';
import { rewardsApi } from '../../services/api';

export function RewardsWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [redeemingId, setRedeemingId] = useState(null);
  const [redemptionResult, setRedemptionResult] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rewardsApi.getWallet();
      setWallet(data);
    } catch (err) {
      console.error('Failed to load wallet:', err);
      setError(err.message || 'Unable to retrieve reward wallet.');
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

    try {
      const res = await rewardsApi.redeemCoupon(couponId);
      setRedemptionResult(res);
      // Refresh wallet balance and ledger
      await fetchWallet();
    } catch (err) {
      console.error('Redemption error:', err);
      setActionError(err.message || 'Redemption failed. Check your coin balance.');
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your eco-rewards balance & coupon ledger..." />;
  }

  if (error || !wallet) {
    return (
      <ErrorState
        title="Unable to Access Wallet"
        message={error || 'Failed to connect to rewards service.'}
        onRetry={fetchWallet}
      />
    );
  }

  const coins = wallet.coins || 0;
  const coupons = wallet.availableCoupons || [];
  const transactions = wallet.transactions || [];

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
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            REWARDS WALLET
          </h1>
          <p className="text-sm text-zinc-600">
            Earn verified green coins every time your e-waste is collected by an authorized partner.
          </p>
        </div>
      </div>

      {/* Top Banner: Coin Balance Card */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-950 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="pointer-events-none absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
              <EcoLeafIcon className="w-4 h-4 text-emerald-400" />
              <span>Available Coin Balance</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {coins}
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono">
                Green Coins
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-md leading-relaxed pt-1">
              +50 coins credited automatically per verified device collection. Coins can be redeemed
              for sample retail and mobility discounts below.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center sm:text-right font-mono space-y-1">
            <span className="text-[10px] uppercase text-zinc-400 tracking-wider block">
              Verified Collection Rate
            </span>
            <span className="text-emerald-300 font-black text-lg block">
              50 Coins / Device
            </span>
            <span className="text-[11px] text-zinc-400 block">
              Rule: Duplicate collections prevented
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {redemptionResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 shadow-subtle">
          <CheckCircleIcon className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-emerald-950">
            <strong className="text-sm font-bold block text-emerald-900">
              Voucher Redeemed Successfully!
            </strong>
            <p>{redemptionResult.message}</p>
            <div className="pt-2 flex items-center gap-2 font-mono">
              <span className="text-zinc-600">Your Promo Code:</span>
              <span className="px-3 py-1 bg-white border border-emerald-300 rounded font-bold text-sm text-forest-900 tracking-wider">
                {redemptionResult.voucherCode}
              </span>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-700">
            <strong className="block font-bold mb-0.5">Redemption Notice:</strong>
            {actionError}
          </div>
        </div>
      )}

      {/* Sample Coupons / Reward Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-950">
            Available Reward Coupons (Demo Mode)
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            Interactive redemption simulated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coupons.map((coupon) => {
            const canAfford = coins >= coupon.cost;
            const isRedeeming = redeemingId === coupon.id;

            return (
              <div
                key={coupon.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-subtle p-5 flex flex-col justify-between space-y-4 hover:border-forest-600/50 transition-colors"
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
                    <h3 className="font-bold text-sm text-zinc-950">{coupon.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{coupon.merchant}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <Button
                    variant={canAfford ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full text-xs"
                    disabled={!canAfford || isRedeeming}
                    loading={isRedeeming}
                    onClick={() => handleRedeem(coupon.id)}
                  >
                    {canAfford ? `Redeem for ${coupon.cost} Coins` : `Need ${coupon.cost - coins} More Coins`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <Card>
        <CardHeader
          title="Eco-Coins Transaction Ledger"
          subtitle="Verifiable record of earned collection incentives and redeemed shopping vouchers"
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
                    <th scope="col" className="p-3.5">Activity / Event</th>
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

      {/* Demo Mode Notice */}
      <div className="p-4 bg-zinc-100 rounded-xl text-xs text-zinc-600 border border-zinc-200 flex items-start gap-2.5">
        <InfoIcon className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Demo Shop Disclosure:</strong> Reward coins are credited as part of the E-Waste Passport pilot
          upon collector custody verification. Sample coupon codes are simulated for demonstration and do not constitute legal payment instruments or external merchant obligations.
        </p>
      </div>
    </div>
  );
}
