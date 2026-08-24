/* Banco de pruebas: ejecuta el motor real de Naira fuera del navegador.
   Se le pone un DOM de mentira, se le fija el estado (dónde se alojan, coche,
   niños...) y se llama a construir(). No prueba la conversación ni la API,
   pero sí lo que de verdad decide: qué paradas salen y qué restaurante. */
const fs=require('fs');
const src=fs.readFileSync('./index.html','utf8');
const code=src.slice(src.indexOf('/* ===================== DATOS'), src.lastIndexOf('</script>'));

const noop=()=>{};
const elem=()=>({style:{},classList:{add:noop,remove:noop,toggle:noop},
  setAttribute:noop,getAttribute:()=>null,addEventListener:noop,appendChild:noop,
  querySelectorAll:()=>[],querySelector:()=>null,innerHTML:'',textContent:'',value:'',
  children:[],scrollIntoView:noop,focus:noop,remove:noop,insertAdjacentHTML:noop,hidden:false,replaceChildren:noop,closest:()=>null,cloneNode(){return elem()},getBoundingClientRect:()=>({top:0,left:0,width:0,height:0})});
global.document={getElementById:elem,createElement:elem,querySelector:()=>null,
  querySelectorAll:()=>[],addEventListener:noop,body:elem(),documentElement:elem()};
global.window={addEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop}),
  location:{href:''},localStorage:{getItem:()=>null,setItem:noop},innerWidth:400};
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
  return {construir,S,LUGARES,REST,BASES,km,tr,minutosA,tipoTr,horarioTr};`)();
module.exports=ctx;
