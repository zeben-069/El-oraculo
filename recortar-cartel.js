/* recortar-cartel.js — saca la ilustración de una maqueta de cartel y la deja
   lista para `img/cartas/`.

   POR QUÉ EXISTE. Las ilustraciones llegan como maqueta de móvil, con el marco,
   un pie blanco y —lo que de verdad estorba— **el título quemado dentro del
   dibujo**, en una banda blanca. Eso no vale: la regla de la casa es que el
   rótulo va DEBAJO y lo escribe `tr()`, porque el mismo cartel se ve en inglés
   y en alemán. Ya hubo que cortarlo a mano con los dos carteles de Anaga y la
   cumbre; a la segunda vez toca herramienta, que es la lección de `guaguas.js`
   y de `matriz.js`.

       node recortar-cartel.js entrada.png img/cartas/senderos.jpg [más pares…]

   CÓMO ENCUENTRA EL CORTE. Nada está escrito a mano: el borde del cartel sale
   de las filas y columnas con muchos píxeles oscuros, y la banda del rótulo se
   busca **por dos caminos**, cortando por encima del que salga más arriba:
   la franja de lado a lado —más del 60% del ancho interior en blanco— y **la
   caja centrada dentro del dibujo**, que es como venían «CON COCHE» y «EN
   GUAGUA» y que la primera versión no veía: el corte se iba al pie de abajo y
   el texto se quedaba quemado dentro. Luego se toma el cuadrado más grande que
   quepa, centrado, y se guarda a 360 px al 82%, que es el tamaño de las otras
   cartas.

   Se hace con Chromium y un canvas porque en el contenedor no hay ni PIL ni
   ImageMagick. Es el mismo camino con el que se abren los `.mht` de Zeben.
*/
const {chromium}=require('playwright'); const fs=require('fs');
const pares=[]; const a=process.argv.slice(2);
for(let i=0;i<a.length;i+=2) pares.push([a[i],a[i+1]]);
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage();
 for(const [src,dst] of pares){
  const b64=fs.readFileSync(src).toString('base64');
  const r=await p.evaluate(async(d)=>{
   const img=new Image(); img.src='data:image/png;base64,'+d; await img.decode();
   const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
   const x=c.getContext('2d'); x.drawImage(img,0,0);
   const D=x.getImageData(0,0,c.width,c.height).data;
   const P=(i,j)=>{const o=(j*c.width+i)*4; return [D[o],D[o+1],D[o+2]];};
   const oscuro=p=>p[0]<110&&p[1]<95&&p[2]<85;
   const blanco=p=>p[0]>228&&p[1]>225&&p[2]>218;
   const filas=[],cols=[];
   for(let j=0;j<c.height;j++){let n=0;for(let i=0;i<c.width;i+=2)if(oscuro(P(i,j)))n++;filas.push(n);}
   for(let i=0;i<c.width;i++){let n=0;for(let j=0;j<c.height;j+=2)if(oscuro(P(i,j)))n++;cols.push(n);}
   const top=filas.findIndex(n=>n>c.width*0.25);
   const left=cols.findIndex(n=>n>c.height*0.06);
   let right=c.width-1; while(right>0&&cols[right]<=c.height*0.06) right--;
   /* LA BANDA DEL RÓTULO, por dos caminos, y se corta por encima del que salga
      más arriba. Hicieron falta los dos porque los carteles vienen de dos
      maneras y la primera versión solo veía una:
      · **De lado a lado** — la primera fila, bajando desde top+300, en la que
        más del 60% del ancho interior es blanco. Es el pie blanco del cartel.
      · **Una caja centrada** — el rótulo puede ir DENTRO del dibujo, en un
        recuadro blanco de media anchura («CON COCHE», «EN GUAGUA»). Ahí la
        regla del 60% no lo ve, y el corte se iba al pie de abajo dejando el
        texto quemado dentro. Se busca el tramo blanco seguido más largo de
        cada fila: vale si pasa del 25% del ancho interior y está centrado.
        Y para no confundirlo con una nube o con el cielo, dentro de esos dos
        bordes tiene que seguir habiendo blanco 40 de las 60 filas siguientes:
        una caja tiene los lados rectos y una nube no. */
   const tramoBlanco=(j)=>{
     let mejor=[0,-1,-1], a=-1;
     for(let i=left+20;i<right-20;i++){
       if(blanco(P(i,j))){ if(a<0) a=i; }
       else { if(a>=0 && i-a>mejor[0]) mejor=[i-a,a,i]; a=-1; }
     }
     if(a>=0 && right-20-a>mejor[0]) mejor=[right-20-a,a,right-20];
     return mejor;
   };
   let rotulo=null;
   for(let j=top+300;j<c.height;j++){
     let n=0,t=0; for(let i=left+20;i<right-20;i+=3){t++; if(blanco(P(i,j)))n++;}
     if(n/t>0.60){ rotulo=j; break; }
   }
   const ancho=right-left, centro=(left+right)/2;
   for(let j=top+300;j<(rotulo||c.height);j++){
     const [w,a,b]=tramoBlanco(j);
     if(w<ancho*0.25) continue;
     if(Math.abs((a+b)/2-centro)>ancho*0.14) continue;
     /* Y aquí está la vuelta que costó: **el texto del rótulo parte el tramo
        blanco**, así que exigir que el tramo seguido aguante 25 filas no vale
        —en «CON COCHE» las letras dejan la fila en menos del 15%—. Lo que se
        mide es **cuánto blanco hay DENTRO de la caja**, entre sus dos bordes:
        una fila de la banda pasa del 55% aunque lleve letras, y una nube no
        mantiene los mismos bordes 60 filas seguidas. */
     let dentro=0;
     for(let k=j;k<j+60&&k<c.height;k++){
       let n=0,t=0; for(let i=a;i<b;i+=3){t++; if(blanco(P(i,k)))n++;}
       if(n/t>0.55) dentro++;
     }
     if(dentro>=40){
       /* Y una vez encontrada, **hay que subir hasta su borde de arriba**. La
          fila que dispara no es la primera de la caja: las de en medio llevan
          las letras y no pasan el corte, así que salta la de debajo del texto
          y cortar ahí dejaría media banda dentro. Se sube mientras siga
          habiendo blanco entre los dos bordes; encima de la caja está el
          dibujo —el coche, la guagua— y ahí se para solo. */
       let arriba=j;
       while(arriba>top+300){
         let n=0,t=0; for(let i=a;i<b;i+=3){t++; if(blanco(P(i,arriba-1)))n++;}
         if(n/t<0.35) break;
         arriba--;
       }
       rotulo=arriba; break;
     }
   }
   const t0=top+14, x0=left+14, x1=right-14, y1=(rotulo||c.height)-6;
   const lado=Math.min(x1-x0, y1-t0);
   const cx=Math.round((x0+x1)/2 - lado/2);
   const o=document.createElement('canvas'); o.width=360; o.height=360;
   o.getContext('2d').drawImage(c, cx, t0, lado, lado, 0,0,360,360);
   return {jpg:o.toDataURL('image/jpeg',0.82).split(',')[1], top,left,right,rotulo,lado,cx};
  },b64);
  fs.writeFileSync(dst, Buffer.from(r.jpg,'base64'));
  console.log(dst.split('/').pop(),'· lado',r.lado,'· rótulo en y='+r.rotulo,'·',
    Math.round(fs.statSync(dst).size/1024)+' KB');
 }
 await b.close();
})();
