const KEY='cooinmo_fincas_v2';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const write=x=>localStorage.setItem(KEY,JSON.stringify(x));

function makeCopy(f){
 const title=f.titulo||'Finca agrícola en Andalucía';
 return `${title}\n\n${f.tipo||'Finca'} · ${f.provincia||'Andalucía'}${f.municipio?' · '+f.municipio:''}\nSuperficie: ${f.superficie||'Consultar'}\nPrecio: ${f.precio||'Consultar'}\nAgua: ${f.agua||'Consultar'}\n\n${f.descripcion||'Excelente oportunidad agrícola para inversor o comprador final.'}\n\nCOOINMO FINCAS · Andalucía\nSolicita información y ficha completa.`;
}
function render(){
 const data=read();$('#count').textContent=`${data.length} finca(s) creadas en este navegador`;
 if(!data.length){$('#tableWrap').innerHTML='<div class="empty">Todavía no hay fincas creadas. Usa el formulario de la izquierda.</div>';return}
 let rows=data.map((f,i)=>`<tr><td><b>${esc(f.titulo)}</b><div class="muted">${esc(f.tipo)} · ${esc(f.provincia)}${f.municipio?' · '+esc(f.municipio):''}</div></td><td>${esc(f.superficie||'-')}</td><td><b>${esc(f.precio||'Consultar')}</b></td><td><span class="badge">${esc(f.estado||'En captación')}</span></td><td><div class="actions"><button class="mini" onclick="showCard(${i})">Ficha</button><button class="mini" onclick="prepare(${i})">Preparar distribución</button><button class="mini" onclick="removeFarm(${i})">Eliminar</button></div></td></tr>`).join('');
 $('#tableWrap').innerHTML=`<table class="table"><thead><tr><th>Finca</th><th>Superficie</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table>`;
}
window.removeFarm=i=>{const d=read();if(confirm('¿Eliminar esta finca del inventario local?')){d.splice(i,1);write(d);render()}};
window.showCard=i=>{const f=read()[i];if(!f)return;$('#modalContent').innerHTML=`<p><b>${esc(f.titulo)}</b></p><div class="adcopy">${esc(makeCopy(f))}</div><p><button class="btn primary" onclick="copyText(${i})">Copiar anuncio</button></p>`;$('#modal').classList.add('show')};
window.copyText=i=>{navigator.clipboard?.writeText(makeCopy(read()[i])).then(()=>alert('Anuncio copiado al portapapeles.'))};
window.prepare=i=>{const f=read()[i];if(!f)return;const copy=makeCopy(f);$('#modalContent').innerHTML=`<p><b>Distribución preparada</b></p><p class="muted">La ficha está lista para usar en los canales autorizados. Para portales externos no se realiza una publicación simulada.</p><div class="adcopy">${esc(copy)}</div><div class="distGrid"><div class="channel"><b>✓ COOINMO Web</b><small>Disponible en este navegador.</small></div><div class="channel"><b>✓ Milanuncios</b><small>Preparar mediante cuenta/integración autorizada.</small></div><div class="channel"><b>✓ Fotocasa / Habitaclia</b><small>Preparar mediante servicio compatible.</small></div><div class="channel"><b>✓ Redes / WhatsApp</b><small>Texto listo para compartir.</small></div></div><p><button class="btn primary" onclick="copyText(${i})">Copiar anuncio</button></p>`;$('#modal').classList.add('show')};

$('#farmForm').addEventListener('submit',e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));f.id='finca-'+Date.now();f.createdAt=new Date().toISOString();write([f,...read()]);e.target.reset();render();alert('Finca guardada en el inventario local. Abre la web pública para verla en este mismo navegador.')});
$('#demoBtn').addEventListener('click',()=>{const d=$('#farmForm');d.titulo.value='Finca de olivar intensivo en Córdoba';d.provincia.value='Córdoba';d.municipio.value='Puente Genil';d.tipo.value='Olivar';d.superficie.value='32 ha';d.precio.value='950.000 €';d.agua.value='Regadío';d.pies.value='8.500';d.produccion.value='Alta producción';d.estado.value='OPORTUNIDAD';d.descripcion.value='Explotación de olivar con buena accesibilidad, recursos hídricos y potencial productivo.'});
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(read(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cooinmo-fincas-inventario.json';a.click();URL.revokeObjectURL(a.href)});
$('#clearBtn').addEventListener('click',()=>{if(confirm('Esto borrará las fincas creadas desde este navegador. ¿Continuar?')){localStorage.removeItem(KEY);render()}});
$('#closeModal').addEventListener('click',()=>$('#modal').classList.remove('show'));$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').classList.remove('show')});
render();
