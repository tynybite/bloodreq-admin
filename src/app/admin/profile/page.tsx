import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch basic profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch admin specific details
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, permissions")
    .eq("id", user.id)
    .single();

  // Combine data
  const combinedProfile = {
    ...profile,
    email: user.email,
    admin_role: adminUser?.role,
    permissions: adminUser?.permissions,
  };

  return <ProfileClient initialProfile={combinedProfile} />;
}
