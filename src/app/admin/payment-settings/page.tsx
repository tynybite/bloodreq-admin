import { getAllPaymentSettings } from './actions';
import PaymentSettingsForm from './PaymentSettingsForm';

export const metadata = {
    title: 'Payment Settings | BloodReq Admin',
    description: 'Configure payment gateways for donations.',
};

export default async function PaymentSettingsPage() {
    const { bkash, paypal, cryptomus } = await getAllPaymentSettings();

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <PaymentSettingsForm 
                initialBkash={bkash} 
                initialPaypal={paypal}
                initialCryptomus={cryptomus}
            />
        </div>
    );
}
