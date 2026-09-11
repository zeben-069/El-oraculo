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
  'netlify/functions/naira.js','netlify/functions/naira-stream.mjs','netlify/functions/tiempo.js',
  'img/naira-social.jpg',
  /* La página de diagnóstico va DENTRO del sitio a propósito: abrirla desde
     el ordenador no prueba lo mismo que abrirla desde la web, que es donde
     falla. No la ve ningún turista: hay que escribir su dirección a mano. */
  'probar-aereo.html']
  .concat(sueltos)
  .concat(fs.readdirSync('img/estampas').map(f=>'img/estampas/'+f))
  .concat(fs.readdirSync('img/cartas').map(f=>'img/cartas/'+f))
  .concat(fs.readdirSync('img/zonas').map(f=>'img/zonas/'+f))
  .concat(fs.existsSync('img/sitios')?fs.readdirSync('img/sitios').map(f=>'img/sitios/'+f):[]);

const faltan=LISTA.filter(f=>!fs.existsSync(f));
if(faltan.length){ console.error('faltan ficheros:\n  '+faltan.join('\n  ')); process.exit(1); }

/* ── Y la misma lista, al revés, para desplegar desde aquí ──
   Desde el 11 de septiembre el despliegue lo hago yo con la extensión de
   Netlify («lo subes tú mismo, que para eso te puse la extensión»), y eso no
   sube un zip: sube la CARPETA, con `publish = "."`. O sea que subiría también
   las herramientas, los ficheros del Cabildo y las páginas de elegir fotos.
   `.netlifyignore` es la única manera de cortar eso sin cambiar lo otro, y se
   escribe **desde la misma lista** en vez de a mano: así no se despega nunca.
   Lo que NO está en LISTA se ignora; la lista se escribe entera —no un «todo
   fuera menos estos»— porque las negaciones de gitignore no vuelven a entrar
   en una carpeta ya excluida, y eso se descubre tarde y mal.
   El zip no lo mira, así que soltar el zip a mano sigue funcionando igual. */
function escribeIgnore(lista){
  const dentro=new Set(lista);
  const fuera=[];
  (function anda(dir){
    for(const e of fs.readdirSync(dir||'.',{withFileTypes:true})){
      const rel=dir?dir+'/'+e.name:e.name;
      if(rel==='.git'||rel==='node_modules'||rel==='.netlifyignore') continue;
      if(e.isDirectory()){
        /* si de esta carpeta no se publica NADA, se corta entera y no se
           recorre: es lo que hace que capturas/ o las 9.652 filas del Cabildo
           no dejen mil líneas aquí dentro */
        if(![...dentro].some(f=>f.startsWith(rel+'/'))) fuera.push('/'+rel+'/');
        else anda(rel);
      }
      else if(!dentro.has(rel)) fuera.push('/'+rel);
    }
  })('');
  fs.writeFileSync('.netlifyignore',
    '# Lo escribe empaquetar.js desde su propia lista. No se toca a mano.\n'+
    '# Es lo que hace que desplegar la carpeta publique lo mismo que el zip.\n'+
    fuera.sort().join('\n')+'\n');
  return fuera.length;
}

const ZIP='naira-netlify.zip';
if(fs.existsSync(ZIP)) fs.unlinkSync(ZIP);
cp.execFileSync('zip',['-q',ZIP,...new Set(LISTA)]);
const bytes=fs.statSync(ZIP).size;
console.log(ZIP+' · '+[...new Set(LISTA)].length+' ficheros · '+
  (bytes/1024/1024).toFixed(2)+' MB');
console.log('Se suelta tal cual en app.netlify.com/drop.');
console.log('.netlifyignore · '+escribeIgnore([...new Set(LISTA)])+
  ' cosas fuera, para desplegar la carpeta sin subir las herramientas.');
