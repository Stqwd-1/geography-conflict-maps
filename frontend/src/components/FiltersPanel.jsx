const STATUS_LABELS = {
  active: 'Активный',
  frozen: 'Замороженный',
  resolved: 'Завершённый',
};

const CAUSE_LABELS = {
  territorial: 'Территориальный',
  ethnic: 'Этнический',
  economic: 'Экономический',
  political: 'Политический',
  religious: 'Религиозный',
};

const SEVERITY_LABELS = {
  global: 'Глобальный',
  regional: 'Региональный',
  local: 'Локальный',
};

function FiltersPanel({ filters, onChange, conflicts = [], selectedSlug, compareMode, compareSlugs = [], onSelect, onSelectForCompare }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="filters-panel">
      <h3>Фильтры</h3>

      <label>
        По статусу
        <select value={filters.status} onChange={(e) => update('status', e.target.value)}>
          <option value="">Все</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>

      <label>
        По причине
        <select value={filters.cause} onChange={(e) => update('cause', e.target.value)}>
          <option value="">Все</option>
          {Object.entries(CAUSE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>

      <label>
        По масштабу
        <select value={filters.severity} onChange={(e) => update('severity', e.target.value)}>
          <option value="">Все</option>
          {Object.entries(SEVERITY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>

      <label>
        Минимум сторон
        <input
          type="number"
          min="1"
          max="15"
          value={filters.minParties === '' ? '' : filters.minParties}
          onChange={(e) => update('minParties', e.target.value)}
        />
      </label>

      <button className="btn-reset" onClick={() => onChange({ status: '', cause: '', severity: '', minParties: '' })}>
        Сбросить фильтры
      </button>

      <details className="catalog" open>
        <summary>
          Каталог конфликтов
          <span className="catalog-count">{conflicts.length}</span>
        </summary>
        <ul className="catalog-list">
          {conflicts.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className={`catalog-item${c.slug === selectedSlug ? ' catalog-item-selected' : ''}${
                  compareSlugs.includes(c.slug) ? ' catalog-item-compare' : ''
                }`}
                onClick={() => (compareMode ? onSelectForCompare(c.slug) : onSelect(c.slug))}
              >
                <span className={`catalog-dot severity-dot-${c.severity}`} />
                <span className="catalog-title">{c.title}</span>
                <span className="catalog-years">
                  {String(c.start_date).slice(0, 4)}
                  {c.end_date ? `–${String(c.end_date).slice(0, 4)}` : '–н.в.'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default FiltersPanel;