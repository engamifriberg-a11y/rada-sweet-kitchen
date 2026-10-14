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
  let geminiStatus='not_configured';
  const geminiKey=process.env.GEMINI_API_KEY;
  if(geminiKey){
   try{
    const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
    let response;
    try{
     response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':geminiKey},
      body:JSON.stringify({systemInstruction:{parts:[{text:'את קונדיטורית מקצועית. השיבי אך ורק בעברית תקנית וברורה. תני מתכון מקצועי עם שם, תפוקה, זמני הכנה, מרכיבים בכמויות מדויקות, הוראות ממוספרות, טמפרטורות, אלרגנים וטיפים. אל תציגי מידע שלא נבדק כעובדה.'}]},contents:[{role:'user',parts:[{text:query}]}],generationConfig:{maxOutputTokens:1800}}),
      signal:controller.signal
     });
    }finally{clearTimeout(timeout)}
    if(response.ok){
     const data=await response.json();
     const recipe=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
     if(recipe && /[א-ת]/.test(recipe))return Response.json({recipe,source:'Gemini'});
     geminiStatus='empty_or_not_hebrew';
    }else{geminiStatus=response.status===400?'invalid_request':response.status===401||response.status===403?'invalid_key_or_permissions':response.status===429?'rate_limit':'provider_error_'+response.status;console.error('Gemini request failed',response.status)}
   }catch(e){geminiStatus=e?.name==='AbortError'?'timeout':'network_error';console.error('Gemini unavailable',e?.name||'error')}
  }
  const key=process.env.OPENAI_API_KEY;
  if(key){
   try{
    const client=new OpenAI({apiKey:key});
    const result=await client.responses.create({model:'gpt-4.1-mini',instructions:'את קונדיטורית מקצועית. כתבי בעברית מתכון מפורט, כמויות מדויקות, זמני הכנה ואפייה, שלבים וטיפים. צייני אלרגנים.',input:query,max_output_tokens:1500});
    if(result.output_text && /[א-ת]/.test(result.output_text))return Response.json({recipe:result.output_text,source:'AI'});
   }catch(e){console.error('AI provider unavailable',e?.status||'error')}
  }
  return Response.json({error:geminiStatus==='not_configured'?'חיבור Gemini לא הוגדר ב־Vercel. יש להגדיר GEMINI_API_KEY ולבצע פריסה מחדש.':geminiStatus==='invalid_key_or_permissions'?'מפתח Gemini אינו תקין או שאין הרשאה להשתמש בו. יש ליצור מפתח חדש ולהגדירו ב־Vercel.':geminiStatus==='rate_limit'?'הגעת למגבלת השימוש החינמית של Gemini. יש להמתין ולנסות שוב.':geminiStatus==='timeout'?'שירות Gemini לא השיב בזמן. נסו שוב.':'לא ניתן ליצור כרגע מתכון בעברית. יש לבדוק את הגדרות Gemini ב־Vercel.',code:geminiStatus},{status:503});
 }catch{return Response.json({error:'שגיאה בבקשת המתכון'},{status:500})}
}
