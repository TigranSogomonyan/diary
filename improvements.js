/* Progressive accessibility enhancements — no external dependencies. */
(function(){
'use strict';
var reader=document.getElementById('reader'),track=document.getElementById('rTrack');
if(reader&&track){
  var prev=document.getElementById('rPrev'),next=document.getElementById('rNext');
  function syncPages(){
    if(reader.hidden)return;
    var max=Math.max(0,track.scrollWidth-track.clientWidth);
    if(prev)prev.disabled=track.scrollLeft<=2;
    if(next)next.disabled=max<=2||track.scrollLeft>=max-2;
  }
  function trapTab(e){
    if(reader.hidden||e.key!=='Tab')return;
    var items=Array.prototype.filter.call(reader.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'),function(el){return el.getClientRects().length>0});
    if(!items.length){e.preventDefault();reader.focus();return}
    var first=items[0],last=items[items.length-1];
    if(e.shiftKey&&(document.activeElement===first||!reader.contains(document.activeElement))){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&(document.activeElement===last||!reader.contains(document.activeElement))){e.preventDefault();first.focus()}
  }
  document.addEventListener('keydown',trapTab,true);
  track.addEventListener('scroll',syncPages,{passive:true});
  new MutationObserver(syncPages).observe(reader,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(syncPages).observe(track,{childList:true});
  window.addEventListener('resize',syncPages);
}
var tabs=Array.prototype.slice.call(document.querySelectorAll('#themes .ttabs [role="tab"]'));
if(tabs.length){
  tabs.forEach(function(tab,i){
    var panel=document.querySelector('#themes .tgrid[data-t="'+tab.dataset.t+'"]');
    tab.id='diary-theme-tab-'+tab.dataset.t;
    tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1;
    if(panel){panel.id='diary-theme-panel-'+tab.dataset.t;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);tab.setAttribute('aria-controls',panel.id)}
    tab.addEventListener('click',function(){tabs.forEach(function(x){x.tabIndex=x===tab?0:-1})});
    tab.addEventListener('keydown',function(e){
      var n;
      if(e.key==='ArrowRight')n=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;
      else if(e.key==='Home')n=0;
      else if(e.key==='End')n=tabs.length-1;
      else return;
      e.preventDefault();tabs[n].click();tabs[n].focus();
    });
  });
}
var board=document.getElementById('boardEl');
if(board){
  var pins=Array.prototype.slice.call(board.querySelectorAll('.pin'));
  function syncPins(){pins.forEach(function(p){var off=p.classList.contains('off');p.tabIndex=off?-1:0;p.setAttribute('aria-hidden',String(off))})}
  pins.forEach(function(p){
    var name=(p.querySelector('span')||p).textContent.trim()||'Заметка';
    p.setAttribute('role','group');
    p.setAttribute('aria-label',name+'. Для перемещения используйте клавиши со стрелками');
    p.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight');
    p.addEventListener('keydown',function(e){
      var d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(!d||p.classList.contains('off'))return;
      e.preventDefault();
      var step=e.shiftKey?36:12;
      var x=Math.max(0,Math.min(board.clientWidth-p.offsetWidth,p.offsetLeft+d[0]*step));
      var y=Math.max(0,Math.min(board.clientHeight-p.offsetHeight,p.offsetTop+d[1]*step));
      p.style.left=x+'px';p.style.top=y+'px';
    });
  });
  document.querySelectorAll('#board .filters button').forEach(function(b){b.addEventListener('click',syncPins)});
  syncPins();
}
/* Highlight the section currently being read without changing scroll position. */
var navLinks=Array.prototype.slice.call(document.querySelectorAll('.diary-home .top nav a[href^="#"]'));
if(navLinks.length){
  var targets=navLinks.map(function(link){return{link:link,section:document.getElementById(link.getAttribute('href').slice(1))}}).filter(function(x){return x.section});
  var queued=false;
  function syncActiveSection(){
    queued=false;
    var mark=window.innerHeight*.34,found=null;
    targets.forEach(function(x){var box=x.section.getBoundingClientRect();if(box.top<=mark&&box.bottom>mark)found=x.link});
    targets.forEach(function(x){if(x.link===found)x.link.setAttribute('aria-current','location');else x.link.removeAttribute('aria-current')});
  }
  function requestSync(){if(!queued){queued=true;requestAnimationFrame(syncActiveSection)}}
  document.addEventListener('scroll',requestSync,{passive:true});
  window.addEventListener('resize',requestSync);
  syncActiveSection();
}
/* Disable the gallery arrows at the true scroll boundaries. */
var carousel=document.getElementById('carT');
if(carousel){
  var back=document.getElementById('carP'),forward=document.getElementById('carX');
  function syncCarouselButtons(){
    var remaining=Math.max(0,carousel.scrollWidth-carousel.clientWidth);
    if(back)back.disabled=carousel.scrollLeft<=3;
    if(forward)forward.disabled=remaining<=3||carousel.scrollLeft>=remaining-3;
  }
  carousel.addEventListener('scroll',syncCarouselButtons,{passive:true});
  window.addEventListener('resize',syncCarouselButtons);
  syncCarouselButtons();
}
})();
