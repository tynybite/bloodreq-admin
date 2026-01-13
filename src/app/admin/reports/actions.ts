'use server';

import { createClient } from "@/lib/supabase/server";

export async function getReportsData() {
  const supabase = await createClient();

  // 1. Fetch Users Data (Profiles)
  // Fetching just id, created_at, and blood_group to minimize payload
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, created_at, blood_group');
  
  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // 2. Fetch Blood Requests
  const { data: requests, error: requestsError } = await supabase
    .from('blood_requests')
    .select('id, created_at, city, blood_group');

  if (requestsError) {
    console.error("Error fetching requests:", requestsError);
  }

  // 3. Fetch Donations
  const { data: donations, error: donationsError } = await supabase
    .from('donations')
    .select('id, amount, created_at')
    .eq('status', 'completed');

  if (donationsError) {
    console.error("Error fetching donations:", donationsError);
  }

  const now = new Date();
  const validProfiles = profiles || [];
  const validRequests = requests || [];
  const validDonations = donations || [];

  // --- Calculate Main Stats ---
  
  // Total Users
  const totalUsers = validProfiles.length;
  // Calculate User Growth (vs last month)
  const usersLastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const usersThisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsersThisMonth = validProfiles.filter(p => new Date(p.created_at) >= usersThisMonthStart).length;
  const newUsersLastMonth = validProfiles.filter(p => {
    const d = new Date(p.created_at);
    return d >= usersLastMonthStart && d < usersThisMonthStart;
  }).length;
  const userGrowth = newUsersLastMonth === 0 ? 100 : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

  // Requests
  const totalRequests = validRequests.length;
  // Request Growth logic (simplified similar to users)
  const newRequestsThisMonth = validRequests.filter(r => new Date(r.created_at) >= usersThisMonthStart).length;
  const newRequestsLastMonth = validRequests.filter(r => {
    const d = new Date(r.created_at);
    return d >= usersLastMonthStart && d < usersThisMonthStart;
  }).length;
  const requestGrowth = newRequestsLastMonth === 0 ? 100 : ((newRequestsThisMonth - newRequestsLastMonth) / newRequestsLastMonth) * 100;

  // Financials
  const totalRaised = validDonations.reduce((sum, d) => sum + Number(d.amount), 0);
  // Financial Growth
  const raisedThisMonth = validDonations
    .filter(d => new Date(d.created_at) >= usersThisMonthStart)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const raisedLastMonth = validDonations
    .filter(d => {
        const date = new Date(d.created_at);
        return date >= usersLastMonthStart && date < usersThisMonthStart;
    })
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const financialGrowth = raisedLastMonth === 0 ? 100 : ((raisedThisMonth - raisedLastMonth) / raisedLastMonth) * 100;

  // Donation Count
  const totalDonations = validDonations.length;
  const donationsThisMonth = validDonations.filter(d => new Date(d.created_at) >= usersThisMonthStart).length;
  const donationsLastMonth = validDonations.filter(d => {
      const date = new Date(d.created_at);
      return date >= usersLastMonthStart && date < usersThisMonthStart;
  }).length;
  const donationGrowth = donationsLastMonth === 0 ? 100 : ((donationsThisMonth - donationsLastMonth) / donationsLastMonth) * 100;


  // --- User Growth Chart Data (Last 6 months) ---
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }

  const userGrowthData = months.map(monthDate => {
    const monthName = monthDate.toLocaleString('default', { month: 'short' });
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    
    // Count cumulative users up to end of this month? Or new users in this month?
    // Usually "Growth" chart implies cumulative or rate. Let's do Cumulative for "User Growth".
    const count = validProfiles.filter(p => new Date(p.created_at) < nextMonth).length;
    return { month: monthName, value: count };
  });

  // --- Blood Type Distribution ---
  const bloodTypeCounts: Record<string, number> = {};
  validProfiles.forEach(p => {
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
  validRequests.forEach(r => {
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
        donors: 0 // We don't track donor location easily right now, defaulting to 0 or we could try to approximate
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
