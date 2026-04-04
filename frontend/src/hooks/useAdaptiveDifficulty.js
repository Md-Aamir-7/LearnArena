import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useAdaptiveDifficulty = (gameType) => {
  const [difficulty, setDifficulty] = useState('Easy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDifficulty = async () => {
      try {
        const res = await api.get(`/gamification/adaptive-difficulty/${gameType}`);
        setDifficulty(res.data.difficulty);
      } catch (error) {
        console.error('Failed to fetch adaptive difficulty', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDifficulty();
  }, [gameType]);

  return { difficulty, loading };
};
