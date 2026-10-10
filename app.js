import { evaluateExpression } from './calc-core.js';
import { FORMULAS } from './formulas.js';
import { parseSpokenExpression } from './voice-parser.js';

const $=s=>document.querySelector(s);
let deg=true,ans=0,memv=0;
const fact=n=>{if(n<0||n%1)throw 0;let r=1;for(let i=2;i<=n;i++)r*=i;return r};
const rad=x=>deg===true?x*Math.PI/180:deg==='g'?x*Math.PI/200:x,ang=x=>deg===true?x*180/Math.PI:deg==='g'?x*200/Math.PI:x;
const tr=f=>x=>f(rad(x)), itr=f=>x=>ang(f(x));
const F={sin:tr(Math.sin),cos:tr(Math.cos),tan:tr(Math.tan),asin:itr(Math.asin),acos:itr(Math.acos),atan:itr(Math.atan),
ln:Math.log,log:Math.log10,sqrt:Math.sqrt,abs:Math.abs,fact,PI:Math.PI,e:Math.E};
let dig=0;
const fmt=r=>{if(!isFinite(r))throw new Error('Result is not a finite number');if(r===0)return'0';const n=Number(r.toPrecision(dig||12)),a=Math.abs(n);if(a>=1e10||a<1e-3){const [m,e]=n.toExponential(dig?dig-1:9).split('e');return Number(m)+'×10^'+Number(e)}return String(n)};
function ev(s,xv){return evaluateExpression(s,{functions:F,ans,x:xv})}
const ex=$('#ex'),res=$('#res'),errorHelp=$('#error-help');let frac=false;
const toF=r=>{if(Number.isInteger(r))return String(r);const s=r<0?'−':'',x=Math.abs(r);let h1=1,h0=0,k1=0,k0=1,b=x;for(let i=0;i<20;i++){const a=Math.floor(b);[h1,h0]=[a*h1+h0,h1];[k1,k0]=[a*k1+k0,k1];if(Math.abs(x-h1/k1)<1e-9||b===a)break;b=1/(b-a)}return k1>1e6?fmt(r):s+h1+'/'+k1};
const sh=r=>frac?toF(r):eng?toE(r):fmt(r);
function ins(t){const s=ex.selectionStart,e=ex.selectionEnd;ex.setRangeText(t,s,e,'end');ex.focus();live()}
function explainError(error){
 const message=String(error?.message||error||'');
 let m=message.match(/^Unknown function: (.+)$/);
 if(m)return `“${m[1]}” function nahi mili. sin, cos, tan, asin, acos, atan, ln, log, sqrt, abs, fact, cbrt ya root use karke dekho.`;
 m=message.match(/^Unknown value: (.+)$/);
 if(m)return `“${m[1]}” value samajh nahi aayi. Number, x, ANS, PI, e ya supported function ka naam check karo.`;
 if(message==='Unexpected closing parenthesis')return `Extra “)” bracket hai. Brackets ko pair mein check karo; example: (2+3)×4.`;
 if(message==='Missing closing parenthesis')return `Ek opening “(” ka closing “)” missing hai. Example: sin(30) ya (2+3).`;
 if(message==='Expected a value')return `Kisi operator ke baad number ya value missing hai. Example: 8×(2+3).`;
 if(message.startsWith('Unexpected token:'))return `“${message.slice('Unexpected token:'.length).trim()}” yahan fit nahi ho raha. Do values ke beech operator lagao, jaise 2×3.`;
 if(message==='Factorial needs a non-negative integer')return `Factorial (!) sirf 0 ya positive whole number par lagta hai. Example: 5!; 2.5! valid nahi hai.`;
 if(message==='Invalid character in expression'||message==='Could not read expression')return `Kisi symbol ko calculator nahi padh paaya. × ya * se multiply, ÷ ya / se divide karo; extra letters/symbols hatao.`;
 if(message==='Expression is empty')return `Pehle equation type karo, phir “=” dabao.`;
 if(message==='Result is not a finite number')return `Is equation ka result defined nahi hai—zero se divide ya invalid square root/log ho sakta hai. Denominator aur function ke andar ki value check karo.`;
 return `Equation calculate nahi hui. Brackets, operators, function ke naam aur denominator check karo.`;
}
function clearError(){errorHelp.hidden=true;errorHelp.textContent=''}
function showError(error){res.style.opacity=1;res.textContent='Equation check karo';errorHelp.textContent=explainError(error);errorHelp.hidden=false}
function live(){clearError();try{if(ex.value.trim()){res.style.opacity=.6;res.textContent=sh(ev(ex.value))}else res.textContent=''}catch(e){res.textContent=''}}
function eq(){if(!ex.value.trim())return;try{const r=ev(ex.value);const t=fmt(r);addH(ex.value+' = '+t,ex.value);ans=r;res.style.opacity=1;res.textContent=sh(r);ex.value='';clearError()}catch(e){showError(e)}}
function addH(l,v){const d=document.createElement('div');d.textContent=l;d.onclick=()=>{ex.value=v;ex.focus();live()};$('#hist').prepend(d)}
const keys=[['sin','sin(','fn'],['cos','cos(','fn'],['tan','tan(','fn'],['ln','ln(','fn'],['log','log(','fn'],['AC','ac','op'],
['sin⁻¹','asin(','fn'],['cos⁻¹','acos(','fn'],['tan⁻¹','atan(','fn'],['√','√(','fn'],['x²','^2','fn'],['⌫','del','op'],
['(','(','op'],[')',')','op'],['π','π','op'],['e','e','op'],['xʸ','^','fn'],['n!','!','fn'],
['7','7'],['8','8'],['9','9'],['÷','÷','op'],['%','%','op'],['ANS','ANS','op'],
['4','4'],['5','5'],['6','6'],['×','×','op'],['EXP','*10^','fn'],['1/x','1/(','fn'],
['1','1'],['2','2'],['3','3'],['−','−','op'],['M+','m+','fn'],['M−','m-','fn'],
['0','0'],['.','.'],['±','neg','op'],['+','+','op'],['MR','mr','fn'],['=','eq','eq']];
keys.forEach(([l,v,c])=>{const b=document.createElement('button');b.textContent=l;b.className=c||'';b.onclick=()=>key(v);$('#pad').appendChild(b)});
function key(v){
 if(v==='ac'){ex.value='';res.textContent='';return}
 if(v==='del'){ex.value=ex.value.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|ln\(|log\(|ANS|.)$/,'');live();return}
 if(v==='eq'){eq();return}
 if(v==='neg'){ex.value=ex.value.startsWith('−')?ex.value.slice(1):'−'+ex.value;live();return}
 if(v==='m+'||v==='m-'){try{const x=ev(ex.value||String(ans));memv+=v==='m+'?x:-x;$('#mem').textContent='M: '+fmt(memv)}catch(e){}return}
 if(v==='mr'){ins(fmt(memv));return}
 ins(v);
}
ex.addEventListener('input',live);
ex.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();eq()}});
$('#deg').onclick=()=>{deg=true;$('#deg').classList.add('on');$('#rad').classList.remove('on');live()};
$('#rad').onclick=()=>{deg=false;$('#rad').classList.add('on');$('#deg').classList.remove('on');live()};

/* Formulas */
const fsel=$('#fsel');FORMULAS.forEach((f,i)=>fsel.add(new Option(f.n,i)));
function rf(){const f=FORMULAS[fsel.value];const box=$('#fin');box.innerHTML='';
 f.i.forEach(([id,l,d])=>{const w=document.createElement('div');w.innerHTML='<label for="f_'+id+'">'+l+'</label><input type="number" step="any" id="f_'+id+'" value="'+d+'">';w.querySelector('input').oninput=cf;box.appendChild(w)});
 $('#fnote').textContent=f.t||'';cf()}
function cf(){const f=FORMULAS[fsel.value],v={};f.i.forEach(([id])=>v[id]=parseFloat($('#f_'+id).value));
 $('#fout').innerHTML=f.o.map(([l,fn,u])=>{let r=fn(v);r=typeof r==='number'?(isFinite(r)?fmt(r):'—'):r;return '<div><span>'+l+'</span><b>'+r+' '+u+'</b></div>'}).join('')}
fsel.onchange=rf;

/* Units */
const U={Length:{mm:.001,cm:.01,m:1,km:1000,in:.0254,ft:.3048},Mass:{g:.001,kg:1,tonne:1000,lb:.45359237},Force:{N:1,kN:1000,kgf:9.80665,lbf:4.4482216},
Pressure:{Pa:1,kPa:1e3,MPa:1e6,bar:1e5,psi:6894.757,atm:101325},Energy:{J:1,kJ:1e3,kWh:3.6e6,cal:4.184,BTU:1055.056},Power:{W:1,kW:1e3,hp:745.7,PS:735.499},
Torque:{'N·m':1,'kgf·m':9.80665,'lbf·ft':1.355818},Temperature:{'°C':0,'K':0,'°F':0}};
const ucat=$('#ucat'),ufrom=$('#ufrom');Object.keys(U).forEach(k=>ucat.add(new Option(k)));
function ru(){ufrom.innerHTML='';Object.keys(U[ucat.value]).forEach(k=>ufrom.add(new Option(k)));cu()}
function cu(){const c=ucat.value,v=parseFloat($('#uval').value),from=ufrom.value;let h='';
 for(const u in U[c]){if(u===from)continue;let r;
  if(c==='Temperature'){const k=from==='°C'?v+273.15:from==='°F'?(v-32)*5/9+273.15:v;r=u==='°C'?k-273.15:u==='°F'?(k-273.15)*9/5+32:k}
  else r=v*U[c][from]/U[c][u];
  h+='<div><span>'+u+'</span><b>'+(isFinite(r)?fmt(r):'—')+'</b></div>'}
 $('#uout').innerHTML=h}
ucat.onchange=ru;ufrom.onchange=cu;$('#uval').oninput=cu;

/* Constants */
const C=[['g (gravity)','9.80665','m/s²'],['Steel E','200000','MPa'],['Aluminium E','69000','MPa'],['Copper E','110000','MPa'],['Steel density','7850','kg/m³'],['Aluminium density','2700','kg/m³'],['Water density','1000','kg/m³'],
['Air density (20°C)','1.204','kg/m³'],['Steel G','80000','MPa'],['Steel Poisson ν','0.3',''],['Gas constant R','8.314462','J/mol·K'],['Air R','287','J/kg·K'],['Stefan–Boltzmann σ','5.670374e-8','W/m²K⁴'],
['Atm pressure','101325','Pa'],['Steel k','50','W/m·K'],['Water Cp','4186','J/kg·K'],['Speed of light','299792458','m/s']];
$('#ctbl').innerHTML=C.map(([n,v,u])=>'<tr data-v="'+v+'"><td>'+n+'</td><td>'+v+' '+u+'</td></tr>').join('');
$('#ctbl').onclick=e=>{const r=e.target.closest('tr');if(r){show('calc');ins(r.dataset.v)}};

/* Tabs & theme */
function show(t){
 document.querySelectorAll('section[role="tabpanel"]').forEach(s=>s.hidden=s.id!==t);
 document.querySelectorAll('[role="tab"]').forEach(b=>{const active=b.dataset.t===t;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>show(b.dataset.t));
$('.tabs').addEventListener('keydown',e=>{
 const tabs=[...document.querySelectorAll('[role="tab"]')],i=tabs.indexOf(document.activeElement);if(i<0)return;
 let next=null;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;
 if(next!==null){e.preventDefault();tabs[next].focus();show(tabs[next].dataset.t)}
});
$('#theme').onclick=()=>{const r=document.documentElement;const dk=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dk?'light':'dark'};
/* Solve */
function mg(){const n=+$('#msz').value;let h='<div style="display:grid;gap:4px;grid-template-columns:repeat('+(n+1)+',1fr)">';for(let i=0;i<n;i++)for(let j=0;j<=n;j++)h+='<input type="number" step="any" class="mi m" data-i="'+i+'" data-j="'+j+'" value="'+(j==n?'':(i==j?1:0))+'" placeholder="'+(j==n?'b':'0')+'"'+(j==n?' style="border-color:var(--acc)"':'')+'>';$('#mgrid').innerHTML=h+'</div>';document.querySelectorAll('#mgrid .m').forEach(e=>e.setAttribute('aria-label','Coefficient row '+(+e.dataset.i+1)+' column '+(+e.dataset.j+1)));$('#mout').innerHTML=''}
function ms(){const n=+$('#msz').value,M=[...Array(n)].map(()=>Array(n+1).fill(0));document.querySelectorAll('.m').forEach(e=>M[e.dataset.i][e.dataset.j]=parseFloat(e.value)||0);let det=1;
for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
if(Math.abs(M[p][c])<1e-12){$('#mout').innerHTML='<div><span>det A</span><b>0</b></div><div>No unique solution (singular matrix).</div>';return}
if(p!=c){[M[p],M[c]]=[M[c],M[p]];det=-det}det*=M[c][c];
for(let r=0;r<n;r++)if(r!=c){const f=M[r][c]/M[c][c];for(let k=c;k<=n;k++)M[r][k]-=f*M[c][k]}}
$('#mout').innerHTML='<div><span>det A</span><b>'+fmt(det)+'</b></div>'+M.map((r,i)=>'<div><span>x'+(i+1)+'</span><b>'+fmt(r[n]/r[i])+'</b></div>').join('')}
function ns(){const f=$('#nf').value;let x=parseFloat($('#nx').value);const g=t=>ev(f,t),o=deg;deg=false;try{for(let i=0;i<100;i++){const y=g(x),h=1e-6*(Math.abs(x)+1),d=(g(x+h)-g(x-h))/(2*h);if(!d)throw 0;const nx=x-y/d;if(Math.abs(nx-x)<1e-12){x=nx;break}x=nx}$('#nout').innerHTML='<div><span>x</span><b>'+fmt(x)+'</b></div><div><span>f(x)</span><b>'+fmt(g(x))+'</b></div>'}catch(e){$('#nout').textContent='No root found. Try another guess or check f(x).'}deg=o}
$('#msz').onchange=mg;$('#msolve').onclick=ms;$('#nsolve').onclick=ns;mg();
/* Graph */
function gp(){const c=$('#cv'),g=c.getContext('2d'),W=c.width,H=c.height,s=getComputedStyle(document.documentElement),ink=s.getPropertyValue('--ink'),ln=s.getPropertyValue('--line'),ac=s.getPropertyValue('--acc');
const x0=+$('#gx0').value,x1=+$('#gx1').value,o=deg;deg=false;const P=[];let a=1e99,b=-1e99;
for(let i=0;i<=W;i++){const x=x0+(x1-x0)*i/W;let y=NaN;try{y=ev($('#gf').value,x)}catch(e){}P.push(y);if(isFinite(y)&&Math.abs(y)<1e9){a=Math.min(a,y);b=Math.max(b,y)}}deg=o;
if(a>b){a=-1;b=1}if(a==b){a-=1;b+=1}const pd=(b-a)*.08;a-=pd;b+=pd;const X=x=>(x-x0)/(x1-x0)*W,Y=y=>H-(y-a)/(b-a)*H;
g.clearRect(0,0,W,H);g.strokeStyle=ln;g.lineWidth=1;g.beginPath();if(a<0&&b>0){g.moveTo(0,Y(0));g.lineTo(W,Y(0))}if(x0<0&&x1>0){g.moveTo(X(0),0);g.lineTo(X(0),H)}g.stroke();
g.strokeStyle=ac;g.lineWidth=2;g.beginPath();let pen=false;P.forEach((y,i)=>{if(!isFinite(y)||Math.abs(y)>1e9){pen=false;return}pen?g.lineTo(i,Y(y)):g.moveTo(i,Y(y));pen=true});g.stroke();
g.fillStyle=ink;g.font='12px IBM Plex Mono, monospace';g.fillText('ymax '+fmt(b).slice(0,8),4,12);g.fillText('ymin '+fmt(a).slice(0,8),4,H-4);g.fillText('x: '+x0+' to '+x1,W-110,H-4)}
$('#gplot').onclick=gp;document.querySelector('[data-t=graph]').addEventListener('click',gp);
/* Steam */
const ST=[[1,99.63,417.46,2258,2675.5,1.694],[2,120.23,504.7,2201.9,2706.7,.8857],[5,151.86,640.23,2108.5,2748.7,.3749],[10,179.91,762.81,2015.3,2778.1,.1944],[20,212.42,908.79,1890.7,2799.5,.09963],[40,250.4,1087.31,1714.1,2801.4,.04978],[100,311.06,1407.56,1317.1,2724.7,.01802]];
$('#stbl').innerHTML='<tr><td>P bar</td><td>Tsat</td><td>hf</td><td>hfg</td><td>hg</td><td>vg</td></tr>'+ST.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('');
function sc(){const p=+$('#sp').value;if(!(p>=1&&p<=100)){$('#sout').textContent='Enter a pressure from 1 to 100 bar.';return}let i=ST.findIndex(r=>r[0]>=p);if(i<1)i=1;const A=ST[i-1],B=ST[i],t=(p-A[0])/(B[0]-A[0]),L=['Tsat (°C)','hf (kJ/kg)','hfg (kJ/kg)','hg (kJ/kg)','vg (m³/kg)'];$('#sout').innerHTML=L.map((l,k)=>'<div><span>'+l+'</span><b>'+fmt(A[k+1]+(B[k+1]-A[k+1])*t)+'</b></div>').join('')}
$('#sp').oninput=sc;sc();
/* Logo & install */
const LOGO='<svg viewBox="0 0 40 40" role="img" aria-label="GPN CALC logo"><rect width="40" height="40" rx="9" fill="#1d2730"/><circle cx="20" cy="20" r="11" fill="none" stroke="#e8590c" stroke-width="4" stroke-dasharray="3.6 2.8"/><circle cx="20" cy="20" r="8" fill="#e8590c"/><circle cx="20" cy="20" r="4.5" fill="#1d2730"/></svg>';
document.querySelectorAll('.logo').forEach(e=>e.innerHTML=LOGO);
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});
$('#inst').onclick=()=>{if(dp){dp.prompt();dp=null}else $('#ihelp').hidden=false};
$('#frac').onclick=()=>{frac=!frac;$('#frac').classList.toggle('on',frac);if(ex.value.trim())live();else if(res.textContent&&res.textContent!=='Error')res.textContent=sh(ans)};
/* Casio-style keypad */
let SH=0,AL=0,HY=0,pend=null,eng=false;
const toE=r=>{if(!r)return'0';const e=Math.floor(Math.log10(Math.abs(r))/3)*3;return Number((r/10**e).toPrecision(10))+'×10^'+e};
'ABCDEFXYM'.split('').forEach(k=>F[k]=0);
Object.assign(F,{cbrt:Math.cbrt,root:(n,x)=>Math.pow(x,1/n),nCr:(n,r)=>fact(n)/(fact(r)*fact(n-r)),nPr:(n,r)=>fact(n)/fact(n-r),sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,asinh:Math.asinh,acosh:Math.acosh,atanh:Math.atanh,Rnd:x=>Number(x.toPrecision(10)),Ran:()=>Math.floor(Math.random()*1000)/1000,
Pol:(x,y)=>{const a=Math.atan2(y,x);F.X=Math.hypot(x,y);F.Y=ang(a);return F.X},
Rec:(r,t)=>{const a=rad(t);F.X=r*Math.cos(a);F.Y=r*Math.sin(a);return F.X}});
const K1=[['SHIFT',,'sh',,,'op'],['ALPHA',,'al',,,'op'],['◀',,'left',,,'op'],['▶',,'right',,,'op'],['D/R',,'dr',,,'op'],['CLR',,'clr',,,'op'],
['x⁻¹','x!','^(-1)','!',,'fn'],['nCr','nPr','nCr(','nPr(',,'fn'],['Pol(','Rec(','Pol(','Rec(',,'fn'],['x³','³√','^3','cbrt(',,'fn'],['S⇔D',,'frac',,,'fn'],['√',,'√(',,,'fn'],
['x²',,'^2',,,'fn'],['xʸ','ˣ√','^','root(',,'fn'],['log','10ˣ','log(','10^(',,'fn'],['ln','eˣ','ln(','e^(',,'fn'],['(−)',,'−',,'A','fn'],['hyp',,'hyp',,'C','fn'],
['sin','sin⁻¹','sin(','asin(','D','fn'],['cos','cos⁻¹','cos(','acos(','E','fn'],['tan','tan⁻¹','tan(','atan(','F','fn'],['(',,,,,'op'],[')',,,,'X','op'],[',',,,,'Y','op'],
['RCL','STO','rcl','sto',,'fn'],['ENG',,'eng',,,'fn'],['M+','M−','m+','m-','M','fn'],['π',,,,,'op'],['e',,,,'B','op'],['□/□',,'fr',,,'fn']];
const K2=[['7'],['8'],['9'],['DEL',,'del',,,'op'],['AC',,'ac',,,'op'],['4'],['5'],['6'],['×',,,,,'op'],['÷',,,,,'op'],['1'],['2'],['3'],['+',,,,,'op'],['−',,,,,'op'],
['0','Rnd','0','Rnd('],['.','Ran#','.','Ran()'],['×10ˣ','π','×10^','π'],['Ans','DRG▶','ANS','dr'],['=','%','eq','%',,'eq']];
function mk(box,K){K.forEach(k=>{const [m,s='',v=m,sv='',a='',c='']=k;const b=document.createElement('button');b.className=c;b.innerHTML=(s?'<i class=s>'+s+'</i>':'')+m+(a?'<i class=a>'+a+'</i>':'');if(s)b.dataset.s=1;if(a)b.dataset.a=1;b.onclick=()=>press({v,sv,a});box.appendChild(b)})}
mk($('#k1'),K1);mk($('#k2'),K2);
function mm(){$('#mem').textContent=pend?pend.toUpperCase()+': press a key with a red letter':'M: '+fmt(F.M)}
function st(){$('#kp').classList.toggle('shon',!!SH);$('#kp').classList.toggle('alon',!!AL||!!pend);mm()}
function rl(){if(ex.value.trim())live();else if(res.textContent&&res.textContent!=='Error')res.textContent=sh(ans)}
function press(k){
 if(k.v==='sh'){SH=!SH;AL=0;st();return}
 if(k.v==='al'){AL=!AL;SH=0;st();return}
 let v=k.v;
 if(pend&&k.a){const l=k.a;if(pend==='sto'){try{F[l]=ev(ex.value||'ANS');res.textContent=l+' = '+fmt(F[l])}catch(e){res.textContent='Error'}}else ins('('+fmt(F[l])+')');pend=null;SH=AL=0;st();return}
 if(AL&&k.a)v=k.a;else if(SH&&k.sv)v=k.sv;
 SH=AL=0;run(v);st()}
function run(v){
 const M={ac:()=>{ex.value='';res.textContent=''},eq,
 del:()=>{const s=ex.selectionStart,m=ex.value.slice(0,s).match(/(a?(?:sin|cos|tan)h?\(|ln\(|log\(|cbrt\(|root\(|nCr\(|nPr\(|Pol\(|Rec\(|Rnd\(|Ran\(\)|ANS|.)$/);if(m){ex.setRangeText('',s-m[0].length,s,'end');live()}},
 dr:()=>setAng(deg===true?false:deg==='g'?true:'g'),clr:()=>{$('#hist').innerHTML=''},frac:()=>$('#frac').click(),eng:()=>{eng=!eng;rl()},
 'm+':()=>{try{F.M+=ev(ex.value||'ANS')}catch(e){}},'m-':()=>{try{F.M-=ev(ex.value||'ANS')}catch(e){}},
 fr:()=>{ins('()/()');const p=ex.selectionStart-4;ex.setSelectionRange(p,p)},
 rcl:()=>{pend='rcl'},sto:()=>{pend='sto'},hyp:()=>{HY=1},
 left:()=>{const p=Math.max(0,ex.selectionStart-1);ex.focus();ex.setSelectionRange(p,p)},right:()=>{const p=ex.selectionStart+1;ex.focus();ex.setSelectionRange(p,p)}};
 if(M[v])return M[v]();
 if(HY&&/^a?(sin|cos|tan)\($/.test(v))v=v.replace(/(sin|cos|tan)/,'$1h');HY=0;ins(v)}
mk($('#k3'),[['(',,,,,'op'],[')',,,,,'op'],['%',,,,,'op'],['√',,'√(',,,'op'],['x²',,'^2',,,'op']]);
function setMode(s){$('#k1').hidden=s;$('#k3').hidden=!s;$('#deg').hidden=$('#rad').hidden=$('#grd').hidden=s;$('#mode').textContent=s?'Scientific':'Simple';SH=AL=0;st();try{localStorage.setItem('gpnMode',s?'s':'')}catch(e){}}
$('#mode').onclick=()=>setMode(!$('#k1').hidden);
try{if(localStorage.getItem('gpnMode')==='s')setMode(true)}catch(e){}
/* Voice input */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const vlang=()=>$('#vl1').value;
try{const v=localStorage.getItem('gpnLang');if(v&&$('#vl1').querySelector('[value="'+v+'"]'))$('#vl1').value=$('#vl2').value=v}catch(e){}
['#vl1','#vl2'].forEach(q=>$(q).onchange=e=>{$('#vl1').value=$('#vl2').value=e.target.value;try{localStorage.setItem('gpnLang',e.target.value)}catch(_){}});
const voiceDialog=$('#voice-review');let voiceTarget='calc';
function showVoiceReview(raw,target){
 voiceTarget=target;$('#voice-heard').value=raw;$('#voice-expression').value=parseSpokenExpression(raw);
 $('#voice-review-help').textContent='Check the recognized words and edit the equation before using it. Recognition quality depends on your browser and selected language.';
 if(!voiceDialog.open)voiceDialog.showModal();
 $('#voice-expression').focus();
}
$('#voice-cancel').onclick=()=>voiceDialog.close();
$('#voice-use').onclick=()=>{
 const expression=$('#voice-expression').value.trim();
 if(!expression){$('#voice-expression').focus();return}
 voiceDialog.close();
 if(voiceTarget==='nb')ntxt(expression);else ins(expression);
};
const DG=[0,3,4,5,6,8];$('#dg').onclick=()=>{dig=DG[(DG.indexOf(dig)+1)%DG.length];$('#dg').textContent='Sig: '+(dig||'Auto');rl()};
/* Notebook editor */
const ned=$('#ned'),nres=$('#nres'),Z='\u200b';let nrg=null;
document.addEventListener('selectionchange',()=>{const g=getSelection();if(g.rangeCount&&ned.contains(g.anchorNode))nrg=g.getRangeAt(0).cloneRange()});
function nrs(){ned.focus();const g=getSelection();g.removeAllRanges();if(nrg)g.addRange(nrg);else{const r=document.createRange();r.selectNodeContents(ned);r.collapse(false);g.addRange(r)}}
function nx(n){let t='';n.childNodes.forEach(c=>{if(c.nodeType===3)t+=c.textContent.replace(/\u200b/g,'');else if(c.classList.contains('fr'))t+='(('+nx(c.children[0])+')/('+nx(c.children[1])+'))';else if(c.classList.contains('sq'))t+='\u221a('+nx(c.children[0])+')';else if(c.classList.contains('pw'))t+='^('+nx(c)+')';else t+=nx(c)});return t}
function nl(){try{const t=nx(ned);nres.textContent=t.trim()?sh(ev(t)):''}catch(e){nres.textContent=''}}
function ntxt(t){nrs();document.execCommand('insertText',false,t);nl()}
function ntpl(h){nrs();document.execCommand('insertHTML',false,h);const a=ned.querySelector('[data-new]'),b=ned.querySelector('[data-aft]'),g=getSelection(),r=document.createRange();
 if(a){a.removeAttribute('data-new');r.selectNodeContents(a);r.collapse(false)}else if(b){b.removeAttribute('data-aft');r.setStartAfter(b);r.collapse(true)}else{nl();return}
 g.removeAllRanges();g.addRange(r);nl()}
function nbox(){const g=getSelection(),n=g.anchorNode,e=n.nodeType===3?n.parentNode:n;const b=e.closest('.nu,.de,.in,.pw');return b&&ned.contains(b)?b:null}
function nmv(d){nrs();const g=getSelection(),b=nbox();
 if(b){const r=document.createRange();if(d>0){r.setStart(g.anchorNode,g.anchorOffset);r.setEnd(b,b.childNodes.length)}else{r.setStart(b,0);r.setEnd(g.anchorNode,g.anchorOffset)}
  if(r.toString().replace(/\u200b/g,'')===''){const P=b.classList.contains('pw')?b:b.parentNode,q=document.createRange();
   if(d>0){if(b.classList.contains('nu')){q.selectNodeContents(b.nextSibling);q.collapse(true)}else{q.setStartAfter(P);q.collapse(true)}}
   else{if(b.classList.contains('de')){q.selectNodeContents(b.previousSibling);q.collapse(false)}else{q.setStartBefore(P);q.collapse(true)}}
   g.removeAllRanges();g.addRange(q);return}}
 g.modify('move',d>0?'forward':'backward','character')}
function ndl(){nrs();const g=getSelection(),b=nbox();
 if(b){const r=document.createRange();r.setStart(b,0);r.setEnd(g.anchorNode,g.anchorOffset);
  if(r.toString().replace(/\u200b/g,'')===''){const P=b.classList.contains('pw')?b:b.parentNode;
   if(!P.textContent.replace(/\u200b/g,'')){const q=document.createRange();q.setStartBefore(P);q.collapse(true);P.remove();g.removeAllRanges();g.addRange(q)}else nmv(-1);nl();return}}
 document.execCommand('delete');nl()}
const T=t=>()=>ntxt(t),fr='<span class="fr"><span class="nu" data-new>'+Z+'</span><span class="de">'+Z+'</span></span>';
const NK=[['\u25a1/\u25a1',()=>ntpl(fr)],['\u221a\u25a1',()=>ntpl('<span class="sq"><span class="in" data-new>'+Z+'</span></span>')],['x\u25a1',()=>ntpl('<span class="pw" data-new>'+Z+'</span>')],['x\u00b2',()=>ntpl('<span class="pw" data-aft>2</span>')],['\u00d710\u25a1',()=>ntpl('\u00d710<span class="pw" data-new>'+Z+'</span>')],
['sin',T('sin(')],['cos',T('cos(')],['tan',T('tan(')],['log',T('log(')],['ln',T('ln(')],
['(',T('(')],[')',T(')')],['\u03c0',T('\u03c0')],['\u25c0',()=>nmv(-1)],['\u25b6',()=>nmv(1)],
['7',T('7')],['8',T('8')],['9',T('9')],['DEL',ndl,'op'],['AC',()=>{ned.innerHTML='';nrg=null;nres.textContent='';ned.focus()},'op'],
['4',T('4')],['5',T('5')],['6',T('6')],['\u00d7',T('\u00d7'),'op'],['\u00f7',T('\u00f7'),'op'],
['1',T('1')],['2',T('2')],['3',T('3')],['+',T('+'),'op'],['\u2212',T('\u2212'),'op'],
['0',T('0')],['.',T('.')],['e',T('e')],['Ans',T('ANS')],['=',()=>{try{ans=ev(nx(ned));nres.textContent=sh(ans)}catch(e){nres.textContent='Error'}},'eq']];
NK.forEach(([l,f,c])=>{const b=document.createElement('button');b.textContent=l;b.className=c||(/^[a-z\u221a\u25a1x\u00d7\u03c0]/.test(l)&&l.length>1?'fn':'');b.onmousedown=e=>e.preventDefault();b.onclick=f;$('#nk').appendChild(b)});
ned.addEventListener('input',nl);
$('#ndg').onclick=()=>{$('#dg').click();$('#ndg').textContent=$('#dg').textContent;nl()};
$('#nsd').onclick=()=>{$('#frac').click();nl()};
show('nb');
/* Angle unit */
function setAng(v){deg=v;['#deg','#rad','#grd'].forEach(q=>$(q).classList.remove('on'));$(v===true?'#deg':v==='g'?'#grd':'#rad').classList.add('on');live();nl()}
$('#deg').onclick=()=>setAng(true);$('#rad').onclick=()=>setAng(false);$('#grd').onclick=()=>setAng('g');
/* Tools */
const cm=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],cd=(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]};
const cl=x=>Math.abs(x)<1e-9?0:x,cxs=(a,b)=>{a=cl(a);b=cl(b);return b===0?fmt(a):(a===0?'':fmt(a)+(b<0?' \u2212 ':' + '))+fmt(a===0?b:Math.abs(b))+'i'};
const nums=t=>t.split(/[,\s;]+/).filter(x=>x!=='').map(Number),mat=t=>t.split(';').map(r=>r.trim().split(/[,\s]+/).map(Number));
const ms2=m=>m.map(r=>r.map(x=>fmt(cl(x))).join('   ')).join('\n');
const mmul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((q,x,k)=>q+x*B[k][j],0)));
function minv(A){const n=A.length,M=A.map((r,i)=>[...r,...A.map((_,j)=>+(i===j))]);for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<1e-12)return null;[M[p],M[c]]=[M[c],M[p]];const d=M[c][c];M[c]=M[c].map(x=>x/d);for(let r=0;r<n;r++)if(r!==c){const f=M[r][c];M[r]=M[r].map((x,k)=>x-f*M[c][k])}}return M.map(r=>r.slice(n))}
function mdet(A){const n=A.length,M=A.map(r=>[...r]);let d=1;for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<1e-12)return 0;if(p!==c){[M[p],M[c]]=[M[c],M[p]];d=-d}d*=M[c][c];for(let r=c+1;r<n;r++){const f=M[r][c]/M[c][c];for(let k=c;k<n;k++)M[r][k]-=f*M[c][k]}}return d}
function proots(c){const n=c.length-1,a=c.map(x=>x/c[0]);let z=[],p=[1,0];for(let k=0;k<n;k++){z.push(p);p=cm(p,[.4,.9])}
 for(let it=0;it<800;it++){let m=0;for(let i=0;i<n;i++){let v=[1,0];for(let k=1;k<=n;k++){v=cm(v,z[i]);v[0]+=a[k]}let d=[1,0];for(let j=0;j<n;j++)if(j!==i)d=cm(d,[z[i][0]-z[j][0],z[i][1]-z[j][1]]);const q=cd(v,d);z[i]=[z[i][0]-q[0],z[i][1]-q[1]];m=Math.max(m,Math.hypot(q[0],q[1]))}if(m<1e-14)break}return z}
function pc(t){t=t.replace(/\s+/g,'').replace(/\u2212/g,'-');if(!/i$/.test(t))return[Number(t),0];const m=t.match(/^(?:([+-]?\d*\.?\d+)(?=[+-]))?([+-]?\d*\.?\d*)i$/);if(!m)return[NaN,NaN];return[m[1]?Number(m[1]):0,m[2]===''||m[2]==='+'?1:m[2]==='-'?-1:Number(m[2])]}
const noDeg=fn=>{const o=deg;deg=false;try{return fn()}finally{deg=o}};
const TL=[
{n:'Quadratic, cubic & polynomial roots',i:[['c','Coefficients, highest power first','1,-6,11,-6']],t:'x\u00b3 \u2212 6x\u00b2 + 11x \u2212 6  \u2192  1,-6,11,-6.  Quadratic: 1,-5,6.  Complex roots shown as a + bi.',
 f:v=>{const c=nums(v.c);while(c.length&&c[0]===0)c.shift();if(c.length<2||c.some(isNaN))throw 0;return proots(c).sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map((z,i)=>['x'+(i+1),cxs(z[0],z[1])])}},
{n:'Matrix: add, multiply, determinant, inverse',i:[['A','Matrix A (rows separated by ;)','1,2;3,4'],['B','Matrix B','5,6;7,8']],t:'Example 2\u00d72: 1,2;3,4',
 f:v=>{const A=mat(v.A),B=mat(v.B),o=[];const sq=A.length===A[0].length;
  if(sq){o.push(['det A',fmt(cl(mdet(A)))]);const I=minv(A);o.push(['A\u207b\u00b9',I?ms2(I):'singular (no inverse)'])}
  o.push(['A transpose',ms2(A[0].map((_,j)=>A.map(r=>r[j])))]);
  if(A.length===B.length&&A[0].length===B[0].length)o.push(['A + B',ms2(A.map((r,i)=>r.map((x,j)=>x+B[i][j])))]);
  if(A[0].length===B.length)o.push(['A \u00d7 B',ms2(mmul(A,B))]);return o}},
{n:'Vectors: dot, cross, magnitude, angle',i:[['a','Vector A','1,2,3'],['b','Vector B','4,5,6']],t:'Same number of components (2 or 3).',
 f:v=>{const a=nums(v.a),b=nums(v.b);if(a.length!==b.length||a.some(isNaN)||b.some(isNaN))throw 0;const d=a.reduce((s,x,i)=>s+x*b[i],0),ma=Math.hypot(...a),mb=Math.hypot(...b),o=[['A + B',a.map((x,i)=>fmt(x+b[i])).join(', ')],['A \u2212 B',a.map((x,i)=>fmt(x-b[i])).join(', ')],['A \u00b7 B',fmt(d)],['|A|',fmt(ma)],['|B|',fmt(mb)],['Angle between',fmt(Math.acos(d/(ma*mb))*180/Math.PI)+' deg']];
  if(a.length===3)o.splice(3,0,['A \u00d7 B',[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]].map(fmt).join(', ')]);if(a.length===2)o.splice(3,0,['A \u00d7 B (z)',fmt(a[0]*b[1]-a[1]*b[0])]);return o}},
{n:'Complex numbers',i:[['p','z\u2081','3+4i'],['q','z\u2082','1-2i']],t:'Write like 3+4i, 2-i, 5i.',
 f:v=>{const a=pc(v.p),b=pc(v.q);if(a.concat(b).some(isNaN))throw 0;const m=cm(a,b),d=cd(a,b),r=Math.hypot(...a),th=Math.atan2(a[1],a[0]),sr=Math.sqrt(r);return[['z\u2081 + z\u2082',cxs(a[0]+b[0],a[1]+b[1])],['z\u2081 \u2212 z\u2082',cxs(a[0]-b[0],a[1]-b[1])],['z\u2081 \u00d7 z\u2082',cxs(m[0],m[1])],['z\u2081 \u00f7 z\u2082',cxs(d[0],d[1])],['|z\u2081|',fmt(r)],['arg z\u2081',fmt(th*180/Math.PI)+' deg'],['conjugate',cxs(a[0],-a[1])],['\u221az\u2081',cxs(sr*Math.cos(th/2),sr*Math.sin(th/2))]]}},
{n:'Calculus: derivative, integral, limit',i:[['f','f(x)','x^3-2*x'],['x','Point x\u2080','2'],['a','Integral from a','0'],['b','to b','3']],t:'Derivative and limit at x\u2080. Integral by Simpson rule. Angles in radians.',
 f:v=>noDeg(()=>{const g=x=>ev(v.f,x),x=+v.x,h=1e-5*(Math.abs(x)+1),H=1e-3*(Math.abs(x)+1),a=+v.a,b=+v.b,N=2000,hh=(b-a)/N;let s=g(a)+g(b);for(let i=1;i<N;i++)s+=g(a+i*hh)*(i%2?4:2);
  const L=g(x-1e-7),R=g(x+1e-7);return[['f(x\u2080)',fmt(g(x))],["f'(x\u2080)",fmt(cl((g(x+h)-g(x-h))/(2*h)))],["f''(x\u2080)",fmt(cl((g(x+H)-2*g(x)+g(x-H))/(H*H)))],['\u222b f dx  (a to b)',fmt(s*hh/3)],['limit from left',fmt(L)],['limit from right',fmt(R)],['limit exists?',Math.abs(L-R)<1e-4*(1+Math.abs(L))?'Yes, \u2248 '+fmt((L+R)/2):'No (left \u2260 right)']]})},
{n:'Statistics & linear regression',i:[['x','Data x (comma separated)','2,4,4,5,7,9'],['y','Data y (optional, for regression)','1,3,4,4,6,8']],t:'Leave y empty if you only need mean and standard deviation.',
 f:v=>{const x=nums(v.x),n=x.length;if(!n||x.some(isNaN))throw 0;const sum=x.reduce((p,q)=>p+q,0),m=sum/n,ss=x.reduce((p,q)=>p+(q-m)**2,0),so=[...x].sort((p,q)=>p-q),med=n%2?so[(n-1)/2]:(so[n/2-1]+so[n/2])/2;
  const o=[['n',n],['Sum',fmt(sum)],['Mean',fmt(m)],['Median',fmt(med)],['Min / Max',fmt(so[0])+' / '+fmt(so[n-1])],['Variance (sample)',n>1?fmt(ss/(n-1)):'-'],['Std dev (sample)',n>1?fmt(Math.sqrt(ss/(n-1))):'-'],['Std dev (population)',fmt(Math.sqrt(ss/n))]];
  const y=nums(v.y);if(v.y.trim()&&y.length===n&&n>1){const my=y.reduce((p,q)=>p+q,0)/n,sxy=x.reduce((p,q,i)=>p+(q-m)*(y[i]-my),0),syy=y.reduce((p,q)=>p+(q-my)**2,0),b=sxy/ss,a=my-b*m;o.push(['Regression  y = a + bx',''],['a (intercept)',fmt(a)],['b (slope)',fmt(b)],['r (correlation)',fmt(sxy/Math.sqrt(ss*syy))])}return o}},
{n:'Table of f(x)',i:[['f','f(x)','x^2+1'],['a','Start x','0'],['b','End x','5'],['s','Step','0.5']],t:'Shows up to 60 rows. Angles in radians.',
 f:v=>noDeg(()=>{const a=+v.a,b=+v.b,s=+v.s,o=[];if(!(s>0)||b<a)throw 0;for(let x=a,i=0;x<=b+1e-12&&i<60;x+=s,i++){const q=Number(x.toPrecision(12));let y;try{y=fmt(ev(v.f,q))}catch(e){y='-'}o.push(['x = '+q,y])}return o})}
];
const tsel=$('#tsel');TL.forEach((t,i)=>tsel.add(new Option(t.n,i)));
function tcl(){const t=TL[tsel.value],v={};t.i.forEach(([id])=>v[id]=$('#t_'+id).value);let h;try{h=t.f(v).map(([l,x])=>'<div><span>'+l+'</span><b>'+x+'</b></div>').join('')}catch(e){h='Check the input format.'}$('#tout').innerHTML=h}
function trn(){const t=TL[tsel.value];$('#tin').innerHTML=t.i.map(([id,l,d])=>'<label for="t_'+id+'">'+l+'</label><input id="t_'+id+'" value="'+d+'">').join('');$('#tin').querySelectorAll('input').forEach(e=>e.oninput=tcl);$('#tnote').textContent=t.t||'';tcl()}
tsel.onchange=trn;trn();
/* Steam engineering reference & extra data */
const REF=[
['Derived SI units (Table 2.1.1)',['Quantity','Name','Symbol','SI base unit','Derived unit'],['Area|square metre|A|m²|-','Volume|cubic metre|V|m³|-','Velocity|metre per second|u|m/s|-','Acceleration|metre per second squared|a|m/s²|-','Force|newton|N|kg m/s²|J/m','Energy|joule|J|kg m²/s²|N m','Pressure or stress|pascal|Pa|kg/m s²|N/m²','Power|watt|W|kg m²/s³|J/s']],
['Other derived quantities (Table 2.1.2)',['Quantity','SI base unit','Derived unit'],['Mass density|kg/m³|kg/m³','Specific volume (vg)|m³/kg|m³/kg','Specific enthalpy (h)|m²/s²|J/kg','Specific heat capacity (cp)|m²/s² K|J/kg K','Specific entropy|m²/s² K|J/kg K','Heat flowrate|m² kg/s³|J/s or W','Dynamic viscosity|kg/m s|N s/m²']],
['Dot notation and prefixes',null,['m = mass (e.g. kg).  ṁ = mass flow per unit time (e.g. kg/h) = mass flowrate. A dot means a rate.','One thousand metres can be written 1 km, 1 000 m or 10³ m.']],
['SI prefixes (Table 2.1.3)',['Factor','Prefix','Symbol'],['10¹²|tera|T','10⁹|giga|G','10⁶|mega|M','10³|kilo|k','10⁻³|milli|m','10⁻⁶|micro|μ','10⁻⁹|nano|n','10⁻¹²|pico|p']],
['Flowmetering symbols, ISO 5167 (Table 2.1.4)',['Symbol','Definition','Unit'],['qM|Mass flowrate|kg/s or kg/h','qV|Volume flowrate|m³/s','QI|Liquid flowrate|l/min','QS|Gas flowrate at STP|l/min','QF|Gas flowrate actual|l/min','QE|Equivalent water flowrate|l/min','DS|Density of gas at STP|kg/m³','DF|Density of gas actual|kg/m³','PS|Standard pressure (1.013 bar a)|bar a','PF|Actual flow pressure|bar a','TS|Standard temperature|°C','TF|Actual flow temperature|°C']],
['STP (standard temperature and pressure)',null,['Standard temperature is the freezing point of pure water, 0 °C (273.16 K in the source text). Standard pressure is 760 mm Hg, one atmosphere, about 14.7 lb/in² (1.01325 bar a).','Gas density is usually reported at STP. Properties that cannot be measured at STP are measured at other conditions and then extrapolated to STP.']],
['Symbols and units (Table 2.1.5)',['Symbol','Definition','Unit'],['A|Cross sectional area of a conduit|m² or mm²','cP|Specific heat capacity at constant pressure|kJ/kg °C or kJ/kg K','cV|Specific heat capacity at constant volume|kJ/m³ °C or kJ/m³ K','D|Diameter of circular cross section of a conduit|m or mm','d|Orifice diameter|m or mm','g|Acceleration due to gravity|9.81 m/s²','Hz|Hertz, unit of frequency|Hz or kHz','J|Joule, unit of energy|J or kJ','L|Length|m','M|Molar mass of a fluid|kg/mol','N|Newton, unit of force|N or kN','Pa|Pascal, unit of pressure|Pa or kPa','p|Static pressure of a fluid|bar or kPa','Δp|Differential pressure|bar or kPa','m|Metre, unit of length|m','m|Mass|kg','ṁ|Mass flowrate|kg/s or kg/h','ṁS|Steam mass flowrate|kg/s or kg/h','Q|Quantity of heat|kJ','Q̇|Heat transfer rate|kJ/s (kW)','R|Radius|m or mm','ReD|Reynolds number referred to D|dimensionless','s|Second, unit of time|s','Sr|Strouhal number|dimensionless','σ|Stress|N/m²','TS|Steam temperature|K or °C','TL|Liquid (or product) temperature|K or °C','ΔT|Temperature difference or change|K or °C','t|Time|s or h','u|Velocity of a fluid|m/s','μ|Dynamic viscosity of a fluid|Pa s or cP','ν|Kinematic viscosity|cSt','ρ|Density of a fluid|kg/m³','V̇|Volume flowrate|m³/s or m³/h','W|Unit of energy flow (watt)|W (J/s)','V (vg)|Volume (specific volume)|m³ (m³/kg)','H (hg)|Enthalpy (specific enthalpy)|kJ (kJ/kg)','S (sg)|Entropy (specific entropy)|kJ/K (kJ/kg K)','U (ug)|Internal energy (specific internal energy)|kJ (kJ/kg)']],
['Subscripts for enthalpy, entropy, internal energy',null,['f = fluid (liquid) state, e.g. hf is liquid enthalpy.','fg = change of state, liquid to gas, e.g. hfg is enthalpy of evaporation.','g = total (saturated steam), e.g. hg. By convention the total heat in superheated steam is written h.','Capital letters are sample quantities (H kJ). Lower case letters are per unit mass (h kJ/kg).']],
['Temperature',null,['Celsius (°C): zero at the freezing point of water. Kelvin (K): same step size as °C, zero at absolute zero (about −273 °C). K = °C + 273.15 (the source text uses 273.16).','SI unit is the kelvin = 1/273.16 of the thermodynamic temperature of the triple point of water (0.01 °C).','Most thermodynamic equations need kelvin. A temperature difference of 1 °C equals 1 K.']],
['Pressure',null,['SI unit is the pascal (Pa) = 1 N/m². kPa and MPa are common in steam work. 1 bar = 10⁵ N/m², about 1 atmosphere.','Absolute pressure (bar a) is measured from a perfect vacuum (0 bar a). Gauge pressure (bar g) is measured from atmospheric pressure.','Gauge pressure = absolute pressure − atmospheric pressure (1.01325 bar a). A pressure of −1 bar g is close to a perfect vacuum.','Differential pressure is the difference between two pressures and needs no a or g suffix, as long as both use the same datum.']],
['Density, specific volume, specific gravity',null,['Density ρ = mass / volume (kg/m³). Specific volume vg = volume / mass = 1/ρ (m³/kg).','Specific gravity (relative density) = ρ substance / ρ water at STP. Water is about 1 000 kg/m³, so SG > 1 sinks in water. SG has no units.']],
['Heat, work and energy',null,['Work = force × displacement = applied pressure × displaced volume. 1 Pa × 1 m³ = 1 N m = 1 J.','The watt is 1 J/s of heat flow. Other heat units: Btu (1 lb water by 1 °F) and kilocalorie (1 kg water by 1 °C).','Total energy of a system = internal + potential + kinetic energy. Temperature is related to internal energy ug.']],
['Specific enthalpy and specific heat capacity',null,['Specific enthalpy is the total energy (pressure plus temperature) per unit mass, in kJ/kg.','Heat needed: Q = m × cp × ΔT. Water cp is about 4.19 kJ/kg °C, which is why water and steam carry heat well.','Example 2.1.2: 2 litres (2 kg) of water from 20 °C to 70 °C: Q = 2 × 4.19 × 50 = 419 kJ.','For solids and liquids cP ≈ cv.']],
['Entropy',null,['Entropy measures disorder. Units kJ/kg K. Gas > liquid > solid.','Change of entropy = heat change / average absolute temperature, so Δs = Δh / T avg.','Example 2.1.3: water 0 to 100 °C, Δh = 419 kJ/kg. Example 2.1.4: evaporation at 100 °C, hfg = 2258 kJ/kg, sfg = hfg / T. Total sg = sf + sfg.','Example 2.1.5: superheating saturated steam at atmospheric pressure to 150 °C. Use the Formulas tab (Steam: entropy change) with your steam table values.']]
];
function rr(){const q=$('#rq').value.toLowerCase();let h='';REF.forEach(([t,hd,rows])=>{const r=rows.filter(x=>!q||(t+' '+x).toLowerCase().includes(q));if(!r.length)return;h+='<h3>'+t+'</h3>'+(hd?'<table class=rt><tr>'+hd.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+r.map(x=>'<tr>'+x.split('|').map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</table>':r.map(x=>'<p>'+x+'</p>').join(''))});$('#rbody').innerHTML=h||'<p>No match.</p>'}
$('#rq').oninput=rr;rr();
const FX=[
{n:'Steam: heat to warm water (litres)',i:[['l','Water volume (litres)',2],['t1','Start temp (°C)',20],['t2','End temp (°C)',70],['c','cp (kJ/kg°C)',4.19]],o:[['Mass (1 kg per litre)',v=>v.l,'kg'],['Heat Q = m·cp·ΔT',v=>v.l*v.c*(v.t2-v.t1),'kJ']],t:'Example 2.1.2: 2 kg from 20 to 70 °C gives 419 kJ.'},
{n:'Steam: gauge and absolute pressure',i:[['p','Pressure value (bar)',5],['a','Atmospheric (bar a)',1.01325]],o:[['If value is bar g, then',v=>v.p+v.a,'bar a'],['If value is bar a, then',v=>v.p-v.a,'bar g']],t:'Gauge = absolute − atmospheric. −1 bar g is close to a perfect vacuum.'},
{n:'Steam: density, specific volume, SG',i:[['r','Density ρ (kg/m³)',1000],['w','Water density (kg/m³)',1000]],o:[['Specific volume vg = 1/ρ',v=>1/v.r,'m³/kg'],['Specific gravity ρ/ρw',v=>v.r/v.w,'']]},
{n:'Steam: work = F·d and P·V',i:[['F','Force (N)',100],['d','Displacement (m)',2],['P','Pressure (Pa)',1],['V','Displaced volume (m³)',1]],o:[['Work = F × d',v=>v.F*v.d,'J'],['Work = P × V',v=>v.P*v.V,'J']],t:'Example 2.1.1: 1 Pa × 1 m³ = 1 N·m = 1 J'},
{n:'Steam: entropy change Δs = Δh / T avg',i:[['h1','Start enthalpy h1 (kJ/kg)',0],['h2','End enthalpy h2 (kJ/kg)',419],['t1','Start temp (°C)',0],['t2','End temp (°C)',100]],o:[['Average temperature',v=>(v.t1+v.t2)/2+273.15,'K'],['Δs',v=>(v.h2-v.h1)/((v.t1+v.t2)/2+273.15),'kJ/kg K']],t:'Example 2.1.3 (water 0 to 100 °C). Uses the average absolute temperature.'},
{n:'Steam: entropy of evaporation sfg = hfg / T',i:[['h','hfg (kJ/kg)',2258],['t','Saturation temp (°C)',100],['sf','sf of water (kJ/kg K, optional)',1.30]],o:[['sfg = hfg / T',v=>v.h/(v.t+273.15),'kJ/kg K'],['sg = sf + sfg',v=>v.sf+v.h/(v.t+273.15),'kJ/kg K']],t:'Example 2.1.4 (evaporation at 100 °C).'}
];
FX.forEach(f=>{FORMULAS.push(f);fsel.add(new Option(f.n,FORMULAS.length-1))});
Object.assign(U.Pressure,{'kg/cm²':98066.5,mmHg:133.322,inH2O:249.089});Object.assign(U.Power,{'Btu/h':0.293071});Object.assign(U.Energy,{kcal:4186.8});
Object.assign(U,{'SI prefix':{T:1e12,G:1e9,M:1e6,k:1e3,'(base)':1,m:1e-3,'μ':1e-6,n:1e-9,p:1e-12},Density:{'kg/m³':1,'g/cm³':1000,'kg/L':1000,'lb/ft³':16.01846},'Specific volume':{'m³/kg':1,'L/kg':.001,'ft³/lb':.062428},'Volume flow':{'m³/s':1,'m³/h':1/3600,'L/s':.001,'L/min':1/60000},'Mass flow':{'kg/s':1,'kg/h':1/3600,'t/h':1000/3600,'lb/h':1.259979e-4},'Specific enthalpy':{'kJ/kg':1,'J/kg':.001,'kcal/kg':4.1868,'Btu/lb':2.326},'Specific heat':{'kJ/kg·K':1,'kcal/kg·°C':4.1868,'Btu/lb·°F':4.1868},'Viscosity (dynamic)':{'Pa·s':1,cP:.001,poise:.1},'Viscosity (kinematic)':{'m²/s':1,cSt:1e-6,St:1e-4}});
Object.keys(U).filter(k=>![...ucat.options].some(o=>o.value===k)).forEach(k=>ucat.add(new Option(k)));
C.push(['Standard atmosphere','1.01325','bar a'],['1 atm in mmHg','760','mmHg'],['1 atm in psi','14.7','lb/in²'],['Triple point of water','273.16','K'],['Standard temperature (STP)','0','°C'],['Water cp','4.19','kJ/kg°C'],['Water hf at 100 °C','419','kJ/kg'],['Water hfg at 100 °C','2258','kJ/kg'],['Specific gravity of water','1','']);
$('#ctbl').innerHTML=C.map(([n,v,u])=>'<tr data-v="'+v+'"><td>'+n+'</td><td>'+v+' '+u+'</td></tr>').join('');
let rec=null,activeMic=null;
function startVoice(target){
 const output=target==='nb'?nres:res,button=target==='nb'?$('#nmic'):$('#mic');
 if(!SR){output.textContent='Voice recognition is unavailable in this browser. Try Chrome, or type the equation.';return}
 if(rec){rec.stop();return}
 activeMic=button;rec=new SR();rec.lang=vlang();rec.interimResults=true;rec.maxAlternatives=3;
 rec.onstart=()=>{button.classList.add('on');button.textContent='Listening…'};
 rec.onresult=e=>{
  const heard=[];
  for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)heard.push(e.results[i][0].transcript);
  if(heard.length)showVoiceReview(heard.join(' '),target);
 };
 rec.onerror=e=>{
  const messages={'not-allowed':'Microphone permission is blocked. Allow it in browser settings.','service-not-allowed':'This browser speech service is unavailable. Try Chrome.','no-speech':'No speech detected. Try again a little closer to the microphone.','network':'Speech recognition needs an internet connection.'};
  output.textContent=messages[e.error]||('Mic error: '+e.error);
 };
 rec.onend=()=>{rec=null;if(activeMic){activeMic.classList.remove('on');activeMic.textContent='Mic';activeMic=null}};
 try{rec.start()}catch(err){rec=null;button.classList.remove('on');button.textContent='Mic';output.textContent='Could not start voice recognition. Try again.'}
}
$('#mic').onclick=()=>startVoice('calc');
$('#nmic').onclick=()=>startVoice('nb');
st();
rf();ru();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
