'use client';

import {useMemo,useState} from 'react';
import {CartesianGrid,Line,LineChart,XAxis,YAxis} from 'recharts';
import {Scale,Plus,ChevronRight,Pencil,Trash2,Check,TrendingUp} from 'lucide-react';
import {ChartContainer,ChartTooltip,ChartTooltipContent} from '@/components/ui/chart';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction} from '@/components/ui/alert-dialog';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {measurementSeries,measurementSummary,measurementTimestamp,orderedMeasurements,signedChange,dayOffset,type BodyMeasurement,type TrainingState,type MeasurementMetric,type MeasurementPeriod} from '@/lib/training';
import type {Action} from '@/lib/state-server';

type SaveAction=(action:Action,message?:string)=>Promise<TrainingState|null>;
const displayDate=(date:string)=>date.replaceAll('-','/');

export function BodySummary({records,today,disabled,onAdd,onHistory}:{records:BodyMeasurement[];today:string;disabled:boolean;onAdd:()=>void;onHistory:()=>void}){
 const {latest,previousChange}=measurementSummary(records);
 return <section className="card body-summary"><div className="card-heading"><h2><Scale/>からだの記録</h2><button className="text-btn" onClick={onHistory}>推移を見る<ChevronRight size={15}/></button></div>
  {latest?<div className="body-summary-value"><div><strong>{latest.weight.toFixed(1)}<small>kg</small></strong><span>{displayDate(latest.date)} の体重</span></div><span className="body-change">{previousChange===null?'初回の記録':`前回比 ${signedChange(previousChange)} kg`}</span></div>:<p className="body-empty-copy">体重を残して、少しずつ変化を見ていこう。</p>}
  <button className="btn outline wide" disabled={disabled} onClick={onAdd}><Plus size={17}/>{records.some(record=>record.date===today)?'今日の体重を更新':'体重を記録'}</button>
 </section>;
}

export function BodyRecords({records,today,busy,loaded,act,onAdd,onEdit}:{records:BodyMeasurement[];today:string;busy:boolean;loaded:boolean;act:SaveAction;onAdd:()=>void;onEdit:(record:BodyMeasurement)=>void}){
 const [period,setPeriod]=useState<MeasurementPeriod>('30'),[metric,setMetric]=useState<MeasurementMetric>('weight'),[remove,setRemove]=useState<string|null>(null),[visibleCount,setVisibleCount]=useState(20);
 const summary=measurementSummary(records),ordered=orderedMeasurements(records),series=useMemo(()=>measurementSeries(records,period,today,metric),[records,period,today,metric]),unit=metric==='weight'?'kg':'%',metricLabel=metric==='weight'?'体重':'体脂肪率';
 const firstTime=series[0]?.timestamp??measurementTimestamp(today),lastTime=series.at(-1)?.timestamp??firstTime;
 const from=period==='all'?firstTime:measurementTimestamp(dayOffset(today,1-Number(period))),to=period==='all'?lastTime:measurementTimestamp(today),spanDays=Math.round((to-from)/86400000),tickCount=Math.min(5,spanDays+1);
 const ticks=Array.from({length:tickCount},(_,i)=>from+(tickCount===1?0:Math.round(i*spanDays/(tickCount-1)))*86400000);
 const change=series.length>1?series.at(-1)!.value-series[0].value:null;
 const history=ordered.slice().reverse();
 return <div className="body-records">
  <div className="body-records-heading"><div><h2>からだの変化</h2><p>体重・体脂肪率を、日付ごとに残せます。</p></div><button className="btn primary" disabled={busy||!loaded} onClick={onAdd}><Plus size={17}/>体重を記録</button></div>
  <div className="body-stat-grid">
   <div className="body-stat"><span>最新の体重</span><strong>{summary.latest?summary.latest.weight.toFixed(1):'—'}<small>kg</small></strong><p>{summary.latest?displayDate(summary.latest.date):'最初の記録を待っています'}</p></div>
   <div className="body-stat"><span>前回から</span><strong>{summary.previousChange===null?'—':signedChange(summary.previousChange)}<small>kg</small></strong><p>{summary.previous?displayDate(summary.previous.date)+' と比較':'2回記録すると表示します'}</p></div>
   <div className="body-stat"><span>初回から</span><strong>{summary.totalChange===null?'—':signedChange(summary.totalChange)}<small>kg</small></strong><p>{summary.first?displayDate(summary.first.date)+' から':'記録の積み重ねをここに'}</p></div>
   <div className="body-stat"><span>最新の体脂肪率</span><strong>{summary.latestFat?.bodyFat?.toFixed(1)??'—'}<small>%</small></strong><p>{summary.latestFat?displayDate(summary.latestFat.date):'体脂肪率は任意です'}</p></div>
  </div>
  <section className="card body-chart-card"><div className="card-heading"><h2><TrendingUp/>{metricLabel}の推移</h2><div className="body-chart-controls">
   <Select value={metric} onValueChange={value=>setMetric(value as MeasurementMetric)}><SelectTrigger className="pick" aria-label="グラフの項目"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="weight">体重</SelectItem><SelectItem value="bodyFat">体脂肪率</SelectItem></SelectContent></Select>
   <Select value={period} onValueChange={value=>setPeriod(value as MeasurementPeriod)}><SelectTrigger className="pick" aria-label="グラフの表示期間"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="30">直近30日</SelectItem><SelectItem value="90">直近90日</SelectItem><SelectItem value="all">全期間</SelectItem></SelectContent></Select>
  </div></div>
  {series.length?<><div className="body-chart-overview"><span>{displayDate(series[0].date)}〜{displayDate(series.at(-1)!.date)} · {series.length}回の記録</span><strong>{change===null?'次の記録から増減を表示':`期間内の変化 ${signedChange(change)} ${metric==='weight'?'kg':'ポイント'}`}</strong></div>
   <ChartContainer className="body-chart" config={{value:{label:metricLabel,color:'#497e65'}}} aria-label={`${metricLabel}の推移。期間内に${series.length}回の記録。詳しい値は下の記録一覧で確認できます。`}>
    <LineChart accessibilityLayer data={series} margin={{top:18,right:18,bottom:8,left:0}}>
     <CartesianGrid vertical={false} stroke="#e2eae0"/>
     <XAxis dataKey="timestamp" type="number" scale="time" domain={from===to?[from-86400000,to+86400000]:[from,to]} ticks={ticks} tickFormatter={value=>new Date(value).toISOString().slice(5,10).replace('-','/')} tickLine={false} axisLine={false} tickMargin={12} minTickGap={24}/>
     <YAxis width={49} domain={[(min:number)=>Math.max(0,Math.floor((min-1)*10)/10),(max:number)=>Math.ceil((max+1)*10)/10]} tickFormatter={value=>Number(value).toFixed(1)} tickLine={false} axisLine={false} tickMargin={7}/>
     <ChartTooltip content={<ChartTooltipContent labelFormatter={(_,payload)=>displayDate(payload?.[0]?.payload?.date??'')} formatter={value=><span className="body-tooltip-value">{metricLabel} <strong>{Number(value).toFixed(1)} {unit}</strong></span>}/>}/>
     <Line type="linear" dataKey="value" name={metricLabel} stroke="var(--color-value)" strokeWidth={2.5} dot={{r:4,fill:'#497e65',strokeWidth:2,stroke:'#fff'}} activeDot={{r:6}} isAnimationActive={false}/>
    </LineChart>
   </ChartContainer><p className="body-chart-note">縦軸：{unit} · 点は記録した値、線は記録間のつながりを示します。</p></>:<div className="body-chart-empty"><Scale size={32}/><strong>{records.length?'この期間の'+metricLabel+'は未記録です':'最初の記録から、グラフが始まります。'}</strong><p>{records.length?'期間を切り替えるか、記録を追加してください。':'体重だけでも大丈夫。測った日から残していこう。'}</p><button className="btn outline" disabled={busy||!loaded} onClick={onAdd}><Plus size={16}/>記録する</button></div>}
  </section>
  <section className="card body-history"><div className="card-heading"><h2>からだの記録一覧</h2><span className="muted small">全 {records.length} 日 · 新しい順</span></div>
   {history.length?<><Table><TableHeader><TableRow><TableHead>日付</TableHead><TableHead>体重</TableHead><TableHead>体脂肪率</TableHead><TableHead>メモ</TableHead><TableHead><span className="sr-only">操作</span></TableHead></TableRow></TableHeader><TableBody>{history.slice(0,visibleCount).map(record=><TableRow key={record.date}><TableCell className="body-date-cell">{displayDate(record.date)}</TableCell><TableCell className="body-number-cell">{record.weight.toFixed(1)} <small>kg</small></TableCell><TableCell className="body-number-cell">{record.bodyFat===null?'—':record.bodyFat.toFixed(1)+' %'}</TableCell><TableCell className="body-note-cell">{record.note||'—'}</TableCell><TableCell><div className="body-row-actions"><button className="icon-btn" disabled={busy||!loaded} aria-label={displayDate(record.date)+'の体重記録を編集'} onClick={()=>onEdit(record)}><Pencil size={16}/></button><button className="icon-btn" disabled={busy||!loaded} aria-label={displayDate(record.date)+'の体重記録を削除'} onClick={()=>setRemove(record.date)}><Trash2 size={16}/></button></div></TableCell></TableRow>)}</TableBody></Table>{history.length>visibleCount&&<button className="btn outline body-more" onClick={()=>setVisibleCount(count=>count+20)}>さらに20件を見る</button>}</>:<p className="body-empty-copy">保存した体重・体脂肪率・メモがここに並びます。</p>}
  </section>
  <AlertDialog open={remove!==null} onOpenChange={open=>{if(!open&&!busy)setRemove(null);}}><AlertDialogContent><AlertDialogTitle>この日の体重記録を削除しますか？</AlertDialogTitle><AlertDialogDescription>{remove&&displayDate(remove)} の体重・体脂肪率・メモを削除します。</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel disabled={busy}>戻る</AlertDialogCancel><AlertDialogAction disabled={busy} onClick={async event=>{event.preventDefault();if(remove&&await act({type:'deleteMeasurement',date:remove},'体重の記録を削除しました'))setRemove(null);}}>{busy?'削除中…':'削除'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </div>;
}

export function BodyEntryDialog({records,today,date,editing,busy,act,onClose}:{records:BodyMeasurement[];today:string;date:string;editing:boolean;busy:boolean;act:SaveAction;onClose:()=>void}){
 const draftFor=(date:string)=>{const record=records.find(item=>item.date===date);return {date,weight:record?String(record.weight):'',bodyFat:record?.bodyFat==null?'':String(record.bodyFat),note:record?.note??''};};
 const [draft,setDraft]=useState(()=>draftFor(date));
 const existing=records.find(record=>record.date===draft.date),conflict=editing&&draft.date!==date&&!!existing;
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent className="app-dialog body-entry-dialog"><DialogTitle>{editing?'からだの記録を編集':'からだを記録する'}</DialogTitle><DialogDescription>1日1件、測った値を残せます。体脂肪率とメモは任意です。</DialogDescription>
  <form onSubmit={async event=>{event.preventDefault();if(busy||conflict)return;const result=await act({type:'measurement',date:draft.date,...(editing?{originalDate:date}:{}),weight:Number(draft.weight),bodyFat:draft.bodyFat===''?null:Number(draft.bodyFat),note:draft.note},'からだの記録を保存しました');if(result)onClose();}}>
   <fieldset disabled={busy} className="body-entry-fields"><label className="field-label">測定日<input required type="date" min="1900-01-01" max={today} value={draft.date} onChange={event=>setDraft(editing?{...draft,date:event.target.value}:draftFor(event.target.value))}/></label>
    <div className="body-measure-inputs"><label className="field-label">体重（kg）<input autoFocus required inputMode="decimal" type="number" min="0.1" max="500" step="0.1" placeholder="0.0" value={draft.weight} onChange={event=>setDraft({...draft,weight:event.target.value})}/></label><label className="field-label">体脂肪率（%・任意）<input inputMode="decimal" type="number" min="0.1" max="99.9" step="0.1" placeholder="未入力でもOK" value={draft.bodyFat} onChange={event=>setDraft({...draft,bodyFat:event.target.value})}/></label></div>
    <label className="field-label">メモ（任意）<textarea maxLength={500} placeholder="朝、起床後に測定 など" value={draft.note} onChange={event=>setDraft({...draft,note:event.target.value})}/></label>
   </fieldset>
   {conflict?<p className="body-entry-notice" role="alert">変更先の日付には記録があります。その日の編集から更新してください。</p>:!editing&&existing?<p className="body-entry-notice">この日は記録済みです。保存すると、表示している内容に更新します。</p>:<p className="body-entry-help">過去の日付も入力できます。日付は日本時間です。</p>}
   <div className="schedule-dialog-actions"><button type="button" className="btn outline" disabled={busy} onClick={onClose}>キャンセル</button><button type="submit" className="btn primary" disabled={busy||conflict}><Check size={17}/>{busy?'保存中…':'記録を保存'}</button></div>
  </form>
 </DialogContent></Dialog>;
}
