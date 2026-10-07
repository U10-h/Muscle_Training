import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const u=await getChatGPTUser();if(!u)return Response.json({error:'サインインが必要です。'},{status:401});
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return Response.json({error:'リクエストを確認できませんでした。'},{status:403});
 const mime=(req.headers.get('content-type')||'').split(';')[0];if(!['video/mp4','video/webm','video/quicktime'].includes(mime))return Response.json({error:'MP4・WebM・MOVの動画を選んでください。'},{status:400});
 const length=Number(req.headers.get('content-length')||0);if(length>40*1024*1024)return Response.json({error:'動画は40MB以下にしてください。'},{status:413});
 if(!req.body||length<=0)return Response.json({error:'動画が空か、サイズを確認できません。動画を選び直してください。'},{status:400});
 const id=crypto.randomUUID();if(!env.BUCKET)throw new Error('動画保存に接続できません。');await env.BUCKET.put(u.userId+'/'+id,req.body,{httpMetadata:{contentType:mime}});return Response.json({id});
 }catch(e){console.error(e);return Response.json({error:'動画を保存できませんでした。再試行してください。'},{status:503});}}
export async function GET(req:Request){try{
 const u=await getChatGPTUser();if(!u)return new Response('Unauthorized',{status:401});const id=new URL(req.url).searchParams.get('id');if(!id||!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 const object=await env.BUCKET?.get(u.userId+'/'+id,{range:req.headers});if(!object)return new Response('Not found',{status:404});const headers=new Headers({'Cache-Control':'private, no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'});object.writeHttpMetadata(headers);headers.set('ETag',object.httpEtag);
 let status=200;if(req.headers.has('range')&&object.range&&'offset' in object.range&&'length' in object.range){const {offset,length}=object.range;if(offset!==undefined&&length!==undefined){headers.set('Content-Range',`bytes ${offset}-${offset+length-1}/${object.size}`);headers.set('Content-Length',String(length));status=206;}}else headers.set('Content-Length',String(object.size));
 return new Response(object.body,{headers,status});
 }catch(e){console.error(e);return new Response('Video unavailable',{status:503});}}
