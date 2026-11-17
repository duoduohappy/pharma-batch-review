import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
const core=fs.readFileSync('core.mjs','utf8').replaceAll('export ','');
const flow=fs.readFileSync('workflow.mjs','utf8').replace(/^import .*\n/,'').replace('export async function workflow','async function workflow');
const api=fs.readFileSync('api.mjs','utf8').replace(/^import .*\n/gm,'').replace('export async function api','async function api');
const html=JSON.stringify(fs.readFileSync('index.html','utf8')),app=JSON.stringify(fs.readFileSync('app.js','utf8'));
const worker=core+'\n'+flow+'\n'+api+'\nconst HTML='+html+';\nconst APP='+app+';\nexport default {async fetch(request,env){const p=new URL(request.url).pathname;if(p.startsWith("/api/"))return api(request,env);if(p==="/app.js")return new Response(APP,{headers:{"Content-Type":"text/javascript; charset=utf-8"}});if(p!=="/")return new Response("Not found",{status:404});return new Response(HTML,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"}})}};';
fs.writeFileSync('dist/server/index.js',worker);if(fs.existsSync('.openai/hosting.json'))fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');console.log('Worker built:',Buffer.byteLength(worker),'bytes');
