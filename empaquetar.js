/* empaquetar.js — arma el zip que se suelta en Netlify Drop.
   ------------------------------------------------------------------
   Va lo que el navegador pide y nada más: ni las pruebas, ni las
   herramientas, ni la página de elegir fotos, ni este fichero. Se hacía
   a mano y era fácil olvidarse de un dato nuevo; ahora los ficheros de
   datos se leen de las etiquetas <script src=...> de index.html, igual
   que hace banco.js, así que añadir uno no obliga a tocar esto.

       node empaquetar.js            escribe naira-netlify.zip           */
const fs=require('fs'), path=require('path'), cp=require('child_process');

const html=fs.readFileSync('index.html','utf8');
const sueltos=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1])
  .concat([...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]))
  .filter(f=>!/^https?:/.test(f));   /* leaflet viene de fuera, no se empaqueta */

const LISTA=['index.html','manifest.webmanifest','netlify.toml',
  'icono.svg','icono-180.png','icono-192.png','icono-512.png',
  'netlify/functions/naira.js','netlify/functions/tiempo.js',
  'img/naira-social.jpg']
  .concat(sueltos)
  .concat(fs.readdirSync('img/estampas').map(f=>'img/estampas/'+f))
  .concat(fs.readdirSync('img/cartas').map(f=>'img/cartas/'+f))
  .concat(fs.readdirSync('img/zonas').map(f=>'img/zonas/'+f))
  .concat(fs.existsSync('img/sitios')?fs.readdirSync('img/sitios').map(f=>'img/sitios/'+f):[]);

const faltan=LISTA.filter(f=>!fs.existsSync(f));
if(faltan.length){ console.error('faltan ficheros:\n  '+faltan.join('\n  ')); process.exit(1); }

const ZIP='naira-netlify.zip';
if(fs.existsSync(ZIP)) fs.unlinkSync(ZIP);
cp.execFileSync('zip',['-q',ZIP,...new Set(LISTA)]);
const bytes=fs.statSync(ZIP).size;
console.log(ZIP+' · '+[...new Set(LISTA)].length+' ficheros · '+
  (bytes/1024/1024).toFixed(2)+' MB');
console.log('Se suelta tal cual en app.netlify.com/drop.');
