
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Parallel data fetching
  const [
    { count: totalUsers },
    { count: totalRequests },
    { count: totalDonations },
    { count: pendingRequests },
    // { count: pendingDonations } // If donations have a status
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('blood_requests').select('*', { count: 'exact', head: true }),
    supabase.from('blood_donations').select('*', { count: 'exact', head: true }),
    supabase.from('blood_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    // supabase.from('blood_donations').select('*', { count: 'exact', head: true }).eq('status', 'offered'), // Assuming status is offered/accepted/completed
  ]);
  
  // Pending donations count (separate query to avoid error if table structure varies)
  const { count: pendingDonations } = await supabase
    .from('blood_donations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'offered');

  // Fetch Recent Activity (Requests + Donations)
  // This is a bit tricky with Supabase basic queries, so we'll fetch latest 5 of each and interleave
  const { data: recentRequests } = await supabase
    .from('blood_requests')
    .select('patient_name, blood_group, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentDonations } = await supabase
    .from('blood_donations')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  // Normalize Activity
  const activity = [
    ...(recentRequests || []).map(r => ({
      type: 'blood_request',
      title: `New ${r.blood_group} request for ${r.patient_name}`,
      time: new Date(r.created_at).toLocaleDateString(), // simplified
      created_at: new Date(r.created_at),
      status: r.status
    })),
    ...(recentDonations || []).map(d => ({
      type: 'donation',
      title: `Donation offered by ${d.profiles?.full_name || 'Donor'}`,
      time: new Date(d.created_at).toLocaleDateString(),
      created_at: new Date(d.created_at),
      status: d.status
    }))
  ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()).slice(0, 5);

  // Blood Type Distribution from View
  const { data: distributionData } = await supabase
    .from('blood_type_distribution')
    .select('*')
    .order('count', { ascending: false });

  const bloodTypeDistribution = distributionData?.map(d => ({
      type: d.blood_group,
      count: d.count,
      percentage: Math.round(d.percentage)
  })) || [];

  const dashboardData = {
    totalUsers: totalUsers || 0,
    totalRequests: totalRequests || 0,
    totalDonations: totalDonations || 0,
    pendingRequests: pendingRequests || 0,
    pendingDonations: pendingDonations || 0,
    recentActivity: activity,
    bloodTypeDistribution
  };

  return <DashboardClient data={dashboardData} />;
}
