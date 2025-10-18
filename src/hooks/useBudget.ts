import { useState } from 'react';

export function useBudgetSettings() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  };
}
