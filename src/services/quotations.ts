import { supabase } from './supabase';
import { Quotation } from '../types';

/**
 * Get all quotations for the current vendor
 */
export async function getQuotations(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ quotations: Quotation[] }> {
  try {
    let query = supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Transform snake_case to camelCase for app use
    const transformed = (data || []).map((q: any) => ({
      ...q,
      vendorId: q.vendor_id,
      resortId: q.resort_id,
      guestName: q.guest_name,
      checkIn: q.check_in,
      checkOut: q.check_out,
      totalAmount: q.total_amount,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    }));
    
    return { quotations: transformed };
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return { quotations: [] };
  }
}

/**
 * Get a single quotation by ID
 */
export async function getQuotationById(id: string): Promise<{ quotation: Quotation | null }> {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Transform snake_case to camelCase for app use
    const transformed = data ? {
      ...data,
      vendorId: data.vendor_id,
      resortId: data.resort_id,
      guestName: data.guest_name,
      checkIn: data.check_in,
      checkOut: data.check_out,
      totalAmount: data.total_amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : null;
    
    return { quotation: transformed };
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return { quotation: null };
  }
}

/**
 * Create a new quotation
 */
export async function createQuotation(quotationData: {
  resort_id: string;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms: number;
  status?: string;
  total_amount: number;
  notes?: string;
}): Promise<{ quotation: Quotation }> {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        ...quotationData,
        status: quotationData.status || 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return { quotation: data };
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
}

/**
 * Update a quotation
 */
export async function updateQuotation(
  id: string,
  updates: Partial<{
    status: string;
    total_amount: number;
    notes: string;
  }>
): Promise<{ quotation: Quotation }> {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { quotation: data };
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
}

/**
 * Delete a quotation
 */
export async function deleteQuotation(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
}

