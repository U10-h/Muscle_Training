import { env } from 'cloudflare:workers';
import { z } from 'zod';
import {initialState,jstDate,ACHIEVEMENTS,normalizeTargetAreas,type TrainingState} from './training';
const eid=z.enum(['leg','chest','lat','row','curl','shoulder','biceps','abs']);
const targetAreas=z.array(z.enum(['chest','back','legs','shoulders','arms','core'])).max(6);
const id=z.string().min(1).max(100);
const measurementDate=z.string().date().refine(date=>date>='1900-01-01','日付を確認してください。');
export const actionSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('login')}),
 z.object({type:z.literal('schedule'),days:z.array(z.number().int().min(0).max(6)).max(7)}),
 z.object({type:z.literal('focus'),areas:targetAreas}),
 z.object({type:z.literal('measurement'),date:measurementDate,originalDate:measurementDate.optional(),weight:z.number().min(0.1).max(500).multipleOf(0.1),bodyFat:z.number().min(0.1).max(99.9).multipleOf(0.1).nullable(),note:z.string().trim().max(500)}),
 z.object({type:z.literal('deleteMeasurement'),date:measurementDate}),
 z.object({type:z.literal('start'),id,plan:z.array(eid).min(1).max(10),title:z.string().max(80),targetSets:z.number().int().min(1).max(3).optional(),minutes:z.number().int().min(5).max(180).optional(),targetAreas:targetAreas.optional()}),
 z.object({type:z.literal('set'),sessionId:id,id,exercise:eid,weight:z.number().min(0).max(500),reps:z.number().int().min(1).max(100)}),
 z.object({type:z.literal('editSet'),sessionId:id,id,weight:z.number().min(0).max(500),reps:z.number().int().min(1).max(100)}),
 z.object({type:z.literal('deleteSet'),sessionId:id,id}),
 z.object({type:z.literal('finish'),sessionId:id,note:z.string().max(1000),duration:z.number().int().min(0).max(86400)}),
 z.object({type:z.literal('recovery')}),
 z.object({type:z.literal('deleteSession'),sessionId:id}),
 z.object({type:z.literal('review'),id,exercise:eid,checks:z.array(z.boolean().nullable()).length(3),method:z.literal('self').optional(),note:z.string().max(1000),videoId:id.optional()}),
 z.object({type:z.literal('claim'),quest:z.enum(['set','form','care'])}),
 z.object({type:z.literal('pet'),name:z.string().trim().min(1).max(20)}),
 z.object({type:z.literal('theme'),theme:z.enum(['mint','sky','sunset'])}),
 z.object({type:z.literal('timer'),mode:z.enum(['start','pause','reset']),seconds:z.number().int().min(0).max(600)})
]);
export type Action=z.infer<typeof actionSchema>;
export function applyAction(state:TrainingState,a:Action,now=Date.now()):TrainingState{
 const s=structuredClone(state),day=jstDate(now);
 const grant=(xp:number,coins:number)=>{s.xp+=xp;s.coins+=coins;};
 const session=('sessionId' in a)?s.sessions.find(x=>x.id===a.sessionId):undefined;
 if('sessionId' in a&&!session)throw new Error('記録が見つかりません。再読み込みしてください。');
 switch(a.type){
 case 'schedule':s.trainingDays=[...new Set(a.days)].sort((a,b)=>a-b);break;
 case 'focus':s.targetAreas=normalizeTargetAreas(a.areas);break;
 case 'measurement':{
  if(a.date>day)throw new Error('今日までの日付を選んでください。');
  const records=s.measurements??[];
  if(a.originalDate&&!records.some(record=>record.date===a.originalDate))throw new Error('この記録は削除されています。画面を閉じて、もう一度入力してください。');
  if(a.originalDate&&a.originalDate!==a.date&&records.some(record=>record.date===a.date))throw new Error('変更先の日付には記録があります。その日の編集から更新してください。');
  s.measurements=[...records.filter(record=>record.date!==a.date&&record.date!==a.originalDate),{date:a.date,weight:a.weight,bodyFat:a.bodyFat,note:a.note}].sort((a,b)=>a.date.localeCompare(b.date));
  break;
 }
 case 'deleteMeasurement':s.measurements=(s.measurements??[]).filter(record=>record.date!==a.date);break;
 case 'login':if(!s.logins.includes(day)){s.logins.push(day);grant(10,5);}break;
 case 'start':if(s.sessions.some(x=>!x.finishedAt))break;s.sessions.push({id:a.id,date:day,startedAt:now,plan:a.plan,sets:[],note:'',title:a.title,targetSets:a.targetSets||1,minutes:a.minutes||35,targetAreas:normalizeTargetAreas(a.targetAreas??s.targetAreas??[])});break;
 case 'set':if(session!.finishedAt)throw new Error('このトレーニングは完了しています。');if(!session!.sets.some(x=>x.id===a.id))session!.sets.push({id:a.id,exercise:a.exercise,weight:a.weight,reps:a.reps});break;
 case 'editSet':{const set=session!.sets.find(x=>x.id===a.id);if(!set)throw new Error('セットが見つかりません。');set.weight=a.weight;set.reps=a.reps;break;}
 case 'deleteSet':session!.sets=session!.sets.filter(x=>x.id!==a.id);break;
 case 'finish':{if(session!.finishedAt)break;if(!session!.sets.length)throw new Error('1セット以上記録してから完了してください。');session!.finishedAt=now;session!.duration=a.duration;session!.note=a.note;const key='workout:'+day;if(!s.claims.includes(key)){s.claims.push(key);grant(40,20);}break;}
 case 'deleteSession':s.sessions=s.sessions.filter(x=>x.id!==a.sessionId);break;
 case 'recovery':if(!s.recovery.includes(day))s.recovery.push(day);break;
 case 'review':if(!s.reviews.some(x=>x.id===a.id))s.reviews.push({id:a.id,date:day,exercise:a.exercise,checks:a.checks,note:a.note,...(a.method?{method:a.method}:{}),...(a.videoId?{videoId:a.videoId}:{})});break;
 case 'claim':{const key=day+':'+a.quest;if(s.claims.includes(key))break;const ok=a.quest==='set'?s.sessions.some(x=>x.date===day&&x.sets.length>0):a.quest==='form'?s.reviews.some(x=>x.date===day):s.recovery.includes(day)||s.sessions.some(x=>x.date===day&&x.finishedAt);if(!ok)throw new Error('クエストを達成すると受け取れます。');s.claims.push(key);grant(a.quest==='form'?15:20,a.quest==='form'?5:10);break;}
 case 'pet':s.petName=a.name;break;
 case 'theme':if(!s.owned.includes(a.theme)){if(s.coins<60)throw new Error('コインが足りません。');s.coins-=60;s.owned.push(a.theme);}s.theme=a.theme;break;
 case 'timer':if(a.mode==='start'){s.timer={endAt:now+a.seconds*1000,remaining:a.seconds,preset:a.seconds};}else if(a.mode==='pause'){s.timer={...s.timer,endAt:null,remaining:s.timer.endAt?Math.max(0,Math.ceil((s.timer.endAt-now)/1000)):s.timer.remaining};}else{s.timer={endAt:null,remaining:a.seconds,preset:a.seconds};}break;
 }
 for(const badge of ACHIEVEMENTS){const key='badge:'+badge.id;if(badge.value(s)>=badge.goal&&!s.claims.includes(key)){s.claims.push(key);grant(25,10);}}
 return s;
}
function db(){if(!env.DB)throw new Error('記録に接続できません。しばらくしてから再試行してください。');return env.DB;}
export async function readState(user:string){
 const row=await db().prepare('SELECT data, revision FROM training_state WHERE user_id = ?').bind(user).first<{data:string,revision:number}>();
 return row?{state:{...initialState(),...JSON.parse(row.data)} as TrainingState,revision:row.revision}:{state:initialState(),revision:-1};
}
export async function mutateState(user:string,a:Action){
 for(let attempt=0;attempt<5;attempt++){
 const {state,revision}=await readState(user),next=applyAction(state,a);
 const q=revision===-1?db().prepare('INSERT OR IGNORE INTO training_state (user_id, data, revision) VALUES (?, ?, 0)').bind(user,JSON.stringify(next)):db().prepare('UPDATE training_state SET data = ?, revision = revision + 1 WHERE user_id = ? AND revision = ?').bind(JSON.stringify(next),user,revision);
 const r=await q.run();if(r.meta.changes)return next;
 }
 throw new Error('別の更新と重なりました。もう一度お試しください。');
}
