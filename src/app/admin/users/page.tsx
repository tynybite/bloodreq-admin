
import { getCollection, Collections, UserDocument, DonationDocument, BloodRequestDocument } from '@/lib/db/mongodb';
import UsersClient from "./UsersClient";

// Helper to get count by status
async function getCountByStatus(status: string) {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  return await usersCollection.countDocuments({ status });
}

export default async function UsersPage() {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  const donationsCollection = await getCollection<DonationDocument>(Collections.DONATIONS);
  const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);

  // Fetch Users
  const usersRaw = await usersCollection.find({})
    .sort({ created_at: -1 })
    .toArray();

  // Get per-user donation and request counts
  const userIds = usersRaw.map(u => u._id.toString());

  const [donationCounts, requestCounts] = await Promise.all([
    donationsCollection.aggregate([
      { $match: { donor_id: { $in: userIds } } },
      { $group: { _id: '$donor_id', count: { $sum: 1 } } }
    ]).toArray(),
    requestsCollection.aggregate([
      { $match: { requester_id: { $in: userIds } } },
      { $group: { _id: '$requester_id', count: { $sum: 1 } } }
    ]).toArray(),
  ]);

  const donationMap = new Map(donationCounts.map(d => [d._id, d.count]));
  const requestMap = new Map(requestCounts.map(r => [r._id, r.count]));

  const users = usersRaw.map(user => ({
    ...user,
    id: user._id,
    _id: undefined,
    donation_count: donationMap.get(user._id.toString()) || 0,
    request_count: requestMap.get(user._id.toString()) || 0,
  }));

  // Calculate Stats
  const totalUsers = await usersCollection.countDocuments({});
  
  const activeUsers = await usersCollection.countDocuments({ 
    $or: [{ status: 'active' }, { status: { $exists: false } }] 
  }); 

  // Donors - users with blood group set
  const donors = await usersCollection.countDocuments({ blood_group: { $exists: true, $ne: null as any } });

  // New This Month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const newUsers = await usersCollection.countDocuments({ created_at: { $gte: startOfMonth } });

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Active Today', value: 124, gradient: 'from-emerald-500 to-teal-400' }, // mock active today or use aggregation on 'last_sign_in' if available
    { label: 'Donors', value: donors || 0, gradient: 'from-rose-500 to-pink-400' },
    { label: 'New This Month', value: newUsers || 0, gradient: 'from-violet-500 to-purple-500' },
  ];

  return <UsersClient initialUsers={users as any[]} stats={stats} />;
}
