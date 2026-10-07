export const EXERCISES = [
 {id:'leg',source:'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/leg-press/vid-20084684',name:'レッグプレス',en:'LEG PRESS',group:'脚・お尻',checks:['背中とお尻がシートから浮いていない','膝とつま先が同じ方向を向いている','反動を使わず、膝を伸ばし切らずに戻せている'],tip:'座席を合わせ、痛みのない範囲でゆっくり。最初にスタッフに座席設定を確認してもらおう。'},
 {id:'chest',source:'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/chest-press/vid-20084687',name:'チェストプレス',en:'CHEST PRESS',group:'胸・腕',checks:['グリップが胸の高さにある','肩をすくめず、背中をシートにつけている','押すときに息を吐き、ゆっくり戻している'],tip:'持ち手が胸の高さになるように座席を調整。肘を無理に後ろへ引かない。'},
 {id:'lat',source:'https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/',name:'ラットプルダウン',en:'LAT PULLDOWN',group:'背中・腕',checks:['バーを首の後ろではなく胸の前へ引いている','上体を大きく反らしたり振ったりしていない','肩をすくめず、ゆっくり戻している'],tip:'太もものパッドを固定。軽い重さで、肘を下に向けて引く感覚を確認しよう。'},
 {id:'row',source:'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/seated-row/vid-20084688',name:'シーテッドロー',en:'SEATED ROW',group:'背中・腕',checks:['背中を丸めず、首が自然な位置にある','上体を前後に振っていない','肘を引いたあと、反動を使わず戻している'],tip:'胸を自然に起こし、肩をすくめず引く。腰を大きく反らさない。'},
 {id:'curl',source:'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/seated-hamstring-curl/vid-20084685',name:'レッグカール',en:'LEG CURL',group:'もも裏',checks:['マシンの回転軸と膝の位置を合わせている','腰やお尻がシートから浮いていない','痛みのない範囲でゆっくり動かせている'],tip:'パッドの位置はマシンの案内に合わせる。膝の位置合わせをスタッフと確認しよう。'},
 {id:'shoulder',source:'https://ie.physitrack.com/home-exercise-video/shoulder-press-with-weight-machine',name:'ショルダープレス',en:'SHOULDER PRESS',group:'肩・腕',checks:['持ち手が肩の少し上にくる位置に座っている','上体を起こしたまま、持ち手を上へ押せている','反動を使わず、ゆっくり元の位置へ戻している'],tip:'座席を合わせ、軽い重さで上へ押す動きを確認しよう。'},
 {id:'biceps',source:'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/biceps-curl/vid-20084690',name:'アームカール',en:'BICEPS CURL',group:'腕（上腕二頭筋）',checks:['手のひらを上に向けて持ち手を握っている','手首を曲げずに肘を曲げている','上げるときも下げるときもゆっくり動かせている'],tip:'手首をまっすぐ保ち、腕の前側を意識して丁寧に。'},
 {id:'abs',source:'https://us.physitrack.com/home-exercise-video/abdominal-crunch-machine',name:'アブドミナルクランチ',en:'ABDOMINAL CRUNCH',group:'お腹',checks:['座席とパッドをマシンの案内に合わせている','お腹に力を入れ、上体を前へ曲げている','勢いをつけず、ゆっくり元の位置へ戻している'],tip:'お腹に力を入れて上体を前へ。初回はスタッフにマシンの設定を確認しよう。'},
] as const;
export type ExerciseId = typeof EXERCISES[number]['id'];
export const BODY_AREAS = [{id:'chest',label:'胸'},{id:'back',label:'背中'},{id:'legs',label:'脚・お尻'},{id:'shoulders',label:'肩'},{id:'arms',label:'腕'},{id:'core',label:'お腹'}] as const;
export type BodyArea = typeof BODY_AREAS[number]['id'];
export const normalizeTargetAreas=(areas:readonly BodyArea[])=>BODY_AREAS.filter(area=>areas.includes(area.id)).map(area=>area.id);
export const targetAreaLabels=(areas:readonly BodyArea[])=>BODY_AREAS.filter(area=>areas.includes(area.id)).map(area=>area.label);
export type SetRecord = {id:string;exercise:ExerciseId;weight:number;reps:number};
export type Session = {id:string;date:string;startedAt:number;finishedAt?:number;duration?:number;targetSets?:number;minutes?:number;targetAreas?:BodyArea[];plan:ExerciseId[];sets:SetRecord[];note:string;title:string};
export type Review = {id:string;date:string;exercise:ExerciseId;checks:(boolean|null)[];note:string;videoId?:string;method?:'self'};
export type BodyMeasurement = {date:string;weight:number;bodyFat:number|null;note:string};
export type TrainingState = {trainingDays:number[];targetAreas:BodyArea[];measurements:BodyMeasurement[];sessions:Session[];reviews:Review[];recovery:string[];logins:string[];claims:string[];xp:number;coins:number;owned:string[];theme:string;petName:string;timer:{endAt:number|null;remaining:number;preset:number};};
export const initialState = ():TrainingState=>({trainingDays:[0,2],targetAreas:[],measurements:[],sessions:[],reviews:[],recovery:[],logins:[],claims:[],xp:0,coins:0,owned:['mint'],theme:'mint',petName:'レピ',timer:{endAt:null,remaining:90,preset:90}});
export function jstDate(now:number|Date=Date.now()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function dayOffset(date:string,offset:number){return new Date(Date.parse(date+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);}
export function weekDates(date:string){const wd=new Date(date+'T12:00:00Z').getUTCDay();const mon=dayOffset(date,-((wd+6)%7));return Array.from({length:7},(_,i)=>dayOffset(mon,i));}
export const levelOf=(xp:number)=>1+Math.floor(xp/100);
export const exerciseOf=(id:string)=>EXERCISES.find(x=>x.id===id)||EXERCISES[0];
export const WEEKDAY_LABELS = ['月','火','水','木','金','土','日'] as const;
export function makePlan(minutes:number,condition:string,day:string,trainingDays:readonly number[]=[0,2],targetAreas:readonly BodyArea[]=[]):{ids:ExerciseId[],sets:number,title:string,reason:string,minutes:number}{
 const weekday=(new Date(day+'T12:00:00Z').getUTCDay()+6)%7;
 const slot=trainingDays.indexOf(weekday),useB=slot>=0&&slot%2===1;
 if(condition==='pain')return {ids:[],sets:0,minutes:0,title:'今日は休養にしよう',reason:'痛みのある動きは休んでください。痛みが続く場合は医療者に相談を。'};
 const areas=normalizeTargetAreas(targetAreas),sets=minutes===50&&condition==='good'?2:1;
 if(areas.length){
  const primary:Record<BodyArea,ExerciseId>={chest:'chest',back:useB?'row':'lat',legs:'leg',shoulders:'shoulder',arms:'biceps',core:'abs'};
  const ids=areas.map(area=>primary[area]);
  if(minutes>=35&&condition==='good'){
   if(areas.includes('legs')&&ids.length<4)ids.push('curl');
   if(areas.includes('back')&&ids.length<4)ids.push(useB?'lat':'row');
  }
  const label=areas.length>3?`${areas.length}部位`:targetAreaLabels(areas).join('・');
  return {ids,sets,minutes:Math.ceil((10+ids.length*sets*3)/5)*5,title:`${condition==='tired'?'軽めの':''}${label}のメニュー`,reason:condition==='tired'?'選んだ部位を1セットずつ。疲れている日は、途中で終えても大丈夫。':'選んだ部位の種目を組み合わせました。軽い重さで、丁寧に動かそう。'};
 }
 const ids:ExerciseId[]=['leg','chest',useB?'row':'lat'];
 if(minutes>=35&&condition==='good')ids.push('curl');
 return {ids,sets,minutes,title:condition==='tired'?'軽めの全身メニュー':useB?'全身トレーニング B':'全身トレーニング A',reason:condition==='tired'?'疲れている日は1セットずつ。途中で終えても大丈夫。':'脚・胸・背中をバランスよく。まずは軽い重さで動きに慣れよう。'};
}
export const ACHIEVEMENTS=[
 {id:'first',name:'はじめの一歩',description:'初めてのトレーニングを完了',goal:1,value:(s:TrainingState)=>s.sessions.filter(x=>x.finishedAt).length},
 {id:'five',name:'少しずつ、着実に',description:'トレーニングを5回完了',goal:5,value:(s:TrainingState)=>s.sessions.filter(x=>x.finishedAt).length},
 {id:'form',name:'フォーム研究家',description:'フォーム確認を3回保存',goal:3,value:(s:TrainingState)=>s.reviews.length},
 {id:'rest',name:'休むのもトレーニング',description:'休養を3日記録',goal:3,value:(s:TrainingState)=>s.recovery.length},
 {id:'ten',name:'自分のリズム',description:'トレーニングを10回完了',goal:10,value:(s:TrainingState)=>s.sessions.filter(x=>x.finishedAt).length},
 {id:'login',name:'いつもの場所',description:'7日間アプリを開く（連続でなくてOK）',goal:7,value:(s:TrainingState)=>s.logins.length},
];


export type MeasurementPeriod = '30'|'90'|'all';
export type MeasurementMetric = 'weight'|'bodyFat';
export const orderedMeasurements=(records:readonly BodyMeasurement[])=>[...records].sort((a,b)=>a.date.localeCompare(b.date));
export const measurementTimestamp=(date:string)=>Date.parse(date+'T00:00:00Z');
export const signedChange=(value:number)=>{const rounded=Math.round(value*10)/10;return `${rounded>0?'+':''}${rounded.toFixed(1)}`;};
export function measurementSeries(records:readonly BodyMeasurement[],period:MeasurementPeriod,today:string,metric:MeasurementMetric){
 const cutoff=period==='all'?'1900-01-01':dayOffset(today,1-Number(period));
 return orderedMeasurements(records).filter(record=>record.date>=cutoff&&record.date<=today&&record[metric]!==null).map(record=>({date:record.date,timestamp:measurementTimestamp(record.date),value:record[metric] as number}));
}
export function measurementSummary(records:readonly BodyMeasurement[]){
 const ordered=orderedMeasurements(records),latest=ordered.at(-1),previous=ordered.at(-2),first=ordered[0];
 return {latest,previous,first,latestFat:ordered.filter(record=>record.bodyFat!==null).at(-1),previousChange:latest&&previous?latest.weight-previous.weight:null,totalChange:latest&&ordered.length>1?latest.weight-first.weight:null};
}
