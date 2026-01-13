import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/payments/methods - Get available payment methods
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch payment settings from system_settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['payment_settings', 'currency_settings']);

    const paymentSettings = settings?.find(s => s.key === 'payment_settings')?.value || {};
    const currencySettings = settings?.find(s => s.key === 'currency_settings')?.value || { default: 'BDT' };

    // Build available methods based on what's enabled
    const methods = [];

    // bKash
    if (paymentSettings.bkash?.enabled) {
      methods.push({
        id: 'bkash',
        name: 'bKash',
        type: 'mobile_wallet',
        icon: 'bkash',
        currencies: ['BDT'],
        min_amount: 10,
        max_amount: 50000,
      });
    }

    // Nagad
    if (paymentSettings.nagad?.enabled) {
      methods.push({
        id: 'nagad',
        name: 'Nagad',
        type: 'mobile_wallet',
        icon: 'nagad',
        currencies: ['BDT'],
        min_amount: 10,
        max_amount: 50000,
      });
    }

    // Stripe (Card)
    if (paymentSettings.stripe?.enabled) {
      methods.push({
        id: 'stripe',
        name: 'Credit/Debit Card',
        type: 'card',
        icon: 'card',
        currencies: ['BDT', 'USD', 'EUR'],
        min_amount: 1,
        max_amount: 1000000,
      });
    }

    // PayPal
    if (paymentSettings.paypal?.enabled) {
      methods.push({
        id: 'paypal',
        name: 'PayPal',
        type: 'online',
        icon: 'paypal',
        currencies: ['USD', 'EUR'],
        min_amount: 1,
        max_amount: 10000,
      });
    }

    // Default methods if none configured
    if (methods.length === 0) {
      methods.push({
        id: 'manual',
        name: 'Bank Transfer',
        type: 'manual',
        icon: 'bank',
        currencies: ['BDT'],
        min_amount: 100,
        max_amount: 1000000,
        instructions: 'Contact the fundraiser organizer for bank details.',
      });
    }

    return successResponse({
      methods,
      default_currency: currencySettings.default || 'BDT',
      currencies: ['BDT', 'USD', 'EUR'],
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
