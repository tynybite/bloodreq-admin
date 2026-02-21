/**
 * GET /api/payments/exchange-rate
 * Returns BDT <-> USD exchange rate.
 * Uses exchangerate-api.com free tier with a hardcoded fallback.
 */
import { NextResponse } from 'next/server';

const FALLBACK_BDT_PER_USD = 110; // Approximate fallback
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

let _rateCache: { rate: number; fetchedAt: number } | null = null;

async function fetchRate(): Promise<number> {
  if (_rateCache && Date.now() - _rateCache.fetchedAt < CACHE_DURATION_MS) {
    return _rateCache.rate;
  }

  try {
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error('Rate fetch failed');
    const data = await res.json();
    const rate = data?.rates?.BDT;
    if (!rate) throw new Error('BDT rate missing');
    _rateCache = { rate: Number(rate), fetchedAt: Date.now() };
    return _rateCache.rate;
  } catch {
    // Return fallback silently
    return FALLBACK_BDT_PER_USD;
  }
}

export async function GET() {
  try {
    const bdtPerUsd = await fetchRate();
    return NextResponse.json({
      success: true,
      bdt_per_usd: bdtPerUsd,
      usd_per_bdt: +(1 / bdtPerUsd).toFixed(6),
    });
  } catch {
    return NextResponse.json({
      success: true,
      bdt_per_usd: FALLBACK_BDT_PER_USD,
      usd_per_bdt: +(1 / FALLBACK_BDT_PER_USD).toFixed(6),
    });
  }
}
