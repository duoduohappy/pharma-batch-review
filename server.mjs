import http from 'node:http';
import fs from 'node:fs';
import {api} from './api.mjs';
const port=Number(process.env.PORT||18771);
const host=process.env.HOST||(process.env.RENDER?'0.0.0.0':'127.0.0.1');
const server=http.createServer(async(req,res)=>{try{
 const url='http://127.0.0.1:'+port+req.url;const p=new URL(url).pathname;
 if(p.startsWith('/api/')){let raw='';for await(const c of req){raw+=c;if(raw.length>550000){res.writeHead(413);res.end('Too large');return}}const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:raw}:{})});const r=await api(request,process.env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;}
 const file=p==='/'?'index.html':p==='/app.js'?'app.js':null;if(!file){res.writeHead(404);res.end();return}
 res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(new URL(file,import.meta.url)));
 }catch{res.writeHead(500);res.end('Internal error')}});
server.listen(port,host,()=>console.log('Listening: http://'+host+':'+server.address().port));
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
