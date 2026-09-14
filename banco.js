/* Banco de pruebas: ejecuta el motor real de Naira fuera del navegador.
   Se le pone un DOM de mentira, se le fija el estado (dónde se alojan, coche,
   niños...) y se llama a construir(). No prueba la conversación ni la API,
   pero sí lo que de verdad decide: qué paradas salen y qué restaurante. */
const fs=require('fs');
/* index.html se partió: los datos y el prompt viven en ficheros aparte y el
   navegador los carga con su propio <script> antes que el motor. Aquí se
   juntan en el mismo orden y se ejecutan de una pieza, que es exactamente lo
   que hace el navegador. El orden lo dicta index.html, no una lista escrita
   a mano: si mañana se añade otro fichero de datos, esto lo sigue. */
const src=fs.readFileSync('./index.html','utf8');
const piezas=[...src.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1])
  .filter(f=>/^(datos\/|prompt\.js)/.test(f));
const code=piezas.map(f=>fs.readFileSync('./'+f,'utf8')).join('\n')+'\n'+
  src.slice(src.indexOf('/* ===================== DATOS'), src.lastIndexOf('</script>'));

const noop=()=>{};
const elem=()=>({style:{},classList:{add:noop,remove:noop,toggle:noop},
  setAttribute:noop,getAttribute:()=>null,addEventListener:noop,appendChild:noop,
  querySelectorAll:()=>[],querySelector:()=>null,innerHTML:'',textContent:'',value:'',
  children:[],scrollIntoView:noop,focus:noop,remove:noop,insertAdjacentHTML:noop,hidden:false,replaceChildren:noop,closest:()=>null,cloneNode(){return elem()},getBoundingClientRect:()=>({top:0,left:0,width:0,height:0})});
global.document={getElementById:elem,createElement:elem,querySelector:()=>null,
  querySelectorAll:()=>[],addEventListener:noop,body:elem(),documentElement:elem()};
/* Un localStorage de verdad, no un tapón que se traga lo que se escribe.
   Era `setItem:noop` y con eso la memoria de «no me repitas el plan» —que vive
   ahí desde el 14 de septiembre— no se podía probar desde aquí: se escribía en
   el vacío y al releer salía null, o sea que la prueba decía que funcionaba
   cuando en el navegador iba a hacer otra cosa. Es de memoria y muere con el
   proceso, así que cada ejecución sigue siendo un navegador recién estrenado. */
function memoria(){ const c={}; return {
  getItem:k=>c[k]===undefined?null:c[k], setItem:(k,v)=>{c[k]=String(v)},
  removeItem:k=>{delete c[k]}, clear:()=>{for(const k in c) delete c[k]} }; }
global.window={addEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop}),
  location:{href:''},localStorage:memoria(),innerWidth:400};
global.navigator={language:'es',geolocation:{getCurrentPosition:noop}};
global.localStorage=global.window.localStorage;
global.fetch=()=>Promise.reject(new Error('sin red'));
global.L=undefined;
global.Image=function(){};
global.requestAnimationFrame=noop;
/* La cabecera se repinta cada dos minutos con setInterval. Fuera del navegador
   ese temporizador no caduca nunca y deja el proceso de node colgado después de
   imprimir el resultado; aquí no hay cabecera que repintar, así que se anula. */
global.setInterval=()=>0;
global.clearInterval=noop;

const ctx=new Function(code+`;
  return {construir,construirConVariedad,actosDelDia,S,LUGARES,REST,BASES,EVENTOS,ACTOS,km,tr,minutosA,tipoTr,horarioTr,tipoDeDia,esFestivo,narrarLocal};`)();
module.exports=ctx;
