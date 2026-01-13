import { getModerators } from './actions';
import ModeratorsClient from './ModeratorsClient';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function ModeratorsPage() {
  const moderators = await getModerators();
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get current user's admin role using admin client
  let currentUserRole = 'support'; // Default lowest role
  if (user) {
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    console.log('Current user role lookup:', { userId: user.id, adminUser, error });
    
    if (adminUser) {
      currentUserRole = adminUser.role;
    }
  }

  console.log('Passing to client:', { currentUserId: user?.id, currentUserRole });

  return (
    <ModeratorsClient 
      moderators={moderators} 
      currentUserId={user?.id || ''} 
      currentUserRole={currentUserRole}
    />
  );
}


