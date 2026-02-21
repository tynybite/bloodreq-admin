/**
 * bKash Tokenized Checkout API Utility
 * Docs: https://developer.bka.sh/docs/tokenized-checkout-overview
 */

import { getCollection } from '@/lib/db/mongodb';

interface BkashConfig {
  username: string;
  password: string;
  appKey: string;
  appSecret: string;
  isSandbox: boolean;
}

async function getBkashConfig(): Promise<BkashConfig> {
  const col = await getCollection<{ key: string; value: any }>('app_settings');
  const setting = await col.findOne({ key: 'payment_bkash' });

  if (!setting?.value?.enabled) throw new Error('bKash is not enabled');
  const v = setting.value;
  if (!v.username || !v.password || !v.appKey || !v.appSecret) {
    throw new Error('bKash credentials are incomplete');
  }
  return v as BkashConfig;
}

function getBaseUrl(isSandbox: boolean) {
  return isSandbox
    ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
    : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
}

let _cachedToken: { token: string; expiresAt: number; sandbox: boolean } | null = null;

/** Get or refresh bKash grant token (cached for ~55 minutes) */
export async function getBkashToken(): Promise<{ token: string; config: BkashConfig }> {
  const config = await getBkashConfig();

  if (
    _cachedToken &&
    _cachedToken.sandbox === config.isSandbox &&
    _cachedToken.expiresAt > Date.now() + 60_000
  ) {
    return { token: _cachedToken.token, config };
  }

  const base = getBaseUrl(config.isSandbox);
  const res = await fetch(`${base}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: config.username,
      password: config.password,
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
    }),
  });

  const data = await res.json();
  if (data.statusCode !== '0000') {
    throw new Error(`bKash token error: ${data.statusMessage ?? 'Unknown'}`);
  }

  const expiresIn = Number(data.expires_in ?? 3600) * 1000;
  _cachedToken = {
    token: data.id_token,
    expiresAt: Date.now() + expiresIn,
    sandbox: config.isSandbox,
  };

  return { token: data.id_token, config };
}

export interface BkashPayment {
  paymentID: string;
  bkashURL: string;
  createTime: string;
}

/** Create a bKash payment — returns paymentID and checkout URL */
export async function createBkashPayment(
  amount: number,  // in BDT (integer)
  merchantInvoiceNumber: string,
  callbackUrl: string,
): Promise<BkashPayment> {
  const { token, config } = await getBkashToken();
  const base = getBaseUrl(config.isSandbox);

  const res = await fetch(`${base}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: token,
      'x-app-key': config.appKey,
    },
    body: JSON.stringify({
      mode: '0011',            // Checkout URL mode
      payerReference: merchantInvoiceNumber,
      callbackURL: callbackUrl,
      amount: String(amount),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber,
    }),
  });

  const data = await res.json();
  if (data.statusCode !== '0000') {
    throw new Error(`bKash create payment error: ${data.statusMessage ?? 'Unknown'}`);
  }

  return {
    paymentID: data.paymentID,
    bkashURL: data.bkashURL,
    createTime: data.createTime,
  };
}

export interface BkashExecuteResult {
  paymentID: string;
  trxID: string;
  amount: string;
  currency: string;
  customerMsisdn: string;
  transactionStatus: string;
}

/** Execute a bKash payment after user completes checkout (called from callback) */
export async function executeBkashPayment(paymentID: string): Promise<BkashExecuteResult> {
  const { token, config } = await getBkashToken();
  const base = getBaseUrl(config.isSandbox);

  const res = await fetch(`${base}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: token,
      'x-app-key': config.appKey,
    },
    body: JSON.stringify({ paymentID }),
  });

  const data = await res.json();
  if (data.statusCode !== '0000') {
    throw new Error(`bKash execute error: ${data.statusMessage ?? 'Unknown'}`);
  }

  return data as BkashExecuteResult;
}

/** Query payment status from bKash (server-side verification) */
export async function queryBkashPayment(paymentID: string) {
  const { token, config } = await getBkashToken();
  const base = getBaseUrl(config.isSandbox);

  const res = await fetch(`${base}/tokenized/checkout/payment/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: token,
      'x-app-key': config.appKey,
    },
    body: JSON.stringify({ paymentID }),
  });

  return res.json();
}
