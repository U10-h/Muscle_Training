import type {ExerciseId, Session, SetRecord} from './training';

export type StrengthPoint = {
  sessionId:string; date:string; timestamp:number; best:SetRecord;
  weight:number; reps:number; volume:number; setCount:number; sets:SetRecord[];
};

// Finished sessions only. Preserve separate workouts on the same day.
export function exerciseHistory(sessions:readonly Session[], exercise:ExerciseId):StrengthPoint[] {
  return sessions.filter(s=>s.finishedAt != null).map(session=>{
    const sets=session.sets.filter(set=>set.exercise===exercise);
    if(!sets.length)return null;
    const best=sets.reduce((a,b)=>b.weight>a.weight||(b.weight===a.weight&&b.reps>a.reps)?b:a);
    return {sessionId:session.id,date:session.date,timestamp:session.startedAt,best,
      weight:best.weight,reps:best.reps,volume:Math.round(sets.reduce((sum,set)=>sum+set.weight*set.reps,0)*100)/100,
      setCount:sets.length,sets};
  }).filter((point):point is StrengthPoint=>point!==null)
    .sort((a,b)=>a.date.localeCompare(b.date)||a.timestamp-b.timestamp||a.sessionId.localeCompare(b.sessionId));
}

export function strengthSummary(history:readonly StrengthPoint[]) {
  const latest=history.at(-1),previous=history.at(-2);
  const best=history.reduce<StrengthPoint|undefined>((a,b)=>!a||b.weight>a.weight||(b.weight===a.weight&&b.reps>=a.reps)?b:a,undefined);
  return {latest,previous,best,change:latest&&previous?latest.weight-previous.weight:null,
    totalSets:history.reduce((sum,point)=>sum+point.setCount,0)};
}
