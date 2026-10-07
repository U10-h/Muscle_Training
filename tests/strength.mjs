import assert from 'node:assert/strict';
import {test} from 'node:test';
import {exerciseHistory,strengthSummary} from '../lib/strength.ts';
import {mealAdvice} from '../lib/nutrition.ts';

const set=(id,weight,reps,exercise='leg')=>({id,weight,reps,exercise});
const session=(id,date,sets,finished=true,hour=12)=>({id,date,sets,startedAt:Date.parse(`${date}T${hour}:00:00+09:00`),...(finished?{finishedAt:Date.parse(`${date}T${hour}:30:00+09:00`)}:{}),plan:['leg'],title:'test',note:''});
test('sort workouts; exclude unfinished, empty and unrelated exercises; preserve same-day workouts',()=>{
  const records=[session('later','2026-10-07',[set('a',30,10)],true,17),session('active','2026-10-07',[set('b',200,1)],false),session('early','2026-10-07',[set('c',20,12)]),session('old','2026-09-30',[set('d',15,15)]),session('empty','2026-10-01',[]),session('chest','2026-10-02',[set('e',100,20,'chest')])];
  const points=exerciseHistory(records,'leg');
  assert.deepEqual(points.map(p=>p.sessionId),['old','early','later']);
  assert.equal(strengthSummary(points).change,10);
  assert.equal(records[0].id,'later');
});
test('keep reps with the heaviest set; tie on weight chooses highest reps; volume sums every set',()=>{
  const points=exerciseHistory([session('a','2026-10-01',[set('one',20,10),set('two',20,12),set('three',10,20)])],'leg');
  assert.deepEqual([points[0].weight,points[0].reps,points[0].volume,points[0].setCount],[20,12,640,3]);
  assert.equal(strengthSummary(points).change,null);
});
test('best is not latest; decreases, zero weights, fractional loads and missing history are valid',()=>{
  const points=exerciseHistory([session('a','2026-10-01',[set('one',30,8)]),session('b','2026-10-02',[set('two',22.5,12)]),session('c','2026-10-03',[set('three',0,15)])],'leg');
  const summary=strengthSummary(points);
  assert.equal(summary.best.weight,30);assert.equal(summary.latest.weight,0);assert.equal(summary.change,-22.5);
  assert.equal(points[1].volume,270);assert.equal(summary.totalSets,3);
  assert.deepEqual(strengthSummary([]),{latest:undefined,previous:undefined,best:undefined,change:null,totalSets:0});
});
test('edits and deletions recompute best and comparison from the saved source records',()=>{
  const records=[session('a','2026-10-01',[set('one',20,12)]),session('b','2026-10-02',[set('two',40,12)])];
  assert.equal(strengthSummary(exerciseHistory(records,'leg')).best.weight,40);
  records[1].sets[0].weight=15;
  assert.equal(strengthSummary(exerciseHistory(records,'leg')).best.weight,20);
  assert.equal(strengthSummary(exerciseHistory(records,'leg')).change,-5);
  records[0].sets=[];
  assert.equal(strengthSummary(exerciseHistory(records,'leg')).best.weight,15);
  assert.equal(strengthSummary(exerciseHistory(records,'leg')).change,null);
});
test('meal check distinguishes unknown from absent and provides food-specific suggestions',()=>{
  const unknown=mealAdvice({staple:'unknown',main:'unknown',vegetable:'unknown'},false);
  assert.equal(unknown.length,1);assert.match(unknown[0],/未確認/);
  const missing=mealAdvice({staple:'yes',main:'no',vegetable:'no'},true);
  assert.equal(missing.length,3);assert.match(missing[0],/主菜/);assert.match(missing[1],/副菜/);assert.match(missing[2],/無糖/);
  const balanced=mealAdvice({staple:'yes',main:'yes',vegetable:'yes'},false);
  assert.equal(balanced.length,1);assert.match(balanced[0],/量も確認/);
});
