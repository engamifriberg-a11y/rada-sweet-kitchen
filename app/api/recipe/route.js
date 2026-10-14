import OpenAI from 'openai';
export async function POST(request) {
 const key=process.env.OPENAI_API_KEY;
 if(!key) return Response.json({error:'מפתח AI לא הוגדר בשרת'},{status:503});
 try {
  const body=await request.json();
  const query=String(body.query||'').trim().slice(0,500);
  if(!query) return Response.json({error:'חסרה בקשת מתכון'},{status:400});
  const client=new OpenAI({apiKey:key});
  const answer=await client.responses.create({model:'gpt-4.1-mini',instructions:'את קונדיטורית מומחית. כתבי בעברית מתכון מפורט, כמויות בגרמים, הוראות מדויקות, זמני אפייה, אלרגנים וטיפים.',input:query,max_output_tokens:1500});
  return Response.json({recipe:answer.output_text});
 } catch(err) {
  return Response.json({error:'שירות AI אינו זמין כעת'},{status:500});
 }
}