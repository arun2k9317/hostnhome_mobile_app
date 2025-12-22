import { supabase } from './supabase';
import { Resort, Room } from '../types';

/**
 * Get all resorts for the current vendor
 */
export async function getResorts(): Promise<{ resorts: Resort[] }> {
  try {
    const { data, error } = await supabase
      .from('resorts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { resorts: data || [] };
  } catch (error) {
    console.error('Error fetching resorts:', error);
    throw error;
  }
}

/**
 * Get a single resort by ID
 */
export async function getResortById(id: string): Promise<{ resort: Resort | null }> {
  try {
    const { data, error } = await supabase
      .from('resorts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { resort: data };
  } catch (error) {
    console.error('Error fetching resort:', error);
    return { resort: null };
  }
}

/**
 * Create a new resort
 */
export async function createResort(resortData: {
  name: string;
  slug: string;
  description?: string;
  location: string;
  amenities?: string[];
  images?: string[];
  status?: 'active' | 'inactive';
}): Promise<{ resort: Resort }> {
  try {
    const { data, error } = await supabase
      .from('resorts')
      .insert({
        ...resortData,
        status: resortData.status || 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return { resort: data };
  } catch (error) {
    console.error('Error creating resort:', error);
    throw error;
  }
}

/**
 * Update a resort
 */
export async function updateResort(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    location: string;
    amenities: string[];
    images: string[];
    status: 'active' | 'inactive';
  }>
): Promise<{ resort: Resort }> {
  try {
    const { data, error } = await supabase
      .from('resorts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { resort: data };
  } catch (error) {
    console.error('Error updating resort:', error);
    throw error;
  }
}

/**
 * Delete a resort
 */
export async function deleteResort(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('resorts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting resort:', error);
    throw error;
  }
}

/**
 * Get all rooms for a resort
 */
export async function getRoomsByResort(resortId: string): Promise<{ rooms: Room[] }> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('resort_id', resortId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { rooms: data || [] };
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
}

/**
 * Get a single room by ID
 */
export async function getRoomById(id: string): Promise<{ room: Room | null }> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { room: data };
  } catch (error) {
    console.error('Error fetching room:', error);
    return { room: null };
  }
}

/**
 * Create a new room
 */
export async function createRoom(roomData: {
  resort_id: string;
  name: string;
  type: string;
  description?: string;
  price: number;
  capacity: number;
  size?: number;
  amenities?: string[];
  images?: string[];
  availability_status?: 'available' | 'booked' | 'maintenance';
}): Promise<{ room: Room }> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        ...roomData,
        availability_status: roomData.availability_status || 'available',
      })
      .select()
      .single();

    if (error) throw error;
    return { room: data };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

/**
 * Update a room
 */
export async function updateRoom(
  id: string,
  updates: Partial<{
    name: string;
    type: string;
    description: string;
    price: number;
    capacity: number;
    size: number;
    amenities: string[];
    images: string[];
    availability_status: 'available' | 'booked' | 'maintenance';
  }>
): Promise<{ room: Room }> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { room: data };
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
}

/**
 * Delete a room
 */
export async function deleteRoom(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

