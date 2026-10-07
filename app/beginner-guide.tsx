'use client';
import {ExternalLink} from 'lucide-react';
import {exerciseOf,type ExerciseId} from '@/lib/training';

export function BeginnerGuide({exercise}:{exercise?:ExerciseId}) {
  return <details className="beginner-guide">
    <summary>初めてなら、どの重さから？ <span>目安を見る</span></summary>
    <div className="guide-detail">
      <p><strong>まずは軽い設定で、動きを確認。</strong>同じkg表示でもマシンによって負荷が違うため、一律の開始重量は決めていません。</p>
      {exercise&&<p className="exercise-start-tip">{exerciseOf(exercise).tip}</p>}
      <ol className="numbered-guide">
        <li><strong>設定を合わせる</strong><p>座席と動かせる範囲をスタッフに確認。軽い負荷でゆっくり試します。</p></li>
        <li><strong>12〜15回を目安に、まず1セット</strong><p>最初は動作の練習を優先。途中で姿勢が崩れるなら軽くし、回数を無理に埋めなくて大丈夫です。</p></li>
        <li><strong>慣れたら、少しずつ</strong><p>丁寧に15回できるようになったら、マシンの最小刻みで重さを調整。重すぎたら戻しましょう。</p></li>
      </ol>
      <p className="guide-caution">痛みが出たら中止。最高重量の更新を急がず、同じマシン・設定・動作で比べましょう。</p>
      <a className="source-link" href="https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/weight-training/art-20045842" target="_blank" rel="noreferrer">参考：Mayo Clinic「ウエイトトレーニングの基本」<ExternalLink size={14}/></a>
    </div>
  </details>;
}
