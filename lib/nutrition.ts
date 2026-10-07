export const MEAL_PARTS = [
  {id:'staple',label:'主食',examples:'ご飯・パン・麺など'},
  {id:'main',label:'主菜',examples:'魚・肉・卵・豆腐・納豆など'},
  {id:'vegetable',label:'副菜',examples:'野菜・きのこ・海藻の料理など'},
] as const;
export type MealPart = typeof MEAL_PARTS[number]['id'];
export type MealCheck = Record<MealPart,'yes'|'no'|'unknown'>;
export function mealAdvice(check:MealCheck,sweetDrink:boolean):string[] {
  const advice:string[]=[];
  if(check.main==='no')advice.push('主菜を1品足してみよう。ゆで卵、冷ややっこ、焼き魚などから選べます。');
  if(check.vegetable==='no')advice.push('副菜を1品。サラダ、冷凍野菜のおかず、具だくさんの野菜スープなどを添えてみよう。');
  if(check.staple==='no')advice.push('主食も食事の一部に。ご飯やパンなどを、ほかのおかずとの量のバランスで選びましょう。');
  if(sweetDrink)advice.push('甘い飲み物のうち1杯を、水や無糖のお茶に替えてみよう。');
  if(Object.values(check).every(value=>value==='yes'))advice.push('主食・主菜・副菜がそろっています。品数だけでなく量も確認し、足りない分は次の食事で整えましょう。');
  if(Object.values(check).some(value=>value==='unknown'))advice.push('未確認の項目は、食材を見て選んでみよう。丼やサンドイッチなど、1品に複数の区分が含まれていても大丈夫です。');
  return advice;
}
