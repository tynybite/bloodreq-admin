import { getAdSettings } from "./actions";
import { getCampaigns, getCampaignTypes } from "./campaign-actions";
import AdsSettingsClient from "./AdsSettingsClient";

export default async function AdsPage() {
  const [admob, meta, campaigns, campaignTypes] = await Promise.all([
    getAdSettings('ads_admob'),
    getAdSettings('ads_meta'),
    getCampaigns(),
    getCampaignTypes()
  ]);

  return (
    <AdsSettingsClient 
      initialAdmob={admob} 
      initialMeta={meta} 
      initialCampaigns={campaigns}
      campaignTypes={campaignTypes}
    />
  );
}
