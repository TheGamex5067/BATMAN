
import { useEffect, useState } from 'react';
import { supabase, Module, Movie, Character, Location, Technology } from '@shared/supabase';
import { useAuth, AccessLevel } from '@/state/auth';

type TableName = 'modules' | 'movies' | 'characters' | 'locations' | 'technologies';
type TableData = Module | Movie | Character | Location | Technology;

const ACCESS_HIERARCHY: Record<AccessLevel, number> = {
  DELTA: 1,
  GAMMA: 2,
  BETA: 3,
  ALPHA: 4,
};

export function useSupabaseData<T extends TableData>(tableName: TableName) {
  const { session } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userLevel = session?.level || 'DELTA';
  const userAccessLevel = ACCESS_HIERARCHY[userLevel];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Filter based on clearance level
      const filteredData = (fetchedData || []).filter((item: any) => {
        const itemAccessLevel = ACCESS_HIERARCHY[item.clearance_level as AccessLevel];
        const canView = itemAccessLevel <= userAccessLevel;
        console.log(`Item "${item.title || item.name}" - Clearance: ${item.clearance_level} (${itemAccessLevel}) - User can view: ${canView}`);
        return canView;
      });

      console.log(`User level: ${userLevel} (${userAccessLevel}), Found ${fetchedData?.length || 0} total items, Showing ${filteredData.length} items`);
      console.log('All fetched items:', fetchedData?.map(item => ({ title: item.title || item.name, clearance: item.clearance_level })));
      console.log('Filtered items:', filteredData.map(item => ({ title: item.title || item.name, clearance: item.clearance_level })));

      setData(filteredData as T[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const insertData = async (newItem: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    if (userLevel !== 'ALPHA') {
      throw new Error('Insufficient clearance for data modification');
    }

    try {
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert([newItem])
        .select()
        .single();

      if (insertError) throw insertError;

      setData(prev => [insertedData as T, ...prev]);
      return insertedData as T;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to insert data');
    }
  };

  const updateData = async (id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>) => {
    if (userLevel !== 'ALPHA') {
      throw new Error('Insufficient clearance for data modification');
    }

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setData(prev => prev.map(item => item.id === id ? updatedData as T : item));
      return updatedData as T;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update data');
    }
  };

  const deleteData = async (id: string) => {
    if (userLevel !== 'ALPHA') {
      throw new Error('Insufficient clearance for data modification');
    }

    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete data');
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, tableName, userLevel]);

  // Set up real-time subscription
  useEffect(() => {
    if (!session) return;

    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        () => {
          fetchData(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session, tableName]);

  return {
    data,
    loading,
    error,
    insertData,
    updateData,
    deleteData,
    refetch: fetchData,
    canModify: userLevel === 'ALPHA'
  };
}
