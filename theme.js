/* Chinese / English helper shared by the blocks below (follows the CRM's own language switch) */
(function(){
  var Z={'+ New customer':'+ 新增客户','Average stay by nationality':'各国籍平均停留时间','Expected years in Korea, from each customer record':'按每位客户记录的预计在韩年数','All months':'全部月份','No data for this month.':'本月暂无数据。','yrs':'年',
  'Switch to light mode':'切换到浅色模式','Switch to dark mode':'切换到深色模式','Active subscription':'当前订阅','Plan info':'套餐信息','Plan history':'套餐历史','Income':'收入','Show':'展开','Hide':'收起','More':'更多','Less':'收起',
  'Company':'公司','Carrier type':'运营商类型','Plan length':'套餐时长','Nationality':'国籍','Used':'已使用','Print':'打印','Copy phone number':'复制电话号码','Phone number copied':'电话号码已复制',
  'plan price':'套餐价','monthly discount':'每月优惠','Not accepted: customer is under 19':'不予受理：客户未满19岁','Month':'月份','Previous plan':'上一个套餐'};
  function zh(){try{return LANG==='zh';}catch(e){return false;}}
  window.__zh=zh;
  window.__T=function(s){return zh()&&Z[s]?Z[s]:s;};
})();

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
    b.title = b.ariaLabel = __T(dark ? 'Switch to light mode' : 'Switch to dark mode');
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
    var pr=Number(s.sellingPrice!=null?s.sellingPrice:s.price);
    var cn='';try{cn=((getCustomer(s.customerId)||{}).name||'').toUpperCase();}catch(e){}
    var rc=n===1&&(/recharge/i.test(s.changeReason||'')||((pr===36000||pr===36300)&&cn.indexOf('SAFARBAYEV BERIK')<0));
    var t=__zh()?n+'个月':n+(n>1?' months':' month');
    return rc?['rc',__zh()?'充值'+t:'Recharge '+t]:['m'+n,t];}
  window.__planLab=lab;
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
      var nb=document.createElement('button');nb.type='button';nb.className='dash-hero-new';nb.textContent=__T('+ New customer');
      nb.onclick=function(){var b=document.getElementById('btnNewCustomerTop');if(b)b.click();};
      row.appendChild(nb);
      var res=document.getElementById('dashQuickSearchResults');if(res)card.appendChild(res);
    }
    var pt=document.getElementById('pageTitle'),dt=document.querySelector('.page-sub,#pageSub');
    var g=(pt&&/Good|早|午|晚/.test(pt.textContent))?pt.textContent.trim():'';
    var n=(DB.customers||[]).length;
    var dd=box.querySelector('.dh-date'),dtx=new Date().toLocaleDateString(__zh()?'zh-CN':'en-GB',{weekday:'long',day:'numeric',month:'long'});if(dd.textContent!==dtx)dd.textContent=dtx;
    var h=box.querySelector('.dh-h');
    var html=(g?esc(g)+(__zh()?'。':'.')+'<br>':'')+(__zh()?'数据库中共有 '+n+' 位客户。':n+' customers in your database.');
    var nbb=card.querySelector('.dash-hero-new');if(nbb&&nbb.textContent!==__T('+ New customer'))nbb.textContent=__T('+ New customer');
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
      c.innerHTML='<div class="ans-head"><div><div class="ans-title"></div><div class="ans-sub"></div></div><select id="ansMonth"></select></div><div id="ansBars"></div>';
      host.insertAdjacentElement('afterend',c);
      c.querySelector('select').onchange=function(){draw(true);};
    }
    c.querySelector('.ans-title').textContent=__T('Average stay by nationality');c.querySelector('.ans-sub').textContent=__T('Expected years in Korea, from each customer record');c.querySelector('select').setAttribute('aria-label',__T('Month'));
    var sel=c.querySelector('select'),ms=months(),sig=ms.join(',')+'|'+(__zh()?'z':'e');
    if(sel.getAttribute('data-sig')!==sig){
      var cur=sel.value;
      sel.innerHTML='<option value="">'+__T('All months')+'</option>'+ms.map(function(m){return'<option value="'+m+'">'+m+'</option>';}).join('');
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
    var sig=(__zh()?'z':'e')+mo+'|'+rows.map(function(r){return r.k+r.n+r.v.toFixed(2);}).join();
    var bars=document.getElementById('ansBars');
    if(!force&&bars.getAttribute('data-sig')===sig)return;
    bars.setAttribute('data-sig',sig);
    bars.innerHTML=rows.length?rows.map(function(r,i){
      return'<div class="ans-row"><span class="ans-name">'+esc(r.k)+'</span><span class="ans-track"><span class="ans-fill" style="display:block;width:0;background:'+COL[i%COL.length]+'" data-w="'+(r.v/max*100).toFixed(1)+'"></span></span><span class="ans-val">'+r.v.toFixed(1)+' '+__T('yrs')+' · '+r.n+'</span></div>';}).join('')
      :'<div class="ans-sub">'+__T('No data for this month.')+'</div>';
    requestAnimationFrame(function(){requestAnimationFrame(function(){bars.querySelectorAll('.ans-fill').forEach(function(f){f.style.width=f.getAttribute('data-w')+'%';});});});
  }
  function tick(){if(document.hidden)return;try{hero();var p=document.getElementById('page-ai');if(p&&p.classList.contains('active'))ai();}catch(e){}}
  setInterval(tick,1200);setTimeout(tick,300);
})();

/* ===== Smooth custom dropdown (replaces the harsh native option list) ===== */
(function(){
  var css=
  '.csel-menu{position:fixed;z-index:100000;min-width:160px;max-height:320px;overflow:auto;padding:6px;border-radius:16px;background:var(--card,#fff);border:1px solid var(--border,#e3e7ec);box-shadow:0 18px 48px rgba(10,20,50,.18);transform-origin:top left;animation:cselIn .16s cubic-bezier(.2,.8,.2,1) both;font-family:inherit}'+
  '@keyframes cselIn{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}'+
  '.csel-opt{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:40px;padding:0 14px;border-radius:11px;font-size:14.5px;font-weight:500;color:var(--text,#14181f);cursor:pointer;white-space:nowrap;transition:background .12s}'+
  '.csel-opt:hover,.csel-opt.hl{background:var(--blue-light,#e6edfb)}'+
  '.csel-opt.sel{color:var(--blue,#1f5bd8);font-weight:700}'+
  '.csel-opt.sel::after{content:"";width:14px;height:14px;flex:0 0 14px;background:no-repeat center/contain url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%231f5bd8%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M5 12l5 5L20 7%27/%3E%3C/svg%3E")}'+
  '.csel-opt.dis{opacity:.4;pointer-events:none}'+
  '.csel-sep{padding:8px 14px 4px;font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-soft,#6b7685)}'+
  'html[data-theme="dark"] .csel-menu{box-shadow:0 18px 48px rgba(0,0,0,.5)}'+
  'html[data-theme="dark"] .csel-opt.sel{color:#8db0ff}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var menu=null,cur=null,items=[],hl=-1;
  function close(){if(menu){menu.remove();menu=null;}if(cur){cur.removeAttribute('data-csel-open');cur=null;}items=[];hl=-1;}
  function pick(i){
    var o=items[i];if(!o||!cur)return;var sel=cur;
    sel.selectedIndex=o.idx;
    sel.dispatchEvent(new Event('input',{bubbles:true}));
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    close();try{sel.focus();}catch(e){}
  }
  function setHl(n){
    if(!items.length)return;hl=(n+items.length)%items.length;
    items.forEach(function(o,i){o.el.classList.toggle('hl',i===hl);});
    items[hl].el.scrollIntoView({block:'nearest'});
  }
  function open(sel){
    close();cur=sel;sel.setAttribute('data-csel-open','1');
    menu=document.createElement('div');menu.className='csel-menu';menu.setAttribute('role','listbox');
    var idx=0;
    Array.prototype.forEach.call(sel.children,function(ch){
      var opts=ch.tagName==='OPTGROUP'?ch.children:[ch];
      if(ch.tagName==='OPTGROUP'){var g=document.createElement('div');g.className='csel-sep';g.textContent=ch.label;menu.appendChild(g);}
      Array.prototype.forEach.call(opts,function(op){
        if(op.tagName!=='OPTION')return;
        var el=document.createElement('div');el.className='csel-opt'+(op.index===sel.selectedIndex?' sel':'')+(op.disabled?' dis':'');
        el.setAttribute('role','option');
        var tx=document.createElement('span');tx.textContent=op.textContent;el.appendChild(tx);
        var k=items.length;items.push({el:el,idx:op.index});
        el.addEventListener('mousedown',function(e){e.preventDefault();});
        el.addEventListener('click',function(e){e.stopPropagation();pick(k);});
        el.addEventListener('mouseenter',function(){setHl(k);});
        menu.appendChild(el);
      });
    });
    document.body.appendChild(menu);
    var r=sel.getBoundingClientRect(),mw=Math.max(r.width,160);
    menu.style.minWidth=mw+'px';
    var mh=Math.min(menu.scrollHeight,320),below=window.innerHeight-r.bottom-12;
    var top=below>=mh||below>r.top?r.bottom+6:Math.max(8,r.top-mh-6);
    var left=Math.min(r.left,window.innerWidth-menu.offsetWidth-12);
    menu.style.top=top+'px';menu.style.left=Math.max(8,left)+'px';
    var s=items.findIndex(function(o){return o.idx===sel.selectedIndex;});setHl(s<0?0:s);
    var se=items[s<0?0:s];if(se)se.el.scrollIntoView({block:'nearest'});
  }
  function ok(t){return t&&t.tagName==='SELECT'&&!t.multiple&&!t.disabled&&!(t.size>1)&&!t.hasAttribute('data-native');}
  document.addEventListener('mousedown',function(e){
    var t=e.target;
    if(menu&&!menu.contains(t)&&t!==cur){close();if(!ok(t))return;}
    if(ok(t)){e.preventDefault();if(cur===t){close();}else{t.focus();open(t);}}
  },true);
  document.addEventListener('keydown',function(e){
    var t=e.target;
    if(menu){
      if(e.key==='Escape'){e.preventDefault();close();}
      else if(e.key==='ArrowDown'){e.preventDefault();setHl(hl+1);}
      else if(e.key==='ArrowUp'){e.preventDefault();setHl(hl-1);}
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(hl);}
      else if(e.key==='Tab'){close();}
      return;}
    if(ok(t)&&(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();open(t);}
  },true);
  window.addEventListener('resize',close);
  document.addEventListener('scroll',function(e){if(menu&&!menu.contains(e.target))close();},true);
})();

/* ===== New customer profile: card layout, copy phone, print for all prepaid, under-19 rule ===== */
(function(){
  var ICON={
    sub:'<path d="M8 3h7l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM10 12h6M10 16h6M13 9v10"/>',
    list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    hist:'<path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>',
    cash:'<path d="M12 6v12M9 9.5c0-1 1-1.8 3-1.8s3 .8 3 1.8-1 1.5-3 2-3 1-3 2 1 1.8 3 1.8 3-.8 3-1.8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>',
    user:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"/>',
    ai:'<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    warn:'<path d="M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'
  };
  function svg(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[n]+'</svg>';}
  function title(txt,ic,cls){var d=document.createElement('div');d.className='pf-title';d.innerHTML='<span class="pf-ib '+(cls||'')+'">'+svg(ic)+'</span><span></span>';d.lastChild.textContent=txt;return d;}
  function card(extra){var c=document.createElement('section');c.className='pf-card'+(extra?' '+extra:'');return c;}
  function tt(e){return (e&&e.textContent||'').trim();}
  function say(m){try{if(typeof toast==='function'){toast(m);return;}}catch(e){}}
  function copyTxt(t,m){
    function ok(){say(m||'Copied');}
    try{navigator.clipboard.writeText(t).then(ok,function(){fb();});}catch(e){fb();}
    function fb(){var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok();}catch(e){}a.remove();}
  }
  function addCopy(root){
    root.querySelectorAll('.kv-grid>div').forEach(function(r){
      var k=r.querySelector('.k'),v=r.querySelector('.v');
      if(!k||!v||v.querySelector('.pf-copy'))return;
      if(!/^phone number$|^电话/i.test(tt(k)))return;
      var num=tt(v);if(!num||num==='—')return;
      var b=document.createElement('button');b.type='button';b.className='pf-copy';b.title=__T('Copy phone number');b.setAttribute('aria-label',__T('Copy phone number'));b.innerHTML=svg('copy');
      b.addEventListener('click',function(e){e.stopPropagation();copyTxt(num,__T('Phone number copied'));});
      v.appendChild(b);
    });
  }
  function canon(l){l=String(l||'').trim().toLowerCase();
    if(/^(phone number|电话号码|联系电话)$/.test(l))return 'phone';
    if(/date of birth|出生日期/.test(l))return 'dob';
    if(/^(가입회사 )?company$/.test(l))return 'company';
    if(/carrier type$/.test(l))return 'carrier';
    if(/^(subscription|subscription type|开通方式)$/.test(l))return 'subscription';
    if(/years in korea|在韩年数/.test(l))return 'years';
    if(/used days|已使用天数/.test(l))return 'used';
    if(/id expiry|证件有效期/.test(l))return 'idexpiry';
    if(/^(nationality|国籍)$/.test(l))return 'nationality';
    return l;}
  function rowVal(root,name){var out='';root.querySelectorAll('.kv-grid>div').forEach(function(r){var k=r.querySelector('.k');if(k&&canon(tt(k))===name)out=tt(r.querySelector('.v'));});return out;}
  function custId(body){var b=body.querySelector('[data-copy-name]');return b?b.getAttribute('data-copy-name'):null;}
  var BI={
    btnRecharge:'<rect x="3" y="8" width="16" height="8" rx="2"/><path d="M21 11v2M10 10l-2 2h4l-2 2"/>',
    btnChangeToPostpaid:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    btnChangePlan:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    btnChangeToPrepaid:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    btnFreezeSim:'<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
    btnUnfreezeSim:'<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
    btnCancelSub:'<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    btnRequestIdChange:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h4M7 14h6M15 10h2"/>',
    btnStartNewSub:'<path d="M12 5v14M5 12h14"/>',
    btnUndoCancel:'<path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3"/>',
    btnPrintIdChange:'<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/>',
    btnCompleteIdChange:'<path d="M5 12l5 5 9-10"/>',
    btnMergeFromProfile:'<path d="M6 4v6a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v2M18 4v6"/>',
    print:'<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/>'
  };
  function iconize(root){
    root.querySelectorAll('button.btn').forEach(function(b){
      if(b.dataset.pfi||b.classList.contains('pf-more')||b.querySelector('svg'))return;
      var key=b.id&&BI[b.id]?b.id:(b.hasAttribute('data-print-service')?'print':null);
      var t=b.textContent.replace(/^[^\p{L}\p{N}+＋]+/u,'').trim();
      b.dataset.pfi='1';b.textContent='';
      if(key){var sp=document.createElement('span');sp.className='pf-bi';sp.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+BI[key]+'</svg>';b.appendChild(sp);}
      b.appendChild(document.createTextNode(t));
    });
  }
  function enhance(body){
    if(body.dataset.pf==='1')return;
    var kids=[].slice.call(body.children);
    var head=kids.filter(function(x){return x.classList.contains('profile-head');})[0];
    var grid=kids.filter(function(x){return x.classList.contains('kv-grid');})[0];
    var active=document.getElementById('detailActiveSub');
    var hist=document.getElementById('detailHistory');
    if(!head||!grid||!active||!hist||active.parentNode!==body)return;
    var idxA=kids.indexOf(active),sh=kids[idxA-1];
    var titles=kids.filter(function(x){return x.classList.contains('section-title');});
    var hTitle=titles.filter(function(x){return x!==(sh&&sh.querySelector&&sh.querySelector('.section-title'))&&x.parentNode===body&&kids.indexOf(x)>idxA;})[0];
    var ai=kids.filter(function(x){return x.classList.contains('service-card')&&kids.indexOf(x)>kids.indexOf(hist);})[0];
    var frag=[];kids.forEach(function(x){if(x===head||x===grid||x===active||x===sh||x===hist||x===hTitle||x===ai||x.classList.contains('form-hr'))return;frag.push(x);});
    body.dataset.pf='1';body.classList.add('pf');
    var cid=custId(body);
    var cust=null;try{cust=DB.customers.find(function(c){return c.id===cid;});}catch(e){}
    var svcs=[];try{svcs=DB.services.filter(function(s){return s.customerId===cid;});}catch(e){}
    var activeSvc=svcs.filter(function(s){return s.isActive;})[0]||null;
    var planSub=null,incSub=null,monSub=null;
    [].slice.call(active.querySelectorAll('.profile-subcard')).forEach(function(p,i){if(i===0&&p.querySelector('.kv-grid'))planSub=p;else if(/fff8e8/i.test(p.getAttribute('style')||''))monSub=p;else incSub=p;});
    var planCard=null,incCard=null;var ptl=planSub&&planSub.querySelector('.profile-subcard-title'),planTitle=(ptl&&tt(ptl))||__T('Plan info');
    if(planSub){planCard=card();planCard.appendChild(title(planTitle,'list'));planCard.appendChild(planSub);}
    if(monSub&&activeSvc&&activeSvc.type==='postpaid'){
      var fee=Number(activeSvc.monthlyFee)||0,dis=Number(activeSvc.discountPerMonth)||0;
      var amt=monSub.children[1];
      if(amt&&dis>0&&fee>0){
        var f=function(n){return '₩'+Math.max(0,Math.round(n)).toLocaleString('en-US');};
        amt.textContent=f(fee-dis);
        var note=document.createElement('div');note.className='muted';note.style.cssText='font-size:12.5px;margin-top:2px;font-weight:600;';note.textContent=f(fee)+' '+__T('plan price')+' − '+f(dis)+' '+__T('monthly discount');
        amt.insertAdjacentElement('afterend',note);
      }
    }
    if(incSub||monSub){
      incCard=card('pf-income');incCard.appendChild(title(__T('Income'),'cash','g'));
      if(monSub){monSub.classList.add('pf-sub','pf-monthly');incCard.appendChild(monSub);}
      if(incSub){incSub.classList.add('pf-sub','pf-store');incCard.appendChild(incSub);}
    }
    /* tiles */
    var pt=active.querySelector('.plan-tag');
    var company=planCard?rowVal(planCard,'company'):'',carrier=planCard?rowVal(planCard,'carrier'):'';
    if((company||carrier||pt)){
      var tiles=document.createElement('div');tiles.className='pf-tiles';
      function tile(k,v,cls){var t=document.createElement('div');t.className='pf-tile'+(cls?' '+cls:'');var b=document.createElement('b');b.textContent=k;var s=document.createElement('span');s.textContent=v;t.appendChild(b);t.appendChild(s);tiles.appendChild(t);}
      if(company)tile(__T('Company'),company);
      if(carrier)tile(__T('Carrier type'),carrier);
      if(pt){var m=(pt.className.match(/\b(m[123]|rc)\b/)||[])[1];tile(__T('Plan length'),tt(pt),m);}
      var pb=active.querySelector('.progress-bar');
      var startRow=pb&&pb.previousElementSibling;
      if(startRow&&startRow.parentNode)startRow.parentNode.insertBefore(tiles,startRow);
    }
    /* recharge customers: show which plan they used before */
    if(activeSvc&&activeSvc.type==='prepaid'&&window.__planLab){
      var cl=window.__planLab(activeSvc);
      if(cl&&cl[0]==='rc'){
        var prevS=svcs.filter(function(x){return x.type==='prepaid'&&x.id!==activeSvc.id&&String(x.activationDate||'')<=String(activeSvc.activationDate||'9999');})
          .sort(function(a,b){return String(b.activationDate||'').localeCompare(String(a.activationDate||''));})[0];
        if(prevS){
          var pl=window.__planLab(prevS);
          var fmt=function(x){try{return new Date(x+'T00:00:00').toLocaleDateString(__zh()?'zh-CN':'en-US',{month:'short',day:'numeric',year:'numeric'});}catch(e){return x||'';}};
          var pv=document.createElement('div');pv.className='pf-prev';
          pv.innerHTML='<span class="pf-prev-k"></span><span class="pf-prev-v"></span>';
          pv.firstChild.textContent=__T('Previous plan');
          pv.lastChild.textContent=(pl?pl[1]:(prevS.durationDays+' days'))+(prevS.plan?' · '+prevS.plan:'')+' · '+fmt(prevS.activationDate)+' → '+fmt(prevS.endedAt||prevS.expiryDate);
          var tl=active.querySelector('.pf-tiles');if(tl)tl.insertAdjacentElement('afterend',pv);
        }
      }
    }
    /* active card */
    var aCard=card();aCard.appendChild(title(__T('Active subscription'),'sub'));
    if(sh){sh.classList.add('section-head');aCard.appendChild(active);aCard.appendChild(sh);}else aCard.appendChild(active);
    /* action buttons: first three visible, the rest under "More" */
    if(sh){var br=sh.querySelector('.btn')&&sh.querySelector('.btn').parentElement;
      if(br){var bs=[].slice.call(br.children).filter(function(x){return x.classList.contains('btn');});
        if(bs.length>3){var rest=bs.slice(3);var wrapR=document.createElement('div');wrapR.className='pf-rest';wrapR.style.display='none';
          rest.forEach(function(x){wrapR.appendChild(x);});
          var mb=document.createElement('button');mb.type='button';mb.className='btn btn-ghost pf-more';mb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="width:16px;height:16px"><path d="M5 12h.01M12 12h.01M19 12h.01"/></svg><span>'+__T('More')+'</span>';
          mb.addEventListener('click',function(){var o=wrapR.style.display==='none';wrapR.style.display=o?'flex':'none';mb.querySelector('span').textContent=__T(o?'Less':'More');});
          br.appendChild(mb);br.insertAdjacentElement('afterend',wrapR);}}}
    /* print for every prepaid (old members too) */
    if(activeSvc&&activeSvc.type==='prepaid'&&!active.querySelector('[data-print-service]')){
      var pbtn=document.createElement('button');pbtn.className='btn btn-sm btn-ghost';pbtn.setAttribute('data-print-service',activeSvc.id);pbtn.textContent='🖨 '+__T('Print');pbtn.style.marginLeft='8px';
      pbtn.addEventListener('click',function(){quickPrintService(cid,activeSvc.id);});
      var pill=active.querySelector('.service-card-head .pill');if(pill&&pill.parentNode)pill.parentNode.appendChild(pbtn);
    }
    /* history */
    var hCard=card(),hRow=document.createElement('div');hRow.className='pf-head-row';
    var n=[].slice.call(hist.children).filter(function(x){return !x.classList.contains('muted');}).length;
    var ht=title(__T('Plan history')+' ('+n+')','hist');ht.style.margin='0';
    var link=document.createElement('span');link.className='pf-link';link.textContent=__T('Show');
    hRow.appendChild(ht);hRow.appendChild(link);hCard.appendChild(hRow);
    hist.classList.add('pf-hist-body');var openH=n>0&&n<=3;hist.style.display=openH?'':'none';if(openH)link.textContent=__T('Hide');hCard.appendChild(hist);
    hRow.addEventListener('click',function(){var o=hist.style.display==='none';hist.style.display=o?'':'none';link.textContent=__T(o?'Hide':'Show');});
    if(!n){link.textContent='';hRow.style.cursor='default';}
    /* print on ended prepaid in history */
    svcs.filter(function(s){return s.type==='prepaid'&&!s.isActive;}).forEach(function(s){
      var dt='';try{dt=new Date(s.activationDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}catch(e){}
      [].slice.call(hist.children).some(function(h){
        if(h.querySelector('[data-print-service]')||h.dataset.pfp)return false;
        var tx=h.textContent;
        if((s.number&&tx.indexOf(s.number)>-1)&&(!dt||tx.indexOf(dt)>-1)){
          h.dataset.pfp='1';
          var b=document.createElement('button');b.className='btn btn-sm btn-ghost';b.setAttribute('data-print-service',s.id);b.textContent='🖨 '+__T('Print');b.style.marginTop='8px';
          b.addEventListener('click',function(){quickPrintService(cid,s.id);});h.appendChild(b);return true;}
        return false;});
    });
    /* customer */
    /* one merged "Plan info" card: key rows first, everything else under "Show all details" */
    var cCard=null;
    if(!planCard){planCard=card();planCard.appendChild(title(planTitle,'list'));}
    var norm=function(k){return canon(k);};
    var pool={},order=[];
    [planSub&&planSub.querySelector('.kv-grid'),grid].forEach(function(g){if(!g)return;[].slice.call(g.children).forEach(function(r){var k=r.querySelector('.k');if(!k)return;var key=norm(tt(k));if(key==='idexpiry'||key==='used'){if(key==='used'&&!pool.__used)pool.__used=tt(r.querySelector('.v'));return;}var nv=tt(r.querySelector('.v'));if(!pool[key]){pool[key]=r;order.push(key);}else if(/^(—|-|)$/.test(tt(pool[key].querySelector('.v')))&&!/^(—|-|)$/.test(nv)){pool[key]=r;}});});
    var KEY=['phone','dob','company','carrier','subscription','years'];
    var mg=document.createElement('div');mg.className='kv-grid';
    var extraRows=[];
    KEY.forEach(function(k){if(pool[k])mg.appendChild(pool[k]);});
    if(cust&&cust.nationality&&!pool.nationality){var nr=document.createElement('div');nr.innerHTML='<div class="k"></div><div class="v"></div>';nr.firstChild.textContent=__T('Nationality');nr.lastChild.textContent=cust.nationality;mg.appendChild(nr);extraRows.push(nr);}
    order.forEach(function(k){if(KEY.indexOf(k)>-1)return;if(k==='nationality'){mg.appendChild(pool[k]);extraRows.push(pool[k]);return;}mg.appendChild(pool[k]);extraRows.push(pool[k]);});
    if(planSub){var og=planSub.querySelector('.kv-grid');if(og)og.replaceWith(mg);else planSub.appendChild(mg);}else planCard.appendChild(mg);
    if(extraRows.length){
      extraRows.forEach(function(r){r.style.display='none';});
      var tg=document.createElement('button');tg.type='button';tg.className='btn btn-sm btn-ghost pf-toggle';tg.textContent=__T('More');
      var open=false;tg.addEventListener('click',function(){open=!open;extraRows.forEach(function(r){r.style.display=open?'':'none';});tg.textContent=__T(open?'Less':'More');});
      planCard.appendChild(tg);
    }
    if(pool.__used){var rem=active.querySelector('.progress-bar');rem=rem&&rem.nextElementSibling;if(rem)rem.textContent=rem.textContent.trim()+' · '+__T('Used')+' '+pool.__used;}
    addCopy(planCard);
    /* ai */
    var aiCard=null;
    if(ai){aiCard=card('pf-ai');var t=ai.querySelector('.service-card-head>div');if(t&&/✨/.test(tt(t))){t.textContent=t.textContent.replace('✨','').trim();t.className='pf-title';t.innerHTML='<span class="pf-ib o">'+svg('ai')+'</span><span>'+t.textContent+'</span>';}aiCard.appendChild(ai);}
    /* rebuild */
    while(body.firstChild)body.removeChild(body.firstChild);
    body.appendChild(head);
    frag.forEach(function(x){body.appendChild(x);});
    [aCard,planCard,hCard,incCard,aiCard].forEach(function(c){if(c)body.appendChild(c);});
    iconize(body);
  }
  function watch(){
    var body=document.getElementById('detailBody');
    if(!body||body.__pfw)return !!body;
    body.__pfw=true;
    var mo=new MutationObserver(function(){
      if(!body.querySelector(':scope>.profile-head'))return;
      mo.disconnect();
      try{body.classList.remove('pf');delete body.dataset.pf;enhance(body);}catch(e){console.error('profile layer',e);}
      mo.observe(body,{childList:true});
    });
    mo.observe(body,{childList:true});
    return true;
  }
  var tries=0,iv=setInterval(function(){if(watch()||++tries>60)clearInterval(iv);},250);
  /* ---- Information change: only customers who are 19 or older ---- */
  function ageOk(){
    try{var c=getCustomer(idChangeCustomerId);var a=c?calcAge(c.dob):null;return {age:a,ok:(a===null||a>=19)};}catch(e){return {age:null,ok:true};}
  }
  function warn(){
    var inp=document.getElementById('idc_arcNumber');if(!inp)return false;
    var w=document.getElementById('idc_ageWarn'),r=ageOk(),bad=!!inp.value.trim()&&!r.ok;
    if(bad){
      if(!w){w=document.createElement('div');w.id='idc_ageWarn';w.setAttribute('role','alert');inp.insertAdjacentElement('afterend',w);}
      w.innerHTML=svg('warn')+'<span></span>';w.lastChild.textContent=__zh()?'客户 '+r.age+' 岁。仅年满19岁方可办理变更为外国人登记证（ARC）。':'Customer is '+r.age+' years old. An Information change to a Resident Card (ARC) is only accepted from age 19.';
      inp.style.borderColor='var(--red)';
    }else{if(w)w.remove();inp.style.borderColor='';}
    return bad;
  }
  document.addEventListener('input',function(e){if(e.target&&e.target.id==='idc_arcNumber')warn();},true);
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('#idChangeModalSave,#idChangeModalSavePrint');
    if(b&&warn()){e.stopImmediatePropagation();e.preventDefault();say(__T('Not accepted: customer is under 19'));}
  },true);
})();

/* ===== Smooth custom date picker (replaces the browser's harsh native calendar) ===== */
(function(){
  var pop=null,cur=null,vy=0,vm=0;
  function zhL(){try{return LANG;}catch(e){return 'en';}}
  function loc(){var l=zhL();return l==='zh'?'zh-CN':l==='ko'?'ko-KR':'en-US';}
  function pad(n){return (n<10?'0':'')+n;}
  function iso(y,m,d){return y+'-'+pad(m+1)+'-'+pad(d);}
  function ok(t){return t&&t.tagName==='INPUT'&&t.type==='date'&&!t.disabled&&!t.readOnly&&!t.hasAttribute('data-native');}
  function close(){if(pop){pop.remove();pop=null;}cur=null;}
  function setVal(v){
    if(!cur)return;var i=cur;i.value=v;
    i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function render(){
    if(!pop||!cur)return;
    var L=loc(),first=new Date(vy,vm,1),startDow=first.getDay(),days=new Date(vy,vm+1,0).getDate();
    var sel=cur.value,today=new Date(),ts=iso(today.getFullYear(),today.getMonth(),today.getDate());
    var title=new Intl.DateTimeFormat(L,{year:'numeric',month:'long'}).format(first);
    var wd=[];for(var i=0;i<7;i++){wd.push(new Intl.DateTimeFormat(L,{weekday:'short'}).format(new Date(2023,0,1+i)));}
    var h='<div class="dp-head"><button type="button" class="dp-nav" data-dp="-1" aria-label="Previous month">&#8249;</button><button type="button" class="dp-title" data-dp="ym"></button><button type="button" class="dp-nav" data-dp="1" aria-label="Next month">&#8250;</button></div><div class="dp-grid">';
    wd.forEach(function(w){h+='<span class="dp-wd">'+w+'</span>';});
    for(var b=0;b<startDow;b++)h+='<span></span>';
    for(var d=1;d<=days;d++){
      var s=iso(vy,vm,d),dis=(cur.min&&s<cur.min)||(cur.max&&s>cur.max);
      h+='<button type="button" class="dp-day'+(s===sel?' sel':'')+(s===ts?' today':'')+'"'+(dis?' disabled':'')+' data-d="'+s+'">'+d+'</button>';
    }
    var zh=L==='zh-CN',ko=L==='ko-KR';
    h+='</div><div class="dp-foot"><button type="button" class="dp-link" data-dp="today">'+(zh?'今天':ko?'오늘':'Today')+'</button>'+(cur.required?'':'<button type="button" class="dp-link" data-dp="clear">'+(zh?'清除':ko?'지우기':'Clear')+'</button>')+'</div>';
    pop.innerHTML=h;pop.querySelector('.dp-title').textContent=title;
  }
  function place(){
    var r=cur.getBoundingClientRect(),w=pop.offsetWidth||288,h=pop.offsetHeight||320;
    var below=window.innerHeight-r.bottom-12,top=below>=h||below>r.top?r.bottom+6:Math.max(8,r.top-h-6);
    pop.style.top=top+'px';pop.style.left=Math.max(8,Math.min(r.left,window.innerWidth-w-12))+'px';
  }
  function open(inp){
    close();cur=inp;
    var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(inp.value),n=new Date();
    vy=m?+m[1]:n.getFullYear();vm=m?+m[2]-1:n.getMonth();
    pop=document.createElement('div');pop.className='dp-pop';pop.setAttribute('role','dialog');
    document.body.appendChild(pop);render();place();
    pop.addEventListener('mousedown',function(e){e.preventDefault();});
    pop.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;e.stopPropagation();
      if(b.dataset.d){setVal(b.dataset.d);var i=cur;close();try{i.focus();}catch(x){}return;}
      var a=b.dataset.dp;
      if(a==='-1'||a==='1'){vm+=+a;if(vm<0){vm=11;vy--;}if(vm>11){vm=0;vy++;}render();}
      else if(a==='today'){var t=new Date();setVal(iso(t.getFullYear(),t.getMonth(),t.getDate()));close();}
      else if(a==='clear'){setVal('');close();}
    });
  }
  document.addEventListener('mousedown',function(e){
    var t=e.target;
    if(pop&&!pop.contains(t)&&t!==cur){close();}
    if(ok(t)){
      var r=t.getBoundingClientRect();
      if(e.clientX>r.right-40){e.preventDefault();t.focus();if(cur===t)close();else open(t);}
      else if(cur!==t){open(t);}
    }
  },true);
  document.addEventListener('click',function(e){if(ok(e.target)){e.preventDefault();}},true);
  document.addEventListener('keydown',function(e){var t=e.target;if(ok(t)&&(e.altKey&&e.key==='ArrowDown'||e.key==='F4')){e.preventDefault();if(!pop||cur!==t)open(t);}},true);
  document.addEventListener('keydown',function(e){if(pop&&e.key==='Escape'){close();}else if(pop&&e.key==='Tab'){close();}},true);
  window.addEventListener('resize',close);
  document.addEventListener('scroll',function(e){if(pop&&!pop.contains(e.target))close();},true);
})();

/* ===== Print templates page: cleaner cards, search and carrier filter ===== */
(function(){
  function zhL(){try{return LANG;}catch(e){return 'en';}}
  var TX={en:{search:'Search templates…',all:'All',edit:'Edit fields',count:'templates',none:'No template matches your search.'},
          zh:{search:'搜索模板…',all:'全部',edit:'编辑字段',count:'个模板',none:'没有符合条件的模板。'},
          ko:{search:'템플릿 검색…',all:'전체',edit:'필드 편집',count:'개 템플릿',none:'검색 결과가 없습니다.'}};
  function T(k){var l=zhL();return (TX[l]||TX.en)[k];}
  var state={q:'',carrier:''};
  function cards(g){return [].slice.call(g.querySelectorAll('.tpl-card'));}
  function enhanceCard(c){
    if(c.dataset.pfc)return;c.dataset.pfc='1';
    var meta=c.querySelector('.tpl-card-meta');
    if(meta){
      var parts=meta.textContent.split(' · ').map(function(x){return x.trim();}).filter(Boolean);
      c.dataset.carrier=(parts[0]||'').toUpperCase();
      meta.textContent='';
      parts.forEach(function(p,i){var s=document.createElement('span');s.className='tpl-chip'+(i===0?' tpl-chip-c':'');s.textContent=p;meta.appendChild(s);});
    }
    var body=c.querySelector('.tpl-card-body');
    if(body&&!body.querySelector('.tpl-edit')){
      var b=document.createElement('span');b.className='tpl-edit';
      b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg><span></span>';
      b.lastChild.textContent=T('edit');body.appendChild(b);
    }
  }
  function apply(g){
    var q=state.q.toLowerCase(),n=0;
    cards(g).forEach(function(c){
      var nm=(c.querySelector('.tpl-card-name')||{}).textContent||'',mt=c.dataset.carrier||'';
      var show=(!q||(nm+' '+mt).toLowerCase().indexOf(q)>-1)&&(!state.carrier||mt===state.carrier);
      c.style.display=show?'':'none';if(show)n++;
    });
    var cnt=document.getElementById('tplCount');if(cnt)cnt.textContent=n+' '+T('count');
    var em=document.getElementById('tplEmpty');
    if(!n){if(!em){em=document.createElement('div');em.id='tplEmpty';em.className='tpl-empty';g.parentNode.insertBefore(em,g.nextSibling);}em.textContent=T('none');}else if(em)em.remove();
  }
  function toolbar(g){
    var tb=document.getElementById('tplBar');
    var carriers={};cards(g).forEach(function(c){if(c.dataset.carrier)carriers[c.dataset.carrier]=1;});
    var sig=Object.keys(carriers).sort().join('|')+'|'+zhL();
    if(tb&&tb.dataset.sig===sig)return;
    if(tb)tb.remove();
    tb=document.createElement('div');tb.id='tplBar';tb.className='tpl-bar';tb.dataset.sig=sig;
    tb.innerHTML='<input type="search" id="tplSearch" class="tpl-search" autocomplete="off"><div class="tpl-chips" id="tplChips"></div><span class="tpl-count" id="tplCount"></span>';
    tb.querySelector('input').placeholder=T('search');tb.querySelector('input').value=state.q;
    var ch=tb.querySelector('#tplChips');
    ['']. concat(Object.keys(carriers).sort()).forEach(function(k){
      var b=document.createElement('button');b.type='button';b.className='tpl-fchip'+(state.carrier===k?' on':'');b.textContent=k||T('all');
      b.addEventListener('click',function(){state.carrier=k;[].forEach.call(ch.children,function(x){x.classList.toggle('on',x===b);});apply(document.getElementById('tplGrid'));});
      ch.appendChild(b);});
    tb.querySelector('input').addEventListener('input',function(e){state.q=e.target.value;apply(document.getElementById('tplGrid'));});
    g.parentNode.insertBefore(tb,g);
  }
  function run(){
    var g=document.getElementById('tplGrid');if(!g)return;
    var cs=cards(g);if(!cs.length)return;
    cs.forEach(enhanceCard);toolbar(g);apply(g);
  }
  setInterval(function(){if(!document.hidden)try{run();}catch(e){}},700);
})();

/* ===== Date-range filter (Sheet View): presets + one calendar, no more two native pickers ===== */
(function(){
  var pop=null,pill=null,vy=0,vm=0,st='',en='',hov='';
  function Lg(){try{return LANG;}catch(e){return 'en';}}
  function loc(){var l=Lg();return l==='zh'?'zh-CN':l==='ko'?'ko-KR':'en-US';}
  var TX={en:{any:'Any activation date',all:'All time',today:'Today',yest:'Yesterday',d7:'Last 7 days',d30:'Last 30 days',tm:'This month',lm:'Last month',m3:'Last 3 months',ty:'This year',hint:'Pick a start and an end date'},
          zh:{any:'任意开通日期',all:'全部时间',today:'今天',yest:'昨天',d7:'最近7天',d30:'最近30天',tm:'本月',lm:'上月',m3:'最近3个月',ty:'今年',hint:'依次选择开始和结束日期'},
          ko:{any:'개통일 전체',all:'전체 기간',today:'오늘',yest:'어제',d7:'최근 7일',d30:'최근 30일',tm:'이번 달',lm:'지난달',m3:'최근 3개월',ty:'올해',hint:'시작일과 종료일을 선택하세요'}};
  function T(k){return (TX[Lg()]||TX.en)[k];}
  function pad(n){return (n<10?'0':'')+n;}
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function pd(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]):null;}
  function fmt(s){var d=pd(s);return d?new Intl.DateTimeFormat(loc(),{month:'short',day:'numeric',year:'numeric'}).format(d):'';}
  function inputs(){return [document.getElementById('sheetDateFrom'),document.getElementById('sheetDateTo')];}
  function setRange(a,b){
    var i=inputs();if(!i[0]||!i[1])return;
    i[0].value=a||'';i[1].value=b||'';
    if(a||b){var rf=document.getElementById('sheetRecentFilter');if(rf&&rf.value!==''){rf.value='';rf.dispatchEvent(new Event('change',{bubbles:true}));}}
    [i[0],i[1]].forEach(function(x){x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));});
    label();
  }
  function label(){
    var p=document.getElementById('sheetDateRangePill'),i=inputs();if(!p||!i[0])return;
    var b=p.querySelector('.dr-btn');if(!b)return;
    var a=i[0].value,z=i[1].value,t=a||z?(fmt(a)||'…')+' – '+(fmt(z)||'…'):T('any');
    if(b.textContent!==t)b.textContent=t;
    p.classList.toggle('dr-has',!!(a||z));
  }
  function setup(){
    var p=document.getElementById('sheetDateRangePill');if(!p||p.dataset.dr)return;
    p.dataset.dr='1';p.classList.add('dr-on');
    var b=document.createElement('button');b.type='button';b.className='dr-btn';
    var ic=p.querySelector('.date-range-icon');if(ic)ic.insertAdjacentElement('afterend',b);else p.insertBefore(b,p.firstChild);
    b.addEventListener('click',function(e){e.stopPropagation();if(pop){close();}else open(p);});
    label();
  }
  function close(){if(pop){pop.remove();pop=null;}pill=null;}
  function presets(){
    var n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate()),add=function(d,k){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+k);};
    return [
      ['all','',''],['today',iso(t),iso(t)],['yest',iso(add(t,-1)),iso(add(t,-1))],['d7',iso(add(t,-6)),iso(t)],['d30',iso(add(t,-29)),iso(t)],
      ['tm',iso(new Date(t.getFullYear(),t.getMonth(),1)),iso(new Date(t.getFullYear(),t.getMonth()+1,0))],
      ['lm',iso(new Date(t.getFullYear(),t.getMonth()-1,1)),iso(new Date(t.getFullYear(),t.getMonth(),0))],
      ['m3',iso(new Date(t.getFullYear(),t.getMonth()-2,1)),iso(t)],
      ['ty',iso(new Date(t.getFullYear(),0,1)),iso(new Date(t.getFullYear(),11,31))]
    ];
  }
  function render(){
    if(!pop)return;
    var L=loc(),first=new Date(vy,vm,1),sd=first.getDay(),days=new Date(vy,vm+1,0).getDate(),ts=iso(new Date());
    var e2=en||hov;var lo=st&&e2&&e2<st?e2:st,hi=st&&e2&&e2<st?st:e2;
    var h='<div class="dr-presets">';
    presets().forEach(function(p){var on=(p[1]===st&&p[2]===en);h+='<button type="button" class="dr-pre'+(on?' on':'')+'" data-p="'+p[0]+'">'+T(p[0])+'</button>';});
    h+='</div><div class="dr-cal"><div class="dp-head"><button type="button" class="dp-nav" data-n="-1">&#8249;</button><span class="dp-title"></span><button type="button" class="dp-nav" data-n="1">&#8250;</button></div><div class="dp-grid">';
    for(var i=0;i<7;i++)h+='<span class="dp-wd">'+new Intl.DateTimeFormat(L,{weekday:'short'}).format(new Date(2023,0,1+i))+'</span>';
    for(var b=0;b<sd;b++)h+='<span></span>';
    for(var d=1;d<=days;d++){
      var s=vy+'-'+pad(vm+1)+'-'+pad(d),c='dp-day dr-day';
      if(lo&&hi&&s>=lo&&s<=hi)c+=' in';if(s===lo)c+=' edge s';if(s===hi)c+=' edge e';if(s===ts)c+=' today';
      h+='<button type="button" class="'+c+'" data-d="'+s+'">'+d+'</button>';
    }
    h+='</div><div class="dr-hint"></div></div>';
    pop.innerHTML=h;
    pop.querySelector('.dp-title').textContent=new Intl.DateTimeFormat(L,{year:'numeric',month:'long'}).format(first);
    pop.querySelector('.dr-hint').textContent=st&&!en?fmt(st)+' → …':(st&&en?fmt(st)+' → '+fmt(en):T('hint'));
  }
  function place(){
    var r=pill.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
    var below=window.innerHeight-r.bottom-12,top=below>=h||below>r.top?r.bottom+6:Math.max(8,r.top-h-6);
    pop.style.top=top+'px';pop.style.left=Math.max(8,Math.min(r.left,window.innerWidth-w-12))+'px';
  }
  function open(p){
    close();pill=p;var i=inputs();st=i[0].value;en=i[1].value;hov='';
    var base=pd(st)||pd(en)||new Date();vy=base.getFullYear();vm=base.getMonth();
    pop=document.createElement('div');pop.className='dr-pop';document.body.appendChild(pop);render();place();
    pop.addEventListener('mousedown',function(e){e.preventDefault();});
    pop.addEventListener('mouseover',function(e){var b=e.target.closest('.dr-day');if(b&&st&&!en&&b.dataset.d!==hov){hov=b.dataset.d;render();}});
    pop.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;e.stopPropagation();
      if(b.dataset.p){var p2=presets().filter(function(x){return x[0]===b.dataset.p;})[0];setRange(p2[1],p2[2]);st=p2[1];en=p2[2];hov='';var bd=pd(st);if(bd){vy=bd.getFullYear();vm=bd.getMonth();}render();if(!st)close();return;}
      if(b.dataset.n){vm+=+b.dataset.n;if(vm<0){vm=11;vy--;}if(vm>11){vm=0;vy++;}render();return;}
      if(b.dataset.d){
        var d=b.dataset.d;
        if(!st||(st&&en)){st=d;en='';hov='';setRange(d,'');render();}
        else{var a=st<d?st:d,z=st<d?d:st;setRange(a,z);close();}
      }
    });
  }
  document.addEventListener('mousedown',function(e){if(pop&&!pop.contains(e.target)&&!(pill&&pill.contains(e.target)))close();},true);
  function excl(e){var x=e.target;if(x&&x.id==='sheetRecentFilter'&&x.value!==''){var i=inputs();if(i[0]&&(i[0].value||i[1].value)){i[0].value='';i[1].value='';label();setTimeout(function(){try{renderSheetPage();}catch(er){}},0);}}}
  document.addEventListener('input',excl,true);document.addEventListener('change',excl,true);
  document.addEventListener('keydown',function(e){if(pop&&e.key==='Escape')close();},true);
  document.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('#sheetDateRangeClear');if(c)setTimeout(label,50);});
  window.addEventListener('resize',close);
  setInterval(function(){if(document.hidden)return;try{setup();label();}catch(e){}},600);
})();

/* ===== Sheet View: "All ratings" becomes Carrier type (prepaid) / Partner company (postpaid) ===== */
(function(){
  var TX={en:{pre:'All carrier types',post:'All partner companies'},zh:{pre:'全部运营商类型',post:'全部合作公司'},ko:{pre:'전체 통신사 유형',post:'전체 제휴사'}};
  var COL={prepaid:4,postpaid:6},vals={prepaid:'',postpaid:''};
  function lang(){try{return LANG;}catch(e){return 'en';}}
  function tab(){try{return sheetTypeTab;}catch(e){return '';}}
  function cellText(td){if(!td)return '';var i=td.querySelector('input,select');return ((i?i.value:td.textContent)||'').replace(/\s+/g,' ').trim();}
  function options(tb){
    var set={};(DB.services||[]).forEach(function(s){
      if(s.type!==tb)return;var v=tb==='prepaid'?s.svcCarrierType:s.partnerCompany;if(v&&String(v).trim())set[String(v).trim()]=1;});
    return Object.keys(set).sort(function(a,b){return a.localeCompare(b);});
  }
  function sync(){
    var rs=document.getElementById('sheetRatingFilter');if(!rs)return;
    var tb=tab(),on=tb==='prepaid'||tb==='postpaid',ex=document.getElementById('sheetExtraFilter');
    if(!on){
      if(ex)ex.style.display='none';rs.style.display='';
      document.querySelectorAll('#sheetTable tbody tr[data-xf]').forEach(function(r){r.style.display='';r.removeAttribute('data-xf');});
      return;
    }
    if(rs.value!==''){rs.value='';rs.dispatchEvent(new Event('change',{bubbles:true}));}
    rs.style.display='none';
    if(!ex){ex=document.createElement('select');ex.id='sheetExtraFilter';ex.className='select-input';rs.insertAdjacentElement('afterend',ex);
      ex.addEventListener('change',function(){vals[ex.dataset.tab]=ex.value;apply();});}
    ex.style.display='';
    var sig=tb+'|'+lang()+'|'+options(tb).join('|');
    if(ex.dataset.sig!==sig){
      ex.dataset.sig=sig;ex.dataset.tab=tb;var T=TX[lang()]||TX.en;
      ex.innerHTML='<option value="">'+(tb==='prepaid'?T.pre:T.post)+'</option>'+options(tb).map(function(o){return '<option value="'+o.replace(/"/g,'&quot;')+'">'+o+'</option>';}).join('');
    }
    ex.dataset.tab=tb;if(ex.value!==vals[tb])ex.value=vals[tb];
    apply();
  }
  function apply(){
    var tb=tab();if(tb!=='prepaid'&&tb!=='postpaid')return;
    var v=vals[tb],rows=document.querySelectorAll('#sheetTable tbody tr'),n=0,idx=COL[tb];
    rows.forEach(function(r){
      var show=!v||cellText(r.children[idx])===v;
      var hidden=r.getAttribute('data-xf')==='1';
      if(!show&&!hidden){r.style.display='none';r.setAttribute('data-xf','1');}
      else if(show&&hidden){r.style.display='';r.removeAttribute('data-xf');}
      if(show)n++;
    });
    if(v||document.querySelector('#sheetTable tbody tr[data-xf]')){var c=document.getElementById('sheetCount');if(c){var m=c.textContent.replace(/^\d+/,n);if(c.textContent!==m)c.textContent=m;}}
  }
  var tbl=document.getElementById('sheetTable');
  function bind(){tbl=document.getElementById('sheetTable');if(tbl&&!tbl.__xf){tbl.__xf=1;new MutationObserver(function(){try{sync();}catch(e){}}).observe(tbl,{childList:true});}}
  setInterval(function(){if(document.hidden)return;try{bind();sync();}catch(e){}},500);
})();

/* ===== Extra prepaid company option ===== */
(function(){
  try{if(typeof PREPAID_COMPANIES!=='undefined'&&PREPAID_COMPANIES.indexOf('벨류컨SMT')<0)PREPAID_COMPANIES.push('벨류컨SMT');}catch(e){}
})();

/* ===== Excel export: recharge plans are written as "Recharge" in PLAN TYPE (same rule as the CRM) ===== */
(function(){
  try{
    if(typeof prepaidExportRow!=='function'||window.__rcExport)return;
    var orig=prepaidExportRow;window.__rcExport=1;
    window.prepaidExportRow=function(c,s){
      var r=orig.apply(this,arguments);
      try{var l=window.__planLab&&window.__planLab(s);if(l&&l[0]==='rc')r[9]='Recharge';}catch(e){}
      return r;
    };
  }catch(e){}
})();
