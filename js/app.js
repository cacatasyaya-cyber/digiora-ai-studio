
const mods=[['Worksheet Generator','📝','Lembar kerja anak dengan latihan terarah.'],['Activity Book Creator','🧩','Buku aktivitas multi-halaman.'],['Coloring Book Creator','🎨','Halaman mewarnai dan line-art.'],['Komik Edukasi Creator','💬','Komik pembelajaran dengan panel cerita.'],['Busy Book Creator','🧸','Aktivitas motorik dan pra-literasi.'],['Catatan Belajar Creator','📚','Rangkuman dan catatan visual.'],['LKPD Generator','📋','Lembar kerja peserta didik.'],['Custom Product Studio','✨','Rancang produk sesuai idemu.']];

let chosen=0,project=null,page=0,projects=read();
const $=id=>document.getElementById(id);

function read(){
 try{return JSON.parse(localStorage.getItem('digiora_mvp_projects')||'[]')}
 catch(e){return []}
}
function persist(){
 try{
  localStorage.setItem('digiora_mvp_projects',JSON.stringify(projects));
  return true;
 }catch(e){
  alert('Penyimpanan browser penuh. Unduh cadangan proyek.');
  return false;
 }
}
function esc(s){
 return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function show(id){
 ['home','formView','editView'].forEach(x=>$(x).classList.toggle('hidden',x!==id));
 window.scrollTo(0,0);
}
function home(){
 show('home');
 renderProjects();
}

$('modulesGrid').innerHTML=mods.map((m,i)=>`<button class="module" onclick="openForm(${i})"><div style="font-size:27px">${m[1]}</div><h3>${m[0]}</h3><p>${m[2]}</p></button>`).join('');

function openForm(i){
 chosen=i;
 $('modPill').textContent=mods[i][0];
 $('title').value='';
 $('count').value=5;
 $('objective').value='';
 $('extra').value='';
 show('formView');
}

async function generate(){
 let title=$('title').value.trim();
 if(!title){
  alert('Isi judul atau topik terlebih dahulu.');
  $('title').focus();
  return;
 }
 let n=Math.max(1,Math.min(30,Number($('count').value)||1));
 const btn=$('generateBtn');
 const payload={
  module:mods[chosen][0],
  title,
  pageCount:n,
  age:$('age').value,
  language:$('lang').value,
  visualStyle:$('style').value,
  curriculum:$('curr').value,
  difficulty:$('level').value,
  objective:$('objective').value.trim(),
  extra:$('extra').value.trim()
 };

 btn.disabled=true;
 btn.textContent='Gemini sedang membuat...';

 try{
  const response=await fetch('/.netlify/functions/generate',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify(payload)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'Permintaan AI gagal. Periksa konfigurasi Gemini API.');
  if(!Array.isArray(data.pages)||!data.pages.length)throw new Error('Gemini belum mengembalikan halaman yang dapat digunakan. Coba lagi.');

  project={
   id:'d'+Date.now(),
   title,
   module:mods[chosen][0],
   age:payload.age,
   lang:payload.language,
   style:payload.visualStyle,
   curr:payload.curriculum,
   level:payload.difficulty,
   pages:data.pages.map((p,i)=>({
    title:String(p.title||`${title} — Halaman ${i+1}`),
    body:String(p.body||''),
    task:String(p.task||'')
   }))
  };
  page=0;
  showEditor();
 }catch(err){
  alert('Belum berhasil membuat draft AI.\n\n'+err.message+'\n\nPastikan fungsi Netlify dan GEMINI_API_KEY sudah terpasang.');
 }finally{
  btn.disabled=false;
  btn.textContent='Buat dengan Gemini AI';
 }
}

function showEditor(){
 show('editView');
 $('editHeading').textContent=project.title;
 render();
}
function render(){
 let p=project.pages[page];
 $('pageList').innerHTML=project.pages.map((x,i)=>`<div class="page ${i===page?'active':''}" onclick="selectPage(${i})">${i+1}. ${esc(x.title)}</div>`).join('');
 $('pTitle').value=p.title;
 $('pBody').value=p.body;
 $('pTask').value=p.task;
 draw();
}
function draw(){
 let p=project.pages[page];
 $('paper').innerHTML=`<div style="font-size:11px;color:#a05c7e;text-transform:uppercase;font-weight:bold">${esc(project.module)} • ${esc(project.age)}</div><h2>${esc(p.title)}</h2><div style="white-space:pre-wrap">${esc(p.body)}</div><div class="task"><b>Yuk, kerjakan!</b><p style="white-space:pre-wrap">${esc(p.task)}</p><div style="height:95px;border:1px dashed #d7c8d0;border-radius:8px"></div></div><p style="text-align:right;color:#9b8c95;font-size:11px">${page+1}</p>`;
}
function selectPage(i){
 page=i;
 render();
}
function update(k,v){
 project.pages[page][k]=v;
 draw();
 $('pageList').children[page].textContent=(page+1)+'. '+project.pages[page].title;
}
function addPage(){
 project.pages.push({
  title:project.title+' — Halaman '+(project.pages.length+1),
  body:'Tambahkan materi atau penjelasan di sini.',
  task:'Tambahkan instruksi aktivitas.'
 });
 page=project.pages.length-1;
 render();
}
function duplicatePage(){
 let c=JSON.parse(JSON.stringify(project.pages[page]));
 c.title+=' (Salinan)';
 project.pages.splice(page+1,0,c);
 page++;
 render();
}
function deletePage(){
 if(project.pages.length<2){
  alert('Minimal satu halaman.');
  return;
 }
 if(confirm('Hapus halaman ini?')){
  project.pages.splice(page,1);
  page=Math.max(0,page-1);
  render();
 }
}
function save(){
 let i=projects.findIndex(x=>x.id===project.id);
 if(i<0)projects.push(JSON.parse(JSON.stringify(project)));
 else projects[i]=JSON.parse(JSON.stringify(project));
 if(persist())alert('Proyek tersimpan di browser ini.');
}
function renderProjects(){
 $('projects').innerHTML=projects.length?projects.slice().reverse().map(p=>`<div class="project"><h3>${esc(p.title)}</h3><p class="muted">${esc(p.module)} • ${p.pages.length} halaman</p><button onclick="openSaved('${p.id}')">Buka</button><button class="light" onclick="rename('${p.id}')">Nama</button><button class="light" onclick="removeProject('${p.id}')">Hapus</button></div>`).join(''):'<p class="muted">Belum ada proyek. Pilih modul untuk mulai membuat.</p>';
}
function openSaved(id){
 project=JSON.parse(JSON.stringify(projects.find(x=>x.id===id)));
 page=0;
 showEditor();
}
function rename(id){
 let p=projects.find(x=>x.id===id);
 let n=prompt('Nama proyek:',p.title);
 if(n&&n.trim()){
  p.title=n.trim();
  persist();
  renderProjects();
 }
}
function removeProject(id){
 if(confirm('Hapus proyek ini?')){
  projects=projects.filter(x=>x.id!==id);
  persist();
  renderProjects();
 }
}
function backup(){
 blobDownload(JSON.stringify(projects,null,2),'DIGIORA_backup.json','application/json');
}
function blobDownload(data,name,type){
 let u=URL.createObjectURL(new Blob([data],{type}));
 let a=document.createElement('a');
 a.href=u;
 a.download=name;
 a.click();
 setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function downloadPage(){
 blobDownload('<!doctype html><meta charset="utf-8"><title>'+esc(project.title)+'</title><style>body{font:16px/1.6 Arial;padding:30px}main{max-width:750px;margin:auto}h2{color:#101d3a}.task{border:2px dashed #e5b8cc;padding:15px;margin-top:25px}</style><main>'+ $('paper').innerHTML+'</main>','DIGIORA_halaman.html','text/html');
}
renderProjects();
