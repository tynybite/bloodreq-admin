import { getSettings } from './actions';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const initialSettings = await getSettings();
  
  return <SettingsClient initialSettings={initialSettings} />;
}
