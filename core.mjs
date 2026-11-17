// determineStatus is a JavaScript adaptation of LabVault determine_status.
// Copyright (c) 2026 Kembly. MIT; see vendor/LabVault-LICENSE.txt.
export function determineStatus(value,min,max){
  if(value===null||value===undefined)return 'Fail (OOS)';
  if(min!==null&&min!==undefined&&value<min)return 'Fail (OOS)';
  if(max!==null&&max!==undefined&&value>max)return 'Fail (OOS)';
  return 'Pass';
}
export const rules=[
 {id:'R01',title:'来源与批次身份完整',text:'三个系统须提供同一批次、产品编码和采集时间；记录标识不可重复。'},
 {id:'R02',title:'必检项目完整且结果在限值内',text:'按模拟主数据的必检清单核对结果；单位须一致，数值有限且上下限有效。'},
 {id:'R03',title:'检验独立复核',text:'每项结果须由与录入人不同的人员完成复核。'},
 {id:'R04',title:'仓储状态与检验结论一致',text:'检验未通过或未完成复核时，仓储不得标记为 RELEASED。'},
 {id:'R05',title:'生产记录完整',text:'模拟批记录须具备投料、过程确认和包装检查三项记录。'},
 {id:'R06',title:'偏差与 OOS 调查关闭',text:'关联的偏差及 OOS 调查须关闭，且具备结论、处理人和依据；原始超标结果仍保留阻断。'},
 {id:'R07',title:'审批绑定当前版本',text:'审核只能针对当前数据指纹与规则版本；资料变化须重新检查和审批。'}
];
export const RULE_VERSION='DEMO-SOP-001/v1';
export function seed(){
 const make=(id,name)=>({id,name,product:'DEMO-TAB-01',revision:1,simulation:true,
   requirements:[{id:'ASSAY',name:'含量',unit:'%',min:95,max:105},{id:'PH',name:'pH',unit:'pH',min:6,max:8}],
   wms:{batch_id:id,product:'DEMO-TAB-01',captured_at:'2026-11-17T08:00:00+08:00',records:[{id:'W-'+id,status:'RELEASED',quantity:1000,unit:'盒'}]},
   lims:{batch_id:id,product:'DEMO-TAB-01',captured_at:'2026-11-17T08:05:00+08:00',records:[{id:'L-'+id+'-1',test:'ASSAY',name:'含量',value:99.2,unit:'%',analyst:'QC-陈',reviewer:'QC-王'},{id:'L-'+id+'-2',test:'PH',name:'pH',value:7.1,unit:'pH',analyst:'QC-陈',reviewer:'QC-王'}]},
   mes:{batch_id:id,product:'DEMO-TAB-01',captured_at:'2026-11-17T08:10:00+08:00',records:[{id:'M-'+id+'-1',step:'投料',complete:true},{id:'M-'+id+'-2',step:'过程确认',complete:true},{id:'M-'+id+'-3',step:'包装检查',complete:true}],deviations:[]}});
 const clean=make('B-261117-001','正常批次');
 const conflict=make('B-261117-002','检验与仓储冲突');conflict.lims.records[0].value=92.3;conflict.mes.deviations=[{id:'DEV-002',kind:'OOS',status:'OPEN',reason:'含量超出模拟标准',owner:'',evidence:''}];
 const missing=make('B-261117-003','记录缺失待整改');missing.lims.records[1].reviewer='';missing.mes.records.pop();missing.wms.records[0].status='QUARANTINE';
 const cases=[clean,conflict,missing];
 const extra=(n,name,mutate)=>{const b=make('B-261117-'+String(n).padStart(3,'0'),name);mutate(b);cases.push(b)};
 extra(4,'批次身份不一致',b=>b.lims.batch_id='OTHER-BATCH');
 extra(5,'必检项目缺失',b=>b.lims.records.pop());
 extra(6,'检验单位不一致',b=>b.lims.records[0].unit='mg');
 extra(7,'录入与复核人为同一人',b=>b.lims.records[0].reviewer=b.lims.records[0].analyst);
 extra(8,'生产记录重复',b=>b.mes.records.push({...b.mes.records[0],id:'M-duplicate'}));
 extra(9,'偏差关闭但缺少依据',b=>b.mes.deviations.push({id:'DEV-009',status:'CLOSED',owner:'QA-李',evidence:''}));
 extra(10,'来源时间缺失',b=>b.wms.captured_at='');
 extra(11,'结果恰好位于上下限',b=>{b.lims.records[0].value=95;b.lims.records[1].value=8});
 extra(12,'仓储仍处于待检状态',b=>b.wms.records[0].status='QUARANTINE');
 const descriptions=[
 ['正常批次如何进入人工签核','全部固定检查通过，但不会自动放行。'],
 ['为什么检验不合格时不能沿用仓储放行状态','预期 3 项阻断：超标、仓储冲突和未关闭 OOS。不能改原始数值消除异常。'],
 ['如何保留初始问题、导入整改，再复验','预期 3 项阻断。导入模拟整改版本后复验，才可人工签核。'],
 ['同名产品的数据为什么不能混批','预期 R01 阻断；先确认来源批次，不能拿别的批次检验结果放行。'],
 ['检验值正常，为什么仍不能通过','预期缺少 pH 必检结果，并识别仓储放行冲突。'],
 ['数值看似正常但单位错误','预期单位异常与仓储放行冲突，不能直接比较不同单位。'],
 ['检验通过还需要谁复核','预期独立复核失败，并阻断仓储放行。'],
 ['重复记录是否能被当作完整记录','预期 R05 阻断，须澄清重复生产记录。'],
 ['把偏差状态改成关闭是否足够','预期 R06 阻断：关闭状态仍需处理人与证据。'],
 ['缺少采集时间会有什么问题','预期 R01 阻断；本版验证格式和存在性，不验证数据时效。'],
 ['限值边界是否被正确处理','含量 95%、pH 8 正好位于模拟限值，应通过检查，仍需人工审核。'],
 ['所有检验通过是否等于仓库已放行','预期 R04 阻断，仓储状态仍需同步。']];
 cases.forEach((b,i)=>b.scenario={purpose:descriptions[i][0],expected:descriptions[i][1]});
 return cases;
}
export function validate(b){
 if(!b||typeof b!=='object'||!b.id||typeof b.id!=='string'||!b.product||!Number.isInteger(b.revision)||b.revision<1)throw Error('批次标识、产品编码或版本无效');
 if(b.simulation!==true)throw Error('首版仅接受 simulation=true 的模拟数据');
 if(!Array.isArray(b.requirements)||b.requirements.length!==2||b.requirements.some((x,i)=>JSON.stringify(x)!==JSON.stringify(seed()[0].requirements[i])))throw Error('模拟主数据须与 DEMO-SOP-001/v1 一致，不允许修改限值或必检清单');
 for(const s of ['wms','lims','mes']){if(!b[s]||!Array.isArray(b[s].records)||b[s].records.length>1000||b[s].records.some(x=>!x||typeof x!=='object'||Array.isArray(x)))throw Error(s+' 记录结构无效');}
 if(!Array.isArray(b.mes.deviations)||b.mes.deviations.length>1000||b.mes.deviations.some(x=>!x||typeof x!=='object'))throw Error('偏差记录结构无效');
 if(JSON.stringify(b).length>500000)throw Error('数据包超过 500KB');
 return b;
}
export async function fingerprint(b){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({version:RULE_VERSION,b}))))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function audit(b){
 validate(b);const findings=[];const add=(rule,system,record,field,message)=>findings.push({id:'F'+String(findings.length+1).padStart(2,'0'),rule,system,record,field,message,source:system+'.'+record+'.'+field});
 for(const s of ['wms','lims','mes']){
   const data=b[s];if(data.batch_id!==b.id||data.product!==b.product)add('R01',s,'header','batch_id/product','系统批次或产品编码与复核对象不一致');
   if(!data.captured_at||!Number.isFinite(Date.parse(data.captured_at)))add('R01',s,'header','captured_at','缺少有效的数据采集时间');
   const ids=new Set();for(const r of data.records){if(!r.id||ids.has(r.id))add('R01',s,r.id||'unknown','id','来源记录标识缺失或重复');ids.add(r.id);}
 }
 let labPass=true;
 for(const req of b.requirements){
  const rows=b.lims.records.filter(r=>r.test===req.id);
  if(rows.length!==1){add('R02','lims','required-'+req.id,'test','必检项目 '+req.name+' 缺失或重复');labPass=false;continue;}
  const r=rows[0];const numeric=typeof r.value==='number'&&Number.isFinite(r.value);
  if(!numeric||r.unit!==req.unit){add('R02','lims',r.id,'value/unit','检验数值缺失、非有限数或单位不符');labPass=false;}
  else if(determineStatus(r.value,req.min,req.max)!=='Pass'){add('R02','lims',r.id,'value',req.name+' '+r.value+' '+r.unit+' 超出模拟限值 '+req.min+'–'+req.max);labPass=false;}
  if(!r.analyst||!r.reviewer||r.analyst===r.reviewer){add('R03','lims',r.id,'reviewer','检验缺少独立复核人，或复核人与录入人相同');labPass=false;}
 }
 if(b.lims.records.some(r=>!b.requirements.some(q=>q.id===r.test))){add('R02','lims','unknown','test','存在未知检验项目，须按本次固定清单澄清');labPass=false;}
 if(b.wms.records.length!==1)add('R04','wms','required','records','演示通道要求一条明确的仓储批次状态');
 for(const r of b.wms.records){if(!['RELEASED','QUARANTINE','REJECTED'].includes(r.status))add('R04','wms',r.id,'status','未知仓储状态');else if(r.status==='RELEASED'&&!labPass)add('R04','wms',r.id,'status','仓储已放行，但检验存在超标、缺项或未复核');else if(r.status!=='RELEASED')add('R04','wms',r.id,'status','仓储尚未达到可放行状态：'+r.status);}
 for(const step of ['投料','过程确认','包装检查']){const rows=b.mes.records.filter(r=>r.step===step);if(rows.length!==1||rows[0].complete!==true)add('R05','mes',rows[0]?.id||'required-'+step,'complete','生产记录 '+step+' 缺失、不完整或重复');}
 for(const d of b.mes.deviations){if(d.status!=='CLOSED'||!d.owner?.trim()||!d.evidence?.trim())add('R06','mes',d.id||'unknown','status/evidence','偏差或 OOS 调查尚未关闭，或缺少处理人与依据');}
 return {status:findings.length?'BLOCKED':'READY',fingerprint:await fingerprint(b),rule_version:RULE_VERSION,batch:b.id,revision:b.revision,findings,checked_at:new Date().toISOString(),summary:findings.length?`发现 ${findings.length} 项阻断，须处理并复验。`:'检查条件满足，可提交人工审核；尚未放行。'};
}
export async function review(b,request){
 const a=await audit(b);if(request.fingerprint!==a.fingerprint)throw Error('数据已变化，旧检查或审批无效，请重新复核');
 if(!request.reviewer?.trim()||!request.reason?.trim())throw Error('须填写审核人及审核意见');
 if(!['APPROVE','REJECT'].includes(request.decision))throw Error('未知审核决定');
 if(b.lims.records.some(r=>r.analyst===request.reviewer.trim()))throw Error('审核人与检验录入人须不同');
 if(request.decision==='APPROVE'&&a.status!=='READY')throw Error('存在阻断项，不能批准');
 return {batch:b.id,revision:b.revision,fingerprint:a.fingerprint,decision:request.decision,reviewer:request.reviewer.trim(),reason:request.reason.trim(),time:new Date().toISOString(),scope:'模拟复核签核，非药品实际放行或电子签名认证'};
}
