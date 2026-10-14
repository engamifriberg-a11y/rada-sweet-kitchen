export const metadata={title:'Rada’s Sweet Kitchen',description:'המטבח המתוק של רדה פרייברג',manifest:'/manifest.webmanifest',icons:{icon:'/cake-icon.svg',apple:'/cake-icon.svg'},appleWebApp:{capable:true,title:'Rada Kitchen',statusBarStyle:'default'}};
export const viewport={themeColor:'#c6387c',width:'device-width',initialScale:1};
export default function RootLayout({children}){return <html lang="he" dir="rtl"><body style={{margin:0}}>{children}</body></html>}
