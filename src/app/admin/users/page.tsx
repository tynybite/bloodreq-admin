
import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const supabase = await createClient();

  // Fetch Users (Profiles)
  // Note: auth.users is distinct from public.profiles. We use profiles for application data.
  // Emails are in auth.users, which we can't join directly with public tables easily in simple query 
  // without a view or RPC. For now, we rely on profiles.
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Calculate Stats
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'); // Assuming active by default logic needed
  const { count: donors } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'donor');
  // New This Month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const { count: newUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString());

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Active Today', value: 124, gradient: 'from-emerald-500 to-teal-400' }, // mock active today
    { label: 'Donors', value: donors || 0, gradient: 'from-rose-500 to-pink-400' },
    { label: 'New This Month', value: newUsers || 0, gradient: 'from-violet-500 to-purple-500' },
  ];

  return <UsersClient initialUsers={users || []} stats={stats} />;
}
