import { NextResponse } from 'next/server';
import { getCollection } from "@/lib/db/mongodb";

interface AppSettingsDocument {
  key: string;
  value: any;
}

export async function GET() {
  try {
    const settingsCollection = await getCollection<AppSettingsDocument>('app_settings');
    const settings = await settingsCollection.find({
        key: { $in: ['payment_bkash', 'payment_paypal', 'payment_cryptomus'] }
    }).toArray();
    
    const result: Record<string, any> = {};
    for (const s of settings) {
        result[s.key] = s.value;
    }

    const paymentMethods = [];

    // bKash
    if (result['payment_bkash']?.enabled) {
        paymentMethods.push({
            id: 'bkash',
            name: 'bKash',
            type: 'mfs',
            isSandbox: result['payment_bkash'].isSandbox,
            // Only expose public keys, never secrets!
            username: result['payment_bkash'].username, 
            // appKey might be considered public in some contexts but usually handled server-side.
            // For mobile apps, they might need it if they initiate the payment directly.
            // If the payment is initiated via your backend, you shouldn't return this.
            // Assuming mobile app handles SDK interaction:
            // username is needed for scripts.
        });
    }

    // PayPal
    if (result['payment_paypal']?.enabled) {
        paymentMethods.push({
            id: 'paypal',
            name: 'PayPal',
            type: 'card',
            mode: result['payment_paypal'].mode,
            clientId: result['payment_paypal'].clientId, // Safe to expose public Client ID
        });
    }

    // Cryptomus
    if (result['payment_cryptomus']?.enabled) {
        paymentMethods.push({
            id: 'cryptomus',
            name: 'Cryptomus',
            type: 'crypto',
            merchantId: result['payment_cryptomus'].merchantId, // Safe to expose Merchant ID
        });
    }

    return NextResponse.json({ 
        success: true, 
        methods: paymentMethods 
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}
