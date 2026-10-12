import React from 'react';

/**
 * Clean Monochrome SVG Charts
 */
export function TimelineChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.sent || 1000));
  const height = 180;
  const width = 500;
  const paddingX = 40;
  const paddingY = 24;

  const barWidth = 32;
  const availableWidth = width - paddingX * 2;
  const step = availableWidth / (data.length - 1 || 1);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = height - paddingY - ratio * (height - paddingY * 2);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-dim)"
                fontFamily="var(--font-mono)"
              >
                {Math.round(maxVal * ratio)}
              </text>
            </g>
          );
        })}

        {/* Bars and labels */}
        {data.map((item, idx) => {
          const x = paddingX + idx * step;
          const barH = (item.sent / maxVal) * (height - paddingY * 2);
          const y = height - paddingY - barH;
          const openH = (item.opens / maxVal) * (height - paddingY * 2);
          const openY = height - paddingY - openH;

          return (
            <g key={idx}>
              {/* Sent bar */}
              <rect
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={barH}
                fill="var(--bg-active)"
                rx="3"
              />
              {/* Opens inner bar */}
              <rect
                x={x - barWidth / 2 + 4}
                y={openY}
                width={barWidth - 8}
                height={openH}
                fill="var(--text-main)"
                rx="2"
              />
              {/* Day label */}
              <text
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
                fontWeight="500"
              >
                {item.day}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: 'var(--bg-active)', borderRadius: 2 }} />
          <span>Total Sent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, background: 'var(--text-main)', borderRadius: 2 }} />
          <span>Opened / Engaged</span>
        </div>
      </div>
    </div>
  );
}

export function ChannelBreakdownChart({ channels = [] }) {
  if (!channels || channels.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {channels.map((ch, idx) => (
        <div key={idx}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 12.5 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ch.channel}</span>
            <span style={{ color: 'var(--text-muted)' }}>${ch.revenue?.toLocaleString()} ({ch.sharePct}%)</span>
          </div>
          <div style={{ width: '100%', height: 7, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${ch.sharePct}%`,
                height: '100%',
                background: 'var(--text-main)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
