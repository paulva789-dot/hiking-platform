'use client';

import { useId, useMemo, useRef, useState } from 'react';
import type { Waypoint } from '@/lib/types';

const VB_W = 600;
const VB_H = 200;
const PAD = { top: 18, right: 14, bottom: 26, left: 42 };

/** Great-circle distance in km — waypoints are the only distance-along-route data we have. */
const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

export function ElevationProfile({ waypoints, color }: { waypoints: Waypoint[]; color: string }) {
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    const usable = [...waypoints]
      .filter((w) => w.elevationM !== null)
      .sort((a, b) => a.order - b.order);
    if (usable.length < 2) return [];

    let dist = 0;
    return usable.map((w, i) => {
      if (i > 0) dist += haversineKm(usable[i - 1], w);
      return { wp: w, distanceKm: dist, elevationM: w.elevationM as number };
    });
  }, [waypoints]);

  if (points.length < 2) return null;

  const totalDist = points[points.length - 1].distanceKm || 1;
  const elevations = points.map((p) => p.elevationM);
  const minEl = Math.min(...elevations);
  const maxEl = Math.max(...elevations);
  const elPad = Math.max(20, (maxEl - minEl) * 0.15);
  const yMin = Math.floor((minEl - elPad) / 50) * 50;
  const yMax = Math.ceil((maxEl + elPad) / 50) * 50;

  const plotW = VB_W - PAD.left - PAD.right;
  const plotH = VB_H - PAD.top - PAD.bottom;

  const x = (km: number) => PAD.left + (km / totalDist) * plotW;
  const y = (m: number) => PAD.top + plotH - ((m - yMin) / (yMax - yMin)) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.distanceKm)} ${y(p.elevationM)}`).join(' ');
  const areaPath = `${linePath} L ${x(totalDist)} ${y(yMin)} L ${x(0)} ${y(yMin)} Z`;

  const peakIndex = elevations.indexOf(maxEl);
  const active = hoverIndex !== null ? points[hoverIndex] : null;

  const handleMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const fracX = (clientX - rect.left) / rect.width;
    const km = fracX * totalDist;
    let nearest = 0;
    let best = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.distanceKm - km);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full touch-none"
        role="img"
        aria-label={`Elevation profile from ${points[0].elevationM.toLocaleString()} m to ${maxEl.toLocaleString()} m over ${totalDist.toFixed(1)} km`}
        onPointerMove={(e) => handleMove(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Gridlines: base and peak only — recessive, one-step-off-surface. */}
        {[yMin, yMax].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={VB_W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              className="stroke-basalt-200 dark:stroke-basalt-800"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-basalt-500 dark:fill-basalt-400 [font-variant-numeric:tabular-nums]"
              fontSize={10}
            >
              {v.toLocaleString()} m
            </text>
          </g>
        ))}

        {/* x-axis endpoints only — distance is labelled sparingly, not per-point. */}
        <text x={PAD.left} y={VB_H - 8} textAnchor="start" className="fill-basalt-500 dark:fill-basalt-400" fontSize={10}>
          0 km
        </text>
        <text x={VB_W - PAD.right} y={VB_H - 8} textAnchor="end" className="fill-basalt-500 dark:fill-basalt-400" fontSize={10}>
          {totalDist.toFixed(1)} km
        </text>

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Waypoint markers, ringed so they read distinctly where they sit on the line. */}
        {points.map((p, i) => (
          <circle
            key={p.wp.id}
            cx={x(p.distanceKm)}
            cy={y(p.elevationM)}
            r={i === hoverIndex ? 5 : 3.5}
            fill={color}
            strokeWidth={2}
            className="stroke-white transition-[r] dark:stroke-basalt-900"
          />
        ))}

        {/* Direct label on the highest point — the one figure this chart's story is about. */}
        <text
          x={x(points[peakIndex].distanceKm)}
          y={y(points[peakIndex].elevationM) - 10}
          textAnchor="middle"
          className="fill-basalt-800 dark:fill-basalt-100 font-semibold [font-variant-numeric:tabular-nums]"
          fontSize={11}
        >
          {maxEl.toLocaleString()} m
        </text>

        {active && (
          <line
            x1={x(active.distanceKm)}
            x2={x(active.distanceKm)}
            y1={PAD.top}
            y2={VB_H - PAD.bottom}
            className="stroke-basalt-400 dark:stroke-basalt-500"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-lg border border-basalt-200 bg-white px-3 py-2 text-xs shadow-md dark:border-basalt-700 dark:bg-basalt-900"
          style={{ left: `${(x(active.distanceKm) / VB_W) * 100}%` }}
        >
          <p className="font-semibold text-basalt-900 dark:text-basalt-50 [font-variant-numeric:tabular-nums]">
            {active.elevationM.toLocaleString()} m <span className="font-normal text-basalt-500 dark:text-basalt-400">· {active.distanceKm.toFixed(1)} km</span>
          </p>
          <p className="mt-0.5 text-basalt-600 dark:text-basalt-300">{active.wp.name}</p>
        </div>
      )}
    </div>
  );
}
