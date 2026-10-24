// Put the Remodel Studio icon and version details into the Windows .exe (no Wine needed).
import * as ResEdit from 'resedit';
import * as PELibrary from 'pe-library';
import fs from 'fs';
const exePath=process.argv[2], icoPath=process.argv[3], ver=process.argv[4]||'1.0.0';
const exe=PELibrary.NtExecutable.from(fs.readFileSync(exePath),{ignoreCert:true});
const res=PELibrary.NtExecutableResource.from(exe);
const ico=ResEdit.Data.IconFile.from(fs.readFileSync(icoPath));
const groups=ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
const gid=groups.length?groups[0].id:1, lang=groups.length?groups[0].lang:1033;
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries,gid,lang,ico.icons.map(i=>i.data));
const vi=ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
const [a,b,c]=ver.split('.').map(Number);
vi.setFileVersion(a,b,c,0,1033);vi.setProductVersion(a,b,c,0,1033);
vi.setStringValues({lang:1033,codepage:1200},{FileDescription:'Remodel Studio',ProductName:'Remodel Studio',CompanyName:'Adam',LegalCopyright:'Personal use',OriginalFilename:'Remodel Studio.exe',InternalName:'Remodel Studio'});
vi.outputToResourceEntries(res.entries);
res.outputResource(exe);
fs.writeFileSync(exePath,Buffer.from(exe.generate()));
console.log('patched',exePath);
