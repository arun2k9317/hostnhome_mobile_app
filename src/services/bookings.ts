import { supabase } from './supabase';
import { Booking } from '../types';

/**
 * Get all bookings for the current vendor
 */
export async function getBookings(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ bookings: Booking[] }> {
  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('check_in', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('check_out', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Transform snake_case to camelCase for app use
    const transformed = (data || []).map((b: any) => ({
      ...b,
      vendorId: b.vendor_id,
      resortId: b.resort_id,
      quotationId: b.quotation_id,
      guestName: b.guest_name,
      checkIn: b.check_in,
      checkOut: b.check_out,
      totalAmount: b.total_amount,
      paidAmount: b.paid_amount,
      paymentStatus: b.payment_status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));
    
    return { bookings: transformed };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { bookings: [] };
  }
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: string): Promise<{ booking: Booking | null }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Transform snake_case to camelCase for app use
    const transformed = data ? {
      ...data,
      vendorId: data.vendor_id,
      resortId: data.resort_id,
      quotationId: data.quotation_id,
      guestName: data.guest_name,
      checkIn: data.check_in,
      checkOut: data.check_out,
      totalAmount: data.total_amount,
      paidAmount: data.paid_amount,
      paymentStatus: data.payment_status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : null;
    
    return { booking: transformed };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { booking: null };
  }
}

/**
 * Create a new booking
 */
export async function createBooking(bookingData: {
  resort_id: string;
  quotation_id?: string;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms: number;
  status: string;
  total_amount: number;
  paid_amount?: number;
  payment_status?: string;
}): Promise<{ booking: Booking }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        paid_amount: bookingData.paid_amount || 0,
        payment_status: bookingData.payment_status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { booking: data };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Update a booking
 */
export async function updateBooking(
  id: string,
  updates: Partial<{
    status: string;
    paid_amount: number;
    payment_status: string;
  }>
): Promise<{ booking: Booking }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { booking: data };
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}

