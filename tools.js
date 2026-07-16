/* tools.js: Mood finder, search, random, quote of the day. Client-side over quotes.json. */
(function(){
  var DATA=[], ready=false;
  var results=document.getElementById('results');
  var resultsHead=document.getElementById('resultsHead');
  var empty=document.getElementById('empty');

  fetch('/quotes.json').then(function(r){return r.json();}).then(function(d){
    DATA=d; ready=true; initQotd(); 
    // deep-link ?mood= or ?q=
    var p=new URLSearchParams(location.search);
    if(p.get('mood')) selectMood(p.get('mood'));
    else if(p.get('q')){document.getElementById('q').value=p.get('q');runSearch(p.get('q'));}
  }).catch(function(){ if(empty){empty.style.display='block';empty.textContent='Could not load quotes. Please refresh.';} });

  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
  function card(q){
    var href='/app.html?q='+encodeURIComponent(q.t)+'&by='+encodeURIComponent('Strong Mom Quotes');
    return '<div class="qcard"><blockquote>&ldquo;'+esc(q.t)+'&rdquo;</blockquote>'+
      '<p class="by">Strong Mom Quotes</p><div class="tools">'+
      '<button type="button" data-copy="'+esc(q.t)+' (Strong Mom Quotes)">Copy</button>'+
      '<button type="button" class="readBtn" data-read="'+esc(q.t)+'">Read aloud</button>'+
      '<a href="'+href+'">Make a card</a></div></div>';
  }
  function show(list, headline){
    if(!list.length){results.innerHTML='';resultsHead.style.display='none';empty.style.display='block';return;}
    empty.style.display='none';
    resultsHead.style.display='block';
    resultsHead.innerHTML='<h2>'+esc(headline)+' <span class="count">'+list.length+'</span></h2>';
    results.innerHTML=list.slice(0,60).map(card).join('');
    resultsHead.scrollIntoView({behavior:'smooth',block:'start'});
  }

  // MOOD
  var MOOD_LABEL={overwhelmed:'For when you feel overwhelmed',guilty:'For the mum guilt',exhausted:'For when you are exhausted',
   'need-encouragement':'When you need a lift',proud:'For the proud days',grateful:'For the grateful moments',
   'want-a-laugh':'When you need a laugh','missing-someone':'For missing someone'};
  function selectMood(m){
    if(!ready)return;
    document.querySelectorAll('#moods button').forEach(function(b){b.classList.toggle('on',b.dataset.mood===m);});
    var list=DATA.filter(function(q){return q.mood.indexOf(m)>-1;});
    // shuffle lightly for freshness
    list=list.slice().sort(function(){return Math.random()-0.5;});
    show(list, MOOD_LABEL[m]||'Quotes for you');
    history.replaceState(null,'','?mood='+m);
  }
  document.getElementById('moods').addEventListener('click',function(e){
    var b=e.target.closest('button');if(b)selectMood(b.dataset.mood);
  });

  // SEARCH
  var qEl=document.getElementById('q'), tmr;
  function runSearch(term){
    if(!ready)return; term=(term||'').trim().toLowerCase();
    if(term.length<2){results.innerHTML='';resultsHead.style.display='none';empty.style.display='none';return;}
    var words=term.split(/\s+/);
    var list=DATA.filter(function(q){
      var hay=(q.t+' '+q.a+' '+q.tone.join(' ')+' '+q.stage.join(' ')+' '+q.theme.join(' ')).toLowerCase();
      return words.every(function(w){return hay.indexOf(w)>-1;});
    });
    show(list,'Results for \u201c'+term+'\u201d');
    history.replaceState(null,'','?q='+encodeURIComponent(term));
  }
  if(qEl){qEl.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(function(){runSearch(qEl.value);},180);});}

  // RANDOM
  function randomQuote(){return DATA[Math.floor(Math.random()*DATA.length)];}
  var randEl=document.getElementById('rand'), randBy=document.getElementById('randBy');
  function doRandom(){
    if(!ready)return; var q=randomQuote();
    randEl.textContent='\u201c'+q.t+'\u201d'; randBy.style.visibility='visible';
    var acts=randEl.parentNode.querySelector('.tool-actions');
    // keep the button, add copy/card links after
    var extra=randEl.parentNode.querySelector('.rand-extra');
    if(extra)extra.remove();
    var div=document.createElement('div');div.className='rand-extra tool-actions';
    div.innerHTML='<button type="button" data-copy="'+q.t.replace(/"/g,'&quot;')+' (Strong Mom Quotes)">Copy</button>'+
      '<button type="button" class="readBtn" data-read="'+q.t.replace(/"/g,'&quot;')+'">Read aloud</button>'+
      '<a class="btn ghost" href="/app.html?q='+encodeURIComponent(q.t)+'">Make a card</a>';
    randEl.parentNode.appendChild(div);
  }
  document.getElementById('randBtn').addEventListener('click',doRandom);
  var rb2=document.getElementById('randBtn2'); if(rb2)rb2.addEventListener('click',function(){empty.style.display='none';doRandom();document.getElementById('rand').scrollIntoView({behavior:'smooth'});});

  // QUOTE OF THE DAY (deterministic by date, same for everyone that day)
  function initQotd(){
    var el=document.getElementById('qotd');if(!el)return;
    var day=Math.floor(Date.now()/86400000);
    var q=DATA[day%DATA.length];
    el.textContent='\u201c'+q.t+'\u201d';
    var acts=document.getElementById('qotdActions');
    acts.innerHTML='<button type="button" data-copy="'+q.t.replace(/"/g,'&quot;')+' (Strong Mom Quotes)">Copy</button>'+
      '<button type="button" class="readBtn" data-read="'+q.t.replace(/"/g,'&quot;')+'">Read aloud</button>'+
      '<a class="btn ghost" href="/app.html?q='+encodeURIComponent(q.t)+'">Make a card</a>';
  }

  // COPY + READ ALOUD (event delegation across the whole page)
  document.addEventListener('click',function(e){
    var c=e.target.closest('[data-copy]');
    if(c){navigator.clipboard&&navigator.clipboard.writeText(c.getAttribute('data-copy')).then(function(){
      var t=c.textContent;c.textContent='Copied';setTimeout(function(){c.textContent=t;},1200);});return;}
    var r=e.target.closest('[data-read]');
    if(r&&'speechSynthesis'in window){
      var u=new SpeechSynthesisUtterance(r.getAttribute('data-read'));u.rate=.95;u.pitch=1;
      speechSynthesis.cancel();speechSynthesis.speak(u);
      var t2=r.textContent;r.textContent='Reading...';setTimeout(function(){r.textContent=t2;},1400);
    }
  });
})();
