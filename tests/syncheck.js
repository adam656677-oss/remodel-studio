const fs=require('fs');const h=fs.readFileSync(process.argv[2],'utf8');const re=/<script([^>]*)>([\s\S]*?)<\/script>/g;let m,all='';let n=0;
while(m=re.exec(h)){if(/src=/.test(m[1])||/json|importmap/.test(m[1]))continue;n++;try{new Function(m[2]);}catch(e){console.log('ERR in script',n,e.message);}all+=m[2]+'\n;\n';}
try{new Function(all);console.log('combined OK',n,'scripts');}catch(e){console.log('COMBINED ERR',e.message);}
