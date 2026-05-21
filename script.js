/* ===================== CONSTANTS ===================== */
const SL={experience:'💼 Pengalaman',education:'🎓 Pendidikan',skills:'⚡ Keahlian',projects:'🚀 Proyek',certificates:'🏆 Sertifikat',languages:'🌐 Bahasa',achievements:'🥇 Prestasi',organizations:'🏛️ Organisasi',hobbies:'🎯 Hobi'};
const SKLVL={Pemula:20,Menengah:45,Mahir:70,Expert:95};
const LNGLVL=['Dasar','Menengah','Conversational','Fasih','Native','Profesional'];
const ITPLS={
  experience:{label:'Pengalaman',fields:[{id:'position',label:'Jabatan',ph:'Software Engineer'},{id:'company',label:'Perusahaan',ph:'PT. Teknologi Maju'},{id:'startDate',label:'Mulai',ph:'Jan 2022'},{id:'endDate',label:'Selesai',ph:'Sekarang'},{id:'location',label:'Lokasi',ph:'Jakarta'},{id:'type',label:'Tipe',ph:'Full-time'},{id:'desc',label:'Deskripsi & Pencapaian',ph:'• Memimpin tim 5 developer...\n• Meningkatkan performa 40%...',ta:true,full:true}]},
  education:{label:'Pendidikan',fields:[{id:'institution',label:'Institusi',ph:'Universitas Indonesia'},{id:'degree',label:'Gelar / Jurusan',ph:'S1 Teknik Informatika'},{id:'startDate',label:'Mulai',ph:'2018'},{id:'endDate',label:'Selesai',ph:'2022'},{id:'gpa',label:'IPK',ph:'3.72'},{id:'desc',label:'Keterangan',ph:'Ketua UKM, Beasiswa...',ta:true,full:true}]},
  projects:{label:'Proyek',fields:[{id:'name',label:'Nama Proyek',ph:'E-Commerce Platform'},{id:'url',label:'URL',ph:'github.com/user/project'},{id:'tech',label:'Teknologi',ph:'React, Node.js'},{id:'year',label:'Tahun',ph:'2023'},{id:'role',label:'Peranmu',ph:'Lead Developer'},{id:'desc',label:'Deskripsi',ph:'Platform dengan fitur...',ta:true,full:true}]},
  certificates:{label:'Sertifikat',fields:[{id:'name',label:'Nama Sertifikat',ph:'AWS Certified Developer'},{id:'issuer',label:'Penerbit',ph:'Amazon Web Services'},{id:'date',label:'Tanggal',ph:'Jun 2023'},{id:'expiry',label:'Berlaku Hingga',ph:'Jun 2026'},{id:'url',label:'Credential URL',ph:'https://...',full:true}]},
  achievements:{label:'Prestasi',fields:[{id:'title',label:'Judul',ph:'Juara 1 Hackathon'},{id:'org',label:'Penyelenggara',ph:'Kominfo'},{id:'year',label:'Tahun',ph:'2023'},{id:'desc',label:'Keterangan',ph:'500+ peserta...',ta:true,full:true}]},
  organizations:{label:'Organisasi',fields:[{id:'name',label:'Nama Organisasi',ph:'Himpunan Mahasiswa'},{id:'role',label:'Jabatan',ph:'Ketua Divisi IT'},{id:'startDate',label:'Mulai',ph:'2021'},{id:'endDate',label:'Selesai',ph:'2022'},{id:'desc',label:'Deskripsi',ph:'Mengelola 20 anggota...',ta:true,full:true}]}
};

/* ===================== STATE ===================== */
function mkS(){return{theme:'modern',accent:'#1B4F8A',font:'Arial',margin:14,spacing:1.55,fontSize:9,secs:{experience:true,education:true,skills:true,projects:false,certificates:false,languages:false,achievements:false,organizations:false,hobbies:false},cv:{name:'',title:'',email:'',phone:'',location:'',linkedin:'',website:'',summary:'',hobbies:'',photo:'',experience:[],education:[],skills:[],projects:[],certificates:[],languages:[],achievements:[],organizations:[]},hist:[],hIdx:-1,saveTimer:null};}
let S=mkS(),_cImg=null,_cOX=0,_cOY=0,_cDrag=false,_cDX=0,_cDY=0,_cZoom=null;

/* ===================== UTILS ===================== */
const esc=s=>s==null?'':String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const unesc=s=>s==null?'':String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'");
const gi=id=>{const e=document.getElementById(id);return e?e.value:''};
const si=(id,v)=>{const e=document.getElementById(id);if(e)e.value=unesc(v||'')};
function dbn(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
const debouncedUpdate=dbn(updateCV,280);
function closeModal(id){document.getElementById(id)?.classList.remove('open')}

/* ===================== PANEL OPEN/CLOSE ===================== */
let _activePanel=null;
function openPanel(key){
  if(_activePanel)document.getElementById('panel-'+_activePanel)?.classList.remove('open');
  _activePanel=key;
  const p=document.getElementById('panel-'+key);
  if(p){p.classList.add('open');p.querySelector('.panel-body')?.scrollTo(0,0)}
  // focus first input in panel
  setTimeout(()=>{const f=p?.querySelector('input,textarea,select');if(f)f.focus()},350);
  // mobile nav: mark editor tab active (panel is "in" the editor)
  if(window.innerWidth<=768){
    document.querySelectorAll('.mnav-btn[id^="mnav"]').forEach(b=>b.classList.remove('active'));
    document.getElementById('mnavEdit')?.classList.add('active');
    _mnavActive='edit';
  }
}
function closePanel(key){
  document.getElementById('panel-'+key)?.classList.remove('open');
  if(_activePanel===key)_activePanel=null;
  updateSnippets();
  // mobile nav: back to editor tab
  if(window.innerWidth<=768){
    document.querySelectorAll('.mnav-btn[id^="mnav"]').forEach(b=>b.classList.remove('active'));
    document.getElementById('mnavEdit')?.classList.add('active');
    _mnavActive='edit';
  }
}

/* ===================== SNIPPETS (cards summary) ===================== */
function updateSnippets(){
  const cv=S.cv;
  // Basic
  const bParts=[cv.name,cv.title,cv.email].filter(Boolean).map(v=>`<span class="snippet-tag">${esc(unesc(v).substring(0,24))}</span>`);
  document.getElementById('snipBasic').innerHTML=bParts.length?bParts.join(''):'<span class="snippet-tag" style="color:var(--tx-3)">Klik untuk mengisi…</span>';
  // Experience
  const expTags=cv.experience.map(e=>`<span class="snippet-tag">${esc(unesc(e.position||'').substring(0,20))}</span>`);
  document.getElementById('snipExperience').innerHTML=expTags.length?expTags.join(''):'<span style="color:var(--tx-3);font-size:11px">Belum ada · Klik untuk tambah</span>';
  document.getElementById('cntExperience').textContent=cv.experience.length+' item';
  // Education
  const eduTags=cv.education.map(e=>`<span class="snippet-tag">${esc(unesc(e.institution||'').substring(0,22))}</span>`);
  document.getElementById('snipEducation').innerHTML=eduTags.length?eduTags.join(''):'<span style="color:var(--tx-3);font-size:11px">Belum ada pendidikan</span>';
  document.getElementById('cntEducation').textContent=cv.education.length+' item';
  // Skills
  const skTags=cv.skills.slice(0,6).map(s=>`<span class="snippet-tag">${esc(unesc(s.name||'').substring(0,16))}</span>`);
  const skMore=cv.skills.length>6?`<span class="snippet-tag" style="color:var(--accent)">+${cv.skills.length-6}</span>`:'';
  document.getElementById('snipSkills').innerHTML=skTags.length?skTags.join('')+skMore:'<span style="color:var(--tx-3);font-size:11px">Tambahkan skill…</span>';
  document.getElementById('cntSkills').textContent=cv.skills.length+' skill';
  // Projects
  const prTags=cv.projects.map(p=>`<span class="snippet-tag">${esc(unesc(p.name||'').substring(0,20))}</span>`);
  document.getElementById('snipProjects').innerHTML=prTags.length?prTags.join(''):'<span style="color:var(--tx-3);font-size:11px">Tampilkan proyek terbaik</span>';
  document.getElementById('cntProjects').textContent=cv.projects.length+' item';
  // Certificates
  const ceTags=cv.certificates.map(c=>`<span class="snippet-tag">${esc(unesc(c.name||'').substring(0,22))}</span>`);
  document.getElementById('snipCertificates').innerHTML=ceTags.length?ceTags.join(''):'<span style="color:var(--tx-3);font-size:11px">AWS, Google, Meta, dll.</span>';
  document.getElementById('cntCertificates').textContent=cv.certificates.length+' item';
  // Languages
  const lgTags=cv.languages.map(l=>`<span class="snippet-tag">${esc(unesc(l.name||''))} <span style="opacity:.55">${l.level}</span></span>`);
  document.getElementById('snipLanguages').innerHTML=lgTags.length?lgTags.join(''):'<span style="color:var(--tx-3);font-size:11px">Indonesia, Inggris…</span>';
  document.getElementById('cntLanguages').textContent=cv.languages.length+' bahasa';
  // Achievements
  const acTags=cv.achievements.map(a=>`<span class="snippet-tag">${esc(unesc(a.title||'').substring(0,22))}</span>`);
  document.getElementById('snipAchievements').innerHTML=acTags.length?acTags.join(''):'<span style="color:var(--tx-3);font-size:11px">Hackathon, beasiswa…</span>';
  document.getElementById('cntAchievements').textContent=cv.achievements.length+' item';
  // Organizations
  const ogTags=cv.organizations.map(o=>`<span class="snippet-tag">${esc(unesc(o.name||'').substring(0,22))}</span>`);
  document.getElementById('snipOrganizations').innerHTML=ogTags.length?ogTags.join(''):'<span style="color:var(--tx-3);font-size:11px">UKM, komunitas…</span>';
  document.getElementById('cntOrganizations').textContent=cv.organizations.length+' item';
  // Hobbies
  const hb=unesc(cv.hobbies||'');
  document.getElementById('snipHobbies').innerHTML=hb?`<span class="snippet-tag">${esc(hb.substring(0,50))}</span>`:'<span style="color:var(--tx-3);font-size:11px">Membaca, fotografi…</span>';
  document.getElementById('cntHobbies').textContent=hb?'Ada':'–';
}

/* ===================== THEME / ACCENT ===================== */
function setTheme(th){
  if(!['modern','minimal'].includes(th))th='modern';
  S.theme=th;document.querySelectorAll('[data-th]').forEach(c=>{c.classList.toggle('active',c.dataset.th===th);c.setAttribute('aria-checked',c.dataset.th===th?'true':'false')});renderPreview();schedSave()
}
function setAccent(c){
  S.accent=c;
  document.querySelectorAll('[data-c]').forEach(s=>{s.classList.toggle('active',s.dataset.c===c);s.setAttribute('aria-checked',s.dataset.c===c?'true':'false')});
  const hr=(h,a)=>{let hex=(h||'').replace('#','');if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);if(isNaN(r)||isNaN(g)||isNaN(b))return`rgba(99,102,241,${a})`;return`rgba(${r},${g},${b},${a})`};
  document.documentElement.style.setProperty('--accent',c);
  document.documentElement.style.setProperty('--accent-l',hr(c,.12));
  document.documentElement.style.setProperty('--accent-b',hr(c,.28));
  renderPreview();schedSave();
}
function setFont(f){S.font=f;renderPreview();schedSave()}
function setMargin(v){S.margin=+v;document.getElementById('marginVal').textContent=v+'mm';renderPreview()}
function setSpacing(v){S.spacing=+v;document.getElementById('spacingVal').textContent=(+v).toFixed(2);renderPreview()}
function setFontSize(v){S.fontSize=+v;document.getElementById('fontSizeVal').textContent=v+'pt';renderPreview()}

/* ===================== SECTION TOGGLES ===================== */
function renderSectionToggles(){
  const c=document.getElementById('sectionToggles');
  c.innerHTML=Object.entries(SL).map(([k,lb])=>`<div class="toggle-row" role="switch" aria-checked="${S.secs[k]}" tabindex="0" onclick="toggleSecV('${k}')" onkeydown="if(event.key==='Enter'||event.key===' ')toggleSecV('${k}')"><span>${lb}</span><div class="switch ${S.secs[k]?'on':''}" id="sw_${k}"></div></div>`).join('');
}
function toggleSecV(k){
  S.secs[k]=!S.secs[k];
  document.getElementById('sw_'+k)?.classList.toggle('on',S.secs[k]);
  renderPreview();schedSave();
}

/* ===================== CV UPDATE ===================== */
function updateCV(){
  const cv=S.cv;
  cv.name=esc(gi('fName'));cv.title=esc(gi('fTitle'));cv.email=esc(gi('fEmail'));
  cv.phone=esc(gi('fPhone'));cv.location=esc(gi('fLocation'));cv.linkedin=esc(gi('fLinkedin'));
  cv.website=esc(gi('fWebsite'));cv.summary=esc(gi('fSummary'));cv.hobbies=esc(gi('fHobbies'));
  schedSave();renderPreview();updateProgress();pushHist();updateSnippets();
}
function countChar(fid,cid,max){
  const e=document.getElementById(fid),c=document.getElementById(cid);if(!e||!c)return;
  const l=e.value.length;c.textContent=`${l} / ${max}`;
  c.className='char-count'+(l>max*.975?' danger':l>max*.875?' warning':'');
}
function updateProgress(){
  const cv=S.cv;
  const ch=[cv.name,cv.title,cv.email,cv.phone,cv.summary&&cv.summary.length>50,cv.experience.length>0,cv.education.length>0,cv.skills.length>=3,cv.linkedin||cv.website,cv.location];
  const sc=Math.round(ch.filter(Boolean).length/ch.length*100);
  const f=document.getElementById('progressFill'),p=document.getElementById('progressPct');
  if(f)f.style.width=sc+'%';if(p)p.textContent=sc+'%';
}

/* ===================== DYNAMIC ITEMS ===================== */
function addItem(type){
  const tpl=ITPLS[type];if(!tpl)return;
  const o={id:Date.now()};tpl.fields.forEach(f=>o[f.id]='');
  S.cv[type].push(o);renderList(type);renderPreview();updateProgress();pushHist();updateSnippets();
  toast(`${tpl.label} ditambahkan`,'success');
  setTimeout(()=>{const l=document.getElementById(type+'List');if(l?.lastElementChild)l.lastElementChild.scrollIntoView({behavior:'smooth',block:'nearest'})},80);
}
function removeItem(type,id){S.cv[type]=S.cv[type].filter(i=>i.id!==id);renderList(type);renderPreview();updateProgress();pushHist();updateSnippets()}
function updateItem(type,id,field,val){const o=S.cv[type].find(i=>i.id===id);if(o)o[field]=esc(val);schedSave();renderPreview();updateProgress();updateSnippets()}
function moveItem(type,id,dir){
  const arr=S.cv[type],idx=arr.findIndex(i=>i.id===id);if(idx<0)return;
  const ni=idx+dir;if(ni<0||ni>=arr.length)return;
  [arr[idx],arr[ni]]=[arr[ni],arr[idx]];renderList(type);renderPreview();pushHist();
}
function togDyn(type,id){
  const el=document.querySelector(`[data-dyn="${type}-${id}"]`);if(!el)return;
  const isC=el.classList.toggle('collapsed');
  el.querySelector('.dyn-header')?.setAttribute('aria-expanded',(!isC).toString());
}
function renderList(type){
  const tpl=ITPLS[type],c=document.getElementById(type+'List');if(!c)return;
  const emIds={experience:'expEmpty',education:'eduEmpty',projects:'projEmpty',certificates:'certEmpty',achievements:'achEmpty',organizations:'orgEmpty'};
  const em=emIds[type]?document.getElementById(emIds[type]):null;
  if(em)em.style.display=S.cv[type].length===0?'block':'none';
  c.innerHTML=S.cv[type].map((item,idx)=>{
    const isF=idx===0,isL=idx===S.cv[type].length-1;
    const pv=unesc(item.position||item.name||item.title||item.institution||item.role||'');
    const ps=unesc(item.company||item.issuer||item.org||'');
    let fh='<div class="item-fields cols-2">';
    tpl.fields.forEach(f=>{
      const val=unesc(item[f.id]||'');
      const cs=f.full?'style="grid-column:1/-1"':'';
      if(f.ta)fh+=`<div ${cs}><div class="field-group"><label class="field-label">${f.label}</label><textarea class="field-input field-textarea" placeholder="${f.ph||''}" oninput="updateItem('${type}',${item.id},'${f.id}',this.value);autoGrow(this)" rows="4">${val}</textarea></div></div>`;
      else fh+=`<div ${cs}><div class="field-group"><label class="field-label">${f.label}</label><input type="text" class="field-input" value="${esc(val)}" placeholder="${f.ph||''}" oninput="updateItem('${type}',${item.id},'${f.id}',this.value)"/></div></div>`;
    });
    fh+='</div>';
    return`<div class="dyn-item" data-dyn="${type}-${item.id}" role="listitem"><div class="dyn-header" onclick="togDyn('${type}',${item.id})" aria-expanded="true"><span class="drag-handle">⣿</span><span class="item-title-txt">${tpl.label} ${idx+1}${pv?` — <span style="color:var(--accent)">${esc(pv.substring(0,30))}</span>`:''}</span>${ps?`<span class="item-meta-txt">${esc(ps.substring(0,22))}</span>`:''}<div class="item-actions" onclick="event.stopPropagation()"><button class="mini-btn" onclick="moveItem('${type}',${item.id},-1)" ${isF?'disabled':''} aria-label="Naik">↑</button><button class="mini-btn" onclick="moveItem('${type}',${item.id},1)" ${isL?'disabled':''} aria-label="Turun">↓</button><button class="mini-btn del" onclick="removeItem('${type}',${item.id})" aria-label="Hapus">✕</button></div></div><div class="dyn-body">${fh}</div></div>`;
  }).join('');
  setTimeout(()=>c.querySelectorAll('textarea').forEach(autoGrow),50);
}

/* ===================== SKILLS ===================== */
function addSkill(){
  S.cv.skills.push({id:Date.now(),name:'',level:'Mahir'});
  renderSkillList();renderPreview();pushHist();updateSnippets();
}
function removeSkill(id){S.cv.skills=S.cv.skills.filter(s=>s.id!==id);renderSkillList();renderPreview();pushHist();updateSnippets()}
function updateSkill(id,f,v){
  const s=S.cv.skills.find(s=>s.id===id);if(!s)return;
  s[f]=f==='name'?esc(v):v;
  if(f==='level'){const b=document.getElementById('skBar_'+id);if(b)b.style.width=(SKLVL[v]||70)+'%'}
  schedSave();renderPreview();updateSnippets();
}
function renderSkillList(){
  const c=document.getElementById('skillList');if(!c)return;
  const em=document.getElementById('skillEmpty');if(em)em.style.display=S.cv.skills.length===0?'block':'none';
  c.innerHTML=S.cv.skills.map(sk=>{
    const p=SKLVL[sk.level]||70;
    return`<div class="skill-row" role="listitem"><input type="text" class="field-input" style="flex:1;min-width:0" placeholder="React, Python, Figma..." value="${unesc(sk.name)}" oninput="updateSkill(${sk.id},'name',this.value)" aria-label="Nama skill"/><div class="skill-bar-wrap"><div class="skill-bar"><div class="skill-fill" id="skBar_${sk.id}" style="width:${p}%"></div></div><select class="skill-select" onchange="updateSkill(${sk.id},'level',this.value)" aria-label="Level">${Object.keys(SKLVL).map(l=>`<option value="${l}" ${sk.level===l?'selected':''}>${l}</option>`).join('')}</select></div><button class="mini-btn del" onclick="removeSkill(${sk.id})" aria-label="Hapus">✕</button></div>`;
  }).join('');
}

/* ===================== LANGUAGES ===================== */
function addLang(){
  S.cv.languages.push({id:Date.now(),name:'',level:'Fasih'});
  renderLangList();renderPreview();pushHist();updateSnippets();
}
function removeLang(id){S.cv.languages=S.cv.languages.filter(l=>l.id!==id);renderLangList();renderPreview();pushHist();updateSnippets()}
function updateLang(id,f,v){const l=S.cv.languages.find(l=>l.id===id);if(l)l[f]=f==='name'?esc(v):v;schedSave();renderPreview();updateSnippets()}
function renderLangList(){
  const c=document.getElementById('languageList');if(!c)return;
  const em=document.getElementById('langEmpty');if(em)em.style.display=S.cv.languages.length===0?'block':'none';
  c.innerHTML=S.cv.languages.map(l=>`<div class="skill-row" role="listitem"><input type="text" class="field-input" style="flex:1;min-width:0" placeholder="Bahasa Inggris" value="${unesc(l.name)}" oninput="updateLang(${l.id},'name',this.value)" aria-label="Bahasa"/><select class="skill-select" onchange="updateLang(${l.id},'level',this.value)" aria-label="Level">${LNGLVL.map(v=>`<option value="${v}" ${l.level===v?'selected':''}>${v}</option>`).join('')}</select><button class="mini-btn del" onclick="removeLang(${l.id})" aria-label="Hapus">✕</button></div>`).join('');
}

/* ===================== RENDER ALL ===================== */
function renderAllLists(){
  Object.keys(ITPLS).forEach(t=>renderList(t));
  renderSkillList();renderLangList();
  const cv=S.cv;
  si('fName',cv.name);si('fTitle',cv.title);si('fEmail',cv.email);si('fPhone',cv.phone);
  si('fLocation',cv.location);si('fLinkedin',cv.linkedin);si('fWebsite',cv.website);
  si('fSummary',cv.summary);si('fHobbies',cv.hobbies);
  countChar('fSummary','sumCount',800);
  if(cv.photo){const img=document.getElementById('photoImg');if(img){img.src=cv.photo;img.style.display='block';document.getElementById('photoPlaceholder').style.display='none'}}
  updateSnippets();
}

/* ===================== PREVIEW ===================== */
let _liveZoom=null;
const renderPreview=dbn(()=>{
  const html=S.theme==='minimal'?renderMinimal():renderModern();
  const c=document.getElementById('cvPage');if(c)c.innerHTML=html;
  const cl=document.getElementById('previewClone');if(cl)cl.innerHTML=html;
  const lv=document.getElementById('cvPageLive');if(lv)lv.innerHTML=html;
  scalePreview();scaleLive();
},150);

function scaleLive(){
  const pane=document.getElementById('livePreviewScroll');
  const page=document.getElementById('cvPageLive');
  if(!pane||!page)return;
  if(_liveZoom!==null){
    page.style.transform=`scale(${_liveZoom})`;
    const lbl=document.getElementById('liveZoomLabel');
    if(lbl)lbl.textContent=Math.round(_liveZoom*100)+'%';
    return;
  }
  const avail=pane.clientWidth-24;
  const sc=Math.min(1,avail/(210*3.7795));
  page.style.transform=`scale(${sc})`;
  page.style.transformOrigin='top center';
  const lbl=document.getElementById('liveZoomLabel');
  if(lbl)lbl.textContent=Math.round(sc*100)+'%';
  // shrink container so scrollbar appears correctly
  page.style.marginBottom=`${-(297*3.7795*(1-sc))}px`;
}
function zoomLive(d){
  const pane=document.getElementById('livePreviewScroll');
  const page=document.getElementById('cvPageLive');
  if(!pane||!page)return;
  if(_liveZoom===null){
    const avail=pane.clientWidth-24;
    _liveZoom=Math.min(1,avail/(210*3.7795));
  }
  _liveZoom=Math.min(1.5,Math.max(0.2,_liveZoom+d));
  page.style.transform=`scale(${_liveZoom})`;
  page.style.transformOrigin='top center';
  page.style.marginBottom=`${-(297*3.7795*(1-_liveZoom))}px`;
  const lbl=document.getElementById('liveZoomLabel');
  if(lbl)lbl.textContent=Math.round(_liveZoom*100)+'%';
}
function zoomLiveReset(){_liveZoom=null;scaleLive();}

function openPreview(){
  const html=S.theme==='minimal'?renderMinimal():renderModern();
  const c=document.getElementById('cvPage');if(c)c.innerHTML=html;
  const cl=document.getElementById('previewClone');if(cl)cl.innerHTML=html;
  document.getElementById('previewModal').classList.add('open');
  document.body.style.overflow='hidden';
  setTimeout(scalePreview,50);
}
function scalePreview(){
  const w=document.getElementById('previewWrapper'),p=document.getElementById('previewClone');if(!w||!p)return;
  const av=w.clientWidth-48;
  const sc=Math.min(1,av/(210*3.7795));
  p.style.transform=`scale(${sc})`;p.style.transformOrigin='top center';
  const zl=document.getElementById('zoomLabel');if(zl)zl.textContent=Math.round(sc*100)+'%';
  _cZoom=null;
}
function closePreview(){
  document.getElementById('previewModal').classList.remove('open');
  document.body.style.overflow='';
}
function zoomPreview(d){
  const p=document.getElementById('previewClone'),w=document.getElementById('previewWrapper');if(!p||!w)return;
  if(_cZoom===null)_cZoom=Math.min(1,(w.clientWidth-48)/(210*3.7795));
  _cZoom=Math.min(2,Math.max(0.3,_cZoom+d));
  p.style.transform=`scale(${_cZoom})`;
  const zl=document.getElementById('zoomLabel');if(zl)zl.textContent=Math.round(_cZoom*100)+'%';
}
function zoomReset(){_cZoom=null;scalePreview()}

/* ===================== TEMPLATE CLASSIC ===================== */
function renderClassic(){
  const cv=S.cv,ac=S.accent,f=S.font,m=S.margin+'mm',sp=S.spacing,fs=S.fontSize+'pt';
  const contacts=[cv.email,cv.phone,cv.location,cv.linkedin,cv.website].filter(Boolean).map(v=>`<span>${unesc(v)}</span>`).join('');
  const sec=(t,h)=>h?`<div class="cv-section"><div class="cv-sec-title" style="color:${ac};border-color:${ac}">${t}</div>${h}</div>`:'';
  const expH=S.secs.experience&&cv.experience.length?cv.experience.map(e=>`<div class="cv-item"><div class="cv-item-header"><span class="cv-item-title">${unesc(e.position||'')}</span><span class="cv-item-date">${unesc(e.startDate||'')}${e.endDate?' – '+unesc(e.endDate):''}</span></div><div class="cv-item-sub">${unesc(e.company||'')}${e.location?' · '+unesc(e.location):''}</div>${e.desc?unesc(e.desc).split('\n').filter(Boolean).map(l=>l.startsWith('•')||l.startsWith('-')?`<div class="cv-bullet">${l.replace(/^[•\-]\s*/,'')}</div>`:`<div class="cv-item-desc">${l}</div>`).join(''):''}</div>`).join(''):'';
  const eduH=S.secs.education&&cv.education.length?cv.education.map(e=>`<div class="cv-item"><div class="cv-item-header"><span class="cv-item-title">${unesc(e.institution||'')}</span><span class="cv-item-date">${unesc(e.startDate||'')}${e.endDate?' – '+unesc(e.endDate):''}</span></div><div class="cv-item-sub">${unesc(e.degree||'')}${e.gpa?' · IPK '+unesc(e.gpa):''}</div>${e.desc?`<div class="cv-item-desc">${unesc(e.desc)}</div>`:''}</div>`).join(''):'';
  const skH=S.secs.skills&&cv.skills.length?`<div class="cv-skills">${cv.skills.map(s=>`<span class="cv-skill-tag">${unesc(s.name)}</span>`).join('')}</div>`:'';
  const prH=S.secs.projects&&cv.projects.length?cv.projects.map(p=>`<div class="cv-item"><div class="cv-item-header"><span class="cv-item-title">${unesc(p.name||'')}</span><span class="cv-item-date">${unesc(p.year||'')}</span></div><div class="cv-item-sub">${unesc(p.tech||'')}${p.role?' · '+unesc(p.role):''}</div>${p.desc?`<div class="cv-item-desc">${unesc(p.desc)}</div>`:''}</div>`).join(''):'';
  const ceH=S.secs.certificates&&cv.certificates.length?cv.certificates.map(c=>`<div class="cv-item"><div class="cv-item-header"><span class="cv-item-title">${unesc(c.name||'')}</span><span class="cv-item-date">${unesc(c.date||'')}</span></div><div class="cv-item-sub">${unesc(c.issuer||'')}${c.expiry?' · s/d '+unesc(c.expiry):''}</div></div>`).join(''):'';
  const lgH=S.secs.languages&&cv.languages.length?`<div class="cv-skills">${cv.languages.map(l=>`<span class="cv-skill-tag">${unesc(l.name)} (${l.level})</span>`).join('')}</div>`:'';
  const acH=S.secs.achievements&&cv.achievements.length?cv.achievements.map(a=>`<div class="cv-item"><div class="cv-item-header"><span class="cv-item-title">${unesc(a.title||'')}</span><span class="cv-item-date">${unesc(a.year||'')}</span></div>${a.org?`<div class="cv-item-sub">${unesc(a.org)}</div>`:''}</div>`).join(''):'';
  const ogH=S.secs.organizations&&cv.organizations.length?cv.organizations.map(o=>`<div class="cv-item"><div class="cv-item-header"><span class="cv-item-title">${unesc(o.name||'')}</span><span class="cv-item-date">${unesc(o.startDate||'')}${o.endDate?' – '+unesc(o.endDate):''}</span></div>${o.role?`<div class="cv-item-sub">${unesc(o.role)}</div>`:''}</div>`).join(''):'';
  const rfH='';
  const photo=cv.photo?`<div style="float:right;margin:0 0 10px 14px"><img src="${cv.photo}" alt="Foto" style="width:85px;height:85px;object-fit:cover;border-radius:3px;border:1px solid #ccc"/></div>`:'';
  return`<div class="cv-classic" style="font-family:'${f}',Arial,sans-serif;padding:${m};line-height:${sp};font-size:${fs}">${photo}<div class="cv-header"><div class="cv-name">${unesc(cv.name)||'Nama Anda'}</div>${cv.title?`<div class="cv-title-tag">${unesc(cv.title)}</div>`:''} ${contacts?`<div class="cv-contacts">${contacts}</div>`:''}</div>${cv.summary?`<div class="cv-section"><div class="cv-sec-title" style="color:${ac};border-color:${ac}">Ringkasan Profil</div><div class="cv-summary">${unesc(cv.summary)}</div></div>`:''}${sec('Pengalaman Kerja',expH)}${sec('Pendidikan',eduH)}${sec('Keahlian',skH)}${sec('Proyek & Portfolio',prH)}${sec('Sertifikat & Lisensi',ceH)}${sec('Prestasi',acH)}${sec('Bahasa',lgH)}${sec('Organisasi',ogH)}${sec('Hobi & Minat',cv.hobbies&&S.secs.hobbies?`<div class="cv-summary">${unesc(cv.hobbies)}</div>`:'')}${''/* referensi dihapus */}</div>`;
}

/* ===================== TEMPLATE MINIMAL ===================== */
function renderMinimal(){
  const cv=S.cv,ac=S.accent,f=S.font,sp=S.spacing,fs=S.fontSize+'pt';
  const contacts=[
    cv.email&&`<span>✉ ${unesc(cv.email)}</span>`,
    cv.phone&&`<span>☏ ${unesc(cv.phone)}</span>`,
    cv.location&&`<span>⌖ ${unesc(cv.location)}</span>`,
    cv.linkedin&&`<span>${unesc(cv.linkedin)}</span>`,
    cv.website&&`<span>${unesc(cv.website)}</span>`
  ].filter(Boolean).join('');
  const sec=(label,content)=>content?`<div class="cvm-section"><div class="cvm-sec-label" style="color:${ac};border-bottom:1.5px solid ${ac}">${label}</div>${content}</div>`:'';
  const expH=S.secs.experience&&cv.experience.length?cv.experience.map(e=>`<div style="margin-bottom:8px"><div class="cvm-row"><span class="cvm-pos">${unesc(e.position||'')}</span><span class="cvm-date">${unesc(e.startDate||'')}${e.endDate?' – '+unesc(e.endDate):''}</span></div><div class="cvm-company">${unesc(e.company||'')}${e.location?' · '+unesc(e.location):''}${e.type?' · '+unesc(e.type):''}</div>${e.desc?unesc(e.desc).split('\n').filter(Boolean).map(l=>l.startsWith('•')||l.startsWith('-')?`<div class="cvm-bullet-m">${l.replace(/^[•\-]\s*/,'')}</div>`:`<div class="cvm-desc">${l}</div>`).join(''):''}</div>`).join('').trim():'';
  const eduH=S.secs.education&&cv.education.length?cv.education.map(e=>`<div style="margin-bottom:7px"><div class="cvm-row"><span class="cvm-pos">${unesc(e.institution||'')}</span><span class="cvm-date">${unesc(e.startDate||'')}${e.endDate?' – '+unesc(e.endDate):''}</span></div><div class="cvm-company">${unesc(e.degree||'')}${e.gpa?' · IPK '+unesc(e.gpa):''}</div>${e.desc?`<div class="cvm-desc">${unesc(e.desc)}</div>`:''}</div>`).join(''):'';
  const skH=S.secs.skills&&cv.skills.length?`<div class="cvm-tags">${cv.skills.map(s=>`<span class="cvm-tag">${unesc(s.name)}${s.level&&s.level!=='Mahir'?` <span style="color:#aaa;font-size:7pt">${s.level}</span>`:''}</span>`).join('')}</div>`:'';
  const lgH=S.secs.languages&&cv.languages.length?`<div>${cv.languages.map(l=>`<div class="cvm-lang-row"><span>${unesc(l.name)}</span><span style="color:#888">${l.level}</span></div>`).join('')}</div>`:'';
  const prH=S.secs.projects&&cv.projects.length?cv.projects.map(p=>`<div style="margin-bottom:7px"><div class="cvm-row"><span class="cvm-pos">${unesc(p.name||'')}</span><span class="cvm-date">${unesc(p.year||'')}</span></div><div class="cvm-company">${unesc(p.tech||'')}${p.role?' · '+unesc(p.role):''}</div>${p.desc?`<div class="cvm-desc">${unesc(p.desc)}</div>`:''}</div>`).join(''):'';
  const ceH=S.secs.certificates&&cv.certificates.length?cv.certificates.map(c=>`<div style="margin-bottom:6px"><div class="cvm-row"><span class="cvm-pos">${unesc(c.name||'')}</span><span class="cvm-date">${unesc(c.date||'')}</span></div><div class="cvm-company">${unesc(c.issuer||'')}${c.expiry?' · s/d '+unesc(c.expiry):''}</div></div>`).join(''):'';
  const acH=S.secs.achievements&&cv.achievements.length?cv.achievements.map(a=>`<div style="margin-bottom:5px"><div class="cvm-row"><span class="cvm-pos">${unesc(a.title||'')}</span><span class="cvm-date">${unesc(a.year||'')}</span></div>${a.org?`<div class="cvm-company">${unesc(a.org)}</div>`:''}</div>`).join(''):'';
  const ogH=S.secs.organizations&&cv.organizations.length?cv.organizations.map(o=>`<div style="margin-bottom:6px"><div class="cvm-row"><span class="cvm-pos">${unesc(o.name||'')}</span><span class="cvm-date">${unesc(o.startDate||'')}${o.endDate?' – '+unesc(o.endDate):''}</span></div>${o.role?`<div class="cvm-company">${unesc(o.role)}</div>`:''}</div>`).join(''):'';
  const rfH='';
  const photoEl=cv.photo?`<img src="${cv.photo}" class="cvm-photo" alt="Foto"/>`:'';
  return`<div class="cv-minimal" style="font-family:'${f}',Arial,sans-serif;line-height:${sp};font-size:${fs}">
<div class="cvm-header">
  <div class="cvm-title-block">
    <div class="cvm-name">${unesc(cv.name)||'Nama Anda'}</div>
    ${cv.title?`<div class="cvm-jobtitle">${unesc(cv.title)}</div>`:''}
    ${contacts?`<div class="cvm-contacts">${contacts}</div>`:''}
  </div>
  ${photoEl}
</div>
<div class="cvm-divider"></div>
${cv.summary&&S.secs!==false?sec('Profil',`<div class="cvm-desc" style="line-height:1.65;font-size:8.5pt">${unesc(cv.summary)}</div>`):''}
${sec('Pengalaman Kerja',expH)}
${sec('Pendidikan',eduH)}
${sec('Keahlian',skH)}
${sec('Proyek',prH)}
${sec('Sertifikat',ceH)}
${sec('Prestasi',acH)}
${sec('Bahasa',lgH)}
${sec('Organisasi',ogH)}
${cv.hobbies&&S.secs.hobbies?sec('Hobi & Minat',`<div class="cvm-desc">${unesc(cv.hobbies)}</div>`):''}
</div>`;
}

/* ===================== TEMPLATE MODERN — Elegant ATS ===================== */
function renderModern(){
  const cv=S.cv,ac=S.accent,sp=S.spacing,fs=S.fontSize+'pt',m=S.margin+'mm';
  const skW={Expert:96,Ahli:96,Mahir:80,Menengah:60,Pemula:36};

  /* helpers */
  const sec=(title,content)=>content
    ?`<div class="cvm-section"><div class="cvm-sec-title" style="color:${ac};border-color:${ac}">${title}</div>${content}</div>`:'';

  /* sidebar: contacts */
  const ctItems=[
    cv.email    &&`<div class="cvs-item"><span class="cvs-item-icon">✉</span><span>${unesc(cv.email)}</span></div>`,
    cv.phone    &&`<div class="cvs-item"><span class="cvs-item-icon">☏</span><span>${unesc(cv.phone)}</span></div>`,
    cv.location &&`<div class="cvs-item"><span class="cvs-item-icon">⌖</span><span>${unesc(cv.location)}</span></div>`,
    cv.linkedin &&`<div class="cvs-item"><span class="cvs-item-icon">in</span><span>${unesc(cv.linkedin)}</span></div>`,
    cv.website  &&`<div class="cvs-item"><span class="cvs-item-icon">↗</span><span>${unesc(cv.website)}</span></div>`
  ].filter(Boolean).join('');

  /* sidebar: skills */
  const sSk=S.secs.skills&&cv.skills.length
    ?`<div class="cvs-section"><div class="cvs-head" style="color:${ac}">Keahlian</div>${cv.skills.map(s=>{const w=skW[s.level]||70;return`<div class="cvs-skill"><span class="cvs-skill-name">${unesc(s.name)}</span><div class="cvs-skill-bar"><div class="cvs-skill-fill" style="width:${w}%;background:${ac}"></div></div></div>`;}).join('')}</div>`:'' ;

  /* sidebar: languages */
  const sLg=S.secs.languages&&cv.languages.length
    ?`<div class="cvs-section"><div class="cvs-head" style="color:${ac}">Bahasa</div>${cv.languages.map(l=>`<div class="cvs-lang"><span>${unesc(l.name)}</span><span class="cvs-lang-level">${l.level}</span></div>`).join('')}</div>`:'';

  /* sidebar: photo */
  const photoHtml=cv.photo?`<img src="${cv.photo}" alt="Foto Profil" class="cvs-photo"/>`:'';

  /* main: summary */
  const sumHtml=cv.summary?`<div class="cvm-summary" style="border-color:${ac}">${unesc(cv.summary)}</div>`:'';

  /* main: experience */
  const eH=S.secs.experience&&cv.experience.length
    ?cv.experience.map(e=>`<div class="cvm-item"><div class="cvm-item-head"><span class="cvm-item-title">${unesc(e.position||'')}</span><span class="cvm-item-date">${unesc(e.startDate||'')}${e.endDate?' – '+unesc(e.endDate):''}</span></div><div class="cvm-item-sub">${unesc(e.company||'')}${e.location?' · '+unesc(e.location):''}${e.type?' · '+unesc(e.type):''}</div>${e.desc?unesc(e.desc).split('\n').filter(Boolean).map(l=>l.startsWith('•')||l.startsWith('-')?`<div class="cvm-bullet" style="--ac:${ac}">${l.replace(/^[•\-]\s*/,'')}</div>`:`<div style="font-size:8pt;color:#3a3a3a;line-height:1.6;margin-bottom:1px">${l}</div>`).join(''):''}</div>`).join(''):'';

  /* main: education */
  const duH=S.secs.education&&cv.education.length
    ?cv.education.map(e=>`<div class="cvm-item"><div class="cvm-item-head"><span class="cvm-item-title">${unesc(e.institution||'')}</span><span class="cvm-item-date">${unesc(e.startDate||'')}${e.endDate?' – '+unesc(e.endDate):''}</span></div><div class="cvm-item-sub">${unesc(e.degree||'')}${e.gpa?' · IPK '+unesc(e.gpa):''}</div>${e.desc?`<div style="font-size:8pt;color:#555;line-height:1.5;margin-top:2px">${unesc(e.desc)}</div>`:''}</div>`).join(''):'';

  /* main: projects */
  const prH=S.secs.projects&&cv.projects.length
    ?cv.projects.map(p=>`<div class="cvm-item"><div class="cvm-item-head"><span class="cvm-item-title">${unesc(p.name||'')}${p.url?` <span style="font-size:7.5pt;font-weight:400;color:${ac}">↗ ${unesc(p.url)}</span>`:''}</span><span class="cvm-item-date">${unesc(p.year||'')}</span></div><div class="cvm-item-sub">${unesc(p.tech||'')}${p.role?' · '+unesc(p.role):''}</div>${p.desc?`<div style="font-size:8pt;color:#3a3a3a;line-height:1.55;margin-top:2px">${unesc(p.desc)}</div>`:''}</div>`).join(''):'';

  /* main: certificates */
  const ceH=S.secs.certificates&&cv.certificates.length
    ?cv.certificates.map(c=>`<div class="cvm-item"><div class="cvm-item-head"><span class="cvm-item-title">${unesc(c.name||'')}</span><span class="cvm-item-date">${unesc(c.date||'')}</span></div><div class="cvm-item-sub">${unesc(c.issuer||'')}${c.expiry?' · s/d '+unesc(c.expiry):''}</div></div>`).join(''):'';

  /* main: achievements */
  const acH=S.secs.achievements&&cv.achievements&&cv.achievements.length
    ?cv.achievements.map(a=>`<div class="cvm-item"><div class="cvm-item-head"><span class="cvm-item-title">${unesc(a.title||'')}</span><span class="cvm-item-date">${unesc(a.year||'')}</span></div>${a.org?`<div class="cvm-item-sub">${unesc(a.org)}</div>`:''}${a.desc?`<div style="font-size:8pt;color:#3a3a3a;line-height:1.5;margin-top:2px">${unesc(a.desc)}</div>`:''}</div>`).join(''):'';

  /* main: organizations */
  const ogH=S.secs.organizations&&cv.organizations&&cv.organizations.length
    ?cv.organizations.map(o=>`<div class="cvm-item"><div class="cvm-item-head"><span class="cvm-item-title">${unesc(o.name||'')}</span><span class="cvm-item-date">${unesc(o.startDate||'')}${o.endDate?' – '+unesc(o.endDate):''}</span></div>${o.role?`<div class="cvm-item-sub">${unesc(o.role)}</div>`:''}${o.desc?`<div style="font-size:8pt;color:#3a3a3a;line-height:1.5;margin-top:2px">${unesc(o.desc)}</div>`:''}</div>`).join(''):'';

  /* main: references — removed */

  return`<div class="cv-modern" style="line-height:${sp};font-size:${fs}">
<div class="cv-sidebar">
  ${photoHtml}
  <div class="cvs-section"><div class="cvs-head" style="color:${ac}">Kontak</div>${ctItems}</div>
  ${sSk}
  ${sLg}
</div>
<div class="cv-main" style="padding:${m}">
  <div class="cvm-header" style="border-color:${ac}">
    <div class="cvm-name">${unesc(cv.name)||'Nama Anda'}</div>
    ${cv.title?`<div class="cvm-title" style="color:${ac}">${unesc(cv.title)}</div>`:''}
  </div>
  ${sumHtml?sec('Ringkasan Profil',sumHtml):''}
  ${sec('Pengalaman Kerja',eH)}
  ${sec('Pendidikan',duH)}
  ${sec('Proyek & Portfolio',prH)}
  ${sec('Sertifikat & Lisensi',ceH)}
  ${sec('Prestasi',acH)}
  ${sec('Organisasi',ogH)}
  ${cv.hobbies&&S.secs.hobbies?sec('Hobi & Minat',`<p style="font-size:8.5pt;color:#444;line-height:1.6;margin:0">${unesc(cv.hobbies)}</p>`):''}
</div>
</div>`;
}

/* ===================== PHOTO ===================== */
function triggerPhoto(){document.getElementById('photoInput').click()}
function handlePhoto(input){
  const f=input.files[0];if(!f)return;
  if(f.size>8*1024*1024){toast('Foto terlalu besar (maks 8MB)','error');return;}
  const r=new FileReader();
  r.onload=e=>{_cImg=new Image();_cImg.onload=()=>{_cOX=0;_cOY=0;openCrop()};_cImg.src=e.target.result};
  r.readAsDataURL(f);input.value='';
}
function openCrop(){
  document.getElementById('cropModal').classList.add('open');
  document.getElementById('cropZoom').value=1;drawCrop();
  const cv=document.getElementById('cropCanvas');
  const dn=e=>{_cDrag=true;const pt=e.touches?e.touches[0]:e;_cDX=pt.clientX-_cOX;_cDY=pt.clientY-_cOY;cv.style.cursor='grabbing'};
  const mv=e=>{if(!_cDrag)return;e.preventDefault();const pt=e.touches?e.touches[0]:e;_cOX=pt.clientX-_cDX;_cOY=pt.clientY-_cDY;drawCrop()};
  const up=()=>{_cDrag=false;cv.style.cursor='grab'};
  cv.onmousedown=dn;cv.onmousemove=mv;cv.onmouseup=up;cv.ontouchstart=dn;cv.ontouchmove=mv;cv.ontouchend=up;
}
function drawCrop(){
  if(!_cImg)return;
  const cv=document.getElementById('cropCanvas'),ctx=cv.getContext('2d'),z=+document.getElementById('cropZoom').value;
  ctx.clearRect(0,0,280,280);
  const sc=z*Math.max(280/_cImg.width,280/_cImg.height),w=_cImg.width*sc,h=_cImg.height*sc;
  ctx.drawImage(_cImg,_cOX+(280-w)/2,_cOY+(280-h)/2,w,h);
}
function applyCrop(){
  S.cv.photo=document.getElementById('cropCanvas').toDataURL('image/jpeg',.85);
  const img=document.getElementById('photoImg');img.src=S.cv.photo;img.style.display='block';
  document.getElementById('photoPlaceholder').style.display='none';
  closeModal('cropModal');renderPreview();schedSave();toast('Foto diupdate ✓','success');
}
function removePhoto(){
  S.cv.photo='';
  const img=document.getElementById('photoImg');img.src='';img.style.display='none';
  document.getElementById('photoPlaceholder').style.display='flex';
  renderPreview();schedSave();
}

/* ===================== ATS CHECK ===================== */
function runATSCheck(){
  const cv=S.cv;let score=0;const tips=[];
  if(cv.name)score+=10;else tips.push('❌ Nama belum diisi');
  if(cv.email)score+=8;else tips.push('❌ Email belum diisi');
  if(cv.phone)score+=5;else tips.push('⚠️ Telepon belum diisi');
  if(cv.summary&&cv.summary.length>100)score+=15;else if(cv.summary)score+=7;else tips.push('❌ Summary belum diisi — sangat penting untuk ATS');
  if(cv.experience.length>0){score+=15;if(cv.experience.some(e=>e.desc&&e.desc.length>50))score+=10;else tips.push('⚠️ Tambahkan deskripsi detail untuk setiap pengalaman')}else tips.push('❌ Pengalaman kerja belum diisi');
  if(cv.education.length>0)score+=10;else tips.push('⚠️ Pendidikan belum diisi');
  if(cv.skills.length>=5)score+=15;else if(cv.skills.length>0){score+=7;tips.push(`⚠️ Tambahkan lebih banyak skill (${cv.skills.length}/5 minimum)`)}else tips.push('❌ Skills belum diisi');
  if(cv.linkedin)score+=5;else tips.push('💡 Tambahkan URL LinkedIn');
  if(S.theme==='modern'||S.theme==='minimal')score+=7;
  score=Math.min(100,score);
  const ring=document.getElementById('atsRing'),fill=document.getElementById('atsFill'),lbl=document.getElementById('atsLabel'),sc=document.getElementById('atsScore');
  sc.textContent=score;fill.style.width=score+'%';
  const color=score>=80?'var(--success)':score>=60?'var(--warning)':'var(--danger)';
  const lb=score>=80?'Sangat Baik':score>=60?'Cukup Baik':'Perlu Perbaikan';
  ring.style.borderColor=color;sc.style.color=color;fill.style.background=color;lbl.textContent=lb;lbl.style.color=color;
  const te=document.getElementById('atsTips');
  if(te)te.innerHTML=tips.slice(0,3).map(t=>`<div style="font-size:11px;color:var(--tx-2);margin-top:3px;padding:3px 6px;background:var(--bg-surface-2);border-radius:var(--r-sm)">${t}</div>`).join('');
  document.getElementById('atsModalTitle').textContent=`🤖 ATS Score: ${score}/100 — ${lb}`;
  document.getElementById('atsModalContent').innerHTML=`<p style="margin-bottom:12px"><strong>Hasil analisis:</strong></p>${tips.map(t=>`<p style="margin-bottom:8px">${t}</p>`).join('')}${tips.length===0?'<p>✅ Semua kriteria utama terpenuhi!</p>':''}<hr style="border-color:var(--border);margin:12px 0"/><p style="font-size:11px;color:var(--tx-3)">Skor berdasarkan kelengkapan data, kualitas konten, dan kompatibilitas template dengan ATS parser.</p>`;
  document.getElementById('atsModal').classList.add('open');
  toast(`ATS Score: ${score}/100 — ${lb}`,score>=60?'success':'warning');
}

/* ===================== UNDO/REDO ===================== */
function pushHist(){
  const snap=JSON.stringify({cv:{...S.cv,photo:''}});
  S.hist=S.hist.slice(0,S.hIdx+1);S.hist.push(snap);S.hIdx=S.hist.length-1;
  if(S.hist.length>50){S.hist.shift();S.hIdx--}
}
function doUndo(){
  if(S.hIdx<=0){toast('Tidak ada yang bisa di-undo','info');return;}
  S.hIdx--;const snap=JSON.parse(S.hist[S.hIdx]);const ph=S.cv.photo;
  Object.assign(S.cv,snap.cv);S.cv.photo=ph;renderAllLists();renderPreview();updateProgress();toast('Undo ↩','info');
}
function doRedo(){
  if(S.hIdx>=S.hist.length-1){toast('Sudah di posisi terbaru','info');return;}
  S.hIdx++;const snap=JSON.parse(S.hist[S.hIdx]);const ph=S.cv.photo;
  Object.assign(S.cv,snap.cv);S.cv.photo=ph;renderAllLists();renderPreview();updateProgress();toast('Redo ↪','info');
}

/* ===================== SAVE/LOAD ===================== */
function schedSave(){clearTimeout(S.saveTimer);S.saveTimer=setTimeout(saveStorage,1500)}
function saveStorage(){
  try{localStorage.setItem('cvpro_v6',JSON.stringify({cv:S.cv,theme:S.theme,accent:S.accent,font:S.font,margin:S.margin,spacing:S.spacing,fontSize:S.fontSize,secs:S.secs}));showSaved()}
  catch(e){toast('Storage penuh. Coba hapus foto profil.','warning')}
}
function loadStorage(){
  try{
    const raw=localStorage.getItem('cvpro_v6');if(!raw)return;
    const d=JSON.parse(raw);
    if(d.cv)Object.assign(S.cv,d.cv);
    if(d.theme&&['modern','minimal'].includes(d.theme))S.theme=d.theme;else S.theme='modern';
    if(d.accent){S.accent=d.accent;setAccent(d.accent)}
    if(d.font){S.font=d.font;const fs=document.getElementById('fontSelect');if(fs)fs.value=d.font}
    if(typeof d.margin==='number'){S.margin=d.margin;const sl=document.getElementById('marginSlider');if(sl)sl.value=d.margin;const sv=document.getElementById('marginVal');if(sv)sv.textContent=d.margin+'mm'}
    if(typeof d.spacing==='number'){S.spacing=d.spacing;const sl=document.getElementById('spacingSlider');if(sl)sl.value=d.spacing;const sv=document.getElementById('spacingVal');if(sv)sv.textContent=(+d.spacing).toFixed(2)}
    if(typeof d.fontSize==='number'){S.fontSize=d.fontSize;const sl=document.getElementById('fontSizeSlider');if(sl)sl.value=d.fontSize;const sv=document.getElementById('fontSizeVal');if(sv)sv.textContent=d.fontSize+'pt'}
    if(d.secs)Object.assign(S.secs,d.secs);
    document.querySelectorAll('[data-th]').forEach(c=>c.classList.toggle('active',c.dataset.th===S.theme));
  }catch(e){console.warn('loadStorage:',e)}
}
function showSaved(){const el=document.getElementById('savedBadge');if(el){el.style.opacity='1';setTimeout(()=>el.style.opacity='0',2500)}}

/* ===================== EXPORT/IMPORT ===================== */
function exportPDF(){
  const cv=S.cv;
  if(!cv.name&&!cv.experience.length){toast('Isi data CV terlebih dahulu','warning');return}

  const page=document.getElementById('cvPage');
  if(!page)return;

  // Render terbaru ke cvPage
  page.innerHTML=S.theme==='minimal'?renderMinimal():renderModern();

  // Buat cvPage visible dan posisikan untuk print
  const origStyle=page.getAttribute('style');
  page.removeAttribute('style');
  page.style.position='fixed';
  page.style.left='0';
  page.style.top='0';
  page.style.visibility='visible';
  page.style.zIndex='99999';
  page.id='printTarget';

  // Tutup modal jika terbuka
  const modal=document.getElementById('previewModal');
  const wasOpen=modal?.classList.contains('open');
  if(wasOpen)modal.classList.remove('open');

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      window.print();
      setTimeout(()=>{
        page.id='cvPage';
        page.setAttribute('style',origStyle||'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none');
        if(wasOpen)modal.classList.add('open');
      },1500);
    });
  });
  toast('Pilih "Save as PDF" di dialog print…','info');
}
function exportJSON(){
  const data=JSON.stringify({cv:S.cv,theme:S.theme,accent:S.accent,font:S.font,version:'6.0'},null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`cv-${unesc(S.cv.name||'data').replace(/\s+/g,'-').toLowerCase()}.json`;a.click();URL.revokeObjectURL(url);
  toast('JSON disimpan ✓','success');
}
function openImport(){const el=document.getElementById('importStatus');if(el)el.style.display='none';document.getElementById('importModal').classList.add('open')}
function showImportStatus(ok,msg){
  const el=document.getElementById('importStatus');if(!el)return;
  el.style.display='block';
  el.style.borderColor=ok?'var(--success)':'var(--danger)';
  el.style.background=ok?'var(--success-l)':'var(--danger-l)';
  el.style.color=ok?'var(--success)':'var(--danger)';
  el.textContent=(ok?'✓ ':'✕ ')+msg;
}
function applyImportData(d){
  // Validasi: harus ada field 'cv' dan 'version' dari CV Builder Pro
  if(!d||typeof d!=='object'||!d.cv||!d.version){
    showImportStatus(false,'File ditolak — bukan dari CV Builder Pro');
    toast('File tidak dikenali. Hanya file dari CV Builder Pro yang diterima.','error');return false;
  }
  // Pastikan struktur cv minimal valid
  if(typeof d.cv!=='object'||Array.isArray(d.cv)){
    showImportStatus(false,'File ditolak — struktur data tidak valid');
    toast('Struktur file tidak valid.','error');return false;
  }
  // Apply data
  Object.assign(S.cv,d.cv);
  if(d.theme&&['modern','minimal'].includes(d.theme)){S.theme=d.theme;setTheme(d.theme)}
  else{S.theme='modern';setTheme('modern')}
  if(d.accent)setAccent(d.accent);
  if(d.font){S.font=d.font;const fs=document.getElementById('fontSelect');if(fs)fs.value=d.font}
  if(typeof d.margin==='number'){S.margin=d.margin;const sl=document.getElementById('marginSlider');if(sl)sl.value=d.margin;const sv=document.getElementById('marginVal');if(sv)sv.textContent=d.margin+'mm'}
  if(typeof d.spacing==='number'){S.spacing=d.spacing;const sl=document.getElementById('spacingSlider');if(sl)sl.value=d.spacing;const sv=document.getElementById('spacingVal');if(sv)sv.textContent=(+d.spacing).toFixed(2)}
  if(typeof d.fontSize==='number'){S.fontSize=d.fontSize;const sl=document.getElementById('fontSizeSlider');if(sl)sl.value=d.fontSize;const sv=document.getElementById('fontSizeVal');if(sv)sv.textContent=d.fontSize+'pt'}
  if(d.secs)Object.assign(S.secs,d.secs);
  renderSectionToggles();renderAllLists();renderPreview();updateProgress();schedSave();
  showImportStatus(true,'Import berhasil! CV siap diedit.');
  toast('Import berhasil! CV siap diedit ✓','success');
  setTimeout(()=>closeModal('importModal'),1500);
  return true;
}
function handleJSON(input){
  const f=input.files[0];if(!f)return;
  // Cek ekstensi
  if(!f.name.toLowerCase().endsWith('.json')){
    showImportStatus(false,'File ditolak — harus berformat .json');
    toast('File ditolak! Harus berformat .json dari CV Builder Pro.','error');
    input.value='';return;
  }
  const r=new FileReader();
  r.onload=e=>{
    let d;
    try{d=JSON.parse(e.target.result)}
    catch{showImportStatus(false,'File ditolak — bukan JSON valid');toast('File tidak bisa dibaca sebagai JSON.','error');input.value='';return;}
    applyImportData(d);
  };
  r.readAsText(f);input.value='';
}
function handleDrop(e){
  e.preventDefault();document.querySelector('.import-zone')?.classList.remove('over');
  const f=e.dataTransfer.files[0];if(!f)return;
  if(!f.name.toLowerCase().endsWith('.json')){
    showImportStatus(false,'File ditolak — harus berformat .json');
    toast('File ditolak! Hanya .json dari CV Builder Pro.','error');return;
  }
  const r=new FileReader();
  r.onload=ev=>{
    let d;
    try{d=JSON.parse(ev.target.result)}
    catch{showImportStatus(false,'File ditolak — bukan JSON valid');toast('File tidak bisa dibaca.','error');return;}
    applyImportData(d);
  };
  r.readAsText(f);
}
function confirmReset(){
  document.getElementById('confirmMsg').textContent='Semua data CV akan dihapus permanen. Tidak bisa dibatalkan.';
  document.getElementById('confirmYes').onclick=()=>{S.cv=mkS().cv;S.hist=[];S.hIdx=-1;renderAllLists();renderPreview();updateProgress();schedSave();closeModal('confirmModal');toast('CV direset.','info')};
  document.getElementById('confirmModal').classList.add('open');
}

/* ===================== SIDEBAR ===================== */
function toggleSidebar(){
  const sb=document.getElementById('mainSidebar'),btn=document.getElementById('sidebarToggle'),ov=document.getElementById('sidebarOverlay');
  const o=sb.classList.toggle('open');btn.setAttribute('aria-expanded',o?'true':'false');ov?.classList.toggle('show',o);
}

/* ===================== MOBILE NAV ===================== */
let _mnavActive='edit';
function mnavGo(tab){
  _mnavActive=tab;
  document.querySelectorAll('.mnav-btn[id^="mnav"]').forEach(b=>b.classList.remove('active'));
  if(tab==='edit'){
    document.getElementById('mnavEdit')?.classList.add('active');
    // close sidebar if open
    const sb=document.getElementById('mainSidebar'),ov=document.getElementById('sidebarOverlay');
    sb?.classList.remove('open');ov?.classList.remove('show');
    document.getElementById('sidebarToggle')?.setAttribute('aria-expanded','false');
    // close any open panel — back to cards
    if(_activePanel)closePanel(_activePanel);
  } else if(tab==='settings'){
    document.getElementById('mnavSettings')?.classList.add('active');
    toggleSidebar();
  }
}

/* ===================== SAMPLE DATA ===================== */
function fillSampleData(){
  S.cv={name:'Reza Firmansyah',title:'Senior Full-Stack Developer',email:'reza@email.com',phone:'+62 812 3456 7890',location:'Jakarta, Indonesia',linkedin:'linkedin.com/in/rezafirmansyah',website:'github.com/rezafirmansyah',photo:'',summary:'Senior Full-Stack Developer dengan 5 tahun pengalaman membangun produk SaaS yang melayani 100.000+ pengguna. Spesialisasi dalam React, Node.js, dan cloud infrastructure. Terbukti meningkatkan performa sistem 40% dan memimpin tim lintas fungsi untuk menghasilkan produk yang berdampak nyata bagi bisnis.',hobbies:'Open Source, Hiking, Photography',
  experience:[{id:1,position:'Senior Full-Stack Developer',company:'PT. Teknologi Nusantara',startDate:'Jan 2022',endDate:'Sekarang',location:'Jakarta / Remote',type:'Full-time',desc:'• Memimpin tim 5 developer dalam membangun platform e-commerce B2B\n• Meningkatkan performa sistem 40% melalui optimasi database dan Redis caching\n• Mengimplementasikan CI/CD pipeline yang mengurangi deployment time 60%\n• Mentoring 3 junior developer yang berhasil naik level dalam 6 bulan'},{id:2,position:'Frontend Developer',company:'Startup Kreatif Indonesia',startDate:'Jun 2020',endDate:'Des 2021',location:'Jakarta',type:'Full-time',desc:'• Membangun UI/UX aplikasi mobile React Native dengan 50K+ downloads\n• Berkolaborasi dengan tim desain meningkatkan user retention 25%\n• Mengintegrasikan 8 payment gateway untuk pasar Indonesia'}],
  education:[{id:1,institution:'Universitas Indonesia',degree:'S1 Teknik Informatika',startDate:'2016',endDate:'2020',gpa:'3.72',desc:'Ketua UKM Robotika · Beasiswa Unggulan Kemendikbud'}],
  skills:[{id:1,name:'React / Next.js',level:'Expert'},{id:2,name:'Node.js / Express',level:'Expert'},{id:3,name:'TypeScript',level:'Mahir'},{id:4,name:'PostgreSQL / MongoDB',level:'Mahir'},{id:5,name:'Docker / Kubernetes',level:'Menengah'},{id:6,name:'AWS / GCP',level:'Menengah'},{id:7,name:'System Design',level:'Mahir'}],
  projects:[{id:1,name:'NusaShop Platform',url:'github.com/rezafirmansyah/nusashop',tech:'Next.js, Node.js, PostgreSQL',year:'2023',role:'Lead Developer',desc:'Platform e-commerce B2B dengan 10.000+ transaksi per bulan.'}],
  certificates:[{id:1,name:'AWS Certified Developer – Associate',issuer:'Amazon Web Services',date:'Mar 2023',expiry:'Mar 2026',url:'credential.aws.com/abc123'}],
  languages:[{id:1,name:'Bahasa Indonesia',level:'Native'},{id:2,name:'Bahasa Inggris',level:'Profesional'}],
  achievements:[],organizations:[]};
  Object.assign(S.secs,{experience:true,education:true,skills:true,projects:true,certificates:true,languages:true,achievements:false,organizations:false,hobbies:true});
  if(!['modern','minimal'].includes(S.theme)){S.theme='modern';setTheme('modern')}
  renderSectionToggles();renderAllLists();renderPreview();updateProgress();schedSave();toast('Data contoh dimuat! ✨','success');
}

/* ===================== TEXTAREA AUTO-GROW ===================== */
function autoGrow(el){
  if(!el)return;el.style.height='auto';el.style.height=Math.min(el.scrollHeight,400)+'px';
}

/* ===================== TOAST ===================== */
function toast(msg,type='info',dur=3200){
  const c=document.getElementById('toastContainer');
  const el=document.createElement('div');el.className=`toast ${type}`;el.setAttribute('role','status');
  el.innerHTML=`<span>${{success:'✓',error:'✕',warning:'⚠',info:'ℹ'}[type]||'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(110%)';el.style.transition='all .3s ease';setTimeout(()=>el.remove(),300)},dur);
}

/* ===================== EVENTS ===================== */
document.addEventListener('click',e=>{
  const sb=document.getElementById('mainSidebar'),btn=document.getElementById('sidebarToggle'),ov=document.getElementById('sidebarOverlay');
  if(window.innerWidth>768)return;
  if(sb?.classList.contains('open')&&!sb.contains(e.target)&&!btn?.contains(e.target)){
    sb.classList.remove('open');btn.setAttribute('aria-expanded','false');ov?.classList.remove('show');
    // reset settings tab active
    document.getElementById('mnavSettings')?.classList.remove('active');
    document.getElementById('mnavEdit')?.classList.add('active');
    _mnavActive='edit';
  }
});
document.querySelectorAll('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(_activePanel){closePanel(_activePanel);return}
    document.querySelectorAll('.modal-backdrop.open').forEach(m=>m.classList.remove('open'));
    closePreview();
  }
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key==='z'&&!e.shiftKey){e.preventDefault();doUndo()}
  if(mod&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();doRedo()}
  if(mod&&e.key==='s'){e.preventDefault();saveStorage();toast('Tersimpan ✓','success')}
  if(mod&&e.key==='p'){e.preventDefault();exportPDF()}
});
document.addEventListener('input',e=>{if(e.target.tagName==='TEXTAREA')autoGrow(e.target)},true);
window.addEventListener('resize',dbn(()=>{
  if(window.innerWidth>768){const sb=document.getElementById('mainSidebar'),ov=document.getElementById('sidebarOverlay');sb?.classList.remove('open');ov?.classList.remove('show')}
  scaleLive();
},200));
// keyboard on sec-cards
document.querySelectorAll('.sec-card').forEach(c=>{
  c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click()}});
});

/* ===================== INIT ===================== */
function init(){
  loadStorage();renderSectionToggles();renderAllLists();renderPreview();updateProgress();pushHist();
  if(S.cv.name||S.cv.experience.length>0)toast('CV dimuat, lanjutkan editing ✓','success');
  setTimeout(()=>document.querySelectorAll('textarea').forEach(autoGrow),150);
}
document.addEventListener('DOMContentLoaded',init);
