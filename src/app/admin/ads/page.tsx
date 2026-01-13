import { getAdSettings } from "./actions";
import AdsSettingsClient from "./AdsSettingsClient";

export default async function AdsPage() {
  const [admob, meta] = await Promise.all([
    getAdSettings('ads_admob'),
    getAdSettings('ads_meta')
  ]);

  return <AdsSettingsClient initialAdmob={admob} initialMeta={meta} />;
}
