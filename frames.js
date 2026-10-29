/* подписи к кадрам по нажатию: повторный тап, ✕ и Escape закрывают; мелкие кадры (< 800 px) — класс .small */
(function(){
var open=null,n=0;
function init(){document.querySelectorAll('.tgrid figure,.tframes figure').forEach(function(f){
  var im=f.querySelector('img'),c=f.querySelector('figcaption');
  if(im){var sz=function(){if(im.naturalWidth&&im.naturalWidth<800)f.classList.add('small')};if(im.complete)sz();else im.addEventListener('load',sz)}
  if(!c||f.querySelector('.capT'))return;
  c.id=c.id||'fcap'+(++n);c.tabIndex=-1;c.classList.add('fcap');
  var b=document.createElement('button');b.type='button';b.className='capT';b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',c.id);
  b.setAttribute('aria-label','Описание: '+((c.querySelector('b')||c).textContent.trim()));
  var x=document.createElement('button');x.type='button';x.className='capX';x.setAttribute('aria-label','Закрыть описание');x.textContent='✕';
  c.appendChild(x);f.insertBefore(b,c)})}
function shut(back){if(!open)return;var f=open,b=f.querySelector('.capT');open=null;f.classList.remove('open');b.setAttribute('aria-expanded','false');if(back)b.focus({preventScroll:true})}
document.addEventListener('click',function(e){var f=e.target.closest('figure');if(!f||!f.querySelector('.capT'))return;
  if(e.target.closest('.capX')||open===f){shut(true);return}
  shut(false);open=f;f.classList.add('open');f.querySelector('.capT').setAttribute('aria-expanded','true');f.querySelector('figcaption').focus({preventScroll:true})});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&open)shut(true)});
init();
})();
