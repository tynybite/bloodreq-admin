
import { createClient } from "@/lib/supabase/server";
import BloodRequestsClient from "./BloodRequestsClient";

export default async function BloodRequestsPage() {
  const supabase = await createClient();

  // Fetch Requests
  const { data: requests, error } = await supabase
    .from('blood_requests')
    .select('*, profiles(full_name, avatar_url, phone_number)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching requests:", error);
  }

  // Calculate Stats
  const { count: totalRequests } = await supabase.from('blood_requests').select('*', { count: 'exact', head: true });
  const { count: pendingRequests } = await supabase.from('blood_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: fulfilledRequests } = await supabase.from('blood_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'); // or 'approved', depending on definition of fulfilled
  const { count: criticalRequests } = await supabase.from('blood_requests').select('*', { count: 'exact', head: true }).eq('urgency', 'critical');

  const stats = [
    { label: 'Total Requests', value: totalRequests || 0, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Pending', value: pendingRequests || 0, gradient: 'from-amber-500 to-orange-400' },
    { label: 'Fulfilled', value: fulfilledRequests || 0, gradient: 'from-emerald-500 to-teal-400' },
    { label: 'Critical', value: criticalRequests || 0, gradient: 'from-rose-500 to-pink-500' },
  ];

  return <BloodRequestsClient initialRequests={requests || []} stats={stats} />;
}
