'use client';
import {useState} from 'react';
export default function Home(){
 const [q,setQ]=useState('');const [recipe,setRecipe]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 async function ask(e){e.preventDefault();if(!q.trim())return;setLoading(true);setError('');setRecipe('');try{const r=await fetch('/api/recipe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});const d=await r.json();if(!r.ok)throw Error(d.error||'שגיאה');setRecipe(d.recipe)}catch(e){setError(e.message)}finally{setLoading(false)}}
 return <main style={{minHeight:'100vh',background:'radial-gradient(circle at 15% 10%,#fff8fc,transparent 40%),linear-gradient(135deg,#ffd4e7,#fce7f3 55%,#f9b9d5)',fontFamily:'Arial,sans-serif',color:'#70334f',padding:'30px 16px'}}>
 <section style={{maxWidth:780,margin:'auto',background:'#ffffffdc',borderRadius:28,padding:'32px 22px',boxShadow:'0 20px 70px #a8467730',border:'2px solid #fff'}}>
 <div style={{textAlign:'center',fontSize:42}}>🧁 🌸 🍰</div><h1 style={{textAlign:'center',fontSize:'clamp(30px,7vw,52px)',margin:'12px 0',color:'#b82d70'}}>Rada’s Sweet Kitchen</h1>
 <p style={{textAlign:'center',fontSize:20}}>המטבח המתוק של רדה פרייברג</p><p style={{textAlign:'center'}}>הקונדיטורית החכמה שלך ✨</p>
 <form onSubmit={ask}><label htmlFor="q">מה תרצו להכין היום?</label><textarea id="q" value={q} onChange={e=>setQ(e.target.value)} placeholder="למשל: עוגת גבינה אפויה ל-10 אנשים, בלי גלוטן..." maxLength={500} rows={3} style={{boxSizing:'border-box',width:'100%',padding:16,borderRadius:15,border:'2px solid #e9a3c4',fontSize:17,marginTop:10}}/><button disabled={loading||!q.trim()} style={{width:'100%',padding:16,marginTop:12,border:0,borderRadius:16,background:'#c6387c',color:'white',fontWeight:'bold',fontSize:19,cursor:'pointer'}}>{loading?'מכינה את המתכון...':'✨ צרי לי מתכון'}</button></form>
 {error&&<p role="alert" style={{color:'#a10030'}}>{error}</p>}
 {recipe&&<article style={{whiteSpace:'pre-wrap',lineHeight:1.9,background:'#fff4f9',padding:20,borderRadius:18,marginTop:24}}><h2>המתכון שלך 🍓</h2>{recipe}<p><a href={'https://www.youtube.com/results?search_query='+encodeURIComponent(q+' מתכון הכנה')} target="_blank" rel="noopener noreferrer">🎥 מצאי סרטון הדרכה ביוטיוב</a></p><button onClick={()=>navigator.clipboard.writeText(recipe)}>העתקת המתכון</button></article>}
 <footer style={{textAlign:'center',marginTop:42,fontSize:13}}>© 2026 כל הזכויות שמורות לרדה פרייברג</footer></section></main>
}