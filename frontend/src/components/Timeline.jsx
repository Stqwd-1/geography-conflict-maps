function Timeline({ year, minYear, maxYear, onChange }) {
  return (
    <div className="timeline">
      <span className="timeline-label">
        {year ? `${year} год` : 'Все годы'}
      </span>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={year || minYear}
        onChange={(e) => onChange(Number(e.target.value))}
        className="timeline-slider"
        aria-label="Фильтр по годам"
      />
      <div className="timeline-years">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
      <button
        className="btn-reset-timeline"
        onClick={() => onChange(null)}
      >
        Сбросить года
      </button>
    </div>
  );
}

export default Timeline;