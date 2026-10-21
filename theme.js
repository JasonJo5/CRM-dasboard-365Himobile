/* Light / Dark toggle for the 365 Himobile CRM. Adds one round button to the top bar.
   Remembers the choice in this browser. Does not touch any CRM data or function. */
(function(){
  var KEY='himobile_theme';
  var MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function read(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function write(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }
  function current(){ return document.documentElement.getAttribute('data-theme')==='dark' ? 'dark' : 'light'; }
  function paint(){
    var b=document.getElementById('themeToggle'); if(!b) return;
    var dark=current()==='dark';
    b.innerHTML = dark ? SUN : MOON;
    b.title = b.ariaLabel = dark ? 'Switch to light mode' : 'Switch to dark mode';
    b.setAttribute('aria-label', b.title);
  }
  function apply(t){ document.documentElement.setAttribute('data-theme',t); paint(); }
  function ensureButton(){
    if(document.getElementById('themeToggle')) return;
    var host=document.querySelector('.topbar-right'); if(!host) return;
    var b=document.createElement('button');
    b.id='themeToggle'; b.type='button'; b.className='theme-toggle';
    b.addEventListener('click',function(){ var t=current()==='dark'?'light':'dark'; write(t); apply(t); });
    host.insertBefore(b,host.firstChild);
    paint();
  }
  apply(read()==='dark' ? 'dark' : 'light');
  ensureButton();
  document.addEventListener('DOMContentLoaded',ensureButton);
  setInterval(ensureButton,1500);
})();

/* ===== Plan-length tag (3 months / 2 months / 1 month recharge) ===== */
(function(){
  var st=document.createElement('style');
  st.textContent='.plan-tag{display:inline-flex;align-items:center;margin-left:6px;padding:3px 11px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;vertical-align:middle}'+
  '.plan-tag.m3{background:#e3f6ec;color:#12804a}.plan-tag.m2{background:#e6eefc;color:#1f5bd8}.plan-tag.m1{background:#f1e8ff;color:#6d3fd1}.plan-tag.rc{background:#fff1e0;color:#b45f06}'+
  'html[data-theme="dark"] .plan-tag.m3{background:#12382a;color:#5fd69b}html[data-theme="dark"] .plan-tag.m2{background:#14284d;color:#7fa8ff}html[data-theme="dark"] .plan-tag.m1{background:#2b1d4d;color:#bfa0ff}html[data-theme="dark"] .plan-tag.rc{background:#3d2a12;color:#ffb561}';
  document.head.appendChild(st);
  function lab(s){
    if(!s||s.type!=='prepaid')return null;
    var d=Number(s.durationDays),n=null;
    if(d>=85&&d<=95)n=3;else if(d>=55&&d<=65)n=2;else if(d>=28&&d<=35)n=1;
    if(!n)return null;
    var rc=/recharge/i.test(s.changeReason||'');
    var t=n+(n>1?' months':' month');
    return rc?['rc','Recharge '+t]:['m'+n,t];}
  function install(){
    var o=window.serviceCardHtml;
    if(typeof o!=='function'||o.__planTag)return !!(o&&o.__planTag);
    var w=function(s,c){
      var h=o.apply(this,arguments);
      try{var r=lab(s);
        if(r)h=h.replace(/(<span class="pill [^"]*">[^<]*<\/span>)/,'$1<span class="plan-tag '+r[0]+'">'+r[1]+'</span>');
      }catch(e){}
      return h;};
    w.__planTag=true;window.serviceCardHtml=w;
    try{if(typeof renderPage==='function')renderPage();}catch(e){}
    return true;}
  if(!install()){var n=0,iv=setInterval(function(){if(install()||++n>40)clearInterval(iv);},250);}
})();

/* ===== Dashboard hero text + AI "Average stay by nationality" ===== */
(function(){
  var css=
  '#page-dashboard>.card:first-child .dash-hero-txt{position:relative;z-index:1;margin-bottom:18px;color:#fff}'+
  '.dash-hero-txt .dh-date{font-size:13px;opacity:.85}'+
  '.dash-hero-txt .dh-h{margin:6px 0 0;font-size:32px;line-height:1.2;font-weight:700;color:#fff}'+
  '.dash-hero-row{display:flex;gap:10px;align-items:center;position:relative;z-index:1}'+
  '.dash-hero-row .search-input{flex:1 1 auto;min-width:0}'+
  '.dash-hero-new{flex:0 0 auto;height:50px;padding:0 22px;border-radius:999px;border:0;background:#f26a21;color:#fff;font-weight:700;font-size:14px;cursor:pointer;transition:transform .2s,filter .2s}'+
  '.dash-hero-new:hover{transform:translateY(-2px);filter:brightness(1.06)}'+
  '#aiNatStay{margin-top:16px;padding:22px 24px}'+
  '#aiNatStay .ans-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px}'+
  '#aiNatStay .ans-title{font-size:16px;font-weight:700;color:var(--text,#14181f)}'+
  '#aiNatStay .ans-sub{font-size:12px;color:var(--text-soft,#6b7685);margin-top:2px}'+
  '#aiNatStay select{height:38px;padding:0 14px;border-radius:999px;border:1px solid var(--border,#e3e7ec);background:var(--card,#fff);color:var(--text,#14181f);font-size:13px}'+
  '.ans-row{display:grid;grid-template-columns:130px 1fr 90px;align-items:center;gap:14px;padding:7px 0;font-size:13px}'+
  '.ans-name{font-weight:600;color:var(--text,#14181f);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '.ans-track{height:12px;border-radius:999px;background:var(--gray-light,#eef1f5);overflow:hidden}'+
  '.ans-fill{height:100%;border-radius:999px;transition:width .7s cubic-bezier(.2,.8,.2,1)}'+
  '.ans-val{text-align:right;font-family:var(--mono,ui-monospace,monospace);color:var(--text-soft,#6b7685);font-size:12px}'+
  '@media(max-width:600px){.ans-row{grid-template-columns:90px 1fr 70px}.dash-hero-txt .dh-h{font-size:24px}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var COL=['#1f5bd8','#f26a21','#0b7a5e','#7c4dff','#d9a400','#c2385a','#2a8fd6','#6b7685'];
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
  function hero(){
    var d=document.getElementById('page-dashboard');if(!d||typeof DB==='undefined')return;
    var card=d.firstElementChild,inp=document.getElementById('dashQuickSearch');if(!card||!inp)return;
    var box=card.querySelector('.dash-hero-txt');
    if(!box){
      box=document.createElement('div');box.className='dash-hero-txt';
      box.innerHTML='<div class="dh-date"></div><h1 class="dh-h"></h1>';
      card.insertBefore(box,card.firstChild);
      var row=document.createElement('div');row.className='dash-hero-row';
      card.insertBefore(row,box.nextSibling);row.appendChild(inp);
      var nb=document.createElement('button');nb.type='button';nb.className='dash-hero-new';nb.textContent='+ New customer';
      nb.onclick=function(){var b=document.getElementById('btnNewCustomerTop');if(b)b.click();};
      row.appendChild(nb);
      var res=document.getElementById('dashQuickSearchResults');if(res)card.appendChild(res);
    }
    var pt=document.getElementById('pageTitle'),dt=document.querySelector('.page-sub,#pageSub');
    var g=(pt&&/Good|早|午|晚/.test(pt.textContent))?pt.textContent.trim():'';
    var n=(DB.customers||[]).length;
    box.querySelector('.dh-date').textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
    var h=box.querySelector('.dh-h');
    var html=(g?esc(g)+'.<br>':'')+n+' customers in your database.';
    if(h.innerHTML!==html)h.innerHTML=html;
  }
  function months(){
    var m={};(DB.customers||[]).forEach(function(c){var k=String(c.createdAt||'').slice(0,7);if(/^\d{4}-\d{2}$/.test(k))m[k]=1;});
    return Object.keys(m).sort().reverse();}
  function ai(){
    var host=document.getElementById('aiStayCards'),page=document.getElementById('page-ai');
    if(!host||!page||typeof DB==='undefined')return;
    var c=document.getElementById('aiNatStay');
    if(!c){
      c=document.createElement('div');c.id='aiNatStay';c.className='card';
      c.innerHTML='<div class="ans-head"><div><div class="ans-title">Average stay by nationality</div><div class="ans-sub">Expected years in Korea, from each customer record</div></div><select id="ansMonth" aria-label="Month"></select></div><div id="ansBars"></div>';
      host.insertAdjacentElement('afterend',c);
      c.querySelector('select').onchange=function(){draw(true);};
    }
    var sel=c.querySelector('select'),ms=months(),sig=ms.join(',');
    if(sel.getAttribute('data-sig')!==sig){
      var cur=sel.value;
      sel.innerHTML='<option value="">All months</option>'+ms.map(function(m){return'<option value="'+m+'">'+m+'</option>';}).join('');
      sel.value=cur;sel.setAttribute('data-sig',sig);}
    draw(false);
  }
  function draw(force){
    var c=document.getElementById('aiNatStay');if(!c)return;
    var mo=c.querySelector('select').value,agg={};
    (DB.customers||[]).forEach(function(x){
      if(mo&&String(x.createdAt||'').slice(0,7)!==mo)return;
      var y=parseFloat(x.years);if(!(y>0))return;
      var k=(x.nationality||'').trim();if(!k)return;
      var a=agg[k]||(agg[k]={s:0,n:0});a.s+=y;a.n++;});
    var rows=Object.keys(agg).map(function(k){return{k:k,n:agg[k].n,v:agg[k].s/agg[k].n};})
      .sort(function(a,b){return b.n-a.n;}).slice(0,8);
    var max=Math.max.apply(null,rows.map(function(r){return r.v;}).concat([0.1]));
    var sig=mo+'|'+rows.map(function(r){return r.k+r.n+r.v.toFixed(2);}).join();
    var bars=document.getElementById('ansBars');
    if(!force&&bars.getAttribute('data-sig')===sig)return;
    bars.setAttribute('data-sig',sig);
    bars.innerHTML=rows.length?rows.map(function(r,i){
      return'<div class="ans-row"><span class="ans-name">'+esc(r.k)+'</span><span class="ans-track"><span class="ans-fill" style="display:block;width:0;background:'+COL[i%COL.length]+'" data-w="'+(r.v/max*100).toFixed(1)+'"></span></span><span class="ans-val">'+r.v.toFixed(1)+' yrs · '+r.n+'</span></div>';}).join('')
      :'<div class="ans-sub">No data for this month.</div>';
    requestAnimationFrame(function(){requestAnimationFrame(function(){bars.querySelectorAll('.ans-fill').forEach(function(f){f.style.width=f.getAttribute('data-w')+'%';});});});
  }
  function tick(){try{hero();var p=document.getElementById('page-ai');if(p&&p.classList.contains('active'))ai();}catch(e){}}
  setInterval(tick,1200);setTimeout(tick,300);
})();
