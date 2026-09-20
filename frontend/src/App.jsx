import { useEffect, useState, useCallback, useRef } from 'react';
import ConflictMap from './components/ConflictMap';
import FiltersPanel from './components/FiltersPanel';
import Sidebar from './components/Sidebar';
import ComparePanel from './components/ComparePanel';
import Timeline from './components/Timeline';
import './App.css';

function App() {
  const [conflicts, setConflicts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: '', cause: '', severity: '', minParties: '' });
  const [year, setYear] = useState(null);
  const [years, setYears] = useState({ min: 1800, max: 2026 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [compareMode, setCompareMode] = useState(false);
  const [compareSlugs, setCompareSlugs] = useState([]);
  const [compareData, setCompareData] = useState([]);

  const MAX_COMPARE = 6;

  const lastPickedRef = useRef(null);

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.cause) params.set('cause', filters.cause);
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.minParties) params.set('min_parties', filters.minParties);

      const resp = await fetch(`/api/geojson/?${params}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const list = (data.features || []).map((f) => ({
        ...f.properties,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }));
      const sorted = [...list].sort((a, b) =>
        String(b.start_date || '').localeCompare(String(a.start_date || ''))
      );
      setConflicts(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/geojson/');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (cancelled) return;
        const startYears = (data.features || []).map((f) =>
          Number(String(f.properties.start_date).slice(0, 4)),
        );
        if (startYears.length === 0) return;
        setYears({ min: Math.min(...startYears), max: Math.max(...startYears, 2026) });
      } catch {
        // keep default range {min: 1803, max: 2026}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectConflict = useCallback(async (slug) => {
    try {
      const resp = await fetch(`/api/conflicts/${slug}/`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setSelected(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const selectForCompare = useCallback(async (slug) => {
    if (!compareMode) {
      selectConflict(slug);
      return;
    }
    if (compareSlugs.includes(slug) || compareSlugs.length >= MAX_COMPARE) return;
    setCompareSlugs((prev) => [...prev, slug]);
    try {
      const resp = await fetch(`/api/conflicts/${slug}/`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setCompareData((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message);
    }
  }, [compareMode, selectConflict, compareSlugs]);

  const removeFromCompare = useCallback((slug) => {
    setCompareSlugs((prev) => prev.filter((s) => s !== slug));
    setCompareData((prev) => prev.filter((c) => c.slug !== slug));
  }, []);

  const pickRandom = useCallback(() => {
    if (conflicts.length === 0) return;
    const candidates = conflicts.filter((c) => c.slug !== lastPickedRef.current);
    const pool = candidates.length > 0 ? candidates : conflicts;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    lastPickedRef.current = pick.slug;
    selectConflict(pick.slug);
    setCompareMode(false);
    setCompareSlugs([]);
    setCompareData([]);
  }, [conflicts, selectConflict]);

  const toggleCompareMode = useCallback(() => {
    setCompareMode((prev) => !prev);
    setCompareSlugs([]);
    setCompareData([]);
    setSelected(null);
  }, []);

  const clearCompare = useCallback(() => {
    setCompareSlugs([]);
    setCompareData([]);
  }, []);

  const closeSidebar = useCallback(() => {
    setSelected(null);
    if (compareMode) {
      setCompareMode(false);
      setCompareSlugs([]);
      setCompareData([]);
    }
  }, [compareMode]);

  return (
    <div className="app">
      <header className="app-header">
        <h1><img src="/avatar.png" alt="Лого" className="app-logo" /> Карта вооружённых конфликтов</h1>
        <div className="header-actions">
          <span className="conflict-count">Конфликтов на карте: {conflicts.length}</span>
          <button className="btn-header" onClick={pickRandom} disabled={conflicts.length === 0}>
            🎲 Случайный
          </button>
          <button
            className={`btn-header${compareMode ? ' btn-header-active' : ''}`}
            onClick={toggleCompareMode}
          >
            ⚖️ Сравнить
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          Ошибка API: {error} — проверьте, что бэкенд запущен на :8000
        </div>
      )}

      <main className="app-main">
        <FiltersPanel
          filters={filters}
          onChange={setFilters}
          conflicts={conflicts}
          selectedSlug={selected?.slug}
          compareMode={compareMode}
          compareSlugs={compareSlugs}
          onSelect={selectConflict}
          onSelectForCompare={selectForCompare}
        />
        <div className="map-wrapper">
          {loading && <div className="loading">Загрузка данных…</div>}
          {compareMode && (
            <div className="compare-hint">
              {compareSlugs.length === 0 && 'Выберите 2 и более конфликта для сравнения'}
              {compareSlugs.length === 1 && 'Выберите ещё минимум 1 конфликт'}
              {compareSlugs.length === MAX_COMPARE && 'Достигнут максимум (6)'}
              {compareSlugs.length >= 2 && compareSlugs.length < MAX_COMPARE && `✓ Выбрано ${compareSlugs.length}, можно добавить ещё`}
            </div>
          )}
          <ConflictMap
            conflicts={conflicts}
            selectedSlug={selected?.slug}
            onSelect={compareMode ? selectForCompare : selectConflict}
            year={year}
          />
        </div>
        {compareMode && compareData.length >= 2 ? (
          <ComparePanel
            conflicts={compareData}
            onClose={clearCompare}
            onRemove={removeFromCompare}
          />
        ) : (
          <Sidebar conflict={selected} onClose={closeSidebar} />
        )}
      </main>

      <footer className="app-footer">
        <Timeline year={year} minYear={years.min} maxYear={years.max} onChange={setYear} />
      </footer>
    </div>
  );
}

export default App;
