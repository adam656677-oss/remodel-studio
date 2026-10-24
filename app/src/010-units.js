/* ======================= units ======================= */
// All model lengths are stored in inches.
function fmtLen(inches){
  if(inches==null||!isFinite(inches)) return '';
  const neg=inches<0; const sx=Math.round(Math.abs(inches)*16);
  const ft=Math.floor(sx/192), rem=sx-ft*192, inch=Math.floor(rem/16); let frac=rem%16, d=16;
  let fs=''; if(frac){ while(frac%2===0){frac/=2;d/=2;} fs=` ${frac}/${d}`; }
  return (neg?'-':'')+(ft?`${ft}'-${inch}${fs}"`:inch||!fs?`${inch}${fs}"`:`${fs.trim()}"`);
}
function fmtFt(inches){ return (inches/12).toFixed(1)+' ft'; }
// Accepts 12'6", 12' 6 1/2", 12-6, 150", 6 ft 3 in, 6′ 3″ (Apple Measure), 1.9 m, 45 cm, 120 mm.
// A bare number uses `bare` units ('in' or 'ft').
function parseLen(str,bare='in'){
  if(str==null) return null;
  let s=String(str).trim().toLowerCase()
    .replace(/[′’‘`]/g,"'").replace(/[″“”]/g,'"').replace(/''/g,'"')
    .replace(/\b(feet|foot|ft)\b\.?/g,"'").replace(/\b(inches|inch|in)\b\.?/g,'"')
    .replace(/,/g,'.').replace(/\s+/g,' ').trim();
  if(!s) return null;
  let m=s.match(/^(\d+(?:\.\d+)?) ?(mm|cm|m)$/);
  if(m){ const v=+m[1]; return m[2]==='mm'? v/25.4 : m[2]==='cm'? v/2.54 : v/0.0254; }
  const parseIn=t=>{ t=t.replace(/"/g,'').trim(); if(!t) return 0; let tot=0;
    for(const part of t.split(/[ -]+/)){ if(!part) continue; const f=part.match(/^(\d+)\/(\d+)$/);
      if(f){ if(+f[2]===0) return NaN; tot+= +f[1]/+f[2]; } else if(/^\d+(\.\d+)?$/.test(part)) tot+= +part; else return NaN; }
    return tot; };
  if(s.includes("'")){ const i=s.indexOf("'"); const ft=parseFloat(s.slice(0,i)); if(isNaN(ft)) return null;
    const inch=parseIn(s.slice(i+1).replace(/^[ -]+/,'')); return isNaN(inch)?null:ft*12+inch; }
  if(s.includes('"')){ const v=parseIn(s); return isNaN(v)?null:v; }
  if(/^\d+-\d/.test(s)){ const i=s.indexOf('-'); const v=parseIn(s.slice(i+1)); return isNaN(v)?null:+s.slice(0,i)*12+v; }
  const v=parseIn(s); if(isNaN(v)) return null; return bare==='ft'? v*12 : v;
}

