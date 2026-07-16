/* generators.js: template-based heartfelt message writers (no AI, no cost, nothing stored). */
(function(){
  var pick=function(a){return a[Math.floor(Math.random()*a.length)];};
  var val=function(id){var e=document.getElementById(id);return e?e.value.trim():'';};

  var GEN={
    letter:{
      title:'Letter to Mom',
      fields:[
        {id:'name',label:'What do you call her?',ph:'Mom, Mum, Mama...'},
        {id:'trait',label:'One thing you admire about her',ph:'her patience, her strength, her laugh'},
        {id:'memory',label:'A memory you treasure (optional)',ph:'summers in the garden, her Sunday cooking'},
        {id:'now',label:'Something you want her to know now',ph:'that you are grateful, that you understand her more now'},
      ],
      build:function(){
        var m=val('name')||'Mom', t=val('trait')||'the way you love us', mem=val('memory'), now=val('now')||'how grateful I am for everything you have done';
        var open=pick(['Dear '+m+',','To my '+m+',',''+m+',']);
        var l1=pick([
          'There are things I have wanted to say for a long time, and I am finally putting them into words.',
          'I do not say this often enough, so I am writing it down where it cannot get lost.',
          'Some feelings are too big for a quick text, so I wanted to write them properly.']);
        var l2='For as long as I can remember, I have admired '+t+'. '+pick([
          'It shaped me more than you probably realise.',
          'I carry it with me, even on the days I forget to say so.',
          'So much of who I am started with that.']);
        var l3=mem?('I still think about '+mem+'. '+pick(['It is one of the memories I hold onto.','Small moments like that turned out to be everything.','That is where I learned what love actually looks like.'])+' '):'';
        var l4=pick(['What I most want you to know is ','If you take one thing from this letter, let it be ','Above all, I want you to know '])+now+'.';
        var close=pick(['With all my love,','Love always,','Forever grateful,']);
        return open+'\n\n'+l1+' '+l2+'\n\n'+l3+l4+'\n\n'+close+'\nYour child';
      }
    },
    thanks:{
      title:'Thank You, Mom',
      fields:[
        {id:'name',label:'What do you call her?',ph:'Mom, Mum, Mama...'},
        {id:'for',label:'What are you thanking her for?',ph:'always being there, the sacrifices, believing in me'},
        {id:'effect',label:'How it shaped you (optional)',ph:'it made me braver, kinder, stronger'},
      ],
      build:function(){
        var m=val('name')||'Mom', f=val('for')||'everything you have done', e=val('effect');
        var open=pick(['Thank you, '+m+'.',''+m+', thank you.','I owe you a thank you, '+m+'.']);
        var l1=pick([
          'I do not think I have ever properly thanked you for '+f+'.',
          'You did '+f+' quietly, never asking for anything back.',
          'For '+f+', and a thousand things I never even noticed at the time, thank you.']);
        var l2=e?(' '+pick(['Because of you, ','Thanks to you, ','You are the reason '])+e+'.'):'';
        var l3=pick([
          ' I see now how much it cost you, and how much love was behind all of it.',
          ' I understand more every year just how much you carried.',
          ' The older I get, the more I realise how lucky I am.']);
        return open+' '+l1+l2+l3+'\n\n'+pick(['With love and gratitude,','Thank you, always,','Forever grateful,'])+'\nYour child';
      }
    },
    shower:{
      title:'Baby Shower Message',
      fields:[
        {id:'name',label:'Mom-to-be\u2019s name',ph:'Sarah, my dear friend...'},
        {id:'rel',label:'Your relationship (optional)',ph:'friend, sister, colleague'},
        {id:'wish',label:'A wish for her (optional)',ph:'easy nights, lots of help, moments to savour'},
      ],
      build:function(){
        var n=val('name')||'Mama-to-be', w=val('wish')||'all the love and support you deserve';
        var open=pick(['Dear '+n+',','To the wonderful '+n+',',''+n+',']);
        var l1=pick([
          'What an exciting season you are stepping into.',
          'A whole new chapter is about to begin, and you are so ready for it.',
          'Watching you get ready to become a mother has been such a joy.']);
        var l2=pick([
          'You are going to be the kind of mother who leads with love.',
          'This little one is so lucky to be getting you.',
          'There is no manual, but you already have the most important thing: a huge heart.']);
        var l3=pick(['My wish for you is ','I hope this journey brings you ','Wishing you '])+w+'.';
        var l4=pick(['Congratulations, and welcome to the wild, wonderful world of motherhood.',
          'Sending you so much love as you begin.',
          'Cannot wait to meet the newest member of your family.']);
        return open+'\n\n'+l1+' '+l2+' '+l3+'\n\n'+l4+'\n\nWith love';
      }
    },
    speech:{
      title:"Mother's Day Speech",
      fields:[
        {id:'name',label:'What do you call her?',ph:'Mom, Mum, Mama...'},
        {id:'crowd',label:'Speaking to (optional)',ph:'family, at dinner, the whole room'},
        {id:'trait',label:'What makes her special',ph:'her selflessness, her strength, her warmth'},
        {id:'memory',label:'A memory or example (optional)',ph:'she never missed a game, she stayed up when I was sick'},
      ],
      build:function(){
        var m=val('name')||'Mom', t=val('trait')||'her endless love', mem=val('memory');
        var open=pick(['I want to say a few words about '+m+'.','Today, I want to talk about '+m+'.','If you will let me, I would like to say something about '+m+'.']);
        var l1=pick([
          'We throw the word mother around easily, but what she does is anything but easy.',
          'It is hard to put into words everything a mother is, but I am going to try.',
          'Being a mother is the hardest job there is, and she has made it look effortless.']);
        var l2='What makes her special is '+t+'. '+pick(['It shows up in the smallest, most ordinary moments.','You see it in the way she treats everyone around her.','It is the thread running through everything she does.']);
        var l3=mem?(' '+pick(['I will never forget how ','One thing I always come back to is that ','Here is who she is: '])+mem+'.'):'';
        var l4=pick([
          ' So today, we celebrate her, not just for what she does, but for who she is.',
          ' So let us raise a glass to her, today and every day.',
          ' Today is her day, and it is long overdue.']);
        var end=pick(['Happy Mother\u2019s Day, '+m+'. We love you.','To '+m+' \u2014 thank you for everything. Happy Mother\u2019s Day.','Happy Mother\u2019s Day. We are so lucky to have you.']);
        return open+' '+l1+'\n\n'+l2+l3+l4+'\n\n'+end;
      }
    }
  };

  var current='letter';
  var formEl=document.getElementById('genForm');
  var resultEl=document.getElementById('genResult');
  var actions=document.getElementById('genActions');

  function renderForm(){
    var g=GEN[current];
    formEl.innerHTML='<h3>'+g.title+'</h3>'+g.fields.map(function(f){
      return '<label class="gen-label">'+f.label+
        '<input type="text" id="'+f.id+'" placeholder="'+f.ph+'"></label>';
    }).join('')+'<button class="btn" id="genGo">Write my message</button>';
    document.getElementById('genGo').addEventListener('click',generate);
    resultEl.textContent='Fill in the prompts and your message appears here.';
    actions.style.display='none';
  }
  function generate(){
    var msg=GEN[current].build();
    resultEl.textContent=msg;
    actions.style.display='flex';
    document.getElementById('genRead').setAttribute('data-read',msg);
    resultEl.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  document.getElementById('genTabs').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    current=b.dataset.gen;
    document.querySelectorAll('#genTabs button').forEach(function(x){x.classList.toggle('on',x===b);});
    renderForm();
  });
  document.getElementById('genCopy').addEventListener('click',function(){
    var txt=resultEl.textContent;
    if(navigator.clipboard)navigator.clipboard.writeText(txt).then(function(){
      var b=document.getElementById('genCopy'),t=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=t;},1200);});
  });
  document.getElementById('genRegen').addEventListener('click',generate);
  renderForm();
})();
