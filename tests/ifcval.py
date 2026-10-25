import re,sys
N={'IFCWALL':8,'IFCDOOR':10,'IFCWINDOW':10,'IFCSPACE':11,'IFCSLAB':9,'IFCFURNISHINGELEMENT':8,'IFCOPENINGELEMENT':8,'IFCBUILDINGSTOREY':10,'IFCBUILDING':12,'IFCSITE':14,'IFCPROJECT':9,'IFCOWNERHISTORY':8,'IFCAPPLICATION':4,'IFCPERSON':8,'IFCORGANIZATION':5,'IFCPERSONANDORGANIZATION':3,'IFCGEOMETRICREPRESENTATIONCONTEXT':6,'IFCSIUNIT':4,'IFCUNITASSIGNMENT':1,'IFCRELAGGREGATES':6,'IFCRELCONTAINEDINSPATIALSTRUCTURE':6,'IFCRELVOIDSELEMENT':6,'IFCRELFILLSELEMENT':6,'IFCRELDEFINESBYPROPERTIES':6,'IFCPROPERTYSET':5,'IFCPROPERTYSINGLEVALUE':4,'IFCEXTRUDEDAREASOLID':4,'IFCRECTANGLEPROFILEDEF':5,'IFCARBITRARYCLOSEDPROFILEDEF':3,'IFCPOLYLINE':1,'IFCSHAPEREPRESENTATION':4,'IFCPRODUCTDEFINITIONSHAPE':3,'IFCLOCALPLACEMENT':2,'IFCAXIS2PLACEMENT3D':3,'IFCAXIS2PLACEMENT2D':2,'IFCCARTESIANPOINT':1,'IFCDIRECTION':1}
t=open(sys.argv[1]).read()
assert t.startswith('ISO-10303-21;') and t.rstrip().endswith('END-ISO-10303-21;')
data=t[t.index('DATA;')+5:t.index('ENDSEC;',t.index('DATA;'))]
lines=[l for l in data.strip().split('\n') if l]
ids=set();ents={};bad=[]
def split_top(s):
    out=[];d=0;cur='';q=False
    for ch in s:
        if ch=="'": q=not q
        if not q:
            if ch=='(':d+=1
            elif ch==')':d-=1
            elif ch==',' and d==0: out.append(cur);cur='';continue
        cur+=ch
    out.append(cur);return out
for l in lines:
    m=re.match(r"#(\d+)=([A-Z0-9]+)\((.*)\);$",l)
    if not m: bad.append(('syntax',l[:80]));continue
    i,e,args=m.groups();ids.add(int(i));ents[e]=ents.get(e,0)+1
    if e in N:
        n=len(split_top(args))
        if n!=N[e]: bad.append((e,n,N[e],l[:100]))
    else: bad.append(('unknown',e))
refs=set(int(x) for x in re.findall(r"#(\d+)",data))
missing=refs-ids
guids=re.findall(r"\('([0-9A-Za-z_$]{22})'",data)
print('entities',sum(ents.values()),'types',len(ents),'missing refs',len(missing),'bad',bad[:5],'guids',len(guids),'unique',len(set(guids)),'first chars',sorted(set(g[0] for g in guids)))
for k in ['IFCWALL','IFCDOOR','IFCWINDOW','IFCSPACE','IFCSLAB','IFCFURNISHINGELEMENT','IFCBUILDINGSTOREY','IFCOPENINGELEMENT']: print(k,ents.get(k,0))
