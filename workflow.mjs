import {audit} from './core.mjs';
// Commands change a new simulated source snapshot; original data remain in history.
export async function workflow(batch,command){
 const before=await audit(batch);
 if(!command.actor?.trim()||!command.reason?.trim())throw Error('操作人和业务依据不能为空');
 if(command.fingerprint!==before.fingerprint)throw Error('来源数据已变化，请刷新后重新操作');
 const next=structuredClone(batch);const actor=command.actor.trim(),reason=command.reason.trim();
 switch(command.action){
  case 'OPEN_DEVIATION':{next.mes.deviations.push({id:'DEV-'+next.id+'-v'+(next.revision+1),kind:'DEVIATION',status:'OPEN',reason,reported_by:actor,owner:'',evidence:''});break;}
  case 'REVIEW_RESULT':{const record=next.lims.records.find(r=>r.id===command.record);if(!record)throw Error('检验记录不存在');if(record.analyst===actor)throw Error('复核人与录入人必须不同');record.reviewer=actor;break;}
  case 'COMPLETE_STEP':{if(!['投料','过程确认','包装检查'].includes(command.step))throw Error('未知生产步骤');const rows=next.mes.records.filter(r=>r.step===command.step);if(rows.length>1)throw Error('重复记录需先澄清，不能自动覆盖');if(rows.length)rows[0].complete=true;else next.mes.records.push({id:'M-'+next.id+'-'+command.step,step:command.step,complete:true,operator:actor,basis:reason});break;}
  case 'CLOSE_DEVIATION':{const d=next.mes.deviations.find(d=>d.id===command.record);if(!d)throw Error('偏差不存在');d.status='CLOSED';d.owner=actor;d.evidence=reason;break;}
  case 'RELEASE_WAREHOUSE':{if(next.wms.records.length!==1||next.wms.records[0].status!=='QUARANTINE')throw Error('只有待检仓储记录可在本演示中放行');if(before.findings.some(f=>f.rule!=='R04'))throw Error('仍有检验、身份、生产或偏差问题，不能同步仓储放行');next.wms.records[0].status='RELEASED';next.wms.records[0].released_by=actor;next.wms.records[0].release_basis=reason;break;}
  default:throw Error('未知业务操作');
 }
 next.revision=batch.revision+1;const after=await audit(next);
 return {batch:next,audit:after,operation:{action:command.action,actor,reason,previous_fingerprint:before.fingerprint,new_fingerprint:after.fingerprint,time:new Date().toISOString(),scope:'模拟来源变更，未写入真实 WMS/LIMS/MES'}};
}
