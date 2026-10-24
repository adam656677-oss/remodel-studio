/* ======================= icons ======================= */
const I={
  elec:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M13 2L5 13h6l-1 9 8-12h-6z"/></svg>`,
  ramp:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 19h18L3 9z"/><path d="M3 6h5" /></svg>`,
  dim:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12h18M3 8v8M21 8v8"/><path d="M6 10l-3 2 3 2M18 10l3 2-3 2"/></svg>`,
  note:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 5h14M12 5v14"/></svg>`,
  shape:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>`,
  select:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3l14 8-6 1.6L10 19z"/></svg>`,
  wall:html`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h4v13h14v4H3z"/></svg>`,
  door:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 20h18"/><path d="M6 20V6"/><path d="M6 6a14 14 0 0 1 14 14" stroke-dasharray="2 2"/></svg>`,
  window:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 9h5M17 9h5M2 15h5M17 15h5"/><rect x="7" y="9" width="10" height="6"/><path d="M7 12h10"/></svg>`,
  room:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 4h10v6h6v10H4z" fill="currentColor" fill-opacity=".15"/></svg>`,
  stair:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 20h4v-4h4v-4h4V8h4V4h2"/></svg>`,
  roof:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2 13L12 4l10 9"/><path d="M5 11v9h14v-9"/></svg>`,
  measure:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>`,
  undo:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/></svg>`,
  redo:html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 7l5 5-5 5"/><path d="M20 12H9a5 5 0 0 0 0 10h2"/></svg>`,
};
I.fixture=html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="6" rx="1"/><ellipse cx="12" cy="16" rx="5" ry="4"/></svg>`;
const TOOLS=[['select','Select','V'],['wall','Wall','W'],['door','Door','D'],['window','Window','N'],['room','Room','R'],['fixture','Fixture','X'],['stair','Stair','S'],['roof','Roof','O'],['elec','Electric','Y'],['ramp','Ramp','G'],['shape','Shape','U'],['dim','Dimension','L'],['note','Note','T'],['measure','Measure','M']];

