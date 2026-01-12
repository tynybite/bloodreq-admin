import { Suspense } from 'react';
import EmailSettingsClient from './EmailSettingsClient';
import { getSMTPSettings } from './actions';

export default async function EmailSettingsPage() {
  const smtpSettings = await getSMTPSettings();

  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <EmailSettingsClient initialSettings={smtpSettings} />
    </Suspense>
  );
}
