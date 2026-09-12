const STORAGE_KEY='cooinmo_fincas_v2';
const LEAD_KEY='cooinmo_leads_v1';
const cfg=window.COINMO_SUPABASE_CONFIG||{};
const cloudReady=!!(cfg.url&&cfg.publishableKey&&window.supabase);
const sb=cloudReady?window.supabase.createClient(cfg.url,cfg.publishableKey):null;
const demoFincas=[
{id:'demo-1',titulo:'Olivar tradicional en Aguilar de la Frontera',provincia:'Córdoba',municipio:'Aguilar de la Frontera',tipo:'Olivar',superficie:'20 ha',precio:'600.000 €',descripcion:'20 ha · Secano · Explotación agrícola',estado:'Destacada',imagen:'p1',demo:true},
{id:'demo-2',titulo:'Explotación de olivar de gran dimensión',provincia:'Jaén',municipio:'',tipo:'Olivar',superficie:'25+ ha',precio:'Precio a consultar',descripcion:'25+ ha · Alta producción · Consultar',estado:'Oportunidad',imagen:'p2',demo:true},
{id:'demo-3',titulo:'Gran explotación de almendro y secano',provincia:'Granada',municipio:'',tipo:'Almendro',superficie:'68 ha',precio:'Precio a consultar',descripcion:'68 ha · Explotación agrícola',estado:'Novedad',imagen:'p3',demo:true},
{id:'demo-4',titulo:'Gran olivar de regadío',provincia:'Jaén',municipio:'Jaén · Polígono 1 · Parcela 114',tipo:'Olivar',superficie:'140.000 m² · 14 ha',precio:'3,14 €/m²',descripcion:'Olivar de un pie · Marco 6 × 8 · Arbequina · 15 años · Regadío instalado y funcionando',estado:'Novedad',imagen:'jaen-120ha-01.jpg',demo:true}
];
const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const write=(key,data)=>localStorage.setItem(key,JSON.stringify(data));
const escapeHtml=s=>String(s??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','\"':'&quot;'}[c]));
let publicFincas=[];
async function loadPublicFincas(){
  if(cloudReady){
    const {data,error}=await sb.from('fincas').select('*').eq('publicada',true).order('created_at',{ascending:false});
    if(!error){publicFincas=[...(data||[])];return publicFincas;}
    console.warn('COOINMO Supabase:',error.message);
  }
  publicFincas=[...read(STORAGE_KEY,[]),...demoFincas];
  return publicFincas;
}
async function renderPublicFincas(){
  const box=document.getElementById('cards');if(!box)return;
  box.querySelectorAll('.dynamic-finca').forEach(x=>x.remove());
  const data=await loadPublicFincas();
  data.filter(x=>!x.demo && String(x.titulo||'').trim()!=='Finca agrícola con agua').forEach(x=>{
    const article=document.createElement('article');article.className='card finca dynamic-finca';article.dataset.p=x.provincia||'';article.dataset.t=x.tipo||'';
    const image=(x.fotos||x.imagen||'').split(',')[0].trim();
    const bg=image?` style=\"background-image:url('${image.replaceAll("'","%27")}')\"`:'';
    const contactId=String(x.id||'').replaceAll("'",'');
    article.innerHTML=`<div class=\"pic p4\"${bg}><span>${escapeHtml(x.estado||'NOVEDAD').toUpperCase()}</span></div><div class=\"body\"><small>${escapeHtml(((x.tipo||'FINCA')+' · '+(x.provincia||'ANDALUCÍA')).toUpperCase())}</small><h3>${escapeHtml(x.titulo||'Finca agrícola')}</h3><p>${escapeHtml(x.descripcion||x.superficie||'Consultar')}${x.agua?' · '+escapeHtml(x.agua):''}</p><b>${escapeHtml(x.precio||'Consultar')}</b><a href=\"#contacto\" onclick=\"selectFarmContact('${contactId}')\">Solicitar información →</a></div>`;
    box.prepend(article);
  });
}
window.selectFarmContact=id=>{const f=publicFincas.find(x=>x.id===id);if(!f)return;const msg=`Consulta COOINMO: ${f.titulo||'Finca'}${f.municipio?' · '+f.municipio:''}`;const tel=String(f.telefono||'').replace(/\D/g,'');if(tel)window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,'_blank');};
window.filtrar=()=>{const p=document.getElementById('prov')?.value||'',t=document.getElementById('tipo')?.value||'';let n=0;document.querySelectorAll('.finca').forEach(x=>{const ok=(!p||x.dataset.p===p)&&(!t||x.dataset.t===t);x.style.display=ok?'block':'none';if(ok)n++});const none=document.getElementById('none');if(none)none.hidden=n>0};
async function registerLead(data){
  const {tipo_lead,nombre,telefono,email,...rest}=data;
  const payload={tipo_lead,nombre,telefono:telefono||null,email:email||null,datos:rest};
  if(cloudReady){const {error}=await sb.from('leads').insert(payload);if(!error)return true;console.warn('COOINMO lead cloud:',error.message)}
  const leads=read(LEAD_KEY,[]);leads.unshift({...data,id:'lead-'+Date.now(),createdAt:new Date().toISOString()});write(LEAD_KEY,leads);return false;
}
function mailForm(form,subject,type){form.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));await registerLead({tipo_lead:type,...d});const b=Object.entries(d).map(([k,v])=>`${k}: ${v}`).join('\\n');location.href='mailto:cooinmoes@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(b);form.reset();});}
document.addEventListener('DOMContentLoaded',async()=>{
  await renderPublicFincas();
  const form=document.getElementById('form');if(form)mailForm(form,'Solicitud de venta de finca COOINMO','propietario');
  const buyer=document.getElementById('buyerForm');if(buyer)mailForm(buyer,'Nueva búsqueda de finca COOINMO','comprador');
  const card=[...document.querySelectorAll('.finca')].find(x=>x.querySelector('h3')?.textContent.includes('Explotación de olivar de gran dimensión'));
  if(card){card.dataset.p='Jaén';card.dataset.t='Olivar';const pic=card.querySelector('.pic');if(pic){pic.className='pic';pic.style.backgroundImage="url('linares-01.jpg')";pic.style.backgroundSize='cover';pic.style.backgroundPosition='center';pic.innerHTML='<span>OPORTUNIDAD</span>';}const body=card.querySelector('.body');if(body)body.innerHTML='<small>OLIVAR REGADÍO · JAÉN</small><h3>Venta 1.800 olivos de regadío</h3><p>99.999 m² · 99,99 ha · Entre Linares y Bailén · Riego por goteo · Dos sondeos legales · Vivienda · Naves · Piscina</p><b>449.000 € · 4,49 €/m²</b><a href="finca-linares-bailen.html">Ver finca →</a>';}
  const benamejiCard=[...document.querySelectorAll('.finca')].find(x=>x.querySelector('h3')?.textContent.includes('Gran explotación de almendro y secano'));
  if(benamejiCard){benamejiCard.dataset.p='Córdoba';benamejiCard.dataset.t='Olivar';const pic=benamejiCard.querySelector('.pic');if(pic){pic.className='pic';pic.style.backgroundImage="url('baena-02.jpg')";pic.style.backgroundSize='cover';pic.style.backgroundPosition='center';pic.innerHTML='<span>NOVEDAD</span>';}const body=benamejiCard.querySelector('.body');if(body)body.innerHTML='<small>OLIVAR · BENAMEJÍ · CÓRDOBA</small><h3>Finca Olivos Benamejí</h3><p>20 fanegas · Cerca de 2.000 Hojiblanca · Olivos de un pie · 3 pozos · Nave con luz · 3 km del pueblo</p><b>550.000 €</b><a href="finca-benameji.html">Ver finca →</a>';}
});
