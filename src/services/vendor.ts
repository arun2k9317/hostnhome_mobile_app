import { supabase } from './supabase';
import { Vendor } from '../types';

/**
 * Get vendor profile for current user
 */
export async function getVendorProfile(): Promise<{ vendor: Vendor; usage?: any }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user profile to find vendor_id
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('vendor_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userProfile?.vendor_id) throw new Error('No vendor found');

    // Get vendor details
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', userProfile.vendor_id)
      .single();

    if (error) throw error;

    // Get usage stats
    const { count: resortCount } = await supabase
      .from('resorts')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', userProfile.vendor_id);

    const { count: staffCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', userProfile.vendor_id);

    return {
      vendor: vendor as Vendor,
      usage: {
        resorts: resortCount || 0,
        staff: staffCount || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    throw error;
  }
}

