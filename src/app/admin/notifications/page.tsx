import { Suspense } from 'react';
import NotificationsClient from './NotificationsClient';
import { getNotificationHistory } from './actions';

export default async function NotificationsPage() {
  const history = await getNotificationHistory();

  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NotificationsClient initialHistory={history} />
    </Suspense>
  );
}
