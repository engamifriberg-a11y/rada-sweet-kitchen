import OpenAI from 'openai';
const known=[
 [/קרואסון|croissant/i,'croissant'],[/מקרון|macaron/i,'macaron'],[/עוגת גבינה|cheesecake/i,'cheesecake'],[/שוקולד|chocolate/i,'chocolate'],[/לימון|lemon/i,'lemon'],[/תפוח|apple/i,'apple'],[/פנקייק|pancake/i,'pancake'],[/בראוני|brownie/i,'brownie'],[/טארט|tart/i,'tart'],[/עוגה|cake/i,'cake'],[/פודינג|pudding/i,'pudding'],[/וניל|vanilla/i,'vanilla'],[/פחזניות|profiterole/i,'profiteroles'],[/בריוש|brioche/i,'brioche'],[/פטל|raspberry/i,'raspberry'],[/פיסטוק|pistachio/i,'pistachio'],[/מילפיי|mille/i,'mille feuille'],[/אקלר|eclair/i,'eclair'],[/מוס|mousse/i,'mousse']
];
async function freeRecipe(query){
 const words=known.filter(([regex])=>regex.test(query)).map(([,value])=>value);
 const searchTerms=[...new Set([words.join(' '),...words,'cake'])].filter(Boolean).slice(0,5);
 for(const term of searchTerms){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6000);
  try{
   const res=await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+encodeURIComponent(term),{signal:controller.signal,cache:'no-store'});
   if(!res.ok)continue;const data=await res.json();
   const desserts=(data.meals||[]).filter(m=>m.strCategory==='Dessert');
   const meal=desserts.find(m=>words.some(w=>m.strMeal.toLowerCase().includes(w)))||desserts[0];
   if(!meal)continue;
   const ingredients=Array.from({length:20},(_,i)=>{const n=i+1;const item=meal['strIngredient'+n]?.trim();const amount=meal['strMeasure'+n]?.trim();return item?'• '+(amount||'')+' '+item:null}).filter(Boolean).join('\n');
   return {recipe:'🍰 '+meal.strMeal+'\n\nמרכיבים (כפי שמופיעים במקור):\n'+ingredients+'\n\nהוראות הכנה (באנגלית, כפי שמופיעות במקור):\n'+(meal.strInstructions||'לא זמינות הוראות')+'\n\nמקור: TheMealDB\n'+(meal.strSource||'https://www.themealdb.com/'),source:'TheMealDB',video:meal.strYoutube||null,image:meal.strMealThumb||null};
  }catch{}finally{clearTimeout(timeout)}
 }
 return null;
}
export async function POST(request){
 try{
  const body=await request.json();const query=String(body.query||'').trim();
  if(!query||query.length>500)return Response.json({error:'יש להזין בקשת מתכון עד 500 תווים'},{status:400});
  const key=process.env.OPENAI_API_KEY;
  if(key){
   try{
    const client=new OpenAI({apiKey:key});
    const result=await client.responses.create({model:'gpt-4.1-mini',instructions:'את קונדיטורית מקצועית. כתבי בעברית מתכון מפורט, כמויות מדויקות, זמני הכנה ואפייה, שלבים וטיפים. צייני אלרגנים.',input:query,max_output_tokens:1500});
    if(result.output_text)return Response.json({recipe:result.output_text,source:'AI'});
   }catch(e){console.error('AI provider unavailable',e?.status||'error')}
  }
  const free=await freeRecipe(query);
  if(free)return Response.json(free);
  return Response.json({error:'לא נמצא מתכון מתאים במאגר החינמי. נסו שם קינוח אחר כגון עוגת שוקולד, עוגת גבינה או טארט לימון. ליצירת מתכון מותאם אישית נדרש חיבור AI.'},{status:404});
 }catch{return Response.json({error:'שגיאה בבקשת המתכון'},{status:500})}
}
