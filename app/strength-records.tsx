'use client';
import {useMemo,useState} from 'react';
import {Dumbbell,Trophy} from 'lucide-react';
import {CartesianGrid,Line,LineChart,XAxis,YAxis} from 'recharts';
import {ChartContainer,ChartTooltip,ChartTooltipContent} from '@/components/ui/chart';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Table,TableBody,TableCaption,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {EXERCISES,dayOffset,exerciseOf,type ExerciseId,type Session} from '@/lib/training';
import {exerciseHistory,strengthSummary} from '@/lib/strength';
import {BeginnerGuide} from './beginner-guide';

const number=(value:number)=>value.toLocaleString('ja-JP',{maximumFractionDigits:2});
const signed=(value:number)=>`${value>0?'+':''}${number(value)}`;
function Choice({label,value,options,onChange}:{label:string;value:string;options:[string,string][];onChange:(value:string)=>void}) {
  return <label className="field-label">{label}<Select value={value} onValueChange={onChange}><SelectTrigger className="pick" aria-label={label}><SelectValue/></SelectTrigger><SelectContent>{options.map(([id,name])=><SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></label>;
}
export function StrengthRecords({sessions,today,exercise,onExercise,onOpenSession,onTrain}:{sessions:Session[];today:string;exercise:ExerciseId;onExercise:(id:ExerciseId)=>void;onOpenSession:(id:string)=>void;onTrain:()=>void}) {
  const [period,setPeriod]=useState('90'),[metric,setMetric]=useState('weight'),[limit,setLimit]=useState(10);
  const all=useMemo(()=>exerciseHistory(sessions,exercise),[sessions,exercise]);
  const {latest,previous,best,change,totalSets}=strengthSummary(all);
  const cutoff=period==='all'?'1900-01-01':dayOffset(today,1-Number(period));
  const series=all.filter(point=>point.date>=cutoff&&point.date<=today);
  const metricLabel=metric==='weight'?'最高重量':'総負荷量',unit=metric==='weight'?'kg':'kg・回';
  const recorded=new Set(sessions.flatMap(s=>s.finishedAt!=null?s.sets.map(set=>set.exercise):[]));
  return <div className="strength-records">
    <div className="strength-heading"><div><h2>種目ごとの成長</h2><p>重さと回数をセットで振り返ろう。</p></div><Choice label="種目" value={exercise} onChange={value=>{onExercise(value as ExerciseId);setLimit(10);}} options={EXERCISES.map(e=>[e.id,e.name+(recorded.has(e.id)?'':'（未記録）')])}/></div>
    <div className="strength-stats">
      <div className="strength-stat personal-best"><span><Trophy size={16}/>記録上の最高重量</span><strong>{best?number(best.weight):'—'}<small>kg</small></strong><p>{best?`${best.reps}回 · ${best.date}`:'最初の記録を待っています'}</p></div>
      <div className="strength-stat"><span>前回からの変化</span><strong>{change===null?'—':signed(change)}<small>kg</small></strong><p>{previous?`${number(previous.weight)} → ${number(latest!.weight)} kg`:'2回完了すると比較できます'}</p></div>
      <div className="strength-stat"><span>直近の最高重量</span><strong>{latest?number(latest.weight):'—'}<small>kg</small></strong><p>{latest?`${latest.reps}回 · ${latest.date}`:'トレーニング完了後に反映'}</p></div>
      <div className="strength-stat"><span>積み重ねた実績</span><strong>{all.length}<small>回</small></strong><p>{totalSets}セット · 完了したトレーニング</p></div>
    </div>
    <section className="card strength-chart-card">
      <div className="card-heading"><h2>{exerciseOf(exercise).name}の推移</h2><div className="strength-controls"><Choice label="表示" value={metric} onChange={setMetric} options={[["weight","最高重量（kg）"],["volume","総負荷量（kg・回）"]]}/><Choice label="期間" value={period} onChange={value=>{setPeriod(value);setLimit(10);}} options={[["30","30日"],["90","90日"],["all","全期間"]]}/></div></div>
      <p className="chart-explanation">{metric==='weight'?'各トレーニングで記録した最も重いセット。回数は下の一覧で確認できます。':'重量 × 回数を、その回の同じ種目の全セットで合計。セット数が増えても大きくなります。'}</p>
      {series.length?<><ChartContainer className="strength-chart" config={{[metric]:{label:metricLabel,color:'#146b59'}}} aria-label={`${exerciseOf(exercise).name}の${metricLabel}。${series.length}回の記録。数値は下の一覧でも確認できます。`}>
        <LineChart accessibilityLayer data={series} margin={{top:20,left:0,right:18,bottom:10}}>
          <CartesianGrid vertical={false} stroke="#dce3df"/>
          <XAxis dataKey="timestamp" type="number" scale="time" domain={series.length===1?[series[0].timestamp-86400000,series[0].timestamp+86400000]:['dataMin','dataMax']} tickFormatter={value=>new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric'}).format(value)} tickLine={false} axisLine={false} minTickGap={28}/>
          <YAxis width={60} domain={[0,'auto']} tickLine={false} axisLine={false}/>
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(_,payload)=>payload?.[0]?.payload?.date??''} formatter={value=><span>{metricLabel} <strong>{number(Number(value))} {unit}</strong></span>}/>}/>
          <Line type="linear" dataKey={metric} stroke="var(--color-weight, var(--color-volume))" strokeWidth={2.5} dot={{r:4,fill:'#146b59'}} isAnimationActive={false}/>
        </LineChart>
      </ChartContainer><p className="chart-explanation">縦軸：{unit} · {series.length}回の記録{series.length===1?'（2回目から線でつながります）':''}</p></>:<div className="strength-empty"><Dumbbell size={32}/><h3>{all.length?'この期間の記録はありません':'最初の1回から、成長が見えてきます'}</h3><p>{all.length?'期間を切り替えて確認できます。':'重さと回数を保存し、トレーニングを完了すると表示されます。'}</p>{!all.length&&<button className="btn primary" onClick={onTrain}>トレーニングへ</button>}</div>}
      <p className="comparison-note">最高重量は1回だけ上げられる限界重量（1RM）の推定ではありません。回数やマシン、可動域が違うと単純比較できません。上の実績は全期間、グラフと一覧は選んだ期間です。</p>
    </section>
    <section className="card strength-history"><div className="card-heading"><h2>重量・回数の実績</h2><span className="muted">{series.length}回 · 新しい順</span></div>{series.length?<><Table><TableCaption>同じ日のトレーニングも、1回ずつ表示します。各回を開くとセットを編集できます。</TableCaption><TableHeader><TableRow><TableHead>日付</TableHead><TableHead>全セット</TableHead><TableHead>総負荷量</TableHead><TableHead><span className="sr-only">操作</span></TableHead></TableRow></TableHeader><TableBody>{series.slice().reverse().slice(0,limit).map(point=><TableRow key={point.sessionId}><TableCell>{point.date.slice(5).replace('-','/')}<small className="record-year">{point.date.slice(0,4)}</small></TableCell><TableCell><ul className="set-results">{point.sets.map((set,i)=><li key={set.id}>{i+1}. <strong>{number(set.weight)} kg × {set.reps}回</strong></li>)}</ul></TableCell><TableCell>{number(point.volume)}<small> kg・回</small></TableCell><TableCell><button className="text-btn" aria-label={`${point.date}のトレーニング記録を開く`} onClick={()=>onOpenSession(point.sessionId)}>開く</button></TableCell></TableRow>)}</TableBody></Table>{series.length>limit&&<button className="btn outline" onClick={()=>setLimit(value=>value+10)}>さらに10件を見る</button>}</>:<p className="muted">この期間のセット記録はありません。</p>}</section>
    <BeginnerGuide exercise={exercise}/>
  </div>;
}
