import { flagSrc } from '../flags';

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

function formatNumber(value) {
  if (value === null || value === undefined) return null;
  if (value === 0) return 0;
  return Number(value).toLocaleString('ru-RU');
}

function dates(conflict) {
  return `${conflict.start_date} — ${conflict.end_date || 'по настоящее время'}`;
}

function PartyRow({ party }) {
  return (
    <li>
      <span className="party-flag">
        {party.flag ? (
          <img
            src={flagSrc(party.flag)}
            alt={party.name}
            title={party.name}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          '⚔️'
        )}
      </span>
      <span className="party-name">{party.name}</span>
      <span className="party-type">{party.type}</span>
    </li>
  );
}

function CompareRow({ label, values, format }) {
  const cells = values.map((v) => (format ? format(v) : v));
  const same = cells.every((v) => v === cells[0]);
  return (
    <>
      <div className="compare-label">{label}</div>
      {cells.map((v, i) => (
        <div key={i} className={`compare-cell${i > 0 ? ' compare-sep' : ''}${!same ? ' compare-cell-diff' : ''}`}>
          {v ?? '—'}
        </div>
      ))}
    </>
  );
}

function ComparePanel({ conflicts, onClose, onRemove }) {
  return (
    <div className="compare-panel">
      <div className="compare-panel-top">
        <h3 className="compare-title">⚖️ Сравнение конфликтов ({conflicts.length})</h3>
        <button className="sidebar-close" onClick={onClose} aria-label="Закрыть сравнение">×</button>
      </div>

      <div
        className="compare-grid"
        style={{
          gridTemplateColumns: `120px ${Array(conflicts.length).fill('minmax(180px, 1fr)').join(' ')}`,
        }}
      >
        <div className="compare-corner" />

        {conflicts.map((c, i) => (
          <div className={`compare-header${i > 0 ? ' compare-sep' : ''}`} key={c.slug}>
            <div className="compare-header-top">
              <div className={`severity-badge severity-${c.severity}`}>
                {SEVERITY_LABELS[c.severity]}
              </div>
              {conflicts.length > 2 && (
                <button
                  className="compare-remove"
                  onClick={() => onRemove(c.slug)}
                  aria-label={`Убрать ${c.title} из сравнения`}
                  title="Убрать из сравнения"
                >
                  ✕
                </button>
              )}
            </div>
            <h2>{c.title}</h2>
            <p className="dates">{dates(c)}</p>
          </div>
        ))}

        <CompareRow
          label="Статус"
          values={conflicts.map((c) => c.status)}
          format={(v) => STATUS_LABELS[v] || v}
        />
        <CompareRow
          label="Причина"
          values={conflicts.map((c) => c.cause)}
          format={(v) => CAUSE_LABELS[v] || v}
        />
        <CompareRow
          label="Масштаб"
          values={conflicts.map((c) => c.severity)}
          format={(v) => SEVERITY_LABELS[v] || v}
        />
        <CompareRow label="Регион" values={conflicts.map((c) => c.region)} />
        <CompareRow label="Годы" values={conflicts.map(dates)} />

        {conflicts.some((c) => c.casualties_estimated > 0) && (
          <CompareRow
            label="Оценочные потери"
            values={conflicts.map((c) => c.casualties_estimated)}
            format={formatNumber}
          />
        )}
        {conflicts.some((c) => c.refugees_count > 0) && (
          <CompareRow
            label="Беженцы"
            values={conflicts.map((c) => c.refugees_count)}
            format={formatNumber}
          />
        )}
        <CompareRow
          label="Сторон"
          values={conflicts.map((c) => c.parties_count)}
        />

        <div className="compare-label">Стороны конфликта</div>
        {conflicts.map((c, i) => (
          <div className={`compare-column${i > 0 ? ' compare-sep' : ''}`} key={c.slug}>
            <ul className="parties-list">
              {(c.parties || []).map((p, j) => <PartyRow party={p} key={j} />)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComparePanel;