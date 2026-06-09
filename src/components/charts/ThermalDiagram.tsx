import { formatNumber } from '../../lib/calculations';

type DiagramType = 'conduction' | 'convection' | 'radiation';

interface ConductionDiagramData {
  hotC: number;
  coldC: number;
  q: number;
  length: number;
  layers?: Array<{ name: string; L: number; k: number }>;
}

interface ConvectionDiagramData {
  surfaceC: number;
  fluidC: number;
  velocity: number;
  h: number;
  q: number;
  regime: string;
}

interface RadiationDiagramData {
  surfaceC: number;
  ambientC: number;
  epsilon: number;
  q: number;
}

interface ThermalDiagramProps {
  type: DiagramType;
  conduction?: ConductionDiagramData;
  convection?: ConvectionDiagramData;
  radiation?: RadiationDiagramData;
}

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const heatColor = (temperatureC: number): string => {
  if (temperatureC >= 250) return '#ef4444';
  if (temperatureC >= 120) return '#f97316';
  if (temperatureC >= 45) return '#f59e0b';
  if (temperatureC >= 10) return '#38bdf8';
  return '#1e3a8a';
};

const layerColor = (k: number): string => {
  if (k >= 100) return '#f97316';
  if (k >= 5) return '#ef4444';
  if (k >= 0.2) return '#f59e0b';
  return '#38bdf8';
};

export function ThermalDiagram({ type, conduction, convection, radiation }: ThermalDiagramProps) {
  const label =
    type === 'conduction'
      ? 'Cómo baja la temperatura en la pared'
      : type === 'convection'
        ? 'Intercambio superficie–fluido'
        : 'Emisión de superficie gris';

  const conductionQ = Math.abs(conduction?.q ?? 0);
  const conductionDeltaT = Math.abs((conduction?.hotC ?? 80) - (conduction?.coldC ?? 20));
  const conductionArrowWidth = clamp(3 + Math.log10(conductionQ + 1) * 2.4, 4, 12);
  const conductionArrowCount = clamp(Math.round(2 + Math.log10(conductionQ + 1)), 2, 5);
  const wallWidth = conduction ? clamp(210 + conduction.length * 460, 220, 390) : 360;
  const wallX = 90;
  const wallEnd = wallX + wallWidth;
  const conductionLayers = conduction?.layers?.length ? conduction.layers : null;
  const totalLayerLength = conductionLayers?.reduce((total, layer) => total + layer.L, 0) ?? 0;

  const convectionVelocity = convection?.velocity ?? 2;
  const convectionH = convection?.h ?? 10;
  const convectionQ = Math.abs(convection?.q ?? 0);
  const convectionStroke = clamp(3 + Math.log10(convectionQ + 1), 4, 10);
  const flowOpacity = clamp(0.25 + convectionVelocity / 14, 0.3, 0.95);
  const flowCount = clamp(Math.round(3 + convectionVelocity / 4), 3, 6);

  const radiationQ = Math.abs(radiation?.q ?? 0);
  const epsilon = radiation?.epsilon ?? 0.8;
  const radiationRadius = clamp(46 + Math.log10(radiationQ + 1) * 9, 48, 82);
  const ringOpacity = clamp(0.2 + epsilon * 0.7, 0.25, 0.95);
  const ringStroke = clamp(2 + epsilon * 5, 2, 7);
  const radiationLineCount = clamp(Math.round(2 + epsilon * 5), 2, 7);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-100">{label}</p>
      </div>
      <svg viewBox="0 0 640 240" role="img" aria-label={label} className="h-56 w-full">
        <defs>
          <linearGradient id={`thermal-${type}`} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor={heatColor(conduction?.hotC ?? convection?.surfaceC ?? radiation?.surfaceC ?? 160)} />
            <stop offset="52%" stopColor="#f97316" />
            <stop offset="100%" stopColor={heatColor(conduction?.coldC ?? convection?.fluidC ?? radiation?.ambientC ?? 25)} />
          </linearGradient>
          <radialGradient id={`radial-${type}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor={heatColor(radiation?.surfaceC ?? 220)} />
          </radialGradient>
          <marker id={`arrow-${type}`} markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0,0 L8,4 L0,8 Z" fill={type === 'radiation' ? '#a78bfa' : '#f97316'} />
          </marker>
        </defs>

        {type === 'conduction' && (
          <>
            {conductionLayers ? (
              conductionLayers.reduce<JSX.Element[]>((elements, layer, index) => {
                const previousLength = conductionLayers.slice(0, index).reduce((total, item) => total + item.L, 0);
                const x = wallX + (previousLength / totalLayerLength) * wallWidth;
                const width = Math.max((layer.L / totalLayerLength) * wallWidth, 20);
                elements.push(
                  <g key={layer.name}>
                    <rect
                      x={x}
                      y="42"
                      width={width}
                      height="156"
                      fill={layerColor(layer.k)}
                      opacity={0.42 + clamp(layer.k / 50, 0, 0.34)}
                    />
                    <line x1={x} x2={x} y1="42" y2="198" stroke="#e2e8f0" strokeOpacity="0.28" />
                  </g>,
                );
                return elements;
              }, [])
            ) : (
              <rect x={wallX} y="42" width={wallWidth} height="156" rx="8" fill={`url(#thermal-${type})`} opacity="0.9" />
            )}
            <rect x={wallX} y="42" width={wallWidth} height="156" rx="8" fill="none" stroke="#e2e8f0" strokeOpacity="0.38" />
            {Array.from({ length: conductionArrowCount }).map((_, index) => (
              <line
                key={index}
                className="heat-flow"
                x1={wallEnd + 25}
                x2="565"
                y1={76 + index * (112 / Math.max(conductionArrowCount - 1, 1))}
                y2={76 + index * (112 / Math.max(conductionArrowCount - 1, 1))}
                stroke="#f97316"
                strokeWidth={conductionArrowWidth}
                markerEnd={`url(#arrow-${type})`}
                style={{ animationDelay: `${index * 0.16}s` }}
              />
            ))}
            <text x="104" y="28" fill={heatColor(conduction?.hotC ?? 80)} fontSize="18" fontWeight="700">
              {formatNumber(conduction?.hotC ?? 0, 1)} °C
            </text>
            <text x={wallEnd - 82} y="28" fill={heatColor(conduction?.coldC ?? 20)} fontSize="18" fontWeight="700">
              {formatNumber(conduction?.coldC ?? 0, 1)} °C
            </text>
            <text x="475" y="216" fill="#fed7aa" fontSize="15" fontWeight="700">
              Q {formatNumber(conduction?.q ?? 0, 1)} W
            </text>
            <text x="108" y="216" fill="#cbd5e1" fontSize="13" fontWeight="700">
              ΔT {formatNumber(conductionDeltaT, 1)} °C
            </text>
          </>
        )}

        {type === 'convection' && (
          <>
            <rect
              x="80"
              y="58"
              width="150"
              height="124"
              rx="8"
              fill={heatColor(convection?.surfaceC ?? 80)}
              opacity="0.88"
            />
            <rect x="230" y="58" width="330" height="124" rx="8" fill="#0ea5e9" opacity={flowOpacity * 0.28} />
            {Array.from({ length: flowCount }).map((_, index) => (
              <path
                key={index}
                className="heat-flow"
                d={`M260 ${72 + index * (112 / Math.max(flowCount - 1, 1))} C340 ${
                  52 + index * 22
                }, 420 ${108 + index * 12}, 545 ${72 + index * (112 / Math.max(flowCount - 1, 1))}`}
                fill="none"
                stroke={convectionVelocity > 0.5 ? '#38bdf8' : '#a78bfa'}
                strokeOpacity={flowOpacity}
                strokeWidth={convectionStroke}
                markerEnd={`url(#arrow-${type})`}
                style={{ animationDelay: `${index * 0.12}s` }}
              />
            ))}
            <text x="96" y="45" fill={heatColor(convection?.surfaceC ?? 80)} fontSize="18" fontWeight="700">
              {formatNumber(convection?.surfaceC ?? 0, 1)} °C
            </text>
            <text x="382" y="45" fill={heatColor(convection?.fluidC ?? 20)} fontSize="18" fontWeight="700">
              Fluido {formatNumber(convection?.fluidC ?? 0, 1)} °C
            </text>
            <text x="260" y="206" fill="#bae6fd" fontSize="15" fontWeight="700">
              v {formatNumber(convectionVelocity, 2)} m/s · h {formatNumber(convectionH, 2)} W/m²·K
            </text>
            <text x="88" y="206" fill="#ddd6fe" fontSize="14" fontWeight="700">
              {convection?.regime ?? 'Régimen'}
            </text>
          </>
        )}

        {type === 'radiation' && (
          <>
            <circle cx="180" cy="120" r={radiationRadius} fill={`url(#radial-${type})`} opacity="0.92" />
            {[0, 1, 2].map((index) => (
              <circle
                key={index}
                cx="180"
                cy="120"
                r={radiationRadius + 24 + index * 25}
                fill="none"
                stroke={index === 0 ? '#f97316' : index === 1 ? '#a78bfa' : '#38bdf8'}
                strokeWidth={ringStroke - index * 0.8}
                strokeOpacity={ringOpacity - index * 0.16}
              />
            ))}
            {Array.from({ length: radiationLineCount }).map((_, index) => (
              <line
                key={index}
                className="heat-flow"
                x1="285"
                x2="535"
                y1={56 + index * (128 / Math.max(radiationLineCount - 1, 1))}
                y2={56 + index * (128 / Math.max(radiationLineCount - 1, 1))}
                stroke="#a78bfa"
                strokeWidth={clamp(3 + epsilon * 5, 3, 8)}
                strokeOpacity={ringOpacity}
                markerEnd={`url(#arrow-${type})`}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
            <text x="110" y="214" fill="#fed7aa" fontSize="16" fontWeight="700">
              ε {formatNumber(epsilon, 3)}
            </text>
            <text x="350" y="42" fill="#ddd6fe" fontSize="16" fontWeight="700">
              Q {formatNumber(radiation?.q ?? 0, 1)} W
            </text>
            <text x="340" y="214" fill="#bae6fd" fontSize="14" fontWeight="700">
              {formatNumber(radiation?.surfaceC ?? 0, 1)} °C → {formatNumber(radiation?.ambientC ?? 0, 1)} °C
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
