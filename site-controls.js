/* Shared editorial controls for the diary and trip chapters. */
(function(){
  'use strict';
  var header=document.querySelector('.top');
  var theme=window.__theme;
  if(!header||!theme)return;
  var link=header.querySelector('a.other');
  if(!link)return;

  var actions=document.createElement('div');
  actions.className='top-actions';
  link.parentNode.insertBefore(actions,link);
  actions.appendChild(link);
  var toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='theme-toggle';
  actions.appendChild(toggle);

  function isDark(){return document.documentElement.getAttribute('data-theme')==='dark'}
  function label(){
    var next=isDark()?'светлую':'тёмную';
    toggle.textContent=isDark()?'☀':'☾';
    toggle.setAttribute('aria-label','Включить '+next+' тему');
    toggle.setAttribute('title','Включить '+next+' тему');
    toggle.setAttribute('aria-pressed',String(isDark()));
  }
  toggle.addEventListener('click',function(){
    theme.mode=isDark()?'light':'dark';
    try{localStorage.setItem('site-theme',theme.mode)}catch(e){}
    theme.apply();label();
  });
  var media=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
  if(media){
    if(media.addEventListener)media.addEventListener('change',label);
    else if(media.addListener)media.addListener(label);
  }
  label();

  var progress=document.createElement('div');
  progress.className='reading-progress';
  progress.setAttribute('aria-hidden','true');
  var fill=document.createElement('span');
  progress.appendChild(fill);
  document.body.appendChild(progress);

  var scheduled=false;
  function update(){
    scheduled=false;
    var root=document.documentElement;
    var max=Math.max(0,root.scrollHeight-window.innerHeight);
    var top=window.scrollY||root.scrollTop||0;
    var ratio=max===0?1:Math.max(0,Math.min(1,top/max));
    fill.style.transform='scaleX('+ratio+')';
  }
  function schedule(){
    if(!scheduled){scheduled=true;requestAnimationFrame(update)}
  }
  document.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('load',schedule);
  update();
})();
