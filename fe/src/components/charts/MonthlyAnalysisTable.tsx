import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type DataPoint = {
  date: string;
  scrap: number;
  gas: number;
  rebar: number;
  hrcc1: number;
  scrap_mxn: number;
  gas_mxn: number;
  rebar_mxn: number;
  hrcc1_mxn: number;
  tipo_de_cambio: number;
  varilla_distribuidor: number;
  varilla_credito: number;
  precio_mercado: number;
  coeficiente: number;
};

type MonthlyRow = {
  key: string;          // "2025-02"
  label: string;        // "feb-25"
  varilla_iva: number;  // avg precio_mercado
  scrap_mxn: number;    // avg scrap_mxn
  varilla_comercial2: number; // avg varilla_credito / 2
  coeficiente: number;  // varilla_comercial2 / scrap_mxn
  tipo_de_cambio: number;
  scrap_usd: number;    // avg scrap
  gap: number;          // varilla_comercial2 - scrap_mxn
  n: number;
};

const MONTH_LABELS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const mean = avg(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length);
}

function fmtMXN(v: number) {
  return '$\u00a0' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUSD(v: number) {
  return '$\u00a0' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTC(v: number) {
  return '$' + v.toFixed(2);
}
function fmtPct(v: number) {
  return (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
}

export function MonthlyAnalysisTable({ data = [] }: { data?: DataPoint[] }) {
  const rows = useMemo<MonthlyRow[]>(() => {
    console.log('data', data);
    
    // Guard clause - return empty array if no data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    const groups: Record<string, DataPoint[]> = {};
    for (const d of data) {
      const key = d.date.slice(0, 7);
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    }
    return Object.keys(groups)
      .sort()
      .map((key) => {
        const pts = groups[key];
        const [year, monthIdx] = key.split('-').map(Number);
        const varilla_iva = avg(pts.map((p) => p.precio_mercado));
        const scrap_mxn = avg(pts.map((p) => p.scrap_mxn));
        const varilla_comercial2 = avg(pts.map((p) => p.varilla_credito)) / 2;
        //const coeficiente = scrap_mxn / varilla_comercial2; // Calculado del promedio
        const coeficiente = avg(pts.map((p) => Number(p.coeficiente) || 0));
        const tipo_de_cambio = avg(pts.map((p) => p.tipo_de_cambio));
        const scrap_usd = avg(pts.map((p) => p.scrap));
        const gap = varilla_comercial2 - scrap_mxn;
        const yy = String(year).slice(2);
        return {
          key,
          label: `${MONTH_LABELS[monthIdx - 1]}-${yy}`,
          varilla_iva,
          scrap_mxn,
          varilla_comercial2,
          coeficiente,
          tipo_de_cambio,
          scrap_usd,
          gap,
          n: pts.length,
        };
      });
  }, [data]);

  const avgGAP = useMemo(() => avg(rows.map((r) => r.gap)), [rows]);
  const avgCoef = useMemo(() => avg(rows.map((r) => r.coeficiente)), [rows]);
  const sdGAP = useMemo(() => stddev(rows.map((r) => r.gap)), [rows]);
  const avgVarilla = useMemo(() => avg(rows.map((r) => r.varilla_iva)), [rows]);
  const avgScrapMXN = useMemo(() => avg(rows.map((r) => r.scrap_mxn)), [rows]);

  const variacionVsProm = (gap: number) => (gap - avgGAP) / Math.abs(avgGAP);

  // Show empty state if no rows
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Análisis Mensual</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground p-8">
          No hay datos disponibles para el análisis mensual
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight">
          Análisis Mensual — Varilla vs. Scrap
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Promedios mensuales
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-separate border-spacing-0 font-mono">
            <thead>
              <tr>
                {[
                  'Periodo (Mes/Año)',
                  'Varilla + IVA',
                  'ScrapMXN',
                  'Varilla Comercial / 2',
                  'Coeficiente',
                  'Tipo de Cambio',
                  'Scrap USD',
                  'GAP',
                  '% Variación vs Promedio',
                ].map((h, i) => (
                  <th
                    key={h}
                    className={[
                      'px-3 py-2 border-b-2 border-border font-semibold whitespace-nowrap',
                      i === 0 ? 'text-left sticky left-0 z-10 bg-card text-primary' : 'text-right',
                      // Datos principales (precios)
                      [1, 2, 3].includes(i) ? 'bg-primary/5 text-foreground' : '',
                      // Datos secundarios (coeficiente, TC, scrap USD)
                      [4, 5, 6].includes(i) ? 'bg-muted/50 text-foreground' : '',
                      // Cálculos/métricas
                      [7, 8].includes(i) ? 'text-muted-foreground' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const variacion = variacionVsProm(row.gap);
                const isLast = i === rows.length - 1;
                const isEven = i % 2 === 0;
                return (
                  <tr
                    key={row.key}
                    className={[
                      isLast ? 'bg-primary/10 font-bold' : isEven ? 'bg-background' : 'bg-muted/20',
                      'hover:bg-muted/40 transition-colors',
                    ].join(' ')}
                  >
                    {/* Periodo */}
                    <td className={`sticky left-0 z-10 px-3 py-1.5 text-left font-semibold border-r border-border whitespace-nowrap ${isLast ? 'bg-primary/10' : isEven ? 'bg-background' : 'bg-muted/20'} text-primary`}>
                      {row.label}
                    </td>
                    {/* Varilla + IVA */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${isLast ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {fmtMXN(row.varilla_iva)}
                    </td>
                    {/* ScrapMXN */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${isLast ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {fmtMXN(row.scrap_mxn)}
                    </td>
                    {/* Varilla Comercial / 2 */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${isLast ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {fmtMXN(row.varilla_comercial2)}
                    </td>
                    {/* Coeficiente */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${isLast ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {row.coeficiente.toFixed(3)}
                    </td>
                    {/* Tipo de Cambio */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${isLast ? 'text-primary font-bold' : 'text-foreground font-semibold'}`}>
                      {fmtTC(row.tipo_de_cambio)}
                    </td>
                    {/* Scrap USD */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${isLast ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {fmtUSD(row.scrap_usd)}
                    </td>
                    {/* GAP */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${row.gap >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {Math.round(row.gap)}
                    </td>
                    {/* % Variación */}
                    <td className={`px-3 py-1.5 text-right whitespace-nowrap tabular-nums ${variacion >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {fmtPct(variacion)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer stats */}
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40">
                <td className="sticky left-0 z-10 bg-muted/40 px-3 py-1.5 text-left text-foreground font-semibold">
                  Promedio
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-foreground">
                  {fmtMXN(avgVarilla)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-foreground">
                  {fmtMXN(avgScrapMXN)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground" />
                <td className="px-3 py-1.5 text-right tabular-nums font-bold text-primary">
                  {avgCoef.toFixed(3)}
                </td>
                <td colSpan={2} />
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground font-bold">
                  —
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                  {/* avg coef as % shown in source */}
                  {(avgCoef * 100 - 900).toFixed(2)}%
                </td>
              </tr>
              <tr className="bg-muted/20">
                <td className="sticky left-0 z-10 bg-muted/20 px-3 py-1.5 text-left text-foreground font-semibold">
                  Desviación Estándar
                </td>
                <td colSpan={6} />
                <td className="px-3 py-1.5 text-right tabular-nums text-foreground font-bold">
                  {Math.round(sdGAP)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}