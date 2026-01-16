'use server';

import { getCollection, Collections, UserDocument, BloodRequestDocument, DonationDocument } from "@/lib/db/mongodb";

export async function getReportsData() {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
  const donationsCollection = await getCollection<DonationDocument>(Collections.DONATIONS);

  // 1. Fetch Users Data (Profiles)
  // Fetching just created_at, and blood_group to minimize payload
  const profiles = await usersCollection.find({}, { 
      projection: { created_at: 1, blood_group: 1 } 
  }).toArray();
  
  // 2. Fetch Blood Requests
  const requests = await requestsCollection.find({}, {
      projection: { created_at: 1, city: 1, blood_group: 1 }
  }).toArray();

  // 3. Fetch Donations
  const donations = await donationsCollection.find(
      { status: 'completed' }, 
      { projection: { amount: 1, created_at: 1, status: 1 } }
  ).toArray();

  const now = new Date();
  
  // --- Calculate Main Stats ---
  
  // Total Users
  const totalUsers = profiles.length;
  // Calculate User Growth (vs last month)
  const usersLastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const usersThisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const newUsersThisMonth = profiles.filter(p => new Date(p.created_at) >= usersThisMonthStart).length;
  const newUsersLastMonth = profiles.filter(p => {
    const d = new Date(p.created_at);
    return d >= usersLastMonthStart && d < usersThisMonthStart;
  }).length;
  const userGrowth = newUsersLastMonth === 0 ? 100 : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

  // Requests
  const totalRequests = requests.length;
  // Request Growth logic
  const newRequestsThisMonth = requests.filter(r => new Date(r.created_at) >= usersThisMonthStart).length;
  const newRequestsLastMonth = requests.filter(r => {
    const d = new Date(r.created_at);
    return d >= usersLastMonthStart && d < usersThisMonthStart;
  }).length;
  const requestGrowth = newRequestsLastMonth === 0 ? 100 : ((newRequestsThisMonth - newRequestsLastMonth) / newRequestsLastMonth) * 100;

  // Financials (Assuming 'amount' is in donations)
  const totalRaised = donations.reduce((sum, d) => sum + Number((d as any).amount || 0), 0);
  // Financial Growth
  const raisedThisMonth = donations
    .filter(d => new Date(d.created_at) >= usersThisMonthStart)
    .reduce((sum, d) => sum + Number((d as any).amount || 0), 0);
  const raisedLastMonth = donations
    .filter(d => {
        const date = new Date(d.created_at);
        return date >= usersLastMonthStart && date < usersThisMonthStart;
    })
    .reduce((sum, d) => sum + Number((d as any).amount || 0), 0);
  const financialGrowth = raisedLastMonth === 0 ? 100 : ((raisedThisMonth - raisedLastMonth) / raisedLastMonth) * 100;

  // Donation Count
  const totalDonations = donations.length;
  const donationsThisMonth = donations.filter(d => new Date(d.created_at) >= usersThisMonthStart).length;
  const donationsLastMonth = donations.filter(d => {
      const date = new Date(d.created_at);
      return date >= usersLastMonthStart && date < usersThisMonthStart;
  }).length;
  const donationGrowth = donationsLastMonth === 0 ? 100 : ((donationsThisMonth - donationsLastMonth) / donationsLastMonth) * 100;


  // --- User Growth Chart Data (Last 6 months) ---
  const months: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }

  const userGrowthData = months.map(monthDate => {
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    
    // Count cumulative users up to end of this month
    const count = profiles.filter(p => new Date(p.created_at) < nextMonth).length;
    return { month: monthName, value: count };
  });

  // --- Blood Type Distribution ---
  const bloodTypeCounts: Record<string, number> = {};
  profiles.forEach(p => {
    if (p.blood_group) {
        bloodTypeCounts[p.blood_group] = (bloodTypeCounts[p.blood_group] || 0) + 1;
    }
  });
  
  // Normalize and calculate percentage
  const bloodTypeData = Object.entries(bloodTypeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // --- Top Regions ---
  const cityCounts: Record<string, number> = {};
  requests.forEach(r => {
    if (r.city) {
        // Simple normalization
        const city = r.city.trim(); 
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
  });

  const topRegions = Object.entries(cityCounts)
    .map(([name, requests]) => ({
        name,
        requests,
        donors: 0 // Placeholder
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);


  return {
    mainStats: [
      { label: "Total Users", value: totalUsers, change: Number(userGrowth.toFixed(1)), gradient: "from-blue-500 to-cyan-400", iconName: "Users" },
      { label: "Blood Requests", value: totalRequests, change: Number(requestGrowth.toFixed(1)), gradient: "from-rose-500 to-pink-500", iconName: "Droplet" },
      { label: "Financial Raised", value: totalRaised, change: Number(financialGrowth.toFixed(1)), prefix: "৳", gradient: "from-emerald-500 to-teal-400", iconName: "DollarSign" },
      { label: "Donations", value: totalDonations, change: Number(donationGrowth.toFixed(1)), gradient: "from-violet-500 to-purple-500", iconName: "Heart" },
    ],
    userGrowthData,
    bloodTypeData,
    topRegions
  };
}
