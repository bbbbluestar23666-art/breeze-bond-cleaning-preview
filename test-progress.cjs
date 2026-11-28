const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const app=fs.readFileSync('dist/app.js','utf8');
const css=fs.readFileSync('dist/style.css','utf8');
const regions=[
  html.slice(html.indexOf('<section id="quote"'),html.indexOf('<section id="ready"')),
  html.slice(html.indexOf('<section id="ready"'),html.indexOf('<dialog id="contactDialog"')),
  html.slice(html.indexOf('<dialog id="contactDialog"'),html.indexOf('<dialog id="reviewDialog"'))
];
const messages=[
  /2 steps ahead, 1 optional[\s\S]*estimate is visible now[\s\S]*No contact details needed[\s\S]*Next: the optional preparation check/,
  /1 step after this[\s\S]*Next: your details[\s\S]*or skip it; your estimate stays the same/,
  /Final step[\s\S]*No more steps[\s\S]*Nothing is sent in this preview/
];
for(const [index,region] of regions.entries()){
  const stage=index+1;
  assert.equal([...region.matchAll(/data-quote-step="(\d)"/g)].map(m=>+m[1]).join(','),''+stage);
  assert.match(region,new RegExp('Step '+stage+' of 3'));
  assert.match(region,messages[index]);
  const list=region.match(/<ol class="quote-stage-list"[^>]*>(.*?)<\/ol>/s)[1];
  const items=[...list.matchAll(/<li([^>]*)>(.*?)<\/li>/gs)];
  assert.equal(items.length,3);
  assert.deepEqual(items.map(([,attrs])=>attrs.includes('aria-current="step"')),[1,2,3].map(n=>n===stage));
  assert.match(items[1][2],/Optional/);
}
assert.match(regions[0],/id="total"[\s\S]*contact-next" href="#ready"/);
assert.match(regions[1],/id="skipReadiness" data-open-contact/);
assert.match(regions[2],/id="closeContact"/);
assert.match(regions[2],/No photos needed now/);
assert.match(app,/contactTrigger\?\.focus\(\{preventScroll:true\}\)/);
assert.match(css,/@container[^{}]*\{\.quote-stage-list\{grid-template-columns:minmax\(0,1fr\)/);
console.log('3 progress markers, correct current step, optional skip, immediate estimate, preview details, focus return and narrow layout contracts passed');
