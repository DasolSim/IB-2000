import React, { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

// ==========================
// Data & Helpers
// ==========================

type Country = {
  code: string;
  name: string;
  region: string;
  culture_distance: number; // 0 (similar) - 100 (very different)
  political_stability: number;
  rule_of_law: number;
  corruption_control: number;
  gdp_pc_index: number; // proxy 0-100
  growth_percent: number; // 0-10%
  logistics: number; // 0-100
  labor_cost_index: number; // 0-100 higher = more expensive
  market_size: number; // 0-100
  trade_barrier: number; // 0-100 higher = more barriers
};

const ALL_COUNTRIES: Country[] = [
  { code: "CAN", name: "Canada", region: "Americas", culture_distance: 15, political_stability: 85, rule_of_law: 88, corruption_control: 87, gdp_pc_index: 85, growth_percent: 2.0, logistics: 86, labor_cost_index: 78, market_size: 65, trade_barrier: 15 },
  { code: "MEX", name: "Mexico", region: "Americas", culture_distance: 40, political_stability: 55, rule_of_law: 48, corruption_control: 45, gdp_pc_index: 45, growth_percent: 2.3, logistics: 68, labor_cost_index: 40, market_size: 72, trade_barrier: 28 },
  { code: "BRA", name: "Brazil", region: "Americas", culture_distance: 55, political_stability: 45, rule_of_law: 44, corruption_control: 42, gdp_pc_index: 42, growth_percent: 2.2, logistics: 60, labor_cost_index: 50, market_size: 82, trade_barrier: 45 },
  { code: "DEU", name: "Germany", region: "Europe", culture_distance: 25, political_stability: 88, rule_of_law: 90, corruption_control: 92, gdp_pc_index: 88, growth_percent: 1.4, logistics: 92, labor_cost_index: 82, market_size: 78, trade_barrier: 10 },
  { code: "GBR", name: "United Kingdom", region: "Europe", culture_distance: 20, political_stability: 75, rule_of_law: 86, corruption_control: 85, gdp_pc_index: 82, growth_percent: 1.6, logistics: 90, labor_cost_index: 80, market_size: 75, trade_barrier: 18 },
  { code: "POL", name: "Poland", region: "Europe", culture_distance: 35, political_stability: 70, rule_of_law: 68, corruption_control: 66, gdp_pc_index: 65, growth_percent: 3.1, logistics: 76, labor_cost_index: 55, market_size: 60, trade_barrier: 18 },
  { code: "TUR", name: "Türkiye", region: "Europe/Asia", culture_distance: 50, political_stability: 40, rule_of_law: 40, corruption_control: 42, gdp_pc_index: 48, growth_percent: 3.8, logistics: 62, labor_cost_index: 45, market_size: 70, trade_barrier: 32 },
  { code: "IND", name: "India", region: "Asia", culture_distance: 60, political_stability: 58, rule_of_law: 55, corruption_control: 52, gdp_pc_index: 35, growth_percent: 6.2, logistics: 64, labor_cost_index: 30, market_size: 90, trade_barrier: 35 },
  { code: "VNM", name: "Vietnam", region: "Asia", culture_distance: 65, political_stability: 62, rule_of_law: 52, corruption_control: 50, gdp_pc_index: 32, growth_percent: 5.8, logistics: 67, labor_cost_index: 28, market_size: 58, trade_barrier: 30 },
  { code: "CHN", name: "China", region: "Asia", culture_distance: 70, political_stability: 60, rule_of_law: 50, corruption_control: 48, gdp_pc_index: 60, growth_percent: 4.9, logistics: 80, labor_cost_index: 60, market_size: 100, trade_barrier: 40 },
  { code: "JPN", name: "Japan", region: "Asia", culture_distance: 35, political_stability: 90, rule_of_law: 92, corruption_control: 94, gdp_pc_index: 90, growth_percent: 1.0, logistics: 94, labor_cost_index: 85, market_size: 74, trade_barrier: 12 },
  { code: "KOR", name: "South Korea", region: "Asia", culture_distance: 40, political_stability: 80, rule_of_law: 84, corruption_control: 80, gdp_pc_index: 78, growth_percent: 1.9, logistics: 90, labor_cost_index: 75, market_size: 70, trade_barrier: 16 },
  { code: "IDN", name: "Indonesia", region: "Asia", culture_distance: 65, political_stability: 55, rule_of_law: 52, corruption_control: 50, gdp_pc_index: 30, growth_percent: 5.1, logistics: 60, labor_cost_index: 32, market_size: 76, trade_barrier: 38 },
  { code: "ZAF", name: "South Africa", region: "Africa", culture_distance: 55, political_stability: 40, rule_of_law: 50, corruption_control: 45, gdp_pc_index: 40, growth_percent: 1.7, logistics: 58, labor_cost_index: 45, market_size: 62, trade_barrier: 28 },
  { code: "NGA", name: "Nigeria", region: "Africa", culture_distance: 70, political_stability: 30, rule_of_law: 32, corruption_control: 28, gdp_pc_index: 20, growth_percent: 2.8, logistics: 40, labor_cost_index: 25, market_size: 80, trade_barrier: 45 },
  { code: "ARE", name: "UAE", region: "Middle East", culture_distance: 55, political_stability: 75, rule_of_law: 76, corruption_control: 78, gdp_pc_index: 88, growth_percent: 3.2, logistics: 88, labor_cost_index: 70, market_size: 66, trade_barrier: 20 },
];

const PRESETS = {
  Balanced: { culture: 15, system: 20, market: 25, cost: 15, logistics: 15, trade: 10 },
  "Cost-driven": { culture: 10, system: 15, market: 20, cost: 30, logistics: 15, trade: 10 },
  "Risk-averse": { culture: 20, system: 30, market: 15, cost: 10, logistics: 15, trade: 10 },
  "Growth-seeker": { culture: 10, system: 15, market: 40, cost: 10, logistics: 15, trade: 10 },
} as const;

type Weights = { culture: number; system: number; market: number; cost: number; logistics: number; trade: number };

const norm = (w: Weights): Weights => {
  const s = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const f = 100 / s;
  return {
    culture: Math.round(w.culture * f),
    system: Math.round(w.system * f),
    market: Math.round(w.market * f),
    cost: Math.round(w.cost * f),
    logistics: Math.round(w.logistics * f),
    trade: Math.round(w.trade * f),
  };
};

function components(c: Country) {
  const culture_fit = 100 - c.culture_distance;
  const institutions = (c.political_stability + c.rule_of_law + c.corruption_control) / 3;
  const market_potential = (c.market_size + c.growth_percent * 10) / 2; // growth scaled to 0-100
  const cost_advantage = 100 - c.labor_cost_index;
  const trade_openness = 100 - c.trade_barrier;
  return { culture_fit, institutions, market_potential, cost_advantage, logistics: c.logistics, trade_openness };
}

function score(comp: ReturnType<typeof components>, w: Weights) {
  const W = norm(w);
  return (
    comp.culture_fit * (W.culture / 100) +
    comp.institutions * (W.system / 100) +
    comp.market_potential * (W.market / 100) +
    comp.cost_advantage * (W.cost / 100) +
    comp.logistics * (W.logistics / 100) +
    comp.trade_openness * (W.trade / 100)
  );
}

// Risk events that perturb components for the selected set
const RISK_EVENTS = [
  {
    key: "tariff",
    label: "Tariff shock (+barriers)",
    apply: (comp: any) => ({ ...comp, trade_openness: Math.max(0, comp.trade_openness - 12) }),
  },
  {
    key: "corruption",
    label: "Corruption probe in sector",
    apply: (comp: any) => ({ ...comp, institutions: Math.max(0, comp.institutions - 10) }),
  },
  {
    key: "port",
    label: "Port congestion / customs delay",
    apply: (comp: any) => ({ ...comp, logistics: Math.max(0, comp.logistics - 12) }),
  },
  {
    key: "wage",
    label: "Sudden wage surge",
    apply: (comp: any) => ({ ...comp, cost_advantage: Math.max(0, comp.cost_advantage - 10) }),
  },
  {
    key: "backlash",
    label: "Consumer nationalist backlash",
    apply: (comp: any) => ({ ...comp, culture_fit: Math.max(0, comp.culture_fit - 10) }),
  },
  {
    key: "ip",
    label: "IP dispute / weak enforcement",
    apply: (comp: any) => ({ ...comp, institutions: Math.max(0, comp.institutions - 8), trade_openness: Math.max(0, comp.trade_openness - 6) }),
  },
] as const;

// ==========================
// UI
// ==========================

export default function App() {
  // Step state
  const [step, setStep] = useState<number>(1);
  const [company, setCompany] = useState<string>("");
  const [product, setProduct] = useState<string>("");

  const [preset, setPreset] = useState<keyof typeof PRESETS>("Balanced");
  const [weights, setWeights] = useState<Weights>({ ...PRESETS.Balanced });

  const [pool, setPool] = useState<string[]>(["MEX", "POL", "IND", "VNM", "DEU"]); // 3–5 selected country codes

  const [riskApplied, setRiskApplied] = useState<boolean>(false);
  const [risk, setRisk] = useState<(typeof RISK_EVENTS)[number] | null>(null);
  const [riskTarget, setRiskTarget] = useState<string | "ALL">("ALL");

  // NEW: Which country to show in the radar profile (user-selectable)
  const [profileCode, setProfileCode] = useState<string | null>(null);

  useEffect(() => {
    setWeights({ ...PRESETS[preset] });
  }, [preset]);

  const selectedCountries = useMemo(() => ALL_COUNTRIES.filter((c) => pool.includes(c.code)), [pool]);

  const computed = useMemo(() => {
    const W = norm(weights);
    return selectedCountries
      .map((c) => {
        let comp = components(c);
        if (riskApplied && risk) {
          // Apply risk to all or one target
          if (riskTarget === "ALL" || riskTarget === c.code) {
            comp = risk.apply(comp);
          }
        }
        const s = score(comp, W);
        return { ...c, components: comp, score: s } as Country & { components: ReturnType<typeof components>; score: number };
      })
      .sort((a, b) => b.score - a.score);
  }, [selectedCountries, weights, riskApplied, risk, riskTarget]);

  const W = norm(weights);
  const top = computed[0];

  // Derive current profile country (defaults to #1)
  const profile = useMemo(() => {
    if (!computed.length) return undefined;
    const code = profileCode ?? computed[0].code;
    return computed.find((c) => c.code === code) ?? computed[0];
  }, [computed, profileCode]);

  // Helpers
  function toggleCountry(code: string) {
    setPool((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : prev.length < 5 ? [...prev, code] : prev));
  }

  function applyRandomRisk() {
    const evt = RISK_EVENTS[Math.floor(Math.random() * RISK_EVENTS.length)];
    const tgt = Math.random() < 0.5 ? "ALL" : (pool[Math.floor(Math.random() * pool.length)] || "ALL");
    setRisk(evt);
    setRiskTarget(tgt as any);
    setRiskApplied(true);
  }

  function resetRisk() {
    setRisk(null);
    setRiskApplied(false);
  }

  const regions = useMemo(() => ["All", ...Array.from(new Set(ALL_COUNTRIES.map((c) => c.region)))], []);
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const listFiltered = useMemo(() => ALL_COUNTRIES.filter((c) => regionFilter === "All" || c.region === regionFilter), [regionFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Country Desk RPG — Visual</h1>
            <p className="text-sm text-slate-600">Guided location-choice game linking culture, institutions, and development to strategy.</p>
          </div>
          <div className="text-xs text-slate-500">
            Steps: <span className="font-semibold">{step}</span>/4
          </div>
        </div>

        {/* Step 1: Company & Product */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">1) Set the Scenario</h2>
              <div>
                <label className="text-sm font-medium">Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., SwiftSneaks USA" className="w-full mt-1 border rounded-xl p-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Product line</label>
                <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g., Mid-tier running shoes" className="w-full mt-1 border rounded-xl p-2" />
              </div>
              <p className="text-xs text-slate-600">Tip: Be specific about segment & price point — it affects your weight logic later.</p>
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
                Next: Strategy
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm">
              <div className="font-semibold mb-1">What to submit later</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Strategy weights & rationale</li>
                <li>Ranking screenshot</li>
                <li>Top-country radar</li>
                <li>Entry mode + city + risk mitigation</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Strategy Weights */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3">
              <h2 className="text-xl font-semibold">2) Choose Strategy Weights</h2>
              <div>
                <label className="text-sm font-semibold">Preset</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => (
                    <button key={k} onClick={() => setPreset(k)} className={`px-3 py-1 rounded-full border ${preset === k ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100"}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-xs text-slate-600">Weights auto-normalize to 100.</div>
              <div className="space-y-3 pt-2">
                {([
                  ["culture", "Culture Fit"],
                  ["system", "Institutions"],
                  ["market", "Market Potential"],
                  ["cost", "Cost Advantage"],
                  ["logistics", "Logistics"],
                  ["trade", "Trade Openness"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-700">
                      {label} {(norm(weights) as any)[key]}%
                    </label>
                    <input type="range" min={0} max={40} value={(weights as any)[key]} onChange={(e) => setWeights((prev) => ({ ...prev, [key]: Number(e.target.value) } as any))} className="w-full" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="px-3 py-2 rounded-xl border">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="px-3 py-2 rounded-xl bg-slate-900 text-white">
                  Next: Countries
                </button>
              </div>
            </div>
            <div className="md:col-span-2 bg-slate-50 rounded-xl p-4">
              <div className="font-semibold mb-2">Strategy–Weight Hints</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>
                  <span className="font-medium">Risk-averse:</span> Heavier on <em>Institutions</em> and <em>Culture Fit</em>.
                </li>
                <li>
                  <span className="font-medium">Cost-driven:</span> Heavier on <em>Cost Advantage</em>; watch for low <em>Institutions</em>.
                </li>
                <li>
                  <span className="font-medium">Growth-seeker:</span> Heavier on <em>Market Potential</em> even if costs/risks rise.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Select Countries */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">3) Pick 3–5 Countries</h2>
              <div className="flex items-center gap-2 text-sm">
                <span>Region</span>
                <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="border rounded-xl p-1">
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {listFiltered.map((c) => {
                const active = pool.includes(c.code);
                return (
                  <button key={c.code} onClick={() => toggleCountry(c.code)} className={`text-left p-3 rounded-xl border hover:shadow ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs opacity-70">{c.region}</div>
                    <div className="mt-2 text-xs opacity-70">Market size: {c.market_size} • Logistics: {c.logistics}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-slate-600">Selected: {pool.join(", ") || "none"} (choose 3–5)</div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="px-3 py-2 rounded-xl border">
                Back
              </button>
              <button disabled={pool.length < 3} onClick={() => setStep(4)} className={`px-3 py-2 rounded-xl ${pool.length < 3 ? "bg-slate-300 text-white" : "bg-slate-900 text-white"}`}>
                Next: Compare
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Compare & Risk Event */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">4) Ranking under Your Weights</h2>
                <div className="text-xs text-slate-600">
                  Preset: <span className="font-semibold">{preset}</span> • Weights: {W.culture}/{W.system}/{W.market}/{W.cost}/{W.logistics}/{W.trade}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm mt-3">
                <div className="font-medium">Key Trade-offs</div>
                <ul className="list-disc pl-5 text-slate-700">
                  {computed.slice(0, 3).map((c, i) => {
                    const comp = c.components as any;
                    const drivers = [
                      { k: "Market", v: comp.market_potential, w: W.market },
                      { k: "Institutions", v: comp.institutions, w: W.system },
                      { k: "Cost", v: comp.cost_advantage, w: W.cost },
                      { k: "Culture", v: comp.culture_fit, w: W.culture },
                      { k: "Logistics", v: comp.logistics, w: W.logistics },
                      { k: "Trade", v: comp.trade_openness, w: W.trade },
                    ]
                      .sort((a, b) => b.v * b.w - a.v * a.w)
                      .slice(0, 2);
                    return (
                      <li key={c.code}>
                        <span className="font-semibold">#{i + 1} {c.name}:</span> strongest on {drivers[0].k} and {drivers[1].k}; weak spots depend on your weights.
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Profile + Risk */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Country Profile</h3>
                  <select className="border rounded-xl p-1 text-sm" value={profile?.code} onChange={(e) => setProfileCode(e.target.value)}>
                    {computed.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={
                        profile
                          ? [
                              { k: "Culture", v: profile.components.culture_fit },
                              { k: "Institutions", v: profile.components.institutions },
                              { k: "Market", v: profile.components.market_potential },
                              { k: "Cost", v: profile.components.cost_advantage },
                              { k: "Logistics", v: profile.components.logistics },
                              { k: "Trade", v: profile.components.trade_openness },
                            ]
                          : []
                      }
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="k" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name={profile?.name} dataKey="v" stroke="#111827" fill="#111827" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {profile && <div className="text-xs text-slate-600 mt-2">Use the selector to compare profiles across your shortlist.</div>}
              </div>

              <div className="bg-white rounded-2xl shadow p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Risk Event</h3>
                  <div className="text-xs text-slate-600">Apply once, then compare.</div>
                </div>
                {!riskApplied ? (
                  <div className="space-y-2">
                    <button onClick={applyRandomRisk} className="px-3 py-2 rounded-xl bg-slate-900 text-white">
                      Roll Random Event
                    </button>
                    <div className="text-xs text-slate-600">Events alter one or more components (e.g., tariffs ↓ trade openness). They may hit one country or all.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm">
                      Applied: <span className="font-semibold">{risk?.label}</span> on <span className="font-semibold">{riskTarget === "ALL" ? "All selected countries" : ALL_COUNTRIES.find((c) => c.code === riskTarget)?.name}</span>
                    </div>
                    <div className="text-xs text-slate-600">Notice how rankings shift. Discuss mitigation in your write-up.</div>
                    <button onClick={resetRisk} className="px-3 py-2 rounded-xl border">
                      Reset Event
                    </button>
                  </div>
                )}

                {/* Simple report block */}
                <div className="pt-2">
                  <div className="font-semibold mb-1">Report Outline (copy into your paper)</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>
                      <span className="font-medium">Strategy weights:</span> {W.culture}% Culture, {W.system}% Institutions, {W.market}% Market, {W.cost}% Cost, {W.logistics}% Logistics, {W.trade}% Trade
                    </li>
                    <li>
                      <span className="font-medium">Top-3:</span> {computed
                        .slice(0, 3)
                        .map((c, i) => `#${i + 1} ${c.name} (${c.score.toFixed(1)})`)
                        .join(", ")}
                    </li>
                    <li>
                      <span className="font-medium">Profiled country strengths:</span>{" "}
                      {profile
                        ? (() => {
                            const comp = profile.components as any;
                            const arr = [
                              { k: "Market", v: comp.market_potential, w: W.market },
                              { k: "Institutions", v: comp.institutions, w: W.system },
                              { k: "Cost", v: comp.cost_advantage, w: W.cost },
                              { k: "Culture", v: comp.culture_fit, w: W.culture },
                              { k: "Logistics", v: comp.logistics, w: W.logistics },
                              { k: "Trade", v: comp.trade_openness, w: W.trade },
                            ]
                              .sort((a, b) => b.v * b.w - a.v * a.w)
                              .slice(0, 2);
                            return ` ${arr[0].k}, ${arr[1].k}`;
                          })()
                        : " —"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="px-3 py-2 rounded-xl border">
                Back
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-3 py-2 rounded-xl bg-slate-900 text-white">
                Back to Top
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Note: Numbers are a learning scaffold derived from a simple model. They are not real-time data; students should focus on reasoning about how national differences change costs, risks, and demand.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
