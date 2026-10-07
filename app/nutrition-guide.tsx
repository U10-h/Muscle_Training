'use client';
import {useState} from 'react';
import {Utensils,ExternalLink,CheckCircle2} from 'lucide-react';
import {RadioGroup,RadioGroupItem} from '@/components/ui/radio-group';
import {Checkbox} from '@/components/ui/checkbox';
import {MEAL_PARTS,mealAdvice,type MealCheck} from '@/lib/nutrition';

const examples={
  convenience:{label:'コンビニ',meal:['おにぎり','ゆで卵・豆腐・サラダチキンなど','サラダ・野菜のおかず'],hint:'麺やパンだけで終わりそうなら、主菜と副菜を足すところから。'},
  restaurant:{label:'外食',meal:['ご飯','焼き魚・鶏肉・豆腐などの主菜','野菜の小鉢'],hint:'定食は組み合わせを選びやすい形。大盛りが習慣なら、まず普通盛りを試してみよう。'},
  home:{label:'家で食べる',meal:['ご飯','納豆＋卵、魚、肉、豆腐など','冷凍野菜のおかず・具だくさん汁'],hint:'全部を手作りしなくても大丈夫。冷凍野菜や惣菜も組み合わせに使えます。'},
};
export function NutritionGuide() {
  const [scene,setScene]=useState<keyof typeof examples>('convenience');
  const [check,setCheck]=useState<MealCheck>({staple:'unknown',main:'unknown',vegetable:'unknown'}),[sweet,setSweet]=useState(false),[result,setResult]=useState<string[]|null>(null);
  const example=examples[scene];
  return <div className="nutrition-guide">
    <section className="card meal-basics"><div className="card-heading"><h2><Utensils/>まずは、食事の組み合わせから</h2><span className="tag">減量・筋トレの土台</span></div><p>主食・主菜・副菜をそろえるところから。毎回完璧にするより、足りないものを1つ足してみよう。</p>
      <div className="meal-parts">{MEAL_PARTS.map((part,i)=><div key={part.id}><span>0{i+1}</span><h3>{part.label}</h3><p>{part.examples}</p></div>)}</div>
      <p className="meal-note">1日を通して、果物や牛乳・乳製品も。アレルギーや食事制限に合わせて選んでください。</p>
    </section>
    <div className="nutrition-grid">
      <section className="card meal-examples"><h2>こんな組み合わせから</h2><RadioGroup value={scene} onValueChange={value=>setScene(value as keyof typeof examples)} aria-label="食事の場面" className="scene-choices">{Object.entries(examples).map(([id,value])=><label className={scene===id?'selected':''} key={id}><RadioGroupItem value={id}/>{value.label}</label>)}</RadioGroup>
        <dl className="meal-example-list">{example.meal.map((meal,i)=><div key={i}><dt>{MEAL_PARTS[i].label}</dt><dd>{meal}</dd></div>)}</dl><p>{example.hint}</p>
        <details className="food-details"><summary>体重を落としたいときの、小さな調整</summary><ul><li>甘い飲み物を、水・無糖のお茶に替える。</li><li>大盛りやおかわりが習慣なら、まず普通盛りに。</li><li>間食は袋から食べ続けず、食べる分を取り分ける。</li><li>主菜も残して、食事を極端に減らさない。</li></ul><p>食べすぎた翌日も、食事を抜いて埋め合わせず、いつもの食事に戻しましょう。</p></details>
      </section>
      <section className="card meal-check"><h2>今の1食をチェック</h2><p>食べたもの・これから食べるものを選ぶと、次の工夫を表示します。</p><form onSubmit={event=>{event.preventDefault();setResult(mealAdvice(check,sweet));}}><fieldset><legend className="sr-only">食事に含まれるもの</legend>{MEAL_PARTS.map(part=><div className="meal-check-row" key={part.id}><span id={'meal-'+part.id}>{part.label}<small>{part.examples}</small></span><RadioGroup value={check[part.id]} onValueChange={value=>{setCheck({...check,[part.id]:value});setResult(null);}} aria-labelledby={'meal-'+part.id} className="meal-options">{[{value:'yes',label:'ある'},{value:'no',label:'ない'},{value:'unknown',label:'未確認'}].map(option=><label key={option.value}><RadioGroupItem value={option.value}/>{option.label}</label>)}</RadioGroup></div>)}<label className="sweet-choice"><Checkbox checked={sweet} onCheckedChange={value=>{setSweet(value===true);setResult(null);}}/>甘い飲み物も飲む</label></fieldset><button className="btn primary" type="submit">食事のヒントを見る</button></form>
        <div aria-live="polite">{result&&<div className="meal-result"><h3><CheckCircle2 size={18}/>次にできること</h3><ul>{result.map(tip=><li key={tip}>{tip}</li>)}</ul><p>量や栄養素の過不足を判定するものではありません。</p></div>}</div>
      </section>
    </div>
    <details className="food-details nutrition-source"><summary>このガイドについて・参考資料</summary><p>一般的な食事の組み合わせのヒントです。献立例はアプリで用意した例で、個別の摂取カロリーやたんぱく質量を処方するものではありません。治療中の食事制限がある場合は、その指示を優先してください。チェック内容は保存されません。</p><a className="source-link" href="https://www.maff.go.jp/j/balance_guide/" target="_blank" rel="noreferrer">農林水産省「食事バランスガイド」<ExternalLink size={14}/></a><a className="source-link" href="https://www.maff.go.jp/j/syokuiku/minna_navi/about/group.html" target="_blank" rel="noreferrer">5つの料理グループ<ExternalLink size={14}/></a></details>
  </div>;
}
