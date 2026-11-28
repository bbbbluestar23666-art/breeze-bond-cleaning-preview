// Mobile enhancements preserve the original select values and quote engine.
const mobileQuery=matchMedia('(max-width:650px)');
const groups={Kitchen:['fridge','dishwasher','oven'],Floors:['carpet','hall','stairs'],Windows:['blinds','screens','glass','windows','shutters'],Outdoors:['balcony','bigbalcony','deck','patio','garage'],Other:['walls','aircon','flat']};
let activeGroup='Kitchen';
const filters=document.createElement('div');filters.className='mobile-extra-filters';filters.setAttribute('aria-label','Extra categories');
filters.innerHTML=Object.keys(groups).map(k=>'<button type="button" data-group="'+k+'">'+k+'</button>').join('');
document.querySelector('#extras').before(filters);
function filterExtras(){document.querySelectorAll('#extras .extra').forEach(el=>{const id=el.querySelector('[data-extra]').dataset.extra;el.hidden=mobileQuery.matches&&!groups[activeGroup].includes(id)});filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===activeGroup)))}
filters.onclick=e=>{const b=e.target.closest('[data-group]');if(b){activeGroup=b.dataset.group;filterExtras()}};
new MutationObserver(filterExtras).observe(document.querySelector('#extras'),{childList:true});
mobileQuery.addEventListener('change',filterExtras);filterExtras();
const chooser=document.createElement('dialog');chooser.id='mobileChooser';chooser.setAttribute('aria-labelledby','chooserTitle');document.body.append(chooser);
let chosenSelect=null,trigger=null;
document.querySelectorAll('.fields select').forEach(select=>{
 const label=select.parentElement;const name=label.childNodes[0].textContent.trim();
 const button=document.createElement('button');button.type='button';button.className='mobile-select';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',name);
 const sync=()=>{button.textContent=select.selectedOptions[0].textContent;button.setAttribute('aria-label',name+': '+button.textContent)};
 sync();select.addEventListener('change',sync);label.append(button);
 button.onclick=()=>{chosenSelect=select;trigger=button;chooser.innerHTML='<div class="chooser-top"><h2 id="chooserTitle">'+name+'</h2><button type="button" class="chooser-close" aria-label="Close choices">×</button></div><fieldset><legend class="sr-only">'+name+'</legend>'+Array.from(select.options).map(o=>'<label><input type="radio" name="mobileChoice" aria-label="'+o.textContent+'" value="'+o.value+'" '+(o.selected?'checked':'')+'><span>'+o.textContent+'</span></label>').join('')+'</fieldset>';
 chooser.querySelector('.chooser-close').onclick=()=>chooser.close();chooser.showModal();chooser.querySelector('input:checked')?.focus();
 };
});
chooser.addEventListener('change',e=>{if(e.target.name==='mobileChoice'){chosenSelect.value=e.target.value;chosenSelect.dispatchEvent(new Event('change',{bubbles:true}));chooser.close()}});
chooser.addEventListener('close',()=>trigger?.focus());
const dock=document.createElement('a');dock.href='#quoteLines';dock.className='mobile-price-dock';dock.innerHTML='<span id="dockStatus"></span><strong id="dockPrice" aria-live="polite"></strong>';document.body.append(dock);
function syncDock(){const q=calculate();document.querySelector('#dockPrice').textContent='A$'+money(q.sum)+(q.unresolved.length?'+':'');document.querySelector('#dockStatus').textContent=q.unresolved.length?'From · incl. GST':'Total incl. GST';dock.setAttribute('aria-label','View full estimate: '+document.querySelector('#dockStatus').textContent+' '+document.querySelector('#dockPrice').textContent)}
new MutationObserver(syncDock).observe(document.querySelector('#total'),{childList:true});syncDock();
const paymentSection = document.querySelector('.demo-deposit');
new IntersectionObserver(([entry]) => {
  dock.style.display = entry.isIntersecting ? 'none' : '';
}).observe(paymentSection);
// Measure fixed-bar height so enlarged system fonts cannot cover the final controls.
new ResizeObserver(() => {
  const height = dock.getBoundingClientRect().height;
  if (height > 0) document.documentElement.style.setProperty('--price-dock-height', height + 'px');
}).observe(dock);
