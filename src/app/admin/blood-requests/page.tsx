
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
    // Also stringify any other ObjectId fields if present
    requester_id: r.requester_id?.toString(),
    created_at: r.created_at?.toISOString(),
    updated_at: r.updated_at?.toISOString(),
  }));

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

  return <BloodRequestsClient initialRequests={requests || []} stats={stats} />;
}
