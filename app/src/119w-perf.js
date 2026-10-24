/* ======================= speed: cache whole-project calculations per model version ======================= */
// The model is immutable: every edit makes a new project object, so results can be cached by object identity.
{const f=runChecks;const C=new WeakMap();runChecks=function(p){let r=C.get(p);if(!r){r=f(p);C.set(p,r);}return r;};}
{const f=counterGeo;const C=new WeakMap();counterGeo=function(p,lvId){let m=C.get(p);if(!m){m=new Map();C.set(p,m);}if(!m.has(lvId))m.set(lvId,f(p,lvId));return m.get(lvId);};}
{const f=cabNumbers;const C=new WeakMap();cabNumbers=function(p){let r=C.get(p);if(!r){r=f(p);C.set(p,r);}return r;};}
{const f=analyzeStructure;const C=new WeakMap();analyzeStructure=function(p){let r=C.get(p);if(!r){r=f(p);C.set(p,r);}return r;};}
{const f=roomWalls;const C=new WeakMap();roomWalls=function(p,levelId){let m=C.get(p);if(!m){m=new Map();C.set(p,m);}const k=levelId||'';if(!m.has(k))m.set(k,f(p,levelId));return m.get(k);};}
{const f=headerMap;const C=new WeakMap();headerMap=function(p){let r=C.get(p);if(!r){r=f(p);C.set(p,r);}return r;};}
