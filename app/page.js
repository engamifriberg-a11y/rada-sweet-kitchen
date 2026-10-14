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
const card={background:'#fff9fc',border:'1px solid #f3c4d8',borderRadius:20,padding:16,boxShadow:'0 4px 16px #b24b7920'};
return <main style={{minHeight:'100vh',background:'radial-gradient(circle at 15% 12%,#fff8fc,transparent 38%),linear-gradient(135deg,#ffd0e4,#fce9f3 58%,#f7b6d5)',fontFamily:'Arial,sans-serif',color:'#70334f',padding:'18px 12px'}}>
<section style={{maxWidth:1040,margin:'auto',background:'#ffffffdf',borderRadius:30,padding:'clamp(16px,4vw,38px)',boxShadow:'0 20px 70px #a8467730',border:'2px solid #fff'}}>
<header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center',fontSize:14,color:'#884766'}}>
<span>🗓️ {now?new Intl.DateTimeFormat('he-IL',{dateStyle:'full',timeStyle:'short',timeZone:'Asia/Jerusalem'}).format(now):'טוענת תאריך ושעה...'}</span>
<button onClick={getWeather} disabled={weatherBusy} style={{background:'#fff0f7',border:'1px solid #e9a3c4',padding:'9px 14px',borderRadius:24,color:'#9b2862',cursor:'pointer'}}>{weatherBusy?'בודקת מזג אוויר...':weather||'🌤️ תחזית מזג אוויר ל־5 ימים'}</button>
</header>
{forecast.length>0&&<section aria-label="תחזית מזג אוויר לחמישה ימים" style={{marginTop:14,padding:14,borderRadius:18,background:'#fff3f9',border:'1px solid #f1c7d8'}}>
 <h2 style={{fontSize:17,margin:'0 0 12px',color:'#a52d6a'}}>🌤️ תחזית מקומית לחמשת הימים הקרובים</h2>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(105px,1fr))',gap:8}}>
 {forecast.map(day=><div key={day.date} style={{background:'white',borderRadius:14,padding:'12px 8px',textAlign:'center',border:'1px solid #f2d4e2'}}>
 <div style={{fontSize:13,fontWeight:'bold'}}>{new Intl.DateTimeFormat('he-IL',{weekday:'short',day:'numeric',month:'numeric'}).format(new Date(day.date+'T12:00:00'))}</div>
 <div style={{fontSize:28,margin:'8px 0'}}>{day.icon}</div>
 <div><strong>{day.high}°</strong> / {day.low}°</div>
 <div style={{fontSize:12,marginTop:6}}>💧 {day.rain??0}%</div>
 </div>)}
 </div><p style={{fontSize:11,margin:'10px 0 0',color:'#95627c'}}>נתוני Open-Meteo לפי מיקום המכשיר, באישור המשתמש. אחוזי הגשם הם ההסתברות המרבית ליום.</p>
 </section>}
<div style={{textAlign:'center',fontSize:43,marginTop:16}}>🌸 🧁 🍰 🌷</div>
<h1 style={{textAlign:'center',fontSize:'clamp(30px,6vw,52px)',margin:'8px 0',color:'#b82d70'}}>Rada’s Sweet Kitchen</h1>
<p style={{textAlign:'center',fontSize:19,marginBottom:26}}>המטבח המתוק של רדה פרייברג · קונדיטוריה עם AI ✨</p>
<div style={{...card,background:'#fff0f7'}}>
<h2 style={{marginTop:0,color:'#a52d6a'}}>✨ תצרי לי מתכון</h2>
<form onSubmit={e=>{e.preventDefault();ask()}}>
<label htmlFor="recipe-query">מה תרצו להכין היום?</label>
<textarea id="recipe-query" value={query} onChange={e=>setQuery(e.target.value)} placeholder="למשל: עוגת גבינה אפויה ל-10 אנשים, ללא גלוטן..." maxLength={500} rows={3} style={{boxSizing:'border-box',width:'100%',padding:15,borderRadius:15,border:'2px solid #e9a3c4',fontSize:17,marginTop:10,fontFamily:'inherit'}}/>
<button disabled={loading||!query.trim()} style={{width:'100%',padding:15,marginTop:12,border:0,borderRadius:16,background:'#c6387c',color:'white',fontWeight:'bold',fontSize:19,cursor:'pointer',opacity:loading?.6:1}}>{loading?'מכינה את המתכון...':'✨ תצרי לי מתכון'}</button>
</form></div>
{error&&<p role="alert" style={{color:'#a10030',padding:12}}>{error}</p>}
{recipe&&<article style={{whiteSpace:'pre-wrap',lineHeight:1.9,background:'#fff4f9',padding:22,borderRadius:18,marginTop:24}}><h2>המתכון שלך 🍓</h2>{recipe}<p><a href={'https://www.youtube.com/results?search_query='+encodeURIComponent(selected+' מתכון הכנה')} target="_blank" rel="noopener noreferrer">🎥 חיפוש סרטון הדרכה ביוטיוב</a></p><button onClick={()=>navigator.clipboard.writeText(recipe)} style={{padding:10,borderRadius:12}}>📋 העתקת המתכון</button></article>}
<section style={{marginTop:35}}>
<h2 style={{textAlign:'center',color:'#a52d6a'}}>👩‍🍳 קולקציית הקונדיטורית</h2>
<p style={{textAlign:'center',color:'#87526a'}}>12 קלאסיקות פטיסרי שנבחרו לרפרטואר מקצועי. לחיצה תיצור מתכון מפורט בעזרת AI.</p>
<div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:20}}>{categories.map(c=><button key={c} onClick={()=>setCategory(c)} style={{padding:'10px 16px',borderRadius:24,border:'1px solid #d987b1',background:category===c?'#bd3478':'white',color:category===c?'white':'#9c316a',cursor:'pointer'}}>{c}</button>)}</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>{catalog.filter(c=>category==='הכול'||c.category===category).map(c=><button key={c.title} disabled={loading} onClick={()=>{ask(c.prompt);window.scrollTo({top:0,behavior:'smooth'})}} style={{...card,textAlign:'right',cursor:'pointer',color:'#70334f',fontFamily:'inherit'}}><div style={{fontSize:37}}>{c.emoji}</div><strong style={{fontSize:18}}>{c.title}</strong><p style={{fontSize:13,color:'#9b6380'}}>{c.detail}</p><span style={{color:'#ba3477',fontWeight:'bold'}}>הכיני מתכון ←</span></button>)}</div>
</section>
<footer style={{textAlign:'center',marginTop:45,fontSize:13,borderTop:'1px solid #f1c7d8',paddingTop:18}}>© 2026 כל הזכויות שמורות לרדה פרייברג</footer>
</section></main>}
