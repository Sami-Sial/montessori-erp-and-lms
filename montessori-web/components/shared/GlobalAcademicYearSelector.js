'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedAcademicYearId } from '../../store/uiSlice';
import { academicYearsApi } from '../../lib/api/academicYears';
import { Calendar } from 'lucide-react';

export default function GlobalAcademicYearSelector() {
  const dispatch = useDispatch();
  const selectedYearId = useSelector((state) => state.ui.selectedAcademicYearId);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadYears() {
      try {
        const data = await academicYearsApi.list();
        setYears(data || []);
        
        // If no year is selected, try to set the current one
        if (!selectedYearId && data?.length > 0) {
          const current = data.find(y => y.isCurrent) || data[0];
          dispatch(setSelectedAcademicYearId(current.id));
        }
      } catch (err) {
        console.error('Failed to load academic years', err);
      } finally {
        setLoading(false);
      }
    }
    loadYears();
  }, [dispatch, selectedYearId]);

  if (loading) {
    return <div className="h-9 w-32 bg-gray-200 animate-pulse rounded-lg"></div>;
  }

  if (years.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Calendar size={16} className="text-gray-500" />
      <select
        value={selectedYearId || ''}
        onChange={(e) => dispatch(setSelectedAcademicYearId(e.target.value))}
        className="bg-surface border border-border text-sm rounded-lg px-2 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-ink transition-all"
        aria-label="Select Academic Year"
      >
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.name} {year.isCurrent ? '(Current)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
