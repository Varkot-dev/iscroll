/**
 * useSavedItems HOOK - Manages bookmarked articles
 * 
 * Handles all database operations for saved items:
 * - Loading saved items
 * - Saving new items
 * - Removing saved items
 * - Checking if item is saved
 * 
 * DATABASE OPERATIONS:
 * - SELECT: Read data from table
 * - INSERT: Add new row
 * - DELETE: Remove row
 * 
 * USAGE:
 * const { savedItems, saveItem, removeItem, isItemSaved } = useSavedItems();
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, SavedItem } from '@/lib/supabase';
import { FeedItem } from '@/types';

export function useSavedItems() {
  // ============================================
  // STATE
  // ============================================
  
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep track of saved Wikipedia IDs for quick lookup
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // ============================================
  // LOAD SAVED ITEMS
  // ============================================
  
  const loadSavedItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Supabase query: SELECT * FROM saved_items ORDER BY saved_at DESC
      const { data, error: dbError } = await supabase
        .from('saved_items')
        .select('*')
        .order('saved_at', { ascending: false });

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to load saved items');
        return;
      }

      // Update state with fetched items
      setSavedItems(data || []);
      
      // Create a Set of Wikipedia IDs for quick lookup
      const ids = new Set((data || []).map(item => item.wikipedia_id));
      setSavedIds(ids);

    } catch (err) {
      console.error('Load error:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved items when hook mounts
  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  // ============================================
  // SAVE ITEM
  // ============================================
  
  const saveItem = useCallback(async (item: FeedItem): Promise<boolean> => {
    try {
      // Check if already saved
      if (savedIds.has(item.id)) {
        console.log('Item already saved');
        return true;
      }

      // Supabase query: INSERT INTO saved_items (...)
      const { error: dbError } = await supabase
        .from('saved_items')
        .insert({
          wikipedia_id: item.id,
          title: item.title,
          extract: item.extract,
          thumbnail_url: item.thumbnailUrl,
        });

      if (dbError) {
        console.error('Save error:', dbError);
        return false;
      }

      // Optimistic update: Update local state immediately
      // This makes the UI feel faster
      setSavedIds(prev => new Set([...prev, item.id]));
      
      // Reload to get the full item with ID
      loadSavedItems();
      
      return true;

    } catch (err) {
      console.error('Save error:', err);
      return false;
    }
  }, [savedIds, loadSavedItems]);

  // ============================================
  // REMOVE ITEM
  // ============================================
  
  const removeItem = useCallback(async (wikipediaId: string): Promise<boolean> => {
    try {
      // Supabase query: DELETE FROM saved_items WHERE wikipedia_id = ?
      const { error: dbError } = await supabase
        .from('saved_items')
        .delete()
        .eq('wikipedia_id', wikipediaId);

      if (dbError) {
        console.error('Delete error:', dbError);
        return false;
      }

      // Optimistic update
      setSavedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(wikipediaId);
        return newSet;
      });
      
      setSavedItems(prev => prev.filter(item => item.wikipedia_id !== wikipediaId));
      
      return true;

    } catch (err) {
      console.error('Remove error:', err);
      return false;
    }
  }, []);

  // ============================================
  // TOGGLE ITEM (Save or Remove)
  // ============================================
  
  const toggleItem = useCallback(async (item: FeedItem): Promise<boolean> => {
    if (savedIds.has(item.id)) {
      return removeItem(item.id);
    } else {
      return saveItem(item);
    }
  }, [savedIds, saveItem, removeItem]);

  // ============================================
  // CHECK IF ITEM IS SAVED
  // ============================================
  
  const isItemSaved = useCallback((wikipediaId: string): boolean => {
    return savedIds.has(wikipediaId);
  }, [savedIds]);

  // ============================================
  // RETURN VALUES
  // ============================================
  
  return {
    savedItems,
    loading,
    error,
    saveItem,
    removeItem,
    toggleItem,
    isItemSaved,
    refresh: loadSavedItems,
  };
}
