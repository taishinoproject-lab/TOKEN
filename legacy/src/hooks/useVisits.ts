import { useState, useEffect } from 'react';

export interface Visit {
  id: string;
  eventId: string;
  date: string;
  photoIdx: number;
  text: string;
  scope: string;
}

const initialVisits: Visit[] = [
  { id: 'v1', eventId: 'ev_04', date: '2026-03-15', photoIdx: 1, text: '安綱の太刀を初めて生で見た', scope: '公開' }
];

export const useVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('token_visits');
    if (stored) {
      setVisits(JSON.parse(stored));
    } else {
      localStorage.setItem('token_visits', JSON.stringify(initialVisits));
      setVisits(initialVisits);
    }
  }, []);

  const addVisit = (v: Visit) => {
    const newVisits = [v, ...visits];
    localStorage.setItem('token_visits', JSON.stringify(newVisits));
    setVisits(newVisits);
  };

  return { visits, addVisit };
};
