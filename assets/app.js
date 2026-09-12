const STORAGE_KEY='cooinmo_fincas_v2';
const demoFincas=[
{id:'demo-1',titulo:'Olivar tradicional en Aguilar de la Frontera',provincia:'Córdoba',municipio:'Aguilar de la Frontera',tipo:'Olivar',superficie:'20 ha',precio:'600.000 €',descripcion:'20 ha · Secano · Explotación agrícola',estado:'Destacada',imagen:'p1',demo:true},
{id:'demo-2',titulo:'Explotación de olivar de gran dimensión',provincia:'Jaén',municipio:'',tipo:'Olivar',superficie:'25+ ha',precio:'Precio a consultar',descripcion:'25+ ha · Alta producción · Consultar',estado:'Oportunidad',imagen:'p2',demo:true},
{id:'demo-3',titulo:'Gran explotación de almendro y secano',provincia:'Granada',municipio:'',tipo:'Almendro',superficie:'68 ha',precio:'Precio a consultar',descripcion:'68 ha · Explotación agrícola',estado:'Novedad',imagen:'p3',demo:true},
{id:'demo-4',titulo:'Finca agrícola con agua',provincia:'Málaga',municipio:'',tipo:'Regadío',superficie:'Consultar',precio:'Consultar',descripcion:'Pozo · Cultivos productivos',estado:'Regadío',imagen:'p4',demo:true}
];

function getFincas(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return [...x,...demoFincas]}catch(e){return demoFincas}}
function saveFincas(f){localStorage.setItem(STORAGE_KEY,JSON.stringify(f))}
function escapeHtml(s){return String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}

function renderPublicFincas(){
 const box=document.getElementById('cards'); if(!box)return;
 const custom=getFincas().filter(x=>!x.demo);
 custom.forEach(x=>{
  const article=document.createElement('article');article.className='card finca';article.dataset.p=x.provincia||'';article.dataset.t=x.tipo||'';
  article.innerHTML=`<div class="pic p4"><span>${escapeHtml(x.estado||'NOVEDAD').toUpperCase()}</span></div><div class="body"><small>${escapeHtml((x.tipo||'FINCA')+' · '+(x.provincia||'ANDALUCÍA')).toUpperCase()}</small><h3>${escapeHtml(x.titulo)}</h3><p>${escapeHtml(x.descripcion||x.superficie||'Consultar')}</p><b>${escapeHtml(x.precio||'Consultar')}</b><a href="#vender">Solicitar información →</a></div>`;
  box.prepend(article);
 });
}

function filtrar(){
 const p=document.getElementById('prov').value,t=document.getElementById('tipo').value;let n=0;
 document.querySelectorAll('.finca').forEach(x=>{const ok=(!p||x.dataset.p===p)&&(!t||x.dataset.t===t);x.style.display=ok?'block':'none';if(ok)n++});
 const none=document.getElementById('none');if(none)none.hidden=n>0;
}

function mailForm(form,subject){
 form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target);let b='';for(const [k,v] of d)b+=k+': '+v+'\n';location.href='mailto:fincas@cooinmo.es?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(b)})
}

document.addEventListener('DOMContentLoaded',()=>{
 renderPublicFincas();
 const form=document.getElementById('form');if(form)mailForm(form,'Solicitud de venta de finca COOINMO');
 const buyer=document.getElementById('buyerForm');if(buyer)mailForm(buyer,'Nueva búsqueda de finca COOINMO');
});
