import {getChatGPTUser} from '@/app/chatgpt-auth';
import {actionSchema,readState,mutateState} from '@/lib/state-server';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){try{const u=await getChatGPTUser();if(!u)return json({error:'サインインが必要です。'},401);return json({state:(await readState(u.userId)).state});}catch(e){console.error(e);return json({error:'記録を読み込めませんでした。再試行してください。'},503);}}
export async function POST(req:Request){try{
 const u=await getChatGPTUser();if(!u)return json({error:'サインインが必要です。'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'リクエストを確認できませんでした。'},403);
 if(Number(req.headers.get('content-length')||0)>20000)return json({error:'入力が大きすぎます。'},413);
 const a=actionSchema.safeParse(await req.json());if(!a.success)return json({error:'入力内容を確認してください。'},400);
 if(a.data.type==='review'&&a.data.videoId){if(!/^[a-f0-9-]{36}$/.test(a.data.videoId)||!await env.BUCKET?.head(u.userId+'/'+a.data.videoId))return json({error:'動画が見つかりません。もう一度選択してください。'},400);}
 return json({state:await mutateState(u.userId,a.data)});
 }catch(e){console.error(e);return json({error:e instanceof Error?e.message:'保存できませんでした。再試行してください。'},400);}}
