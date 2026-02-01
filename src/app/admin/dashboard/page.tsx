import { getCollection, Collections, UserDocument, BloodRequestDocument, DonationDocument } from "@/lib/db/mongodb";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
  const donationsCollection = await getCollection<DonationDocument>(Collections.DONATIONS);

  // Fetch Stats
  const totalUsers = await usersCollection.countDocuments({});
  const totalRequests = await requestsCollection.countDocuments({});
  const totalDonations = await donationsCollection.countDocuments({});
  const pendingRequests = await requestsCollection.countDocuments({ status: 'pending' });
  const activeDonors = await usersCollection.countDocuments({ 
    $or: [{ role: 'donor' as any }, { is_available_to_donate: true }] 
  }); 
  const pendingDonations = await donationsCollection.countDocuments({ status: { $in: ['offered', 'accepted'] } });

  // Recent Requests (Latest 5)
  const recentRequestsRaw = await requestsCollection.find({})
    .sort({ created_at: -1 })
    .limit(5)
    .toArray();

  const recentRequests = recentRequestsRaw.map(req => ({
    ...req,
    id: req._id.toString(),
    _id: undefined,
    requester_id: req.requester_id.toString(),
  }));

  // Recent Donations (Latest 5)
  const recentDonationsRaw = await donationsCollection.find({})
    .sort({ created_at: -1 })
    .limit(5)
    .toArray();
    
  const recentDonations = recentDonationsRaw.map(d => ({
    ...d,
    id: d._id.toString(),
    _id: undefined,
    donor_id: d.donor_id.toString(),
    request_id: d.request_id.toString(),
    fundraiser_id: d.fundraiser_id ? d.fundraiser_id.toString() : undefined,
  }));

  // Normalize Activity
  const activity = [
    ...(recentRequests || []).map(r => ({
      id: r.id,
      type: 'blood_request',
      title: `New ${r.blood_group} request for ${r.patient_name}`,
      time: new Date(r.created_at).toLocaleDateString(), // simplified
      created_at: new Date(r.created_at),
      status: r.status
    })),
    ...(recentDonations || []).map(d => {
      // Assuming donor info might be embedded or linked. For now, just use a placeholder.
      // If `profiles` was a lookup, it would be handled differently.
      // For MongoDB, if `donor_id` is present, we might fetch donor name.
      // For simplicity, assuming `donor_name` might be directly on donation or we use a generic.
      const donorName = (d as any).donor_name || 'Donor'; // Placeholder
      return {
        id: d.id,
        type: 'donation',
        title: `Donation offered`,
        time: new Date(d.created_at).toLocaleDateString(),
        created_at: new Date(d.created_at),
        status: d.status
      };
    })
  ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()).slice(0, 5);

  // Blood Type Distribution (using aggregation)
  const bloodTypeStats = await usersCollection.aggregate([
      { $match: { blood_group: { $exists: true, $ne: null } } },
      { $group: { _id: "$blood_group", count: { $sum: 1 } } }
  ]).toArray();

  const totalUsersWithGroup = bloodTypeStats.reduce((acc, curr) => acc + curr.count, 0);

  const bloodTypeDistribution = bloodTypeStats.map(stat => ({
      type: stat._id,
      count: stat.count,
      percentage: totalUsersWithGroup > 0 ? Math.round((stat.count / totalUsersWithGroup) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const dashboardData = {
    totalUsers: totalUsers || 0,
    totalRequests: totalRequests || 0,
    totalDonations: totalDonations || 0,
    pendingRequests: pendingRequests || 0,
    pendingDonations: pendingDonations || 0,
    activeDonors: activeDonors || 0,
    recentActivity: activity,
    bloodTypeDistribution
  };

  return <DashboardClient data={dashboardData} />;
}
