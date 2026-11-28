// Restore local draft inputs and recalculate prices with the current quote engine.
const storageKey='breeze-clean-selections-v2';let storageAvailable=true;let persisted={schema:1};
try{const raw=JSON.parse(localStorage.getItem(storageKey)||'null');if(raw&&raw.schema===1)persisted=raw}catch{storageAvailable=false}
function loadLocalPart(part,legacy){if(persisted[part])return persisted[part];try{return JSON.parse(sessionStorage.getItem(legacy)||'null')}catch{return null}}
function saveLocalPart(part,value){persisted[part]=value;persisted.updatedAt=new Date().toISOString();try{localStorage.setItem(storageKey,JSON.stringify(persisted))}catch{storageAvailable=false}const note=document.querySelector('#storageNote');if(note)note.textContent=storageAvailable?'':'Browser storage is unavailable. You can still use this estimate, but your choices may not be restored after leaving.'}

function restoreEstimate(){
 try{
  const saved=loadLocalPart('selection','breeze-preview-estimate-v1');if(!saved)return;
  for(const [id,key] of [['bedrooms','b'],['bathrooms','bath'],['levels','levels'],['property','property']]){
   const el=document.getElementById(id);const value=String(saved[key]);
   if([...el.options].some(o=>o.value===value))el.value=value;
  }
  for(const x of extras){const n=Number(saved.counts?.[x[0]]);if(Number.isInteger(n)&&n>=0&&n<=maxQuantity(x[0]))counts[x[0]]=n}
 }catch{}
}
const counts={};
function estimateCondition() {
  const rating = document.querySelector('#contactDialog').dataset.prefilled === 'true' ? 4 :
    Number.parseInt(document.querySelector('[aria-describedby="help-condition"]').value, 10);
  if (rating <= 2) return 'heavy';
  return rating === 3 ? 'buildup' : 'maintained';
}
function resetDepositSimulation() {
  document.querySelector('#previewDeposit').disabled = false;
  document.querySelector('#depositStatus').textContent = '';
}
function extraPrice(x){return x[0]==='walls'?({1:150,2:150,3:150,4:210,5:210}[document.querySelector('#bedrooms').value]??null):x[2]}
function renderExtras(){document.querySelector('#extras').innerHTML=extras.map(x=>{const qty=counts[x[0]]||0,p=extraPrice(x);return `<div class="extra ${qty?'selected':''}"><button class="extra-select" data-extra="${x[0]}" aria-pressed="${!!qty}" aria-label="${qty?'Remove':'Add'} ${x[1]}"><span class="plus" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${qty?'<path d="M5 12l4.5 4.5L19 7.5"/>':'<path d="M5 12h14M12 5v14"/>'}</svg></span>${icon(x[0])}<strong>${x[1]}</strong></button><div class="price">${p===null?'To confirm':`${fromIds.has(x[0])?'From ':''}<span class="extra-amount">A$${money(p)}</span><span class="extra-tax">excl. GST</span>`} <small class="extra-description">· ${x[3]}</small><small class="mobile-unit">${x[3].split("·")[0]}</small><details class="mobile-extra-detail"><summary>Details</summary><p>${x[3]}</p></details></div><div class="quantity ${qty?'':'hidden'}"><button data-minus="${x[0]}" aria-label="Decrease ${x[1]}">−</button><span>${qty}</span><button data-plus="${x[0]}" aria-label="Increase ${x[1]}">+</button></div></div>`}).join('')}
function calculate(){return estimate({b:document.querySelector('#bedrooms').value,bath:+document.querySelector('#bathrooms').value,levels:+document.querySelector('#levels').value,property:document.querySelector('#property').value,condition:estimateCondition(),counts})}
function update(){const q=calculate();resetDepositSimulation();try{saveLocalPart('selection',{b:q.b,bath:q.bath,levels:q.levels,property:q.property,counts:{...counts}})}catch{};document.querySelector('#homeSummary').textContent=`${q.property[0].toUpperCase()+q.property.slice(1)} · ${q.b==='studio'?'Studio':q.b+' bedroom(s)'} · ${q.bath} bathroom(s) · ${q.levels} level(s)`;document.querySelector('#quoteLines').innerHTML=q.lines.filter(l=>l[0]!=="Extras 10% GST"||q.extrasGst>0).map(l=>`<div class="quote-line"><span>${l[0]}</span><span>${formatLine(l)}</span></div>`).join('');document.querySelector('#totalLabel').textContent=q.unresolved.length?'Known subtotal + items to confirm':'Estimated total';document.querySelector('#total').textContent=`A$${money(q.sum)}${q.unresolved.length?'+':''}`;document.querySelector('#taxNote').textContent=`Base price includes GST. Extras GST is shown above when added.`;document.querySelector('#quoteWarning').innerHTML=`<strong>Estimate for review.</strong> ${q.unresolved.length?q.unresolved.join(' '):'Final price confirmed after reviewing your property.'}`;}
document.querySelector('#extras').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const oldScroll=window.scrollY;const openDetails=[...document.querySelectorAll('#extras .extra')].filter(el=>el.querySelector('details')?.open).map(el=>el.querySelector('[data-extra]').dataset.extra);if(b.dataset.extra)counts[b.dataset.extra]=counts[b.dataset.extra]?0:1;if(b.dataset.plus)counts[b.dataset.plus]=Math.min(maxQuantity(b.dataset.plus),(counts[b.dataset.plus]||0)+1);if(b.dataset.minus)counts[b.dataset.minus]=Math.max(0,(counts[b.dataset.minus]||0)-1);const key=Object.keys(b.dataset)[0],id=b.dataset[key];renderExtras();update();const restored=document.querySelector('[data-'+key+'="'+id+'"]');for(const id of openDetails){const card=document.querySelector('[data-extra="'+id+'"]')?.closest('.extra');if(card?.querySelector('details'))card.querySelector('details').open=true}if(restored)restored.focus({preventScroll:true});if(matchMedia('(max-width:650px)').matches)requestAnimationFrame(()=>window.scrollTo({top:oldScroll,behavior:'instant'}))});document.querySelectorAll('.fields select').forEach(el=>el.addEventListener('change',()=>{renderExtras();update()}));
document.querySelector('#reviewBtn').onclick=()=>document.querySelector('#reviewDialog').showModal();document.querySelector('#closeReview').onclick=()=>document.querySelector('#reviewDialog').close();document.querySelector('#pricingSource').textContent='Preview prices and policies are for design review only, not an offer or confirmed quote.';
document.querySelector('#bedrooms').insertAdjacentHTML('afterbegin','<option value="studio">Studio</option>');restoreEstimate();renderExtras();update();

// The two panels share one document so changing views preserves the quote.
const formPanel = document.getElementById('quoteFormPanel');
const questionsPanel = document.getElementById('questionsPanel');
let quoteScrollY = 0;
function showQuestions(open, restorePosition = false) {
  if (open === formPanel.hidden) return;
  if (open) quoteScrollY = window.scrollY;
  formPanel.hidden = open;
  questionsPanel.hidden = !open;
  document.getElementById('showQuote').setAttribute('aria-pressed', String(!open));
  document.getElementById('showQuestions').setAttribute('aria-pressed', String(open));
  document.body.classList.toggle('reading-questions', open);
  if (restorePosition) {
    if (open) {
      document.getElementById('decisionFaqTitle').scrollIntoView({behavior: 'instant'});
    } else {
      window.scrollTo({top: quoteScrollY, behavior: 'instant'});
    }
  }
}
document.getElementById('showQuote').onclick = () => showQuestions(false, true);
document.getElementById('showQuestions').onclick = () => showQuestions(true, true);
function followQuoteLink(hash) {
  if (hash === '#decisionFaqTitle') showQuestions(true);
  else if (hash === '#quote' || formPanel.contains(document.getElementById(hash.slice(1)))) showQuestions(false);
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link) followQuoteLink(link.hash);
});
window.addEventListener('hashchange', () => followQuoteLink(location.hash));
followQuoteLink(location.hash);
const commonQuestions = [
  ['How is the estimate calculated?', 'Choose your home size, bathrooms and levels, then add any extras. The estimate includes GST and marks items that still need a quote.'],
  ...faqs
    .filter(item => ['What is included in an bond clean?', 'Is the oven included?', 'Are windows included?', 'Is carpet steam cleaning included?', 'Does the property need to be empty?', 'Do I need to be home during the clean?', 'When will I pay?'].includes(item[1]))
    .map(item => [item[1].replace('an bond','a bond'), item[2]])
];
document.getElementById('decisionFaqs').innerHTML = commonQuestions.map(([question, answer]) =>
  '<details class="faq-item"><summary>' + question + '</summary><p>' + answer + '</p></details>'
).join('');
const baseTiles=[['dishwasher','Kitchen & bathrooms'],['carpet','Floors & surfaces'],['oven','First oven, inside & out'],['glass','Internal windows & tracks']];
document.querySelector('#scopeIcons').innerHTML=baseTiles.map(([id,title])=>`<div class="scope-tile">${icon(id)}<strong>${title}</strong></div>`).join('');



new ResizeObserver(entries=>{const el=entries[0].target;el.style.setProperty('--estimate-height',el.getBoundingClientRect().height+'px')}).observe(document.querySelector('.estimate'));

// The final step is inline. Its sample choices stay in the current document.
const depositButton = document.querySelector('#previewDeposit');
const detailsPanel = document.querySelector('#contactDialog');
const visitSelects = [...detailsPanel.querySelectorAll('.visit-fields select')];
const staffVisit = document.createElement('dl');
staffVisit.className = 'staff-answer sample-arrangements';
staffVisit.hidden = true;
visitSelects.forEach((select, index) => {
  const term = document.createElement('dt');
  term.textContent = select.parentElement.firstChild.textContent;
  const answer = document.createElement('dd');
  const selected = select.options[[1, 1, 2, 3, 5][index]];
  answer.textContent = selected.text;
  const explanation = document.createElement('small');
  explanation.className = 'field-guide';
  explanation.textContent = selected.dataset.help;
  answer.append(explanation);
  staffVisit.append(term, answer);
  const guide = document.getElementById(select.getAttribute('aria-describedby'));
  const initial = guide.textContent;
  const updateGuide = () => { guide.textContent = select.selectedOptions[0].dataset.help || initial; };
  select.addEventListener('change', updateGuide);
  window.addEventListener('pageshow', updateGuide);
});
detailsPanel.querySelector('.visit-fields').append(staffVisit);
function resetPayment() {
  depositButton.disabled = false;
  document.querySelector('#depositStatus').textContent = '';
}
function applyMode() {
  const prefilled = detailsPanel.dataset.prefilled === 'true';
  detailsPanel.querySelectorAll('.customer-input, .visit-fields label').forEach(el => el.hidden = prefilled);
  detailsPanel.querySelectorAll('.staff-answer').forEach(el => el.hidden = !prefilled);
  resetPayment();
}

document.querySelector('[aria-describedby="help-condition"]').addEventListener('change', update);
detailsPanel.addEventListener('input', resetPayment);
const dateText = document.getElementById('sampleDate');
const datePicker = document.getElementById('datePicker');
datePicker.addEventListener('change', () => {
  if (datePicker.value) dateText.value = datePicker.value;
  resetPayment();
});
dateText.addEventListener('input', () => { datePicker.value = ''; });
depositButton.addEventListener('click', () => {
  if (detailsPanel.dataset.prefilled !== 'true') {
    for (const field of detailsPanel.querySelectorAll('[required]')) {
      if (!field.value.trim()) {
        document.querySelector('#depositStatus').textContent = 'Please complete the highlighted field.';
        field.focus();
        return;
      }
    }
  }
  const card = document.getElementById('demoCard');
  if (!card.value) {
    document.querySelector('#depositStatus').textContent = 'Choose a sample card to continue.';
    card.focus();
    return;
  }
  document.querySelector('#depositStatus').textContent = 'Demo ' + card.value + ' card confirmed. No funds held or charged.';
  depositButton.disabled = true;
});
const draftFields = [...detailsPanel.querySelectorAll('input, select, textarea')];
function draftKey(field) {
  return field.id || field.getAttribute('aria-describedby');
}
function saveDraft() {
  const draft = {};
  for (const field of draftFields) {
    draft[draftKey(field)] = field.type === 'checkbox' ? field.checked : field.value;
  }
  saveLocalPart('details', draft);
}
const draft = persisted.details;
if (draft && typeof draft === 'object') {
  for (const field of draftFields) {
    const value = draft[draftKey(field)];
    if (field.type === 'checkbox') field.checked = value === true;
    else if (typeof value === 'string') field.value = value;
  }
  update();
}
detailsPanel.addEventListener('input', saveDraft);
detailsPanel.addEventListener('change', saveDraft);
applyMode();
