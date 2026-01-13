import { getFinancialDonations, getBloodDonations } from './actions';
import DonationsClient from './DonationsClient';

export default async function DonationsPage() {
  const [financialDonations, bloodDonations] = await Promise.all([
    getFinancialDonations(),
    getBloodDonations(),
  ]);

  return (
    <DonationsClient 
      financialDonations={financialDonations} 
      bloodDonations={bloodDonations} 
    />
  );
}
