import type { DuckResponse, ApiError } from '../api/ducksApi';
import { ducksApi } from '../api/ducksApi';
import { useEffect, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseDucksReturn {
  ducks: DuckResponse[];
  loading: boolean;
  error: ApiError | null;
  direction: SortDirection;
  load: () => Promise<void>;
  toggleSort: () => void;
  refresh: () => void;
}

export const useDucks = (): UseDucksReturn => {
  const [ducks, setDucks] = useState<DuckResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [direction, setDirection] = useState<SortDirection>('desc');

  const load = async () => {
    try {
      setLoading(true);
      const data = await ducksApi.list({ sort: 'quantity', order: direction });
      setDucks(data);
      setError(null);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    load();
  };

  const refresh = () => load();

  useEffect(() => {
    load();
  }, []);

  return { ducks, loading, error, direction, load, toggleSort, refresh };
};