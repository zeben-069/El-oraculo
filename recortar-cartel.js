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
   de las filas y columnas con muchos píxeles oscuros, y la banda del rótulo es
   **la primera fila, bajando desde 300 px por debajo del borde, en la que más
   del 60% del ancho interior es blanco**. Se corta por encima de ella, se toma
   el cuadrado más grande que quepa, centrado, y se guarda a 360 px al 82%,
   que es el tamaño de las otras cartas.

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
   /* La banda del rótulo: la primera fila, bajando desde top+300, en la que
      más del 60% del ancho interior es blanco. Es el rectángulo con el texto
      quemado; se corta POR ENCIMA. */
   let rotulo=null;
   for(let j=top+300;j<c.height;j++){
     let n=0,t=0; for(let i=left+20;i<right-20;i+=3){t++; if(blanco(P(i,j)))n++;}
     if(n/t>0.60){ rotulo=j; break; }
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
