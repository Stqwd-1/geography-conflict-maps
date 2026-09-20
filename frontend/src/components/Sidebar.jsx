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

function Sidebar({ conflict, onClose }) {
  if (!conflict) return null;

  return (
    <div className="sidebar">
      <button className="sidebar-close" onClick={onClose} aria-label="Закрыть">×</button>

      <div className={`severity-badge severity-${conflict.severity}`}>
        {conflict.severity === 'global' ? '🌍 Глобальный' : conflict.severity === 'regional' ? '📡 Региональный' : '📍 Локальный'}
      </div>

      <h2>{conflict.title}</h2>
      <p className="dates">
        {conflict.start_date} — {conflict.end_date || 'по настоящее время'}
      </p>

      <div className="meta-grid">
        <div className="meta-item">
          <span className="meta-label">Статус</span>
          <span className={`status-chip status-${conflict.status}`}>
            {STATUS_LABELS[conflict.status]}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Причина</span>
          <span>{CAUSE_LABELS[conflict.cause]}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Регион</span>
          <span>{conflict.region} · {conflict.country}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Сторон</span>
          <span>{conflict.parties_count || (conflict.parties ? conflict.parties.length : 0)}</span>
        </div>
      </div>

      {(conflict.casualties_estimated || conflict.refugees_count) && (
        <div className="metrics">
          {conflict.casualties_estimated > 0 && (
            <div className="metric">
              <div className="metric-value casualties-value">{conflict.casualties_estimated.toLocaleString('ru-RU')}</div>
              <div className="metric-label">💀 Оценочные потери</div>
            </div>
          )}
          {conflict.refugees_count > 0 && (
            <div className="metric">
              <div className="metric-value refugees-value">{conflict.refugees_count.toLocaleString('ru-RU')}</div>
              <div className="metric-label">🏳️ Беженцы</div>
            </div>
          )}
        </div>
      )}

      <p className="summary">{conflict.summary}</p>

      {conflict.description && (
        <>
          <button className="btn-more" onClick={(e) => {
            const d = e.currentTarget.closest('.sidebar').querySelector('.full-description');
            if (d) d.classList.toggle('visible');
            e.currentTarget.hidden = true;
          }}>
            Подробнее…
          </button>
          <div className="full-description">{conflict.description}</div>
        </>
      )}

      {conflict.parties && conflict.parties.length > 0 && (
        <>
          <h4>Стороны конфликта</h4>
          <ul className="parties-list">
            {conflict.parties.map((p, i) => (
              <li key={i}>
                <span className="party-flag">
                  {p.flag ? (
                    <img
                      src={flagSrc(p.flag)}
                      alt={p.name}
                      title={p.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    '⚔️'
                  )}
                </span>
                <span className="party-name">{p.name}</span>
                <span className="party-type">{p.type}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {conflict.sources && conflict.sources.length > 0 && (
        <>
          <h4>Источники</h4>
          <ul className="sources-list">
            {conflict.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  🔗 {s.name}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Sidebar;