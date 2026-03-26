'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { CREDIT_PACKS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Coins, Check, X, Zap, ShieldCheck, Loader2, CheckCircle2, XCircle,
  Video, Youtube, ShoppingBag, MessageSquare, Film, Camera, UserPlus, Sparkles,
} from 'lucide-react';
import type { CreditTier } from '@/types';

const ALL_FEATURES = [
  { label: 'UGC Creation', icon: Video },
  { label: 'Youtube Cloner', icon: Youtube },
  { label: 'Product Shots', icon: ShoppingBag },
  { label: 'AI Chats', icon: MessageSquare },
  { label: 'Video Editing', icon: Film },
  { label: 'Photo editing', icon: Camera },
  { label: 'Model Creator', icon: UserPlus },
];

export default function Pricing() {
  const { settings, purchaseCredits, grantFreeTrial } = useAppStore();
  const { credits, creditTier, freeTrialUsed } = settings;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<CreditTier | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');

  // Handle Stripe redirect back
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');

    if (canceled) {
      setCancelMessage('Payment was canceled. No credits were charged.');
      router.replace('/pricing', { scroll: false });
      return;
    }

    if (sessionId) {
      fetch(`/api/stripe/checkout?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.tier) {
            purchaseCredits(Number(data.tier) as CreditTier);
            setSuccessMessage(
              `Payment successful! ${CREDIT_PACKS.find((p) => p.tier === Number(data.tier))?.credits ?? data.tier} credits added.`
            );
          }
        })
        .catch(() => {})
        .finally(() => {
          router.replace('/pricing', { scroll: false });
        });
    }
  }, [searchParams, purchaseCredits, router]);

  const handleFreeTrial = () => {
    grantFreeTrial();
    setSuccessMessage('Welcome! 10 free credits have been added to your account.');
  };

  const handlePurchase = async (tier: CreditTier) => {
    // Free tier
    if (tier === 10) {
      handleFreeTrial();
      return;
    }

    setLoadingTier(tier);
    setSuccessMessage('');
    setCancelMessage('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCancelMessage(data.error || 'Could not create checkout session.');
        setLoadingTier(null);
      }
    } catch {
      setCancelMessage('Something went wrong. Please try again.');
      setLoadingTier(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Pricing</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Choose the plan that fits your needs
        </p>
      </div>

      {/* Success / Cancel Banners */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMessage}
        </div>
      )}
      {cancelMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <XCircle className="h-5 w-5 shrink-0" />
          {cancelMessage}
        </div>
      )}

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border-violet-500/20">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Current Balance</p>
              <p className="text-2xl font-bold text-white">{credits} <span className="text-sm font-normal text-zinc-400">credits</span></p>
            </div>
          </div>
          {creditTier && (
            <Badge variant="secondary" className="bg-violet-600/20 text-violet-300 text-xs">
              {CREDIT_PACKS.find((p) => p.tier === creditTier)?.label} Plan
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CREDIT_PACKS.map((pack) => {
          const isActive = creditTier === pack.tier;
          const isFree = pack.tier === 10;
          const isProPlan = pack.tier === 50;
          const isLoading = loadingTier === pack.tier;
          const freeUsed = isFree && freeTrialUsed;

          return (
            <Card
              key={pack.tier}
              className={`relative overflow-hidden transition-all ${
                isProPlan
                  ? 'bg-gradient-to-b from-violet-600/10 to-fuchsia-600/5 border-violet-500/30 scale-[1.02] shadow-lg shadow-violet-500/10'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {isProPlan && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-fuchsia-600 to-violet-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 space-y-5">
                {/* Tier Name */}
                <div>
                  <h3 className="text-lg font-bold text-white">{pack.label}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{pack.description}</p>
                </div>

                {/* Price */}
                <div>
                  {isFree ? (
                    <>
                      <span className="text-3xl font-bold text-white">Free</span>
                      <p className="text-[10px] text-zinc-400 mt-1">10 one-time credits (Non Renewable)</p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-white">${pack.price.toFixed(0)}</span>
                      <p className="text-[10px] text-zinc-400 mt-1">{pack.credits} credits (Renewable)</p>
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2.5">
                  {ALL_FEATURES.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div key={feat.label} className="flex items-center gap-2.5">
                        <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="text-xs text-zinc-300">{feat.label}</span>
                      </div>
                    );
                  })}

                  {/* PRO Enhance */}
                  <div className="flex items-start gap-2.5">
                    {pack.enhanceEnabled ? (
                      <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-zinc-600 mt-0.5 shrink-0" />
                    )}
                    <Sparkles className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <span className={`text-xs ${pack.enhanceEnabled ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        PRO Enhance (4K + Eye Fix)
                      </span>
                      {pack.enhanceEnabled && (
                        <span className="text-[9px] text-zinc-500 block">* Uses 2 credits per image</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(pack.tier)}
                  disabled={isLoading || loadingTier !== null || freeUsed}
                  className={`w-full gap-2 h-11 ${
                    isProPlan
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white'
                      : isFree
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFree ? (
                    <Zap className="h-3.5 w-3.5" />
                  ) : (
                    <Coins className="h-3.5 w-3.5" />
                  )}
                  {freeUsed
                    ? 'Free Credits Used'
                    : isFree
                    ? 'Get Free Credits'
                    : isActive
                    ? 'Renew Credits'
                    : `Get ${pack.label} — $${pack.price.toFixed(0)}`}
                </Button>

                {isActive && (
                  <p className="text-[10px] text-center text-violet-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Active plan
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="text-center space-y-2">
        <p className="text-[11px] text-zinc-500">
          1 credit = 1 standard generation (image or video). Enhanced images (PRO Enhance) use 2 credits.
        </p>
        <p className="text-[11px] text-zinc-400">
          Free credits are one-time and non-renewable. Pro and Studio credits can be renewed anytime.
        </p>
      </div>
    </div>
  );
}
