
import { getCollection, Collections, BloodRequestDocument } from "@/lib/db/mongodb";
import BloodRequestsClient from "./BloodRequestsClient";

export default async function BloodRequestsPage() {
  const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);

  const requestsRaw = await requestsCollection.find({})
    .sort({ created_at: -1 })
    .toArray();

  const requests = requestsRaw.map(r => ({
    ...r,
    id: r._id?.toString(),
    _id: undefined,
    requester_id: r.requester_id?.toString(),
    created_at: r.created_at?.toISOString(),
    updated_at: r.updated_at?.toISOString(),
  }));

  // Fetch requester details
  const usersCollection = await getCollection(Collections.USERS);
  const requesterIds = [...new Set(requests.map(r => r.requester_id).filter(Boolean))];
  const users = await usersCollection.find({ _id: { $in: requesterIds as any[] } }).toArray();
  const usersMap = new Map(users.map(u => [u._id.toString(), u]));

  const requestsWithUser = requests.map(r => {
    const user = r.requester_id ? usersMap.get(r.requester_id) : null;
    return {
      ...r,
      requester: user ? {
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        phone_number: user.phone_number,
        id: user._id.toString()
      } : null,
      profiles: user ? { full_name: user.full_name } : null // Legacy fallback
    };
  });

  // Stats
  const totalRequests = await requestsCollection.countDocuments({});
  const pendingRequests = await requestsCollection.countDocuments({ status: 'pending' });
  const fulfilledRequests = await requestsCollection.countDocuments({ status: 'fulfilled' });
  const criticalRequests = await requestsCollection.countDocuments({ urgency: 'critical' });

  const stats = [
    { label: 'Total Requests', value: totalRequests || 0, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Pending', value: pendingRequests || 0, gradient: 'from-amber-500 to-orange-400' },
    { label: 'Fulfilled', value: fulfilledRequests || 0, gradient: 'from-emerald-500 to-teal-400' },
    { label: 'Critical', value: criticalRequests || 0, gradient: 'from-rose-500 to-pink-500' },
  ];

  return <BloodRequestsClient initialRequests={requestsWithUser || []} stats={stats} />;
}
