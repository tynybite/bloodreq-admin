
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import UsersClient from "./UsersClient";

// Helper to get count by status
async function getCountByStatus(status: string) {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  return await usersCollection.countDocuments({ status });
}

export default async function UsersPage() {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);

  // Fetch Users
  const usersRaw = await usersCollection.find({})
    .sort({ created_at: -1 })
    .toArray();
    
  const users = usersRaw.map(user => ({
    ...user,
    id: user._id,
    _id: undefined,
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
