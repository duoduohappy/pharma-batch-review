import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:'0',HOST:'0.0.0.0',LLM_BASE_URL:'',LLM_MODEL:'',LLM_API_KEY:''},stdio:['ignore','pipe','pipe']});
let address,output='';child.stdout.on('data',c=>{output+=c;const match=output.match(/Listening: http:\/\/0\.0\.0\.0:(\d+)/);if(match)address='http://127.0.0.1:'+match[1]});child.stderr.on('data',c=>{output+=c});
try{
 for(let i=0;i<100&&!address;i++){if(child.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,50))}assert.ok(address,'server did not start');
 const get=async(path)=>{const r=await fetch(address+path);assert.equal(r.status,200);return r};
 const post=async(path,data,expected=200)=>{const r=await fetch(address+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal(r.status,expected);return r.json()};
 assert.match(await (await get('/')).text(),/跨系统批次复核/);assert.match(await(await get('/app.js')).text(),/replaceBatch/);assert.equal((await(await get('/api/health')).json()).ok,true);
 const {batches}=await(await get('/api/seed')).json();const bad=await post('/api/audit',{batch:batches[1]});assert.equal(bad.status,'BLOCKED');assert.equal(bad.findings.length,3);
 await post('/api/review',{batch:batches[1],fingerprint:bad.fingerprint,reviewer:'QA',reason:'test',decision:'APPROVE'},400);
 const fixed=batches[2];fixed.revision=2;fixed.lims.records[1].reviewer='QC-王';fixed.wms.records[0].status='RELEASED';fixed.mes.records.push({id:'M-fixed',step:'包装检查',complete:true});
 const checked=await post('/api/audit',{batch:fixed});assert.equal(checked.status,'READY');const signed=await post('/api/review',{batch:fixed,fingerprint:checked.fingerprint,reviewer:'QA-李',reason:'已核对整改',decision:'APPROVE'});assert.equal(signed.decision,'APPROVE');
 const summary=await post('/api/summary',{batch:batches[1]});assert.equal(summary.mode,'rules');
 console.log('HTTP smoke PASS: 0.0.0.0 binding, pages, health, blocked approval, correction, approval, rules fallback');
}finally{child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)resolve();else{child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve()},3000).unref()}})}
