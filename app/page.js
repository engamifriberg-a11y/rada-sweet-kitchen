'use client';
import {useEffect,useState} from 'react';
const catalog=[
{title:'קרואסון חמאה צרפתי',emoji:'🥐',category:'מאפי שמרים',detail:'בצק כרוך • טכניקה מתקדמת',prompt:'קרואסון חמאה צרפתי מקצועי עם קיפולים והתפחה מבוקרת'},
{title:'מקרון פטל',emoji:'💗',category:'פטיסרי',detail:'מרנג איטלקי • גנאש פטל',prompt:'מקרון פטל מקצועי בשיטת המרנג האיטלקי'},
{title:'עוגת גבינה באסקית',emoji:'🍰',category:'עוגות',detail:'מרקם קרמי • אפייה מדויקת',prompt:'עוגת גבינה באסקית מקצועית עם מרקם קרמי'},
{title:'טארט לימון ומרנג',emoji:'🍋',category:'טארטים',detail:'בצק פריך • קרם לימון',prompt:'טארט לימון עם מרנג איטלקי ברמת פטיסרי'},
{title:'אקלר שוקולד',emoji:'🍫',category:'פטיסרי',detail:'בצק רבוך • קרם פטיסייר',prompt:'אקלר שוקולד מקצועי עם בצק רבוך וקרם פטיסייר'},
{title:'פחזניות קראקלן',emoji:'🧁',category:'פטיסרי',detail:'מעטפת פריכה • מילוי וניל',prompt:'פחזניות קראקלן מקצועיות במילוי קרם דיפלומט וניל'},
{title:'מילפיי וניל',emoji:'🌸',category:'פטיסרי',detail:'בצק עלים • קרם דיפלומט',prompt:'מילפיי וניל קלאסי ברמת קונדיטוריה גבוהה'},
{title:'עוגת מוס שוקולד',emoji:'🎂',category:'עוגות',detail:'שכבות • גלסאז מראה',prompt:'עוגת מוס שוקולד שכבות מקצועית עם גלסאז מראה'},
{title:'בריוש חמאה',emoji:'🧈',category:'מאפי שמרים',detail:'לישה • התפחה קרה',prompt:'בריוש חמאה צרפתי מקצועי עם התפחה קרה'},
{title:'טארט פיסטוק ופטל',emoji:'🍓',category:'טארטים',detail:'קרם פיסטוק • פטל טרי',prompt:'טארט פיסטוק ופטל מקצועי עם פרנג׳יפאן וקרם פיסטוק'},
{title:'פריז ברסט',emoji:'🥮',category:'פטיסרי',detail:'בצק רבוך • פרלינה אגוזים',prompt:'פריז ברסט צרפתי מקצועי עם קרם מוסלין פרלינה'},
{title:'עוגת אופרה',emoji:'☕',category:'עוגות',detail:'ג׳וקונד • קפה ושוקולד',prompt:'עוגת אופרה צרפתית מקצועית בשכבות מדויקות'}];
const categories=['הכול','פטיסרי','עוגות','טארטים','מאפי שמרים'];
export default function Home(){
const [forecast,setForecast]=useState([]);const [query,setQuery]=useState(''),[recipe,setRecipe]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[category,setCategory]=useState('הכול'),[now,setNow]=useState(null),[weather,setWeather]=useState(''),[weatherBusy,setWeatherBusy]=useState(false),[selected,setSelected]=useState('');
useEffect(()=>{setNow(new Date());const id=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id)},[]);
async function ask(text){const q=(text||query).trim();if(!q)return;setQuery(q);setSelected(q);setLoading(true);setError('');setRecipe('');try{const res=await fetch('/api/recipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});const data=await res.json();if(!res.ok)throw new Error(data.error||'לא ניתן לקבל מתכון כרגע');setRecipe(data.recipe||'לא התקבל מתכון')}catch(e){setError(e.message)}finally{setLoading(false)}}
function weatherIcon(code){return code===0?'☀️':code<=3?'⛅':code<=48?'🌫️':code<=67?'🌧️':code<=77?'🌨️':code<=82?'🌦️':code<=86?'❄️':'⛈️'}
function getWeather(){
 if(!navigator.geolocation){setWeather('מיקום אינו זמין בדפדפן');return}
 setWeatherBusy(true);setWeather('');setForecast([]);
 navigator.geolocation.getCurrentPosition(async p=>{
  try{
   const {latitude,longitude}=p.coords;
   const url='https://api.open-meteo.com/v1/forecast?latitude='+latitude+'&longitude='+longitude+'&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto';
   const r=await fetch(url);if(!r.ok)throw Error('weather');const d=await r.json();
   setWeather(weatherIcon(d.current.weather_code)+' '+Math.round(d.current.temperature_2m)+'°C כעת');
   setForecast(d.daily.time.map((date,i)=>({date,icon:weatherIcon(d.daily.weather_code[i]),high:Math.round(d.daily.temperature_2m_max[i]),low:Math.round(d.daily.temperature_2m_min[i]),rain:d.daily.precipitation_probability_max[i]})));
  }catch{setWeather('לא ניתן לקבל תחזית')}finally{setWeatherBusy(false)}
 },()=>{setWeather('נדרשת הרשאת מיקום');setWeatherBusy(false)},{timeout:10000,maximumAge:600000})
}
const card={background:'linear-gradient(160deg,#fff,#fff4f9)',border:'1px solid #f3d1df',borderRadius:22,padding:18,boxShadow:'0 8px 24px #b24b7917',transition:'transform .2s, box-shadow .2s'};
return <main style={{minHeight:'100vh',background:'radial-gradient(ellipse at 10% 0%,#fff9eb 0%,transparent 42%),radial-gradient(ellipse at 95% 75%,#ffd5e8 0%,transparent 45%),linear-gradient(140deg,#fff0f6,#fbe0ed 58%,#fff4ed)',fontFamily:'Arial,sans-serif',color:'#70334f',padding:'18px 12px'}}>
<section style={{maxWidth:1040,margin:'auto',background:'#ffffffed',borderRadius:32,padding:'clamp(16px,4vw,38px)',boxShadow:'0 22px 70px #a8467722',border:'1px solid #fff'}}>
<header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center',fontSize:14,color:'#884766'}}>
<span>🗓️ {now?new Intl.DateTimeFormat('he-IL',{dateStyle:'full',timeStyle:'short',timeZone:'Asia/Jerusalem'}).format(now):'טוענת תאריך ושעה...'}</span>
<button onClick={getWeather} disabled={weatherBusy} style={{background:'linear-gradient(145deg,#fff6fa,#ffe8f2)',border:'1px solid #e9a3c4',padding:'9px 14px',borderRadius:24,color:'#9b2862',cursor:'pointer'}}>{weatherBusy?'בודקת מזג אוויר...':weather||'🌤️ תחזית מזג אוויר ל־5 ימים'}</button>
</header>
{forecast.length>0&&<section aria-label="תחזית מזג אוויר לחמישה ימים" style={{marginTop:12,padding:'12px 10px',borderRadius:20,background:'linear-gradient(110deg,#fff8fb,#fff1f6)',border:'1px solid #f5d8e4'}}>
 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginBottom:10,flexWrap:'wrap'}}>
 <strong style={{fontSize:13,color:'#9b3768'}}>🌤️ מזג האוויר בחמשת הימים הקרובים</strong><span style={{fontSize:11,color:'#9b6b83'}}>לפי מיקום המכשיר</span>
 </div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:5,width:'100%'}}>
 {forecast.map(day=><div key={day.date} style={{minWidth:0,background:'white',borderRadius:14,padding:'9px 2px',textAlign:'center',border:'1px solid #f6e0ea',boxShadow:'0 3px 9px #bc6d9210'}}>
 <div style={{fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{new Intl.DateTimeFormat('he-IL',{weekday:'short'}).format(new Date(day.date+'T12:00:00'))}</div>
 <div style={{fontSize:'clamp(20px,5vw,28px)',lineHeight:1.6,filter:'drop-shadow(0 2px 2px #00000012)'}}>{day.icon}</div>
 <div style={{fontSize:12,whiteSpace:'nowrap'}}><strong>{day.high}°</strong><span style={{color:'#ac8498'}}> {day.low}°</span></div>
 <div style={{fontSize:10,color:'#638da9',marginTop:4}}>💧{day.rain??0}%</div>
 </div>)}
 </div>
 <p style={{fontSize:10,margin:'9px 0 0',color:'#98778a'}}>תחזית Open-Meteo · אחוזי הגשם הם ההסתברות המרבית ליום</p>
 </section>}
<div style={{textAlign:'center',fontSize:53,marginTop:22,filter:'drop-shadow(0 5px 7px #eaa4bd)'}}>🍰</div><div style={{textAlign:'center',fontSize:12,letterSpacing:3,color:'#bd6592',fontWeight:700,marginTop:8}}>MADE WITH LOVE & BUTTER</div>
<h1 style={{textAlign:'center',fontSize:'clamp(30px,6vw,52px)',margin:'10px 0',color:'#ad2869',letterSpacing:'-.6px',textShadow:'0 3px 16px #f3bdd4'}}>Rada’s Sweet Kitchen</h1>
<p style={{textAlign:'center',fontSize:19,marginBottom:26}}>המטבח המתוק של רדה פרייברג · קונדיטוריה עם AI ✨</p>
<div style={{...card,background:'#fff0f7'}}>
<h2 style={{marginTop:0,color:'#a52d6a'}}>✨ תצרי לי מתכון</h2>
<form onSubmit={e=>{e.preventDefault();ask()}}>
<label htmlFor="recipe-query">מה תרצו להכין היום?</label>
<textarea id="recipe-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="למשל: עוגת גבינה אפויה ל-10 אנשים, ללא גלוטן..." maxLength={500} rows={3} style={{boxSizing:'border-box',width:'100%',padding:15,borderRadius:15,border:'2px solid #e9a3c4',fontSize:17,marginTop:10,fontFamily:'inherit'}}/>
<button disabled={loading||!query.trim()} style={{width:'100%',padding:15,marginTop:12,border:0,borderRadius:16,background:'linear-gradient(110deg,#c83278,#e15b95)',boxShadow:'0 8px 18px #cb498143',color:'white',fontWeight:'bold',fontSize:19,cursor:'pointer',opacity:loading?.6:1}}>{loading?'מכינה את המתכון...':'✨ תצרי לי מתכון'}</button>
</form></div>
{error&&<p role="alert" style={{color:'#a10030',padding:12}}>{error}</p>}
{recipe&&<article style={{whiteSpace:'pre-wrap',lineHeight:1.9,background:'#fff4f9',padding:22,borderRadius:18,marginTop:24}}><h2>המתכון שלך 🍓</h2>{recipe}<p><a href={'https://www.youtube.com/results?search_query='+encodeURIComponent(selected+' מתכון הכנה')} target="_blank" rel="noopener noreferrer">🎥 חיפוש סרטון הדרכה ביוטיוב</a></p><button onClick={()=>navigator.clipboard.writeText(recipe)} style={{padding:10,borderRadius:12}}>📋 העתקת המתכון</button></article>}
<section style={{marginTop:35}}>
<h2 style={{textAlign:'center',color:'#a52d6a'}}>👩‍🍳 קולקציית הקונדיטורית</h2>
<p style={{textAlign:'center',color:'#87526a'}}>12 קלאסיקות פטיסרי שנבחרו לרפרטואר מקצועי. לחיצה תפתח בקשה למתכון מפורט, בהתאם לשירות המתכונים הזמין.</p>
<div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:20}}>{categories.map(c=><button key={c} onClick={()=>setCategory(c)} style={{padding:'10px 16px',borderRadius:24,border:'1px solid #d987b1',background:category===c?'#bd3478':'white',color:category===c?'white':'#9c316a',cursor:'pointer'}}>{c}</button>)}</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>{catalog.filter(c=>category==='הכול'||c.category===category).map(c=><button key={c.title} disabled={loading} onClick={()=>{ask(c.prompt);window.scrollTo({top:0,behavior:'smooth'})}} style={{...card,textAlign:'right',cursor:'pointer',color:'#70334f',fontFamily:'inherit',minHeight:156}}><div style={{fontSize:37}}>{c.emoji}</div><strong style={{fontSize:18}}>{c.title}</strong><p style={{fontSize:13,color:'#9b6380'}}>{c.detail}</p><span style={{color:'#ba3477',fontWeight:'bold'}}>הכיני מתכון ←</span></button>)}</div>
</section>
<footer style={{textAlign:'center',marginTop:45,fontSize:13,borderTop:'1px solid #f1c7d8',paddingTop:18}}>© 2026 כל הזכויות שמורות לרדה פרייברג</footer>
</section></main>}
