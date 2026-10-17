'use client';

/**
 * איורים וקטוריים מקוריים — חתך של התוצאה הסופית.
 * כל איור מראה את סדר השכבות האמיתי של המתכון, לא תמונת נוי.
 */

const VB = '0 0 400 250';

const C = {
  sponge: '#E8C184',
  spongeDark: '#D9A85F',
  choc: '#4A2C20',
  chocMid: '#6B3F2C',
  cream: '#FBF1DC',
  creamShade: '#EFDFC0',
  butter: '#F6E2A8',
  lemon: '#F2C33C',
  lemonLight: '#F8DC72',
  berry: '#B5365C',
  caramel: '#C47A2C',
  caramelDark: '#9A5A18',
  glazeRed: '#8E2545',
  white: '#FFFDF8',
  nut: '#C9A063',
  pistachio: '#8FA84E',
  carrot: '#D4762B',
  velvet: '#A32638',
  crust: '#B8793C',
  crustDark: '#8A5425',
  burnt: '#6E3A1C',
  plate: '#E3D8EC',
  line: '#4A3A5E',
};

function Defs() {
  return (
    <defs>
      <linearGradient id="pa-sheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
        <stop offset="45%" stopColor="#fff" stopOpacity=".05" />
        <stop offset="100%" stopColor="#000" stopOpacity=".08" />
      </linearGradient>
      <linearGradient id="pa-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity=".7" />
        <stop offset="40%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="pa-vign" cx="50%" cy="38%" r="70%">
        <stop offset="0%" stopColor="#fff" stopOpacity=".9" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <pattern id="pa-crumb" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.1" fill="#000" opacity=".09" />
        <circle cx="6.5" cy="6" r="1.5" fill="#000" opacity=".07" />
        <circle cx="7" cy="1.6" r=".8" fill="#fff" opacity=".4" />
      </pattern>
      <pattern id="pa-crumb-dark" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2.4" cy="2.4" r="1.3" fill="#000" opacity=".22" />
        <circle cx="6.6" cy="6.4" r="1.6" fill="#000" opacity=".16" />
        <circle cx="7" cy="2" r=".9" fill="#fff" opacity=".13" />
      </pattern>
      <filter id="pa-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
  );
}

function Plate({ w = 300, y = 214 }) {
  return (
    <g>
      <ellipse cx="200" cy={y + 4} rx={w / 2} ry="12" fill="#000" opacity=".10" filter="url(#pa-soft)" />
      <ellipse cx="200" cy={y} rx={w / 2} ry="10" fill={C.plate} />
      <ellipse cx="200" cy={y - 1.5} rx={w / 2 - 8} ry="7" fill="#F2EAF8" />
    </g>
  );
}

/** חתך עוגה — שכבות מלמטה למעלה */
function Slice({ layers, top = null, x = 110, w = 180, baseY = 208, dust = false }) {
  let y = baseY;
  const parts = [];
  layers.forEach((l, i) => {
    y -= l.h;
    parts.push(
      <g key={i}>
        <rect x={x} y={y} width={w} height={l.h} fill={l.c} rx={l.r ?? 0} />
        {l.tex && <rect x={x} y={y} width={w} height={l.h} fill={`url(#${l.tex})`} rx={l.r ?? 0} />}
        <rect x={x} y={y} width={w} height={Math.min(2.5, l.h / 3)} fill="#fff" opacity=".18" />
      </g>
    );
  });
  const totalTop = y;
  return (
    <g>
      {parts}
      {top && top(totalTop, x, w)}
      <rect x={x} y={totalTop} width={w} height={baseY - totalTop} fill="url(#pa-sheen)" opacity=".5" />
      {dust && (
        <g opacity=".5">
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={x + 8 + ((i * 97) % (w - 16))} cy={totalTop - 3 - ((i * 37) % 7)} r="1.2" fill="#fff" />
          ))}
        </g>
      )}
    </g>
  );
}

function Bowl({ fill, tex, swirl = true, label }) {
  return (
    <g>
      <ellipse cx="200" cy="200" rx="128" ry="22" fill="#000" opacity=".08" filter="url(#pa-soft)" />
      <path d="M78 118 Q78 196 200 196 Q322 196 322 118 Z" fill="#E7DCF0" />
      <path d="M84 120 Q84 189 200 189 Q316 189 316 120 Z" fill="#F7F1FB" />
      <ellipse cx="200" cy="118" rx="122" ry="26" fill={fill} />
      {tex && <ellipse cx="200" cy="118" rx="122" ry="26" fill={`url(#${tex})`} />}
      <ellipse cx="200" cy="114" rx="122" ry="26" fill="url(#pa-glass)" opacity=".5" />
      {swirl && (
        <path
          d="M140 118 Q175 100 206 116 Q238 132 268 112"
          fill="none"
          stroke="#fff"
          strokeOpacity=".45"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {label}
    </g>
  );
}

function Pipe({ x, y, c, n = 5, rx = 17, ry = 15 }) {
  return (
    <g>
      {[...Array(n)].map((_, i) => (
        <ellipse key={i} cx={x + i * (rx * 1.9)} cy={y} rx={rx} ry={ry} fill={c} />
      ))}
      {[...Array(n)].map((_, i) => (
        <ellipse key={'h' + i} cx={x + i * (rx * 1.9) - 4} cy={y - 4} rx={rx * 0.45} ry={ry * 0.4} fill="#fff" opacity=".35" />
      ))}
    </g>
  );
}

/** כלי אפייה רדוד עם קרם — ברולה, פלאן, קרמה קטלנה */
function Ramekin({ fill, top, topColor, wide = false }) {
  const rx = wide ? 118 : 96;
  return (
    <g>
      <ellipse cx="200" cy="206" rx={rx + 14} ry="14" fill="#000" opacity=".08" filter="url(#pa-soft)" />
      <path d={`M${200 - rx} 142 h${rx * 2} l-10 54 q-2 10 -14 10 h-${rx * 2 - 48} q-12 0 -14 -10 Z`} fill="#F0E8F3" />
      <path d={`M${200 - rx + 8} 148 h${rx * 2 - 16} l-9 44 q-2 8 -12 8 h-${rx * 2 - 54} q-10 0 -12 -8 Z`} fill="#FBF7FC" />
      <ellipse cx="200" cy="142" rx={rx} ry="22" fill={fill} />
      {topColor && <ellipse cx="200" cy="140" rx={rx - 4} ry="19" fill={topColor} />}
      <ellipse cx="200" cy="138" rx={rx} ry="22" fill="url(#pa-glass)" opacity=".5" />
      {top}
    </g>
  );
}

/** טארט פתוח עגול בחתך */
function TartShell({ fill, crust = C.crust, top = null, h = 30 }) {
  const y = 176 - h;
  return (
    <g>
      <Plate w={300} />
      <path d="M84 204 Q78 152 100 144 L300 144 Q322 152 316 204 Z" fill={crust} />
      <path d="M92 198 Q88 156 106 150 L294 150 Q312 156 308 198 Z" fill="#CE9254" />
      <rect x="100" y={y} width="200" height={176 - y} fill={fill} />
      <rect x="100" y={y} width="200" height="6" fill="#fff" opacity=".25" />
      {top}
    </g>
  );
}

/** ערימה של שכבות דקות רבות — מדוביק, בקלאווה, מיל קרפ */
function Stack({ n = 8, c1, c2, x = 112, w = 176, baseY = 204, lh = 6, gh = 6 }) {
  const rows = [];
  let y = baseY;
  for (let i = 0; i < n; i++) {
    y -= lh;
    rows.push(<rect key={'l' + i} x={x} y={y} width={w} height={lh} fill={c1} />);
    if (i < n - 1) {
      y -= gh;
      rows.push(<rect key={'g' + i} x={x} y={y} width={w} height={gh} fill={c2} />);
    }
  }
  return (
    <g>
      {rows}
      <rect x={x} y={y} width={w} height={baseY - y} fill="url(#pa-sheen)" opacity=".45" />
    </g>
  );
}

/** ספירלה בחתך — רולדה, סינמון רול, בבקה */
function Spiral({ cx = 200, cy = 152, turns = 3.6, c1, c2, r = 62 }) {
  const pts = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const rr = (r * i) / steps;
    pts.push(`${(cx + Math.cos(t) * rr).toFixed(1)} ${(cy + Math.sin(t) * rr * 0.92).toFixed(1)}`);
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r + 5} ry={r * 0.95} fill={c1} />
      <polyline points={pts.join(' ')} fill="none" stroke={c2} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx={cx} cy={cy} rx={r + 5} ry={r * 0.95} fill="url(#pa-sheen)" opacity=".5" />
    </g>
  );
}

/** עוגייה / דיסקית עגולה */
function Disc({ fill, rim, rx = 80, ry = 40, cy = 152, bits = [] }) {
  return (
    <g>
      <Plate w={250} />
      <ellipse cx="200" cy={cy + 7} rx={rx} ry={ry} fill={rim || fill} />
      <ellipse cx="200" cy={cy} rx={rx} ry={ry} fill={fill} />
      <ellipse cx="200" cy={cy} rx={rx} ry={ry} fill="url(#pa-crumb)" opacity=".35" />
      {bits.map(([bx, by, bc], i) => (
        <ellipse key={i} cx={bx} cy={by} rx="11" ry="8" fill={bc} />
      ))}
      <ellipse cx="200" cy={cy} rx={rx} ry={ry} fill="url(#pa-sheen)" opacity=".35" />
    </g>
  );
}

/** נקודות לספירלה שטוחה — מאפה מגולגל במבט מלמעלה */
function coilPoints(cx, cy, turns, r, squash) {
  const pts = [];
  const steps = 170;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const rr = (r * i) / steps;
    pts.push(`${(cx + Math.cos(t) * rr).toFixed(1)} ${(cy + Math.sin(t) * rr * squash).toFixed(1)}`);
  }
  return pts.join(' ');
}

const ART = {
  genoise: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 34, c: C.sponge, tex: 'pa-crumb' },
          { h: 6, c: C.cream },
          { h: 34, c: C.sponge, tex: 'pa-crumb' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 5} width={w} height="5" fill={C.spongeDark} rx="2" />
            <path d={`M${x} ${ty - 5} Q${x + w / 2} ${ty - 13} ${x + w} ${ty - 5}`} fill={C.spongeDark} opacity=".7" />
          </>
        )}
      />
      <g opacity=".75">
        <circle cx="300" cy="120" r="14" fill="none" stroke={C.spongeDark} strokeWidth="2" strokeDasharray="3 4" />
        <path d="M296 120 h8 M300 116 v8" stroke={C.spongeDark} strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  ),

  chocsponge: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 36, c: C.choc, tex: 'pa-crumb-dark' },
          { h: 14, c: '#7A4A33' },
          { h: 36, c: C.choc, tex: 'pa-crumb-dark' },
        ]}
        top={(ty, x, w) => (
          <>
            <path
              d={`M${x} ${ty} h${w} v-8 q-${w * 0.2} 10 -${w * 0.4} 0 q-${w * 0.2} -10 -${w * 0.4} 2 Z`}
              fill="#3A1F15"
            />
            <rect x={x} y={ty - 10} width={w} height="10" fill="#3A1F15" rx="2" />
            <rect x={x} y={ty - 10} width={w} height="3" fill="#fff" opacity=".12" />
          </>
        )}
      />
    </>
  ),

  joconde: () => (
    <>
      <Plate w={320} y={206} />
      <g>
        <rect x="60" y="150" width="280" height="14" rx="3" fill={C.sponge} />
        <rect x="60" y="150" width="280" height="14" rx="3" fill="url(#pa-crumb)" />
        <rect x="60" y="150" width="280" height="3" fill="#fff" opacity=".4" />
        <rect x="68" y="126" width="264" height="13" rx="3" fill={C.spongeDark} opacity=".85" />
        <rect x="76" y="104" width="248" height="12" rx="3" fill={C.sponge} opacity=".7" />
      </g>
      <text x="200" y="192" textAnchor="middle" fontSize="13" fill={C.line} opacity=".55" fontFamily="inherit">
        4–5 מ״מ
      </text>
      <path d="M150 176 h100" stroke={C.line} strokeWidth="1.5" opacity=".4" />
      <path d="M150 172 v8 M250 172 v8" stroke={C.line} strokeWidth="1.5" opacity=".4" />
    </>
  ),

  patissiere: () => (
    <Bowl
      fill={C.cream}
      label={
        <g>
          <path d="M150 112 q25 -16 48 0 q24 16 48 -4" fill="none" stroke="#E4CE9C" strokeWidth="4" strokeLinecap="round" />
          {[...Array(22)].map((_, i) => (
            <ellipse key={i} cx={110 + ((i * 53) % 180)} cy={106 + ((i * 29) % 24)} rx="1.6" ry="1" fill="#4A3520" opacity=".5" />
          ))}
        </g>
      }
    />
  ),

  smbc: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 26, c: C.sponge, tex: 'pa-crumb' },
          { h: 18, c: C.white },
          { h: 26, c: C.sponge, tex: 'pa-crumb' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x - 6} y={ty - 16} width={w + 12} height="16" fill={C.white} rx="3" />
            <Pipe x={x + 14} y={ty - 20} c={C.white} n={5} rx={16} ry={13} />
          </>
        )}
      />
      <rect x="104" y="138" width="192" height="72" fill="url(#pa-glass)" opacity=".35" />
    </>
  ),

  ganache: () => (
    <>
      <Bowl
        fill="#4F2E20"
        swirl={false}
        label={
          <>
            <ellipse cx="200" cy="114" rx="122" ry="26" fill="url(#pa-glass)" opacity=".65" />
            <path d="M136 120 Q178 104 212 120 Q246 136 272 116" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="5" strokeLinecap="round" />
          </>
        }
      />
      <g opacity=".9">
        <rect x="286" y="52" width="86" height="54" rx="8" fill="#F7F1FB" stroke="#D5C6E6" />
        <text x="329" y="72" textAnchor="middle" fontSize="13" fill={C.line} fontFamily="inherit">1:1</text>
        <text x="329" y="90" textAnchor="middle" fontSize="11" fill={C.line} opacity=".7" fontFamily="inherit">ציפוי</text>
      </g>
    </>
  ),

  meringue: () => (
    <>
      <Plate w={260} />
      <g>
        <path d="M120 206 Q116 150 150 140 Q138 104 170 102 Q176 70 200 74 Q226 68 234 100 Q266 100 256 138 Q290 150 282 206 Z" fill={C.white} />
        <path d="M120 206 Q116 150 150 140 Q138 104 170 102 Q176 70 200 74 Q226 68 234 100 Q266 100 256 138 Q290 150 282 206 Z" fill="url(#pa-sheen)" opacity=".8" />
        <path d="M168 110 q12 26 2 54 M204 92 q10 34 -2 62 M238 116 q8 24 0 48" stroke="#E9DCC2" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" />
        <path d="M176 92 q12 -14 24 -2" stroke="#D9BE8C" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55" />
      </g>
    </>
  ),

  curd: () => (
    <Bowl
      fill={C.lemon}
      label={
        <>
          <ellipse cx="200" cy="112" rx="122" ry="26" fill="url(#pa-glass)" opacity=".7" />
          <g transform="translate(296 150)">
            <ellipse cx="0" cy="0" rx="26" ry="20" fill={C.lemonLight} />
            <ellipse cx="0" cy="0" rx="20" ry="15" fill="#FBEBA8" />
            {[...Array(7)].map((_, i) => (
              <path key={i} d={`M0 0 L${Math.cos((i / 7) * 6.28) * 19} ${Math.sin((i / 7) * 6.28) * 14}`} stroke="#E8C85C" strokeWidth="1.6" />
            ))}
          </g>
        </>
      }
    />
  ),

  sucree: () => (
    <>
      <Plate w={300} />
      <g>
        <path d="M80 206 Q74 150 96 142 L304 142 Q326 150 320 206 Z" fill={C.crust} />
        <path d="M88 200 Q84 154 102 148 L298 148 Q316 154 312 200 Z" fill="#CE9254" />
        <rect x="96" y="142" width="208" height="7" fill={C.crustDark} opacity=".5" />
        <path d="M96 142 L304 142" stroke="#E8BE83" strokeWidth="3" />
        <g opacity=".5">
          {[...Array(16)].map((_, i) => (
            <circle key={i} cx={100 + ((i * 61) % 200)} cy={160 + ((i * 31) % 36)} r="1.6" fill="#8A5425" />
          ))}
        </g>
      </g>
      <path d="M96 140 q104 -10 208 0" fill="none" stroke="#F3DCB4" strokeWidth="3" opacity=".8" />
    </>
  ),

  syrup: () => (
    <>
      <Plate w={240} />
      <g>
        <path d="M150 90 h100 v96 q0 20 -22 20 h-56 q-22 0 -22 -20 Z" fill="#F6F1E6" opacity=".55" />
        <path d="M152 126 h96 v60 q0 18 -20 18 h-56 q-20 0 -20 -18 Z" fill="#E7C98E" />
        <path d="M152 126 h96 v8 h-96 Z" fill="#fff" opacity=".45" />
        <path d="M150 90 h100 v96 q0 20 -22 20 h-56 q-22 0 -22 -20 Z" fill="none" stroke="#CBBFA7" strokeWidth="3" />
        <path d="M200 44 v34" stroke="#E7C98E" strokeWidth="5" strokeLinecap="round" />
        <circle cx="200" cy="84" r="5" fill="#E7C98E" />
      </g>
      <text x="290" y="122" textAnchor="middle" fontSize="15" fill={C.line} opacity=".6" fontFamily="inherit">1:1</text>
    </>
  ),

  glaze: () => (
    <>
      <Plate />
      <g>
        <path d="M96 206 Q92 118 200 112 Q308 118 304 206 Z" fill={C.glazeRed} />
        <path d="M96 206 Q92 118 200 112 Q308 118 304 206 Z" fill="url(#pa-sheen)" />
        <ellipse cx="160" cy="142" rx="34" ry="16" fill="#fff" opacity=".55" transform="rotate(-18 160 142)" />
        <ellipse cx="246" cy="170" rx="16" ry="7" fill="#fff" opacity=".3" transform="rotate(-18 246 170)" />
        <path d="M96 204 q18 14 32 2 q16 12 30 0" fill={C.glazeRed} opacity=".8" />
      </g>
    </>
  ),

  caramel: () => (
    <Bowl
      fill={C.caramel}
      swirl={false}
      label={
        <>
          <ellipse cx="200" cy="112" rx="122" ry="26" fill="url(#pa-glass)" opacity=".6" />
          <path d="M134 122 Q180 102 216 120 Q252 138 274 114" fill="none" stroke="#E8A95A" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          {[...Array(9)].map((_, i) => (
            <rect key={i} x={126 + i * 18} y={100 + ((i * 17) % 18)} width="4" height="4" rx="1" fill="#fff" opacity=".8" transform={`rotate(${i * 23} ${128 + i * 18} ${102 + ((i * 17) % 18)})`} />
          ))}
        </>
      }
    />
  ),

  basque: () => (
    <>
      <Plate />
      <g>
        <path d="M100 204 Q94 112 200 106 Q306 112 300 204 Z" fill="#F2DCA8" />
        <path d="M100 204 Q94 112 200 106 Q306 112 300 204 Z" fill="url(#pa-crumb)" opacity=".4" />
        <path d="M100 204 Q94 112 200 106 Q306 112 300 204 Z" fill="url(#pa-sheen)" opacity=".5" />
        <path d="M100 150 Q94 112 200 106 Q306 112 300 150 Q250 128 200 134 Q150 128 100 150 Z" fill={C.burnt} />
        <path d="M112 118 q26 -12 46 -4 M240 112 q26 -6 44 6" stroke="#4E2812" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7" />
        <path d="M128 176 Q164 158 200 176 Q236 194 272 174" fill="none" stroke="#E6C27C" strokeWidth="6" strokeLinecap="round" opacity=".7" />
        <path d="M188 192 q12 14 26 2 q-6 16 -20 14 q-14 -4 -6 -16 Z" fill="#E8C98A" opacity=".9" />
      </g>
    </>
  ),

  nycheesecake: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 16, c: C.crustDark },
          { h: 66, c: '#FAEFD6' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 5} width={w} height="5" fill="#F3E2BF" rx="2" />
            <ellipse cx={x + w / 2} cy={ty - 5} rx={w / 2} ry="5" fill="#FDF6E6" />
          </>
        )}
      />
      <rect x="110" y="126" width="180" height="82" fill="url(#pa-sheen)" opacity=".45" />
      <g opacity=".55">
        {[...Array(12)].map((_, i) => (
          <circle key={i} cx={116 + ((i * 71) % 168)} cy={196 + ((i * 13) % 8)} r="1.6" fill="#7A5228" />
        ))}
      </g>
    </>
  ),

  opera: () => (
    <>
      <Plate w={280} />
      <Slice
        x={112}
        w={176}
        layers={[
          { h: 9, c: '#3A1F15' },
          { h: 11, c: C.sponge, tex: 'pa-crumb' },
          { h: 13, c: '#C79A5E' },
          { h: 11, c: C.sponge, tex: 'pa-crumb' },
          { h: 13, c: '#4A2C20' },
          { h: 11, c: C.sponge, tex: 'pa-crumb' },
          { h: 13, c: '#C79A5E' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 10} width={w} height="10" fill="#2D1710" rx="1" />
            <rect x={x} y={ty - 10} width={w} height="3" fill="#fff" opacity=".22" />
            <rect x={x + w - 44} y={ty - 24} width="30" height="12" rx="2" fill="#C8A96B" opacity=".9" />
          </>
        )}
      />
      <g fontFamily="inherit" fontSize="10" fill={C.line} opacity=".55">
        <path d="M296 110 h14 M296 198 h14" stroke={C.line} strokeWidth="1.2" />
        <path d="M303 110 v88" stroke={C.line} strokeWidth="1.2" />
        <text x="332" y="158" textAnchor="middle" fontSize="12">2.5 ס״מ</text>
      </g>
    </>
  ),

  mousse: () => (
    <>
      <Plate />
      <g>
        <path d="M104 204 Q98 110 200 104 Q302 110 296 204 Z" fill="#5A3324" />
        <path d="M104 204 Q98 110 200 104 Q302 110 296 204 Z" fill="url(#pa-sheen)" opacity=".7" />
        <ellipse cx="164" cy="138" rx="30" ry="13" fill="#fff" opacity=".4" transform="rotate(-16 164 138)" />
        <rect x="140" y="178" width="120" height="22" rx="3" fill="#36201A" />
        <rect x="140" y="178" width="120" height="22" rx="3" fill="url(#pa-crumb-dark)" />
        <path d="M104 198 q22 12 38 2 q18 12 34 0" fill="#5A3324" opacity=".75" />
      </g>
      <text x="200" y="228" textAnchor="middle" fontSize="11" fill={C.line} opacity=".5" fontFamily="inherit">
        מוס · בראוני · גלסאז׳
      </text>
    </>
  ),

  sacher: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 30, c: '#43261A', tex: 'pa-crumb-dark' },
          { h: 9, c: '#C96A2E' },
          { h: 30, c: '#43261A', tex: 'pa-crumb-dark' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x - 5} y={ty - 9} width={w + 10} height="9" fill="#2C1710" rx="2" />
            <rect x={x - 5} y={ty - 9} width={w + 10} height="3" fill="#fff" opacity=".25" />
            <circle cx={x + w / 2} cy={ty - 24} r="13" fill="#2C1710" />
            <circle cx={x + w / 2 - 4} cy={ty - 28} r="4" fill="#fff" opacity=".25" />
          </>
        )}
      />
    </>
  ),

  carrot: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 30, c: '#C98A4C', tex: 'pa-crumb' },
          { h: 16, c: C.white },
          { h: 30, c: '#C98A4C', tex: 'pa-crumb' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x - 5} y={ty - 16} width={w + 10} height="16" fill={C.white} rx="3" />
            <Pipe x={x + 16} y={ty - 20} c={C.white} n={5} rx={15} ry={11} />
            <g transform={`translate(${x + w / 2 - 10} ${ty - 42})`}>
              <path d="M10 2 L16 22 L4 22 Z" fill={C.carrot} />
              <path d="M10 2 q6 -10 12 -8 q-6 6 -8 10 M10 2 q-6 -10 -12 -8 q6 6 8 10" fill="#6B8F3E" />
            </g>
          </>
        )}
      />
      <g opacity=".8">
        {[...Array(8)].map((_, i) => (
          <ellipse key={i} cx={122 + ((i * 83) % 156)} cy={160 + ((i * 41) % 42)} rx="4" ry="2" fill={C.carrot} transform={`rotate(${i * 34} ${122 + ((i * 83) % 156)} ${160 + ((i * 41) % 42)})`} />
        ))}
      </g>
    </>
  ),

  redvelvet: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 28, c: C.velvet, tex: 'pa-crumb-dark' },
          { h: 14, c: C.white },
          { h: 28, c: C.velvet, tex: 'pa-crumb-dark' },
          { h: 14, c: C.white },
          { h: 28, c: C.velvet, tex: 'pa-crumb-dark' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x - 5} y={ty - 14} width={w + 10} height="14" fill={C.white} rx="3" />
            <g>
              {[...Array(9)].map((_, i) => (
                <circle key={i} cx={x + 10 + i * 20} cy={ty - 18} r="2.6" fill={C.velvet} opacity=".85" />
              ))}
            </g>
          </>
        )}
      />
    </>
  ),

  lemontart: () => (
    <>
      <Plate w={300} />
      <g>
        <path d="M84 204 Q78 156 100 148 L300 148 Q322 156 316 204 Z" fill={C.crust} />
        <path d="M92 198 Q88 160 106 154 L294 154 Q312 160 308 198 Z" fill="#CE9254" />
        <path d="M100 148 L300 148 L300 132 Q200 124 100 132 Z" fill={C.lemon} />
        <path d="M100 132 Q200 124 300 132 L300 128 Q200 118 100 128 Z" fill={C.lemonLight} />
        <g>
          <path d="M104 128 q14 -26 30 -2 q16 -28 32 -2 q16 -28 32 -2 q16 -28 32 -2 q16 -28 32 -2 q14 -22 28 0 v6 q-100 -10 -186 2 Z" fill={C.white} />
          <path d="M104 128 q14 -26 30 -2 q16 -28 32 -2 q16 -28 32 -2 q16 -28 32 -2 q16 -28 32 -2 q14 -22 28 0 v6 q-100 -10 -186 2 Z" fill="url(#pa-sheen)" opacity=".7" />
          <path d="M126 106 q6 -6 12 0 M190 100 q6 -6 12 0 M254 102 q6 -6 12 0" stroke="#D9A860" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity=".7" />
        </g>
      </g>
    </>
  ),

  macaron: () => (
    <>
      <Plate w={260} />
      <g>
        <path d="M118 150 q0 -40 60 -40 q60 0 60 40 q0 8 -8 10 h-104 q-8 -2 -8 -10 Z" transform="translate(22 0)" fill="#F0B9C8" />
        <g transform="translate(22 0)">
          {[...Array(9)].map((_, i) => (
            <ellipse key={i} cx={126 + i * 13} cy={162} rx="6" ry="7" fill="#EDA7BA" />
          ))}
          <rect x="118" y="166" width="120" height="16" rx="4" fill={C.berry} />
          {[...Array(9)].map((_, i) => (
            <ellipse key={'b' + i} cx={126 + i * 13} cy={186} rx="6" ry="7" fill="#EDA7BA" />
          ))}
          <path d="M118 198 q0 40 60 40 q60 0 60 -40 q0 -8 -8 -10 h-104 q-8 2 -8 10 Z" fill="#F0B9C8" transform="translate(0 -8)" />
          <ellipse cx="160" cy="124" rx="26" ry="10" fill="#fff" opacity=".45" transform="rotate(-12 160 124)" />
        </g>
      </g>
      <text x="200" y="232" textAnchor="middle" fontSize="11" fill={C.line} opacity=".5" fontFamily="inherit">
        רגליים · קונכייה חלקה
      </text>
    </>
  ),

  eclair: () => (
    <>
      <Plate w={320} />
      <g>
        <rect x="56" y="140" width="288" height="56" rx="28" fill="#E3B678" />
        <rect x="56" y="140" width="288" height="56" rx="28" fill="url(#pa-crumb)" opacity=".4" />
        <path d="M60 162 q144 -22 280 0 v-6 q-140 -22 -280 0 Z" fill="#D7A461" opacity=".6" />
        <rect x="60" y="130" width="280" height="30" rx="15" fill="#3E2318" />
        <rect x="60" y="130" width="280" height="30" rx="15" fill="url(#pa-sheen)" opacity=".8" />
        <ellipse cx="130" cy="140" rx="34" ry="7" fill="#fff" opacity=".35" />
        <path d="M70 176 q40 -16 80 0 q40 16 80 0 q40 -16 80 0" fill="none" stroke={C.cream} strokeWidth="11" strokeLinecap="round" opacity=".95" />
      </g>
    </>
  ),

  parisbrest: () => (
    <>
      <Plate />
      <g>
        <ellipse cx="200" cy="168" rx="124" ry="44" fill="#E3B678" />
        <ellipse cx="200" cy="168" rx="124" ry="44" fill="url(#pa-crumb)" opacity=".35" />
        <ellipse cx="200" cy="162" rx="58" ry="18" fill="#F2EAF8" />
        <path d="M78 156 q30 -30 122 -30 q92 0 122 30 q-30 -44 -122 -44 q-92 0 -122 44 Z" fill="#EFC489" />
        <g>
          {[...Array(11)].map((_, i) => (
            <ellipse key={i} cx={92 + i * 22} cy={154 - Math.abs(5 - i) * 2} rx="11" ry="9" fill={C.nut} opacity=".95" />
          ))}
        </g>
        <path d="M86 150 q34 -24 114 -24 q80 0 114 24" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="4" />
        <g opacity=".6">
          {[...Array(16)].map((_, i) => (
            <circle key={i} cx={86 + ((i * 67) % 228)} cy={128 + ((i * 23) % 14)} r="1.5" fill="#fff" />
          ))}
        </g>
      </g>
    </>
  ),

  millefeuille: () => (
    <>
      <Plate w={300} />
      <g>
        {[0, 1, 2].map((k) => {
          const y = 186 - k * 36;
          return (
            <g key={k}>
              <rect x="94" y={y} width="212" height="14" rx="2" fill="#E0B377" />
              <rect x="94" y={y} width="212" height="4" rx="2" fill="#F1D3A2" />
              <rect x="94" y={y + 10} width="212" height="4" fill="#C79657" opacity=".7" />
              {k < 2 && (
                <g>
                  {[...Array(7)].map((_, i) => (
                    <circle key={i} cx={110 + i * 31} cy={y - 11} r="11" fill={C.cream} />
                  ))}
                  {[...Array(7)].map((_, i) => (
                    <circle key={'h' + i} cx={106 + i * 31} cy={y - 14} r="4" fill="#fff" opacity=".6" />
                  ))}
                </g>
              )}
            </g>
          );
        })}
        <rect x="94" y="114" width="212" height="14" rx="2" fill="#C98A48" />
        <rect x="94" y="114" width="212" height="5" rx="2" fill="#E9C487" />
        <g opacity=".7">
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={100 + ((i * 59) % 200)} cy={108 - ((i * 19) % 6)} r="1.3" fill="#fff" />
          ))}
        </g>
      </g>
    </>
  ),

  croissant: () => (
    <>
      <Plate w={300} />
      <g>
        <path
          d="M70 184 q18 -34 56 -40 q-10 -26 18 -34 q26 -8 38 14 q14 -26 42 -18 q28 8 18 34 q40 8 56 44 q-32 -14 -62 -6 q-26 -24 -52 -12 q-26 -12 -52 12 q-30 -8 -62 6 Z"
          fill="#D79B50"
        />
        <path
          d="M70 184 q18 -34 56 -40 q-10 -26 18 -34 q26 -8 38 14 q14 -26 42 -18 q28 8 18 34 q40 8 56 44 q-32 -14 -62 -6 q-26 -24 -52 -12 q-26 -12 -52 12 q-30 -8 -62 6 Z"
          fill="url(#pa-sheen)"
          opacity=".55"
        />
        <path d="M126 144 q24 -14 48 2 M200 136 q26 -12 48 6" stroke="#B87A32" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" />
        <path d="M146 112 q22 -10 40 6 M214 110 q22 -8 38 8" stroke="#E8BE83" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
        <ellipse cx="200" cy="190" rx="130" ry="10" fill="#C98A48" opacity=".35" />
      </g>
    </>
  ),

  brioche: () => (
    <>
      <Plate w={280} />
      <g>
        <path d="M96 198 q-6 -62 48 -70 q-4 -34 32 -38 q34 -4 40 22 q36 -14 52 16 q34 10 32 70 Z" fill="#DFA960" />
        <path d="M96 198 q-6 -62 48 -70 q-4 -34 32 -38 q34 -4 40 22 q36 -14 52 16 q34 10 32 70 Z" fill="url(#pa-sheen)" opacity=".6" />
        <path d="M144 130 q30 -16 58 0 q28 16 56 0" fill="none" stroke="#C0863C" strokeWidth="3.5" strokeLinecap="round" opacity=".7" />
        <path d="M130 162 q36 -14 72 0 q36 14 68 0" fill="none" stroke="#C0863C" strokeWidth="3.5" strokeLinecap="round" opacity=".55" />
        <circle cx="200" cy="96" r="18" fill="#E5B470" />
        <ellipse cx="194" cy="90" rx="7" ry="4" fill="#fff" opacity=".45" />
      </g>
    </>
  ),

  honey: () => (
    <>
      <Plate w={280} />
      <Slice
        x={118}
        w={164}
        layers={[{ h: 86, c: '#6B3E1E', tex: 'pa-crumb-dark' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty + 4} Q${x + w / 2} ${ty - 20} ${x + w} ${ty + 4} Z`} fill="#5A3317" />
            <path d={`M${x + w / 2 - 26} ${ty - 10} q26 -8 52 2`} stroke="#3F2210" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        )}
      />
      <g opacity=".85">
        <path d="M296 70 q16 -6 24 6 q-8 20 -24 16 q-12 -12 0 -22 Z" fill="#D79A2E" />
        <path d="M300 96 q8 14 18 2" stroke="#B87E1E" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </>
  ),

  apple: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 16, c: '#D4A05E' },
          { h: 40, c: '#E8C98C' },
          { h: 14, c: '#D4A05E' },
        ]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty} h${w} v-7 q-${w / 2} -7 -${w} 0 Z`} fill="#C78F45" />
            <path d={`M${x + 34} ${ty - 5} v-6 M${x + w / 2} ${ty - 7} v-6 M${x + w - 34} ${ty - 5} v-6`} stroke="#A06F2E" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      />
      <g>
        {[...Array(9)].map((_, i) => (
          <path
            key={i}
            d={`M${120 + (i % 5) * 32} ${166 + Math.floor(i / 5) * 18} q14 -9 26 0 q-13 7 -26 0 Z`}
            fill="#EFD9A8"
            stroke="#C99A4E"
            strokeWidth="1.4"
          />
        ))}
      </g>
      <g transform="translate(306 92)">
        <path d="M0 6 q-12 -14 0 -16 q6 -6 12 0 q12 2 0 16 q-6 8 -12 0 Z" fill="#B23A3A" />
        <path d="M6 -11 v-6" stroke="#5E3B1E" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </>
  ),

  babka: () => (
    <>
      <Plate w={290} />
      <g>
        <rect x="112" y="108" width="176" height="100" rx="12" fill="#E0B071" />
        <rect x="112" y="108" width="176" height="100" rx="12" fill="url(#pa-crumb)" opacity=".35" />
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${k * 88} 0)`}>
            <path
              d="M126 200 q-6 -32 14 -44 q20 -12 14 -32 q-4 -14 10 -18"
              fill="none"
              stroke="#3E2214"
              strokeWidth="11"
              strokeLinecap="round"
            />
            <path
              d="M150 200 q-6 -30 12 -40 q18 -10 12 -30"
              fill="none"
              stroke="#3E2214"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        ))}
        <rect x="112" y="108" width="176" height="100" rx="12" fill="url(#pa-sheen)" opacity=".4" />
        <path d="M112 112 q88 -14 176 0" fill="none" stroke="#F0CE96" strokeWidth="4" opacity=".8" />
      </g>
    </>
  ),

  marble: () => (
    <>
      <Plate w={280} />
      <Slice
        x={118}
        w={164}
        layers={[{ h: 90, c: '#F0D79C', tex: 'pa-crumb' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty + 3} Q${x + w / 2} ${ty - 18} ${x + w} ${ty + 3} Z`} fill="#E6C684" />
            <path d={`M${x + 40} ${ty - 8} q40 -8 84 2`} stroke="#CFA85F" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        )}
      />
      <g>
        <path d="M128 190 q28 -26 56 -8 q28 18 56 -10" fill="none" stroke="#5A3420" strokeWidth="13" strokeLinecap="round" opacity=".92" />
        <path d="M130 152 q30 -24 58 -4 q26 18 52 -12" fill="none" stroke="#5A3420" strokeWidth="10" strokeLinecap="round" opacity=".92" />
        <path d="M134 122 q28 -18 54 -2 q24 14 50 -8" fill="none" stroke="#5A3420" strokeWidth="7" strokeLinecap="round" opacity=".85" />
      </g>
    </>
  ),

  brownie: () => (
    <>
      <Plate w={270} />
      <g>
        <rect x="122" y="126" width="156" height="80" rx="7" fill="#3C2016" />
        <rect x="122" y="126" width="156" height="80" rx="7" fill="url(#pa-crumb-dark)" />
        <rect x="122" y="126" width="156" height="13" rx="6" fill="#6B4430" />
        <rect x="122" y="126" width="156" height="13" rx="6" fill="url(#pa-sheen)" opacity=".9" />
        <path d="M138 132 q22 6 40 -2 q22 8 44 -2 q16 6 32 -1" fill="none" stroke="#C7A88E" strokeWidth="2" opacity=".75" />
        <g opacity=".9">
          {[...Array(7)].map((_, i) => (
            <rect key={i} x={134 + ((i * 47) % 128)} y={152 + ((i * 29) % 44)} width="11" height="9" rx="2" fill="#23120C" />
          ))}
        </g>
        {[...Array(5)].map((_, i) => (
          <circle key={'s' + i} cx={140 + i * 30} cy={130} r="1.8" fill="#fff" opacity=".7" />
        ))}
      </g>
    </>
  ),

  coldcheese: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 17, c: C.crustDark },
          { h: 58, c: '#FDFAF2' },
          { h: 12, c: '#C2304F' },
        ]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty} q${w * 0.25} 7 ${w * 0.5} 0 q${w * 0.25} -7 ${w * 0.5} 0 v-3 h-${w} Z`} fill="#A82540" />
            {[...Array(4)].map((_, i) => (
              <circle key={i} cx={x + 26 + i * 44} cy={ty - 8} r="8" fill="#C2304F" />
            ))}
            {[...Array(4)].map((_, i) => (
              <circle key={'h' + i} cx={x + 23 + i * 44} cy={ty - 11} r="3" fill="#fff" opacity=".4" />
            ))}
          </>
        )}
      />
      <rect x="110" y="120" width="180" height="88" fill="url(#pa-sheen)" opacity=".4" />
    </>
  ),

  tiramisu: () => (
    <>
      <Plate w={290} />
      <Slice
        x={112}
        w={176}
        layers={[
          { h: 16, c: '#C79A66' },
          { h: 24, c: '#FBF3DE' },
          { h: 16, c: '#C79A66' },
          { h: 26, c: '#FBF3DE' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 9} width={w} height="9" rx="2" fill="#4A3121" />
            <rect x={x} y={ty - 9} width={w} height="9" rx="2" fill="url(#pa-crumb-dark)" opacity=".6" />
            {[...Array(16)].map((_, i) => (
              <circle key={i} cx={x + 6 + ((i * 53) % (w - 12))} cy={ty - 12 - ((i * 19) % 5)} r="1.3" fill="#6B4A32" opacity=".8" />
            ))}
          </>
        )}
      />
      <g opacity=".55">
        {[...Array(10)].map((_, i) => (
          <circle key={i} cx={122 + ((i * 61) % 156)} cy={152 + ((i * 37) % 44)} r="1.6" fill="#8A6A48" />
        ))}
      </g>
    </>
  ),

  pavlova: () => (
    <>
      <Plate w={280} />
      <g>
        <path d="M112 204 q-6 -58 36 -70 q52 -14 104 0 q42 12 36 70 Z" fill={C.white} />
        <path d="M112 204 q-6 -58 36 -70 q52 -14 104 0 q42 12 36 70 Z" fill="url(#pa-sheen)" opacity=".75" />
        <path d="M150 196 q4 -34 -2 -52 M200 200 q4 -38 0 -58 M250 196 q-4 -34 2 -52" stroke="#E6DCC8" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
        <path d="M132 136 q34 -16 68 -6 q34 10 68 4 q-10 16 -34 14 q-34 -10 -68 0 q-24 6 -34 -12 Z" fill="#FFFDF8" />
        <g>
          <circle cx="170" cy="124" r="11" fill="#9C2748" />
          <circle cx="200" cy="116" r="12" fill="#C2304F" />
          <circle cx="232" cy="124" r="10" fill="#7E1F3C" />
          <circle cx="166" cy="120" r="3.6" fill="#fff" opacity=".45" />
          <circle cx="196" cy="111" r="4" fill="#fff" opacity=".45" />
        </g>
        <path d="M150 112 q10 -10 20 -2" stroke="#E8B93C" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".8" />
      </g>
    </>
  ),

  rugelach: () => (
    <>
      <Plate w={260} />
      <g>
        <path d="M94 176 q22 -52 84 -56 q64 -4 94 48 q-26 -18 -56 -12 q-20 -26 -54 -16 q-34 8 -46 42 q-12 -10 -22 -6 Z" fill="#D89E55" />
        <path d="M94 176 q22 -52 84 -56 q64 -4 94 48 q-26 -18 -56 -12 q-20 -26 -54 -16 q-34 8 -46 42 q-12 -10 -22 -6 Z" fill="url(#pa-sheen)" opacity=".6" />
        <path d="M140 160 q24 -34 62 -28 q32 6 46 28" fill="none" stroke="#45271A" strokeWidth="9" strokeLinecap="round" opacity=".9" />
        <path d="M122 172 q30 -46 78 -40" fill="none" stroke="#45271A" strokeWidth="6" strokeLinecap="round" opacity=".7" />
        <ellipse cx="200" cy="186" rx="112" ry="10" fill="#C08A42" opacity=".4" />
        <g opacity=".75">
          {[...Array(9)].map((_, i) => (
            <circle key={i} cx={120 + i * 20} cy={118 + ((i * 23) % 10)} r="1.6" fill="#fff" />
          ))}
        </g>
      </g>
    </>
  ),

  sufganiya: () => (
    <>
      <Plate w={250} />
      <g>
        <circle cx="200" cy="138" r="66" fill="#D99A4E" />
        <circle cx="200" cy="138" r="66" fill="url(#pa-crumb)" opacity=".3" />
        <path d="M134 138 a66 66 0 0 0 132 0 a66 66 0 0 0 -132 0" fill="none" stroke="#EFCB92" strokeWidth="13" opacity=".9" />
        <circle cx="200" cy="138" r="66" fill="url(#pa-sheen)" opacity=".5" />
        <circle cx="200" cy="120" r="13" fill="#B22A46" />
        <circle cx="196" cy="116" r="4" fill="#fff" opacity=".35" />
        <g opacity=".92">
          {[...Array(22)].map((_, i) => (
            <circle key={i} cx={146 + ((i * 71) % 108)} cy={96 + ((i * 41) % 34)} r={1.4 + ((i * 7) % 3) * 0.5} fill="#fff" />
          ))}
        </g>
      </g>
    </>
  ),

  cookie: () => (
    <>
      <Plate w={250} />
      <g>
        <ellipse cx="200" cy="158" rx="86" ry="44" fill="#D5A05C" />
        <ellipse cx="200" cy="152" rx="86" ry="44" fill="#E2B069" />
        <ellipse cx="200" cy="152" rx="86" ry="44" fill="url(#pa-crumb)" opacity=".4" />
        <ellipse cx="200" cy="152" rx="70" ry="33" fill="#EFC487" opacity=".55" />
        <g>
          {[
            [168, 134],
            [218, 128],
            [242, 156],
            [190, 166],
            [146, 160],
            [214, 172],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx="13" ry="9" fill="#3C2016" />
              <ellipse cx={cx - 3} cy={cy - 3} rx="4.5" ry="2.6" fill="#6B4430" opacity=".8" />
            </g>
          ))}
        </g>
        <ellipse cx="200" cy="152" rx="86" ry="44" fill="url(#pa-sheen)" opacity=".35" />
        <g opacity=".9">
          {[...Array(5)].map((_, i) => (
            <rect key={i} x={160 + i * 20} y={120 + ((i * 13) % 8)} width="3" height="3" rx="1" fill="#fff" transform={`rotate(${i * 30} ${161 + i * 20} ${121 + ((i * 13) % 8)})`} />
          ))}
        </g>
      </g>
    </>
  ),

  banana: () => (
    <>
      <Plate w={280} />
      <Slice
        x={118}
        w={164}
        layers={[{ h: 84, c: '#DFBB7E', tex: 'pa-crumb' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty + 3} Q${x + w / 2} ${ty - 16} ${x + w} ${ty + 3} Z`} fill="#CFA660" />
            <path d={`M${x + 24} ${ty - 6} q56 -12 116 0 q-10 12 -58 12 q-48 0 -58 -12 Z`} fill="#E9CC8E" />
            <path d={`M${x + 42} ${ty - 4} q40 -8 80 0`} stroke="#B98F4E" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
      />
      <g opacity=".85">
        {[...Array(7)].map((_, i) => (
          <ellipse key={i} cx={132 + ((i * 67) % 136)} cy={150 + ((i * 31) % 44)} rx="6" ry="4" fill="#B5873F" transform={`rotate(${i * 27} ${132 + ((i * 67) % 136)} ${150 + ((i * 31) % 44)})`} />
        ))}
      </g>
    </>
  ),

  malabi: () => (
    <>
      <Plate w={210} y={216} />
      <g>
        <path d="M148 86 h104 l-10 112 q-2 14 -16 14 h-52 q-14 0 -16 -14 Z" fill="#F4F0E6" opacity=".45" />
        <path d="M152 120 h96 l-8 78 q-1 10 -12 10 h-56 q-11 0 -12 -10 Z" fill="#FBF7EE" />
        <path d="M152 120 h96 l-2 20 q-46 8 -92 0 Z" fill="#E8DFC8" />
        <path d="M152 120 h96 l-1.4 14 q-47 9 -93 0 Z" fill="#C2304F" />
        <ellipse cx="200" cy="120" rx="48" ry="9" fill="#D4425F" />
        <path d="M148 86 h104 l-10 112 q-2 14 -16 14 h-52 q-14 0 -16 -14 Z" fill="none" stroke="#D8D0C0" strokeWidth="3" />
        <g>
          {[...Array(8)].map((_, i) => (
            <ellipse key={i} cx={166 + i * 10} cy={114 + ((i * 17) % 7)} rx="4.2" ry="3" fill={C.pistachio} transform={`rotate(${i * 34} ${166 + i * 10} ${114 + ((i * 17) % 7)})`} />
          ))}
        </g>
        <path d="M156 128 q6 44 4 62" stroke="#fff" strokeWidth="4" fill="none" opacity=".55" strokeLinecap="round" />
      </g>
    </>
  ),

  lemoncake: () => (
    <>
      <Plate w={280} />
      <Slice
        x={118}
        w={164}
        layers={[{ h: 84, c: '#F3DC9E', tex: 'pa-crumb' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty + 3} Q${x + w / 2} ${ty - 16} ${x + w} ${ty + 3} Z`} fill="#EBCF86" />
            <path
              d={`M${x - 3} ${ty - 1} Q${x + w / 2} ${ty - 21} ${x + w + 3} ${ty - 1} q-6 12 -14 4 q-8 14 -18 2 q-10 16 -20 2 q-12 16 -22 1 q-12 15 -22 0 q-10 13 -20 -1 q-8 10 -14 -7 Z`}
              fill="#FBFAF4"
            />
            <path
              d={`M${x - 3} ${ty - 1} Q${x + w / 2} ${ty - 21} ${x + w + 3} ${ty - 1} q-6 12 -14 4 q-8 14 -18 2 q-10 16 -20 2 q-12 16 -22 1 q-12 15 -22 0 q-10 13 -20 -1 q-8 10 -14 -7 Z`}
              fill="url(#pa-sheen)"
              opacity=".7"
            />
          </>
        )}
      />
      <g transform="translate(300 104)">
        <circle cx="0" cy="0" r="21" fill={C.lemonLight} />
        <circle cx="0" cy="0" r="16" fill="#FBEBA8" />
        {[...Array(7)].map((_, i) => (
          <path key={i} d={`M0 0 L${Math.cos((i / 7) * 6.28) * 15} ${Math.sin((i / 7) * 6.28) * 15}`} stroke="#E8C85C" strokeWidth="1.5" />
        ))}
      </g>
    </>
  ),

  brulee: () => (
    <Ramekin fill="#E8B861" topColor="#C98227" wide top={
      <g>
        <ellipse cx="200" cy="138" rx="112" ry="19" fill="url(#pa-sheen)" opacity=".85" />
        <ellipse cx="166" cy="132" rx="30" ry="8" fill="#fff" opacity=".45" transform="rotate(-8 166 132)" />
        {[...Array(12)].map((_, i) => (<circle key={i} cx={110 + i * 16} cy={136 + ((i * 23) % 11)} r="1.6" fill="#7A4A12" opacity=".7" />))}
      </g>} />
  ),

  crema: () => (
    <Ramekin fill="#F2DC9E" topColor="#D9A445" wide top={
      <g>
        <ellipse cx="200" cy="138" rx="112" ry="19" fill="url(#pa-sheen)" opacity=".7" />
        <rect x="246" y="116" width="46" height="7" rx="3.5" fill="#9A5A2A" transform="rotate(-16 246 116)" />
      </g>} />
  ),

  flan: () => (
    <>
      <Plate w={280} />
      <path d="M118 198 q-4 -66 82 -70 q86 4 82 70 Z" fill="#F6E3A8" />
      <path d="M118 198 q-4 -66 82 -70 q86 4 82 70 Z" fill="url(#pa-sheen)" opacity=".65" />
      <path d="M122 190 q78 -14 156 0 q4 10 -78 12 q-82 -2 -78 -12 Z" fill="#B5751F" />
      <ellipse cx="200" cy="202" rx="96" ry="10" fill="#C98227" opacity=".75" />
      <ellipse cx="168" cy="152" rx="26" ry="11" fill="#fff" opacity=".4" transform="rotate(-14 168 152)" />
    </>
  ),

  pannacotta: () => (
    <>
      <Plate w={250} />
      <path d="M134 196 q-2 -70 66 -72 q68 2 66 72 Z" fill="#FDF8EE" />
      <path d="M134 196 q-2 -70 66 -72 q68 2 66 72 Z" fill="url(#pa-sheen)" opacity=".7" />
      <path d="M152 134 q24 -14 48 -12 q26 2 46 16 q-14 34 -46 30 q-34 4 -48 -34 Z" fill="#A82540" />
      <path d="M156 160 q10 18 4 34 M240 158 q-8 18 -2 32" stroke="#A82540" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="200" cy="200" rx="94" ry="9" fill="#C2304F" opacity=".5" />
    </>
  ),

  souffle: () => (
    <>
      <Plate />
      <path d="M108 206 Q104 96 200 90 Q296 96 292 206 Z" fill="#F7E9C8" />
      <path d="M108 206 Q104 96 200 90 Q296 96 292 206 Z" fill="url(#pa-crumb)" opacity=".3" />
      <path d="M108 130 Q104 96 200 90 Q296 96 292 130 Q248 110 200 114 Q152 110 108 130 Z" fill="#E0B873" />
      <path d="M108 206 Q104 96 200 90 Q296 96 292 206 Z" fill="url(#pa-sheen)" opacity=".5" />
    </>
  ),

  tatin: () => (
    <>
      <Plate />
      <path d="M100 200 q-4 -24 18 -28 L282 172 q22 4 18 28 Z" fill="#D9A05E" />
      <path d="M100 176 q0 -40 100 -44 q100 4 100 44 Z" fill="#C06B22" />
      {[[146, 150, 30], [200, 142, 34], [254, 150, 30]].map(([cx, cy, rx], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry="17" fill="#D98A3A" />
          <ellipse cx={cx} cy={cy - 2} rx={rx - 6} ry="13" fill="#E8A857" />
          <ellipse cx={cx - 6} cy={cy - 6} rx={rx * 0.4} ry="5" fill="#fff" opacity=".35" />
        </g>
      ))}
      <path d="M100 176 q0 -40 100 -44 q100 4 100 44 Z" fill="url(#pa-sheen)" opacity=".45" />
    </>
  ),

  madeleine: () => (
    <>
      <Plate w={250} />
      <path d="M118 178 q0 -52 82 -52 q82 0 82 52 q-82 22 -164 0 Z" fill="#E8C078" />
      {[...Array(7)].map((_, i) => (
        <path key={i} d={`M200 180 L${128 + i * 24} 134`} stroke="#C99A4E" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      ))}
      <path d="M150 128 q50 -34 100 0 q-48 -16 -100 0 Z" fill="#D9A85F" />
      <ellipse cx="200" cy="124" rx="44" ry="14" fill="#EFCE92" />
      <path d="M118 178 q0 -52 82 -52 q82 0 82 52 q-82 22 -164 0 Z" fill="url(#pa-sheen)" opacity=".4" />
    </>
  ),

  canele: () => (
    <>
      <Plate w={230} />
      <path d="M152 86 h96 l-12 106 q-2 14 -18 14 h-36 q-16 0 -18 -14 Z" fill="#3E2113" />
      {[...Array(5)].map((_, i) => (
        <path key={i} d={`M${164 + i * 18} 88 l-2 118`} stroke="#23120A" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
      ))}
      <path d="M152 86 h96 l-12 106 q-2 14 -18 14 h-36 q-16 0 -18 -14 Z" fill="url(#pa-sheen)" opacity=".35" />
      <ellipse cx="200" cy="86" rx="48" ry="11" fill="#5E3620" />
      <ellipse cx="200" cy="85" rx="40" ry="8" fill="#B5894E" />
    </>
  ),

  barcake: () => (
    <>
      <Plate w={280} />
      <rect x="112" y="140" width="176" height="56" rx="8" fill="#E5C27E" />
      <rect x="112" y="140" width="176" height="56" rx="8" fill="url(#pa-crumb)" opacity=".4" />
      <path d="M112 152 q88 -22 176 0 v-4 q-88 -20 -176 0 Z" fill="#D9AE5F" />
      <rect x="112" y="140" width="176" height="56" rx="8" fill="url(#pa-sheen)" opacity=".45" />
      {[...Array(6)].map((_, i) => (
        <ellipse key={i} cx={136 + i * 26} cy={134} rx="9" ry="4" fill="#C9A063" transform={`rotate(${i * 24} ${136 + i * 26} 134)`} />
      ))}
    </>
  ),

  florentine: () => (
    <>
      <Plate w={250} />
      <ellipse cx="200" cy="160" rx="84" ry="30" fill="#3E2113" />
      <ellipse cx="200" cy="152" rx="84" ry="30" fill="#DBA253" />
      {[...Array(14)].map((_, i) => (
        <ellipse key={i} cx={146 + ((i * 47) % 108)} cy={140 + ((i * 29) % 24)} rx="13" ry="4" fill="#EFD3A0"
          transform={`rotate(${(i * 53) % 180} ${146 + ((i * 47) % 108)} ${140 + ((i * 29) % 24)})`} />
      ))}
      <ellipse cx="200" cy="152" rx="84" ry="30" fill="url(#pa-sheen)" opacity=".4" />
    </>
  ),

  palmier: () => (
    <>
      <Plate w={250} />
      <path d="M200 192 q-16 0 -16 -18 q-46 10 -64 -22 q-18 -34 30 -46 q36 -9 50 42 Z" fill="#DFAE63" />
      <path d="M200 192 q16 0 16 -18 q46 10 64 -22 q18 -34 -30 -46 q-36 -9 -50 42 Z" fill="#DFAE63" />
      <path d="M168 112 q-28 6 -18 26 q10 18 36 8" fill="none" stroke="#B8812F" strokeWidth="4" strokeLinecap="round" />
      <path d="M232 112 q28 6 18 26 q-10 18 -36 8" fill="none" stroke="#B8812F" strokeWidth="4" strokeLinecap="round" />
    </>
  ),

  sainthonore: () => (
    <>
      <Plate w={290} />
      <rect x="104" y="174" width="192" height="22" rx="5" fill="#E0B377" />
      <rect x="104" y="174" width="192" height="6" rx="3" fill="#F1D3A2" />
      {[120, 168, 232, 280].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="158" r="19" fill="#E3B678" />
          <path d={`M${cx - 19} 152 a19 19 0 0 1 38 0 Z`} fill="#C98227" />
        </g>
      ))}
      <path d="M140 170 q14 -34 28 -2 q14 -34 28 -2 q14 -34 28 -2 q14 -32 26 0" fill="none" stroke={C.cream} strokeWidth="18" strokeLinecap="round" />
      <path d="M142 162 q12 -24 26 -4" fill="none" stroke="#fff" strokeWidth="4" opacity=".5" strokeLinecap="round" />
    </>
  ),

  fraisier: () => (
    <>
      <Plate />
      <Slice layers={[{ h: 14, c: C.sponge, tex: 'pa-crumb' }, { h: 44, c: '#FDF4E2' }, { h: 14, c: C.sponge, tex: 'pa-crumb' }]}
        top={(ty, x, w) => <rect x={x} y={ty - 9} width={w} height="9" rx="2" fill="#F0D9A0" />} />
      {[...Array(5)].map((_, i) => (
        <g key={i} transform={`translate(${122 + i * 36} 150)`}>
          <path d="M0 -20 q17 0 17 14 q0 18 -17 26 q-17 -8 -17 -26 q0 -14 17 -14 Z" fill="#C2304F" />
          <path d="M0 -14 q11 0 11 10 q0 13 -11 19 q-11 -6 -11 -19 q0 -10 11 -10 Z" fill="#E05C74" />
        </g>
      ))}
    </>
  ),

  clafoutis: () => (
    <>
      <Plate />
      <path d="M100 204 q-6 -56 100 -58 q106 2 100 58 Z" fill="#F3DFAE" />
      <path d="M100 204 q-6 -56 100 -58 q106 2 100 58 Z" fill="url(#pa-crumb)" opacity=".3" />
      <path d="M104 162 q96 -22 192 0 q-4 -16 -96 -16 q-92 0 -96 16 Z" fill="#E0C388" />
      {[[146, 166], [188, 158], [232, 166], [268, 174], [166, 182], [214, 180]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="12" fill="#8E1F38" />
          <circle cx={cx - 4} cy={cy - 4} r="3.4" fill="#fff" opacity=".35" />
        </g>
      ))}
    </>
  ),

  galette: () => (
    <>
      <Plate />
      <ellipse cx="200" cy="170" rx="104" ry="42" fill="#C9903F" />
      <ellipse cx="200" cy="162" rx="104" ry="42" fill="#E0B069" />
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <path key={i} d={`M200 162 Q${200 + Math.cos(a) * 60} ${162 + Math.sin(a) * 18} ${200 + Math.cos(a) * 100} ${162 + Math.sin(a) * 40}`}
            fill="none" stroke="#B37C32" strokeWidth="2.6" strokeLinecap="round" opacity=".85" />
        );
      })}
      <ellipse cx="200" cy="162" rx="104" ry="42" fill="url(#pa-sheen)" opacity=".45" />
    </>
  ),

  painchoc: () => (
    <>
      <Plate w={290} />
      <rect x="108" y="124" width="184" height="78" rx="14" fill="#D79B50" />
      {[...Array(5)].map((_, i) => (
        <path key={i} d={`M${130 + i * 36} 126 q8 38 0 74`} stroke="#B87A32" strokeWidth="3" fill="none" opacity=".75" />
      ))}
      <rect x="150" y="150" width="14" height="28" rx="3" fill="#3E2318" />
      <rect x="236" y="150" width="14" height="28" rx="3" fill="#3E2318" />
      <rect x="108" y="124" width="184" height="78" rx="14" fill="url(#pa-sheen)" opacity=".45" />
    </>
  ),

  choctart: () => (
    <TartShell fill="#43261A" crust="#5E3A22" h={34} top={
      <g>
        <rect x="100" y="142" width="200" height="8" fill="#5E3A22" />
        <rect x="100" y="142" width="200" height="4" fill="#fff" opacity=".22" />
        <ellipse cx="168" cy="146" rx="30" ry="4" fill="#fff" opacity=".3" />
        {[...Array(5)].map((_, i) => (<rect key={i} x={140 + i * 28} y="136" width="4" height="4" rx="1.4" fill="#fff" opacity=".75" />))}
      </g>} />
  ),

  kouign: () => (
    <>
      <Plate w={250} />
      <path d="M122 192 q-6 -70 78 -72 q84 2 78 72 Z" fill="#B5721F" />
      <path d="M130 186 q-4 -58 70 -60 q74 2 70 60 Z" fill="#D99A3E" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${150 + i * 34} 128 q${i % 2 ? 14 : -14} 30 ${i % 2 ? 6 : -6} 58`} stroke="#9A5A18" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".8" />
      ))}
      <path d="M130 186 q-4 -58 70 -60 q74 2 70 60 Z" fill="url(#pa-sheen)" opacity=".5" />
      <ellipse cx="200" cy="196" rx="86" ry="10" fill="#7E4A10" opacity=".6" />
    </>
  ),

  roll: () => (
    <>
      <Plate w={250} />
      <Spiral c1={C.sponge} c2="#C2304F" turns={3.4} r={60} />
    </>
  ),

  cinnamonroll: () => (
    <>
      <Plate w={250} />
      <Spiral c1="#E3B678" c2="#8A5423" turns={3.4} r={62} />
      <path d="M142 118 q20 -14 40 -2 q20 12 40 -2 q18 -12 36 2" fill="none" stroke="#FFFDF8" strokeWidth="13" strokeLinecap="round" />
      <path d="M150 112 q16 -10 32 0" fill="none" stroke="#fff" strokeWidth="4" opacity=".6" strokeLinecap="round" />
    </>
  ),

  cannoli: () => (
    <g>
      <Plate w={280} />
      <g transform="rotate(-10 200 160)">
        <rect x="104" y="128" width="192" height="62" rx="31" fill="#C98A48" />
        <rect x="104" y="128" width="192" height="62" rx="31" fill="url(#pa-crumb)" opacity=".35" />
        {[...Array(9)].map((_, i) => (<circle key={i} cx={128 + i * 20} cy={142 + ((i * 29) % 34)} r="4" fill="#A86C2E" opacity=".5" />))}
        <rect x="104" y="128" width="192" height="62" rx="31" fill="url(#pa-sheen)" opacity=".45" />
        <ellipse cx="108" cy="159" rx="13" ry="30" fill="#FDF6E6" />
        <ellipse cx="292" cy="159" rx="13" ry="30" fill="#FDF6E6" />
        {[...Array(4)].map((_, i) => (<circle key={'p' + i} cx={102 + (i % 2) * 6} cy={144 + i * 10} r="4" fill={C.pistachio} />))}
        {[...Array(4)].map((_, i) => (<circle key={'q' + i} cx={296 - (i % 2) * 6} cy={144 + i * 10} r="4" fill={C.pistachio} />))}
      </g>
    </g>
  ),

  biscotti: () => (
    <>
      <Plate w={280} />
      <path d="M112 190 l24 -74 l156 0 l-24 74 Z" fill="#DFB87E" />
      <path d="M112 190 l24 -74 l156 0 l-24 74 Z" fill="url(#pa-crumb)" opacity=".4" />
      <path d="M136 116 l156 0 l-6 18 l-156 0 Z" fill="#E9CB9A" />
      {[[160, 150], [196, 138], [228, 162], [252, 136], [186, 170], [262, 170]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="11" ry="7" fill="#8A6239" transform={`rotate(${i * 31} ${cx} ${cy})`} />
      ))}
    </>
  ),

  panettone: () => (
    <>
      <Plate w={280} />
      <path d="M116 200 l10 -82 l148 0 l10 82 Z" fill="#D9B894" />
      <path d="M122 196 l9 -74 l138 0 l9 74 Z" fill="#E6D0B0" opacity=".6" />
      <path d="M126 122 q6 -46 74 -46 q68 0 74 46 Z" fill="#D79B50" />
      <path d="M172 86 l56 0 M200 78 l0 36" stroke="#A8692A" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      {[...Array(7)].map((_, i) => (<circle key={i} cx={142 + ((i * 53) % 118)} cy={142 + ((i * 31) % 46)} r="5" fill="#8A4A2A" opacity=".45" />))}
      <path d="M126 122 q6 -46 74 -46 q68 0 74 46 Z" fill="url(#pa-sheen)" opacity=".45" />
    </>
  ),

  caprese: () => (
    <>
      <Plate />
      <Slice layers={[{ h: 62, c: '#3E2117', tex: 'pa-crumb-dark' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty + 2} q${w * 0.25} -12 ${w * 0.5} -2 q${w * 0.25} 10 ${w * 0.5} 0 v6 h-${w} Z`} fill="#33190F" />
            {[...Array(18)].map((_, i) => (<circle key={i} cx={x + 8 + ((i * 59) % (w - 16))} cy={ty - 6 - ((i * 23) % 7)} r="1.7" fill="#fff" opacity=".85" />))}
          </>
        )} />
    </>
  ),

  strudel: () => (
    <>
      <Plate w={300} />
      <path d="M78 186 q10 -56 122 -56 q112 0 122 56 Z" fill="#DFB87E" />
      {[...Array(5)].map((_, i) => (
        <path key={i} d={`M${110 + i * 45} 136 q6 26 0 50`} stroke="#C09050" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".8" />
      ))}
      <path d="M120 150 q80 -16 160 0" stroke="#EFD3A0" strokeWidth="4" fill="none" opacity=".7" />
      <path d="M78 186 q10 -56 122 -56 q112 0 122 56 Z" fill="url(#pa-sheen)" opacity=".45" />
      {[...Array(16)].map((_, i) => (<circle key={'s' + i} cx={96 + ((i * 67) % 208)} cy={126 + ((i * 19) % 8)} r="1.6" fill="#fff" opacity=".75" />))}
    </>
  ),

  blackforest: () => (
    <>
      <Plate />
      <Slice layers={[
        { h: 20, c: '#43261A', tex: 'pa-crumb-dark' },
        { h: 13, c: '#FFFDF8' },
        { h: 10, c: '#8E1F38' },
        { h: 20, c: '#43261A', tex: 'pa-crumb-dark' },
        { h: 13, c: '#FFFDF8' },
        { h: 20, c: '#43261A', tex: 'pa-crumb-dark' },
      ]} top={(ty, x, w) => (
        <>
          <rect x={x - 5} y={ty - 13} width={w + 10} height="13" rx="3" fill="#FFFDF8" />
          <ellipse cx={x + w / 2} cy={ty - 20} rx="15" ry="9" fill="#FFFDF8" />
          <circle cx={x + w / 2} cy={ty - 30} r="10" fill="#8E1F38" />
          {[...Array(7)].map((_, i) => (
            <rect key={i} x={x + 8 + i * 24} y={ty - 24} width="5" height="11" rx="1.5" fill="#2E170D" transform={`rotate(${i * 19} ${x + 10 + i * 24} ${ty - 20})`} />
          ))}
        </>
      )} />
    </>
  ),

  linzer: () => (
    <>
      <Plate />
      <ellipse cx="200" cy="172" rx="104" ry="40" fill="#B8803C" />
      <ellipse cx="200" cy="164" rx="104" ry="40" fill="#CE9A54" />
      <ellipse cx="200" cy="164" rx="92" ry="33" fill="#9C2135" />
      {[-2, -1, 0, 1, 2].map((i) => (<path key={'a' + i} d={`M${152 + i * 30} 134 L${216 + i * 30} 196`} stroke="#CE9A54" strokeWidth="9" strokeLinecap="round" />))}
      {[-2, -1, 0, 1, 2].map((i) => (<path key={'b' + i} d={`M${184 + i * 30} 134 L${120 + i * 30} 196`} stroke="#CE9A54" strokeWidth="9" strokeLinecap="round" />))}
      <ellipse cx="200" cy="164" rx="104" ry="40" fill="none" stroke="#B8803C" strokeWidth="11" />
    </>
  ),

  bundt: () => (
    <>
      <Plate />
      <path d="M94 196 q-6 -72 106 -74 q112 2 106 74 Z" fill="#DFB87E" />
      <path d="M94 196 q-6 -72 106 -74 q112 2 106 74 Z" fill="url(#pa-crumb)" opacity=".35" />
      {[...Array(7)].map((_, i) => (
        <path key={i} d={`M${112 + i * 29} ${132 + Math.abs(3 - i) * 6} q6 32 0 62`} stroke="#C09050" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".5" />
      ))}
      <ellipse cx="200" cy="124" rx="34" ry="12" fill="#F4EAF6" />
      {[...Array(18)].map((_, i) => (<circle key={i} cx={102 + ((i * 71) % 196)} cy={118 + ((i * 23) % 12)} r="1.7" fill="#fff" opacity=".8" />))}
    </>
  ),

  stollen: () => (
    <>
      <Plate w={300} />
      <path d="M82 188 q14 -58 118 -58 q104 0 118 58 Z" fill="#E8DCC2" />
      <path d="M118 148 q82 -22 164 2 q-10 -20 -82 -20 q-72 0 -82 18 Z" fill="#F7F1E4" />
      {[...Array(9)].map((_, i) => (<circle key={i} cx={110 + ((i * 59) % 180)} cy={160 + ((i * 29) % 22)} r="5" fill="#A8692A" opacity=".3" />))}
      {[...Array(26)].map((_, i) => (<circle key={'s' + i} cx={92 + ((i * 73) % 216)} cy={126 + ((i * 31) % 16)} r={1.5 + ((i * 7) % 3) * 0.4} fill="#fff" />))}
    </>
  ),

  medovik: () => (
    <>
      <Plate />
      <Stack n={8} c1="#C08A48" c2="#FBF5E8" lh={7} gh={7} />
    </>
  ),

  scone: () => (
    <>
      <Plate w={250} />
      <path d="M128 192 l6 -56 l132 0 l6 56 Z" fill="#E3BE83" />
      <path d="M128 192 l6 -56 l132 0 l6 56 Z" fill="url(#pa-crumb)" opacity=".4" />
      <path d="M134 136 q66 -34 132 0 Z" fill="#D9A85F" />
      <rect x="130" y="158" width="140" height="7" fill="#FBF1DC" opacity=".9" />
      <path d="M136 160 q30 -10 60 2 q32 12 68 -2" stroke="#C2304F" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".85" />
      {[...Array(6)].map((_, i) => (<circle key={i} cx={148 + i * 22} cy={176 + ((i * 19) % 10)} r="4" fill="#8A5423" opacity=".45" />))}
    </>
  ),

  toffee: () => (
    <>
      <Plate />
      <rect x="118" y="134" width="164" height="68" rx="9" fill="#5A3417" />
      <rect x="118" y="134" width="164" height="68" rx="9" fill="url(#pa-crumb-dark)" />
      <path d="M110 140 q22 18 44 4 q24 -14 46 6 q22 18 46 2 q22 -14 44 2 v-18 h-180 Z" fill="#C47A2C" />
      <path d="M110 140 q22 18 44 4 q24 -14 46 6 q22 18 46 2 q22 -14 44 2" fill="none" stroke="#E8A95A" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="200" cy="206" rx="96" ry="10" fill="#C47A2C" opacity=".5" />
    </>
  ),

  etonmess: () => (
    <>
      <Plate w={210} y={216} />
      <path d="M150 82 h100 l-12 116 q-2 14 -16 14 h-44 q-14 0 -16 -14 Z" fill="#F3EEF6" opacity=".5" />
      <path d="M154 118 h92 l-10 80 q-1 10 -13 10 h-46 q-12 0 -13 -10 Z" fill="#FDF8FA" />
      {[[172, 134, '#C2304F'], [214, 128, '#FFFDF8'], [192, 152, '#E8D9C2'], [228, 158, '#C2304F'], [168, 170, '#FFFDF8'], [208, 182, '#E8D9C2'], [182, 194, '#C2304F']].map(([cx, cy, c], i) => (
        <circle key={i} cx={cx} cy={cy} r={11 - (i % 3) * 2} fill={c} />
      ))}
      <path d="M156 112 q44 -16 88 0 q-8 16 -44 16 q-36 0 -44 -16 Z" fill="#FFFDF8" />
      <circle cx="206" cy="102" r="11" fill="#C2304F" />
      <path d="M150 82 h100 l-12 116 q-2 14 -16 14 h-44 q-14 0 -16 -14 Z" fill="none" stroke="#DED2E6" strokeWidth="3" />
    </>
  ),

  banoffee: () => (
    <>
      <Plate />
      <Slice layers={[{ h: 16, c: C.crustDark }, { h: 16, c: '#B5721F' }, { h: 18, c: '#EFD9A0' }, { h: 26, c: '#FFFDF8' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty} q${w * 0.25} -12 ${w * 0.5} -2 q${w * 0.25} 10 ${w * 0.5} -4 v6 h-${w} Z`} fill="#FFFDF8" />
            {[...Array(9)].map((_, i) => (
              <rect key={i} x={x + 10 + i * 19} y={ty - 14} width="7" height="5" rx="2" fill="#3E2113" transform={`rotate(${i * 23} ${x + 13 + i * 19} ${ty - 12})`} />
            ))}
          </>
        )} />
      {[...Array(4)].map((_, i) => (
        <ellipse key={i} cx={132 + i * 46} cy={166} rx="20" ry="8" fill="#F3E0A8" stroke="#D9BE72" strokeWidth="1.6" />
      ))}
    </>
  ),

  victoria: () => (
    <>
      <Plate />
      <Slice layers={[
        { h: 32, c: '#EFD9A8', tex: 'pa-crumb' },
        { h: 10, c: '#C2304F' },
        { h: 14, c: '#FFFDF8' },
        { h: 32, c: '#EFD9A8', tex: 'pa-crumb' },
      ]} top={(ty, x, w) => (
        <g opacity=".9">
          {[...Array(16)].map((_, i) => (<circle key={i} cx={x + 8 + ((i * 61) % (w - 16))} cy={ty - 5 - ((i * 23) % 7)} r="1.7" fill="#fff" />))}
        </g>
      )} />
    </>
  ),

  crumble: () => (
    <>
      <Plate w={300} />
      <path d="M92 200 q-4 -14 10 -16 l196 0 q14 2 10 16 Z" fill="#EFE2E9" />
      <rect x="100" y="156" width="200" height="30" fill="#D9A85F" />
      {[[130, 166], [168, 174], [206, 164], [246, 176], [278, 166]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="16" ry="9" fill="#E8C98A" />
      ))}
      {[...Array(34)].map((_, i) => (
        <ellipse key={'c' + i} cx={106 + ((i * 53) % 190)} cy={126 + ((i * 29) % 30)} rx={6 + ((i * 7) % 4)} ry={5 + ((i * 5) % 3)} fill={i % 3 === 0 ? '#C9903F' : '#DFB87E'} />
      ))}
    </>
  ),

  bakewell: () => (
    <TartShell fill="#E8CE94" h={32} top={
      <g>
        <rect x="100" y="138" width="200" height="8" fill="#9C2135" />
        <rect x="100" y="126" width="200" height="12" rx="3" fill="#FBFAF4" />
        <rect x="100" y="126" width="200" height="5" rx="2" fill="#fff" opacity=".7" />
        <circle cx="200" cy="116" r="11" fill="#B22A46" />
      </g>} />
  ),

  applepie: () => (
    <>
      <Plate />
      <path d="M86 204 q-6 -22 18 -26 L296 178 q24 4 18 26 Z" fill="#C9903F" />
      <path d="M94 180 q4 -52 106 -54 q102 2 106 54 Z" fill="#E0B069" />
      {[...Array(4)].map((_, i) => (
        <path key={i} d={`M${152 + i * 32} ${142 + Math.abs(1.5 - i) * 6} l10 22`} stroke="#9A6A24" strokeWidth="3.4" strokeLinecap="round" />
      ))}
      <path d="M94 180 q4 -52 106 -54 q102 2 106 54" fill="none" stroke="#B37C32" strokeWidth="3" />
      <path d="M86 196 q22 -12 42 0 q22 12 44 0 q22 -12 44 0 q22 12 44 0 q20 -10 40 2" fill="none" stroke="#C9903F" strokeWidth="7" strokeLinecap="round" />
      <path d="M94 180 q4 -52 106 -54 q102 2 106 54 Z" fill="url(#pa-sheen)" opacity=".4" />
    </>
  ),

  pecanpie: () => (
    <TartShell fill="#8A5020" h={30} top={
      <g>
        {[[136, 138], [176, 132], [216, 138], [256, 132], [292, 140], [156, 148], [236, 148]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(${(i * 37) % 60})`}>
            <ellipse cx="0" cy="0" rx="17" ry="11" fill="#B5793A" />
            <path d="M0 -11 v22 M-12 -5 q6 6 0 12 M12 -5 q-6 6 0 12" stroke="#8A5020" strokeWidth="1.8" fill="none" />
          </g>
        ))}
      </g>} />
  ),

  keylime: () => (
    <>
      <Plate />
      <Slice layers={[{ h: 16, c: C.crustDark }, { h: 46, c: '#E6EFA8' }]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 5} width={w} height="5" fill="#D6E394" />
            <path d={`M${x + 10} ${ty - 5} q14 -22 28 -2 q14 -22 28 -2 q14 -22 28 -2 q14 -22 28 -2 q14 -20 26 0 v8 h-${w - 20} Z`} fill="#FFFDF8" />
            <circle cx={x + w / 2} cy={ty - 34} r="10" fill="#8FA84E" />
            <circle cx={x + w / 2} cy={ty - 34} r="7" fill="#C5D977" />
          </>
        )} />
    </>
  ),

  cupcake: () => (
    <>
      <Plate w={240} />
      <path d="M144 134 l12 70 q2 10 14 10 h60 q12 0 14 -10 l12 -70 Z" fill="#E3A8C0" />
      {[...Array(7)].map((_, i) => (<path key={i} d={`M${152 + i * 16} 136 l${4 + i} 76`} stroke="#C97F9E" strokeWidth="2.6" opacity=".65" />))}
      <path d="M144 134 h112 l-4 -22 q-52 -14 -104 0 Z" fill="#E8C78C" />
      <path d="M156 112 q6 -26 44 -24 q38 -2 44 24 q-14 -12 -30 -6 q-14 -16 -30 -2 q-16 -10 -28 8 Z" fill="#FBF3F7" />
      <path d="M164 96 q10 -24 36 -22 q26 -2 36 22 q-14 -10 -26 -4 q-12 -14 -24 -2 q-12 -8 -22 6 Z" fill="#FFFDFE" />
      <circle cx="200" cy="64" r="9" fill="#C2304F" />
    </>
  ),

  lemonbar: () => (
    <>
      <Plate w={270} />
      <Slice x={124} w={152} layers={[{ h: 22, c: '#E3BE83' }, { h: 44, c: '#F2D45E' }]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 4} width={w} height="4" fill="#E8C33C" />
            {[...Array(20)].map((_, i) => (<circle key={i} cx={x + 6 + ((i * 59) % (w - 12))} cy={ty - 7 - ((i * 23) % 8)} r="1.8" fill="#fff" />))}
          </>
        )} />
    </>
  ),

  waffle: () => (
    <>
      <Plate w={260} />
      <rect x="118" y="124" width="164" height="76" rx="18" fill="#D9A85F" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
        <rect key={`${r}-${c}`} x={128 + c * 38} y={134 + r * 24} width="30" height="16" rx="4" fill="#B8803C" />
      )))}
      <rect x="118" y="124" width="164" height="76" rx="18" fill="url(#pa-sheen)" opacity=".4" />
      {[...Array(10)].map((_, i) => (<circle key={i} cx={132 + ((i * 53) % 142)} cy={130 + ((i * 29) % 14)} r="3" fill="#F3E2B8" />))}
    </>
  ),

  pancake: () => (
    <>
      <Plate w={250} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx="200" cy={186 - i * 26} rx={82 - i * 2} ry="17" fill="#C9903F" />
          <ellipse cx="200" cy={182 - i * 26} rx={82 - i * 2} ry="17" fill="#E3B678" />
        </g>
      ))}
      <ellipse cx="200" cy="130" rx="80" ry="16" fill="#EFC992" />
      <path d="M160 124 q20 -8 40 -2 q20 6 38 -4 q-6 16 -38 18 q-34 -2 -40 -12 Z" fill="#C47A2C" />
      <rect x="186" y="106" width="28" height="12" rx="3" fill="#F7E8A8" />
      <path d="M130 136 q-6 18 2 30 M268 134 q8 16 0 28" stroke="#C47A2C" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),

  lamington: () => (
    <>
      <Plate w={250} />
      <rect x="134" y="118" width="132" height="86" rx="8" fill="#3E2113" />
      <rect x="142" y="126" width="116" height="70" rx="5" fill="#EFD9A8" />
      <rect x="142" y="126" width="116" height="70" rx="5" fill="url(#pa-crumb)" opacity=".4" />
      <rect x="134" y="118" width="132" height="86" rx="8" fill="none" stroke="#2E170D" strokeWidth="9" />
      {[...Array(40)].map((_, i) => (
        <ellipse key={i} cx={132 + ((i * 47) % 138)} cy={116 + ((i * 29) % 92)} rx="4" ry="2" fill="#FBF7EE"
          transform={`rotate(${(i * 43) % 180} ${132 + ((i * 47) % 138)} ${116 + ((i * 29) % 92)})`} />
      ))}
    </>
  ),

  nata: () => (
    <>
      <Plate w={240} />
      <path d="M132 134 l14 62 q2 10 14 10 h80 q12 0 14 -10 l14 -62 Z" fill="#D9A85F" />
      {[...Array(8)].map((_, i) => (<path key={i} d={`M${142 + i * 16} 136 l${3 + i * 0.6} 68`} stroke="#B8803C" strokeWidth="2.4" opacity=".65" />))}
      <ellipse cx="200" cy="134" rx="68" ry="20" fill="#E8C78C" />
      <ellipse cx="200" cy="132" rx="58" ry="16" fill="#F2D98E" />
      {[[172, 126], [206, 136], [230, 124], [190, 140]].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="12" ry="6" fill="#3E2113" opacity=".85" />
      ))}
      <ellipse cx="200" cy="132" rx="58" ry="16" fill="url(#pa-glass)" opacity=".45" />
    </>
  ),

  churros: () => (
    <>
      <Plate w={280} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`rotate(${-14 + i * 14} 200 160) translate(0 ${i * 4})`}>
          <rect x="96" y={140 + i * 4} width="208" height="24" rx="12" fill="#D99A3E" />
          {[...Array(14)].map((_, j) => (<rect key={j} x={100 + j * 15} y={140 + i * 4} width="5" height="24" rx="2.5" fill="#B8762A" opacity=".7" />))}
          <rect x="96" y={140 + i * 4} width="208" height="24" rx="12" fill="url(#pa-sheen)" opacity=".35" />
        </g>
      ))}
      {[...Array(16)].map((_, i) => (<circle key={i} cx={110 + ((i * 61) % 180)} cy={118 + ((i * 29) % 18)} r="1.8" fill="#C9903F" opacity=".9" />))}
    </>
  ),

  tresleches: () => (
    <>
      <Plate />
      <Slice layers={[{ h: 20, c: '#E3C98E' }, { h: 44, c: '#F3E3BE', tex: 'pa-crumb' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x - 4} ${ty} q${w * 0.17} -14 ${w * 0.33} -2 q${w * 0.17} 12 ${w * 0.34} -2 q${w * 0.17} -12 ${w * 0.33} 4 v8 h-${w + 8} Z`} fill="#FFFDF8" />
            {[...Array(12)].map((_, i) => (<circle key={i} cx={x + 10 + ((i * 53) % (w - 20))} cy={ty - 18 - ((i * 19) % 6)} r="1.6" fill="#A8692A" opacity=".85" />))}
          </>
        )} />
    </>
  ),

  brigadeiro: () => (
    <>
      <Plate w={260} />
      {[[152, 168, 32], [214, 158, 36], [266, 172, 28]].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#3A1D12" />
          {[...Array(16)].map((_, j) => (
            <circle key={j} cx={cx + Math.cos((j / 16) * 6.28) * (r - 5)} cy={cy + Math.sin((j / 16) * 6.28) * (r - 5)} r="4" fill="#23110A" />
          ))}
          <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.2} fill="#fff" opacity=".16" />
        </g>
      ))}
    </>
  ),

  alfajor: () => (
    <>
      <Plate w={250} />
      <ellipse cx="200" cy="186" rx="76" ry="20" fill="#EFDCB0" />
      <rect x="124" y="150" width="152" height="30" fill="#B5721F" />
      <ellipse cx="200" cy="150" rx="76" ry="20" fill="#F7EBCE" />
      <ellipse cx="200" cy="146" rx="76" ry="20" fill="#FBF3DE" />
      {[...Array(24)].map((_, i) => (
        <ellipse key={i} cx={126 + ((i * 41) % 148)} cy={152 + ((i * 17) % 28)} rx="4" ry="2" fill="#FBF7EE"
          transform={`rotate(${(i * 51) % 180} ${126 + ((i * 41) % 148)} ${152 + ((i * 17) % 28)})`} />
      ))}
    </>
  ),

  millecrepe: () => (
    <>
      <Plate />
      <Stack n={11} c1="#E8C78C" c2="#FDF6E6" lh={4} gh={6} />
    </>
  ),

  shortcake: () => (
    <>
      <Plate />
      <Slice layers={[
        { h: 20, c: '#FBF0DC', tex: 'pa-crumb' },
        { h: 16, c: '#FFFDF8' },
        { h: 20, c: '#FBF0DC', tex: 'pa-crumb' },
        { h: 16, c: '#FFFDF8' },
        { h: 20, c: '#FBF0DC', tex: 'pa-crumb' },
      ]} top={(ty, x, w) => (
        <>
          <rect x={x - 5} y={ty - 12} width={w + 10} height="12" rx="3" fill="#FFFDF8" />
          <g transform={`translate(${x + w / 2} ${ty - 28})`}>
            <path d="M0 -14 q15 0 15 12 q0 16 -15 23 q-15 -7 -15 -23 q0 -12 15 -12 Z" fill="#C2304F" />
            <path d="M0 -14 q-6 -8 -14 -8 q6 6 8 9" fill="#4E7352" />
          </g>
        </>
      )} />
      {[...Array(4)].map((_, i) => (
        <path key={i} d={`M${132 + i * 44} 150 q13 0 13 10 q0 13 -13 19 q-13 -6 -13 -19 q0 -10 13 -10 Z`} fill="#C2304F" />
      ))}
    </>
  ),

  knafeh: () => (
    <>
      <Plate w={300} />
      <Slice x={104} w={192} layers={[{ h: 20, c: '#D9873A' }, { h: 30, c: '#FDF8EE' }, { h: 22, c: '#E09A3E' }]}
        top={(ty, x, w) => (
          <>
            {[...Array(22)].map((_, i) => (
              <path key={i} d={`M${x + 4 + i * 8.6} ${ty} q3 -9 0 -14`} stroke="#C96E22" strokeWidth="3" fill="none" strokeLinecap="round" />
            ))}
            {[...Array(9)].map((_, i) => (
              <ellipse key={'p' + i} cx={x + 16 + i * 21} cy={ty - 18} rx="6" ry="4" fill={C.pistachio} transform={`rotate(${i * 29} ${x + 16 + i * 21} ${ty - 18})`} />
            ))}
          </>
        )} />
      <path d="M112 164 q46 14 88 2 q44 -12 88 4" stroke="#FFFDF8" strokeWidth="5" fill="none" opacity=".65" strokeLinecap="round" />
    </>
  ),

  baklava: () => (
    <>
      <Plate w={280} />
      <Stack n={5} c1="#E3BE83" c2="#8A6239" x={118} w={164} baseY={196} lh={7} gh={5} />
      <path d="M118 136 l164 0" stroke="#D9A85F" strokeWidth="5" />
      {[...Array(8)].map((_, i) => (
        <ellipse key={i} cx={134 + i * 22} cy={128} rx="7" ry="4.5" fill={C.pistachio} transform={`rotate(${i * 33} ${134 + i * 22} 128)`} />
      ))}
      <path d="M118 194 q40 10 82 0 q42 -10 82 2" stroke="#C9903F" strokeWidth="5" fill="none" opacity=".65" strokeLinecap="round" />
    </>
  ),

  basbousa: () => (
    <>
      <Plate w={270} />
      <path d="M200 110 l78 46 l-78 46 l-78 -46 Z" fill="#E0B069" />
      <path d="M200 110 l78 46 l-78 46 l-78 -46 Z" fill="url(#pa-crumb)" opacity=".45" />
      <path d="M200 116 l68 40 l-68 40 l-68 -40 Z" fill="none" stroke="#C9903F" strokeWidth="2.4" opacity=".7" />
      <ellipse cx="200" cy="152" rx="13" ry="9" fill="#C9A063" />
      <ellipse cx="197" cy="149" rx="4" ry="2.6" fill="#E8D4A8" />
      <path d="M200 110 l78 46 l-78 46 l-78 -46 Z" fill="url(#pa-sheen)" opacity=".4" />
    </>
  ),

  tahinicookie: () => <Disc fill="#E8D6B0" rim="#D6C097" rx={76} ry={36} />,

  datecake: () => (
    <>
      <Plate w={280} />
      <Slice x={118} w={164} layers={[{ h: 82, c: '#5E3A1E', tex: 'pa-crumb-dark' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x - 3} ${ty + 2} q${w * 0.25} -14 ${w * 0.5} -4 q${w * 0.25} 12 ${w * 0.5} -4 v10 h-${w + 6} Z`} fill="#8A5020" />
            <path d={`M${x - 3} ${ty + 2} q${w * 0.25} -14 ${w * 0.5} -4 q${w * 0.25} 12 ${w * 0.5} -4`} fill="none" stroke="#C47A2C" strokeWidth="5" strokeLinecap="round" />
          </>
        )} />
      {[...Array(7)].map((_, i) => (
        <ellipse key={i} cx={134 + ((i * 59) % 132)} cy={158 + ((i * 31) % 40)} rx="8" ry="5" fill="#C9A063" opacity=".85"
          transform={`rotate(${i * 37} ${134 + ((i * 59) % 132)} ${158 + ((i * 31) % 40)})`} />
      ))}
    </>
  ),

  poppy: () => (
    <>
      <Plate w={280} />
      <Slice x={118} w={164} layers={[
        { h: 26, c: '#F0DCA8', tex: 'pa-crumb' },
        { h: 24, c: '#2E2630' },
        { h: 30, c: '#F0DCA8', tex: 'pa-crumb' },
      ]} top={(ty, x, w) => (
        <path d={`M${x} ${ty + 2} Q${x + w / 2} ${ty - 16} ${x + w} ${ty + 2} Z`} fill="#E3C98E" />
      )} />
    </>
  ),

  hamantasch: () => (
    <>
      <Plate w={250} />
      <path d="M200 102 L286 196 L114 196 Z" fill="#E8C78C" />
      <path d="M200 102 L286 196 L114 196 Z" fill="url(#pa-crumb)" opacity=".35" />
      <path d="M200 128 L252 186 L148 186 Z" fill="#3E2318" />
      <path d="M200 102 L252 186 M200 102 L148 186 M148 186 L252 186" stroke="#D9A85F" strokeWidth="13" strokeLinejoin="round" />
      <path d="M200 102 L286 196 L114 196 Z" fill="url(#pa-sheen)" opacity=".35" />
    </>
  ),

  coconut: () => (
    <>
      <Plate w={250} />
      {[[156, 166, 34], [218, 158, 38], [268, 172, 28]].map(([cx, cy, r], i) => (
        <g key={i}>
          <path d={`M${cx - r} ${cy + r * 0.7} q${r * 0.1} -${r * 1.7} ${r} -${r * 1.7} q${r * 0.9} 0 ${r} ${r * 1.7} Z`} fill="#F3E6C8" />
          {[...Array(20)].map((_, j) => (
            <ellipse key={j} cx={cx - r + 6 + ((j * 29) % (r * 2 - 12))} cy={cy - r * 0.9 + ((j * 19) % (r * 1.5))} rx="4" ry="2" fill="#E0CDA4"
              transform={`rotate(${(j * 47) % 180} ${cx - r + 6 + ((j * 29) % (r * 2 - 12))} ${cy - r * 0.9 + ((j * 19) % (r * 1.5))})`} />
          ))}
          <path d={`M${cx - r} ${cy + r * 0.7} h${r * 2}`} stroke="#C9903F" strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </>
  ),

  challah: () => (
    <>
      <Plate w={300} />
      <g>
        <path d="M80 182 q16 -44 120 -44 q104 0 120 44 q-20 16 -120 16 q-100 0 -120 -16 Z" fill="#C9903F" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <path
              d={`M${94 + i * 44} 176 q14 -34 44 -32 q30 2 40 30`}
              fill="#E0B069"
              stroke="#B37C32"
              strokeWidth="2.4"
            />
            <path d={`M${104 + i * 44} 152 q14 -10 28 -2`} stroke="#F0CE96" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".8" />
          </g>
        ))}
        <path d="M80 182 q16 -44 120 -44 q104 0 120 44 q-20 16 -120 16 q-100 0 -120 -16 Z" fill="url(#pa-sheen)" opacity=".4" />
        <g opacity=".9">
          {[...Array(26)].map((_, i) => (
            <circle key={i} cx={96 + ((i * 59) % 212)} cy={142 + ((i * 29) % 34)} r="1.7" fill="#F7EBD0" />
          ))}
        </g>
      </g>
    </>
  ),

  boule: () => (
    <>
      <Plate />
      <g>
        <ellipse cx="200" cy="200" rx="112" ry="16" fill="#A8692A" opacity=".5" />
        <path d="M90 198 q-8 -84 110 -86 q118 2 110 86 Z" fill="#B5721F" />
        <path d="M90 198 q-8 -84 110 -86 q118 2 110 86 Z" fill="url(#pa-crumb)" opacity=".3" />
        <path d="M90 198 q-8 -84 110 -86 q118 2 110 86 Z" fill="url(#pa-sheen)" opacity=".4" />
        <path d="M134 136 q46 -22 92 8" stroke="#6E3A1C" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M138 132 q44 -20 88 8" stroke="#E8C98A" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M112 164 q26 -10 48 2 M246 160 q-22 -8 -42 4" stroke="#8A5020" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6" />
      </g>
    </>
  ),

  focaccia: () => (
    <>
      <Plate w={310} />
      <g>
        <rect x="86" y="132" width="228" height="66" rx="10" fill="#C9903F" />
        <rect x="86" y="132" width="228" height="58" rx="10" fill="#E8BE78" />
        <rect x="86" y="132" width="228" height="58" rx="10" fill="url(#pa-crumb)" opacity=".35" />
        <g>
          {[...Array(14)].map((_, i) => (
            <ellipse
              key={i}
              cx={104 + (i % 7) * 32}
              cy={150 + Math.floor(i / 7) * 26}
              rx="8"
              ry="5"
              fill="#C08A42"
              opacity=".75"
            />
          ))}
        </g>
        <rect x="86" y="132" width="228" height="58" rx="10" fill="url(#pa-sheen)" opacity=".45" />
        <g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${124 + i * 66} 142 q14 6 26 -2`}
              stroke="#4E7352"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <circle key={'s' + i} cx={100 + ((i * 61) % 200)} cy={138 + ((i * 17) % 10)} r="1.8" fill="#fff" opacity=".9" />
          ))}
        </g>
      </g>
    </>
  ),

  baguette: () => (
    <>
      <Plate w={320} />
      <g transform="rotate(-7 200 162)">
        <rect x="56" y="134" width="288" height="56" rx="28" fill="#C9903F" />
        <rect x="56" y="134" width="288" height="56" rx="28" fill="url(#pa-crumb)" opacity=".3" />
        <rect x="56" y="134" width="288" height="56" rx="28" fill="url(#pa-sheen)" opacity=".5" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M${96 + i * 66} 176 l34 -32`} stroke="#7E4A10" strokeWidth="7" strokeLinecap="round" />
            <path d={`M${99 + i * 66} 173 l30 -28`} stroke="#F0CE96" strokeWidth="4" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </>
  ),

  buns: () => (
    <>
      <Plate w={280} />
      <g>
        {[
          [136, 168, 44],
          [200, 160, 48],
          [264, 168, 44],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <path d={`M${cx - r} ${cy + 26} q-4 -${r + 4} ${r} -${r + 4} q${r + 4} 0 ${r} ${r + 4} Z`} fill="#D9A85F" />
            <path d={`M${cx - r} ${cy + 26} q-4 -${r + 4} ${r} -${r + 4} q${r + 4} 0 ${r} ${r + 4} Z`} fill="url(#pa-sheen)" opacity=".55" />
            <ellipse cx={cx - r * 0.25} cy={cy - r * 0.3} rx={r * 0.3} ry="7" fill="#fff" opacity=".3" transform={`rotate(-16 ${cx - r * 0.25} ${cy - r * 0.3})`} />
            {[...Array(5)].map((_, j) => (
              <circle key={j} cx={cx - 20 + j * 10} cy={cy - r * 0.55 + ((j * 13) % 9)} r="1.8" fill="#F7EBD0" />
            ))}
          </g>
        ))}
        <rect x="88" y="190" width="224" height="6" rx="3" fill="#C08A42" opacity=".6" />
      </g>
    </>
  ),

  flatbread: () => (
    <>
      <Plate w={280} />
      <g>
        <ellipse cx="200" cy="178" rx="118" ry="30" fill="#C9903F" />
        <path d="M82 172 q0 -52 118 -52 q118 0 118 52 q-24 20 -118 20 q-94 0 -118 -20 Z" fill="#E3BE83" />
        <path d="M82 172 q0 -52 118 -52 q118 0 118 52 q-24 20 -118 20 q-94 0 -118 -20 Z" fill="url(#pa-sheen)" opacity=".5" />
        <g opacity=".85">
          {[
            [146, 142, 13],
            [206, 132, 16],
            [258, 146, 11],
            [176, 162, 9],
            [238, 166, 8],
          ].map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.6} fill="#8A5020" opacity=".55" />
          ))}
        </g>
        <path d="M100 166 q50 -30 100 -30 q50 0 100 30" fill="none" stroke="#C08A42" strokeWidth="3" opacity=".6" />
      </g>
    </>
  ),

  pretzel: () => (
    <>
      <Plate w={270} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M200 196 q-96 0 -96 -56 q0 -34 32 -34 q30 0 38 34 l26 56 l26 -56 q8 -34 38 -34 q32 0 32 34 q0 56 -96 56 Z"
          stroke="#8A5020"
          strokeWidth="26"
        />
        <path
          d="M200 196 q-96 0 -96 -56 q0 -34 32 -34 q30 0 38 34 l26 56 l26 -56 q8 -34 38 -34 q32 0 32 34 q0 56 -96 56 Z"
          stroke="#B5721F"
          strokeWidth="19"
        />
        <path d="M152 124 q16 10 22 26" stroke="#E8C98A" strokeWidth="4" opacity=".7" />
        <path d="M248 124 q-16 10 -22 26" stroke="#E8C98A" strokeWidth="4" opacity=".7" />
      </g>
      <g>
        {[...Array(12)].map((_, i) => (
          <rect key={i} x={118 + ((i * 53) % 164)} y={128 + ((i * 31) % 54)} width="4" height="4" rx="1.4" fill="#fff" opacity=".95" />
        ))}
      </g>
    </>
  ),

  loaf: () => (
    <>
      <Plate w={290} />
      <Slice
        x={110}
        w={180}
        layers={[{ h: 84, c: '#6B4A2E', tex: 'pa-crumb-dark' }]}
        top={(ty, x, w) => (
          <>
            <path d={`M${x} ${ty + 2} q${w * 0.25} -20 ${w * 0.5} -18 q${w * 0.25} -2 ${w * 0.5} 18 Z`} fill="#4A3119" />
            <path d={`M${x} ${ty + 2} q${w * 0.25} -20 ${w * 0.5} -18 q${w * 0.25} -2 ${w * 0.5} 18`} fill="none" stroke="#8A5F3A" strokeWidth="3" />
          </>
        )}
      />
      <g opacity=".6">
        {[...Array(12)].map((_, i) => (
          <ellipse key={i} cx={126 + ((i * 61) % 148)} cy={150 + ((i * 29) % 44)} rx="4" ry="2.6" fill="#2E1D10" />
        ))}
      </g>
      <rect x="110" y="120" width="180" height="84" fill="url(#pa-sheen)" opacity=".3" />
    </>
  ),

  pizza: () => (
    <>
      <Plate w={300} />
      <g>
        <path d="M200 92 L302 188 q-48 20 -102 20 q-54 0 -102 -20 Z" fill="#E0B069" />
        <path d="M200 110 L286 184 q-42 16 -86 16 q-44 0 -86 -16 Z" fill="#C2304F" opacity=".85" />
        <path d="M98 188 q48 20 102 20 q54 0 102 -20 q6 14 -6 16 q-46 12 -96 12 q-50 0 -96 -12 q-12 -2 -6 -16 Z" fill="#D9A85F" />
        <g>
          {[
            [200, 150, 15],
            [168, 176, 12],
            [236, 174, 12],
            [200, 192, 10],
          ].map(([cx, cy, r], i) => (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.72} fill="#FBF3E0" />
              <ellipse cx={cx - r * 0.25} cy={cy - r * 0.2} rx={r * 0.35} ry={r * 0.22} fill="#fff" opacity=".6" />
            </g>
          ))}
          {[...Array(5)].map((_, i) => (
            <path key={'b' + i} d={`M${166 + i * 18} ${140 + ((i * 17) % 16)} q7 5 0 9`} stroke="#4E7352" strokeWidth="3" fill="none" strokeLinecap="round" />
          ))}
        </g>
        <g opacity=".8">
          {[...Array(8)].map((_, i) => (
            <circle key={i} cx={116 + ((i * 59) % 172)} cy={190 + ((i * 13) % 12)} r="3" fill="#6E3A1C" />
          ))}
        </g>
      </g>
    </>
  ),

  danish: () => (
    <>
      <Plate w={260} />
      <g>
        <path
          d="M200 96 l32 36 l44 -8 l-8 44 l32 32 l-32 32 l8 44 l-44 -8 l-32 36 l-32 -36 l-44 8 l8 -44 l-32 -32 l32 -32 l-8 -44 l44 8 Z"
          fill="#E0B069"
        />
        <path
          d="M200 96 l32 36 l44 -8 l-8 44 l32 32 l-32 32 l8 44 l-44 -8 l-32 36 l-32 -36 l-44 8 l8 -44 l-32 -32 l32 -32 l-8 -44 l44 8 Z"
          fill="url(#pa-sheen)"
          opacity=".5"
        />
        <circle cx="200" cy="168" r="42" fill="#FBF7EE" />
        <circle cx="200" cy="168" r="42" fill="url(#pa-glass)" opacity=".4" />
        <circle cx="200" cy="168" r="18" fill="#9C2135" />
        <circle cx="194" cy="162" r="5" fill="#fff" opacity=".35" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M200 168 L${200 + Math.cos((i / 4) * 6.28 + 0.78) * 60} ${168 + Math.sin((i / 4) * 6.28 + 0.78) * 60}`}
            stroke="#C08A42"
            strokeWidth="3"
            opacity=".6"
          />
        ))}
      </g>
    </>
  ),

  chocbar: () => (
    <>
      <Plate w={280} />
      <g transform="rotate(-6 200 160)">
        <rect x="96" y="112" width="208" height="100" rx="6" fill="#2E170D" />
        <rect x="96" y="112" width="208" height="96" rx="6" fill="#4A2619" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={104 + c * 51}
              y={119 + r * 30}
              width="44"
              height="23"
              rx="3"
              fill="#5E3220"
            />
          ))
        )}
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => (
            <rect
              key={`h${r}-${c}`}
              x={106 + c * 51}
              y={121 + r * 30}
              width="40"
              height="6"
              rx="3"
              fill="#fff"
              opacity=".13"
            />
          ))
        )}
        <rect x="96" y="112" width="208" height="96" rx="6" fill="url(#pa-sheen)" opacity=".55" />
        <ellipse cx="150" cy="128" rx="34" ry="8" fill="#fff" opacity=".25" transform="rotate(-10 150 128)" />
      </g>
    </>
  ),

  truffle: () => (
    <>
      <Plate w={260} />
      <g>
        {[
          [150, 170, 34],
          [212, 160, 38],
          [266, 174, 29],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="#43261A" />
            <circle cx={cx} cy={cy} r={r} fill="url(#pa-crumb-dark)" opacity=".6" />
            {[...Array(26)].map((_, j) => (
              <circle
                key={j}
                cx={cx - r + 4 + ((j * 29) % (r * 2 - 8))}
                cy={cy - r + 6 + ((j * 37) % (r * 2 - 12))}
                r="1.5"
                fill="#6B4430"
                opacity=".75"
              />
            ))}
            <ellipse cx={cx - r * 0.32} cy={cy - r * 0.42} rx={r * 0.28} ry={r * 0.16} fill="#fff" opacity=".12" />
          </g>
        ))}
      </g>
    </>
  ),

  praline: () => (
    <>
      <Plate w={270} />
      <g>
        <path d="M112 196 q-6 -72 88 -72 q94 0 88 72 Z" fill="#3A1D12" />
        <path d="M122 190 q-5 -58 78 -58 q83 0 78 58 Z" fill="#8A5020" />
        <path d="M122 190 q-5 -58 78 -58 q83 0 78 58 Z" fill="url(#pa-glass)" opacity=".3" />
        <path d="M112 196 q-6 -72 88 -72 q94 0 88 72 Z" fill="url(#pa-sheen)" opacity=".6" />
        <rect x="112" y="192" width="176" height="10" rx="4" fill="#2E170D" />
        <ellipse cx="166" cy="146" rx="26" ry="10" fill="#fff" opacity=".4" transform="rotate(-18 166 146)" />
        <path d="M152 124 q24 -10 48 -2 q24 8 46 -2" stroke="#C2304F" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".9" />
      </g>
    </>
  ),

  molten: () => (
    <>
      <Plate w={280} />
      <g>
        <path d="M118 198 q-6 -70 82 -70 q88 0 82 70 Z" fill="#3E2117" />
        <path d="M118 198 q-6 -70 82 -70 q88 0 82 70 Z" fill="url(#pa-crumb-dark)" opacity=".7" />
        <path
          d="M164 142 q20 -16 40 -6 q-4 36 10 56 q-30 10 -56 -6 q-10 -26 6 -44 Z"
          fill="#6B3F1E"
        />
        <path d="M176 176 q18 20 10 38 q-22 6 -34 -10 q6 -18 24 -28 Z" fill="#8A5020" />
        <path d="M186 196 q10 16 2 30" stroke="#A8692A" strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="200" cy="212" rx="44" ry="9" fill="#8A5020" opacity=".75" />
        <path d="M118 198 q-6 -70 82 -70 q88 0 82 70 Z" fill="url(#pa-sheen)" opacity=".3" />
        <g>
          {[...Array(10)].map((_, i) => (
            <circle key={i} cx={132 + ((i * 59) % 136)} cy={126 + ((i * 17) % 10)} r="1.6" fill="#fff" opacity=".75" />
          ))}
        </g>
      </g>
    </>
  ),

  salami: () => (
    <>
      <Plate w={290} />
      <g>
        <rect x="88" y="130" width="150" height="76" rx="34" fill="#3E2318" transform="rotate(-6 160 168)" />
        <g transform="rotate(-6 160 168)">
          {[...Array(16)].map((_, i) => (
            <rect
              key={i}
              x={98 + ((i * 41) % 128)}
              y={140 + ((i * 29) % 54)}
              width="12"
              height="9"
              rx="2.5"
              fill="#E8DCC2"
              opacity=".9"
              transform={`rotate(${(i * 47) % 90} ${104 + ((i * 41) % 128)} ${144 + ((i * 29) % 54)})`}
            />
          ))}
          <rect x="88" y="130" width="150" height="76" rx="34" fill="url(#pa-sheen)" opacity=".3" />
        </g>
        {[262, 300].map((cx, i) => (
          <g key={i} transform={`translate(${cx} ${172 + i * 6}) rotate(${-10 + i * 16})`}>
            <ellipse cx="0" cy="0" rx="32" ry="30" fill="#3E2318" />
            {[...Array(9)].map((_, j) => (
              <rect
                key={j}
                x={-22 + ((j * 17) % 40)}
                y={-20 + ((j * 23) % 38)}
                width="10"
                height="8"
                rx="2"
                fill="#E8DCC2"
                transform={`rotate(${(j * 53) % 90} ${-18 + ((j * 17) % 40)} ${-16 + ((j * 23) % 38)})`}
              />
            ))}
            <ellipse cx="0" cy="0" rx="32" ry="30" fill="none" stroke="#FBF7EE" strokeWidth="2.5" opacity=".8" />
          </g>
        ))}
      </g>
    </>
  ),

  spread: () => (
    <>
      <Plate w={230} y={214} />
      <g>
        <path d="M142 104 h116 v88 q0 14 -16 14 h-84 q-16 0 -16 -14 Z" fill="#F3EEF6" opacity=".5" />
        <path d="M146 122 h108 v70 q0 10 -14 10 h-80 q-14 0 -14 -10 Z" fill="#5E3220" />
        <path d="M146 122 h108 v12 h-108 Z" fill="#7A4630" />
        <path d="M146 122 h108 v70 q0 10 -14 10 h-80 q-14 0 -14 -10 Z" fill="url(#pa-sheen)" opacity=".35" />
        <rect x="136" y="92" width="128" height="18" rx="5" fill="#B5894E" />
        <rect x="136" y="92" width="128" height="7" rx="3.5" fill="#D9B477" />
        <path d="M142 104 h116 v88 q0 14 -16 14 h-84 q-16 0 -16 -14 Z" fill="none" stroke="#DED2E6" strokeWidth="3" />
        <g>
          {[...Array(5)].map((_, i) => (
            <ellipse key={i} cx={162 + i * 20} cy={150 + ((i * 19) % 24)} rx="7" ry="6" fill="#8A5F3A" opacity=".5" />
          ))}
        </g>
      </g>
    </>
  ),

  hotchoc: () => (
    <>
      <Plate w={240} y={212} />
      <g>
        <path d="M128 110 h126 l-10 84 q-2 14 -18 14 h-70 q-16 0 -18 -14 Z" fill="#FBF7FC" />
        <path d="M128 110 h126 l-10 84 q-2 14 -18 14 h-70 q-16 0 -18 -14 Z" fill="url(#pa-glass)" opacity=".5" />
        <ellipse cx="191" cy="110" rx="63" ry="15" fill="#F0E8F3" />
        <ellipse cx="191" cy="110" rx="55" ry="12" fill="#3E2117" />
        <ellipse cx="191" cy="108" rx="42" ry="9" fill="#FBF7EE" opacity=".9" />
        <ellipse cx="178" cy="106" rx="14" ry="4" fill="#fff" />
        <path
          d="M254 128 q34 -4 34 24 q0 26 -32 26"
          fill="none"
          stroke="#F0E8F3"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <g opacity=".85">
          {[...Array(4)].map((_, i) => (
            <circle key={i} cx={172 + i * 14} cy={104 + ((i * 11) % 5)} r="2.4" fill="#6B4430" />
          ))}
        </g>
      </g>
    </>
  ),

  fudge: () => (
    <>
      <Plate w={270} />
      <g>
        {[
          [146, 170],
          [212, 158],
          [262, 178],
        ].map(([x, y], i) => (
          <g key={i} transform={`rotate(${-8 + i * 7} ${x} ${y})`}>
            <rect x={x - 42} y={y - 32} width="84" height="64" rx="5" fill="#2E170D" />
            <rect x={x - 42} y={y - 32} width="84" height="58" rx="5" fill="#4A2619" />
            <rect x={x - 42} y={y - 32} width="84" height="12" rx="5" fill="#5E3220" />
            <rect x={x - 42} y={y - 32} width="84" height="58" rx="5" fill="url(#pa-crumb-dark)" opacity=".5" />
            {[...Array(4)].map((_, j) => (
              <circle key={j} cx={x - 26 + j * 17} cy={y - 18 + ((j * 13) % 30)} r="4" fill="#B5793A" opacity=".85" />
            ))}
            {[...Array(3)].map((_, j) => (
              <rect key={'s' + j} x={x - 20 + j * 18} y={y - 30} width="3.4" height="3.4" rx="1.2" fill="#fff" opacity=".9" />
            ))}
          </g>
        ))}
      </g>
    </>
  ),

  // ---- מאפים מלוחים ופאים ----

  roughpuff: () => (
    <>
      <Plate w={300} />
      {/* גוש בצק מקופל — חתך של שכבות בצק וחמאה */}
      <g>
        <rect x="92" y="106" width="216" height="94" rx="8" fill="#C9A062" />
        {[...Array(9)].map((_, i) => (
          <g key={i}>
            <rect x="92" y={108 + i * 10} width="216" height="5.5" fill="#FAEFD2" />
            <rect x="92" y={113.5 + i * 10} width="216" height="4.5" fill={C.butter} />
          </g>
        ))}
        <rect x="92" y="106" width="216" height="94" rx="8" fill="url(#pa-sheen)" opacity=".45" />
        <rect x="92" y="106" width="216" height="94" rx="8" fill="none" stroke="#B88F52" strokeWidth="2.5" />
        {/* קו הקיפול */}
        <path d="M200 106 v94" stroke="#B88F52" strokeWidth="2" opacity=".45" strokeDasharray="5 6" />
      </g>
      {/* קמח על המשטח */}
      <g opacity=".65">
        {[...Array(13)].map((_, i) => (
          <circle key={i} cx={66 + ((i * 59) % 272)} cy={207 + ((i * 17) % 8)} r={1.3 + (i % 3) * 0.5} fill="#fff" />
        ))}
      </g>
    </>
  ),

  boureka: () => (
    <>
      <Plate w={310} />
      <g>
        {[
          [112, 50, -8],
          [202, 56, 4],
          [292, 48, 9],
        ].map(([cx, s, rot], i) => (
          <g key={i} transform={`rotate(${rot} ${cx} 160)`}>
            <path d={`M${cx - s} 198 L${cx + s} 198 L${cx} ${198 - s * 1.6} Z`} fill="#AF722E" />
            <path d={`M${cx - s + 5} 193 L${cx + s - 5} 193 L${cx} ${201 - s * 1.6} Z`} fill="#E3AB5E" />
            <path d={`M${cx - s + 5} 193 L${cx + s - 5} 193 L${cx} ${201 - s * 1.6} Z`} fill="url(#pa-sheen)" opacity=".5" />
            {[
              [0, 0.16], [-0.6, 0.12], [0.58, 0.14], [-0.3, 0.38],
              [0.34, 0.4], [0.02, 0.56], [-0.42, 0.62], [0.3, 0.68],
            ].map(([u, f], j) => (
              <ellipse
                key={j}
                cx={cx + u * s * (1 - f) * 0.82}
                cy={193 - f * s * 1.55}
                rx="3"
                ry="2.1"
                fill="#FBF3DC"
              />
            ))}
          </g>
        ))}
      </g>
    </>
  ),

  sambusak: () => (
    <>
      <Plate w={300} />
      <g>
        {[
          [138, 76, -6],
          [262, 68, 8],
        ].map(([cx, r, rot], i) => (
          <g key={i} transform={`rotate(${rot} ${cx} 170)`}>
            <path d={`M${cx - r} 192 A${r} ${r * 0.95} 0 0 1 ${cx + r} 192 Z`} fill="#AF722E" />
            <path d={`M${cx - r + 4} 188 A${r - 6} ${r * 0.86} 0 0 1 ${cx + r - 4} 188 Z`} fill="#E3AB5E" />
            {[...Array(10)].map((_, j) => {
              const a = Math.PI * (1 - j / 9);
              return (
                <circle
                  key={j}
                  cx={cx + Math.cos(a) * (r - 3)}
                  cy={192 - Math.sin(a) * (r * 0.95 - 3)}
                  r="5"
                  fill="#CF9446"
                />
              );
            })}
            <path d={`M${cx - r + 4} 188 A${r - 6} ${r * 0.86} 0 0 1 ${cx + r - 4} 188 Z`} fill="url(#pa-sheen)" opacity=".5" />
            {[
              [-0.42, 0.3], [0.1, 0.46], [0.46, 0.26], [-0.12, 0.2], [0.3, 0.56],
            ].map(([u, f], j) => (
              <ellipse key={'s' + j} cx={cx + u * r} cy={188 - f * r * 0.8} rx="3" ry="2.1" fill="#FBF3DC" />
            ))}
          </g>
        ))}
      </g>
    </>
  ),

  quiche: () => (
    <>
      <Plate w={320} />
      <g>
        {/* דופן הבצק */}
        <path d="M78 134 L94 200 Q96 207 108 207 L292 207 Q304 207 306 200 L322 134 Z" fill={C.crustDark} />
        <path d="M88 140 L103 198 Q105 203 112 203 L288 203 Q295 203 297 198 L312 140 Z" fill={C.crust} />
        {/* הקאסטרד */}
        <path d="M93 145 L105 196 L295 196 L307 145 Z" fill="#F0D894" />
        <path d="M93 145 L307 145 L305 153 L95 153 Z" fill="#E4C878" />
        {/* קוביות בשר וגבינה בחתך */}
        {[
          [128, 170], [172, 181], [214, 165], [256, 179], [146, 189], [236, 189],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="17" height="10" rx="3.2" fill="#B2563C" />
        ))}
        {[
          [160, 161], [202, 187], [272, 164], [190, 172],
        ].map(([x, y], i) => (
          <ellipse key={'c' + i} cx={x} cy={y} rx="9" ry="6" fill="#DFB157" />
        ))}
        <path d="M93 145 L307 145 L295 196 L105 196 Z" fill="url(#pa-sheen)" opacity=".4" />
        {/* פני הקאסטרד זהובים */}
        <path d="M93 145 L307 145 L305 150 L95 150 Z" fill="#CFA94E" opacity=".6" />
      </g>
    </>
  ),

  spanakopita: () => (
    <>
      <Plate w={290} />
      <g>
        {[...Array(4)].map((_, i) => (
          <g key={'b' + i}>
            <rect x="112" y={194 - i * 7} width="176" height="4.5" fill="#E0B978" />
            <rect x="112" y={198.5 - i * 7} width="176" height="2.5" fill="#FAF0D6" />
          </g>
        ))}
        <rect x="112" y="142" width="176" height="31" fill="#56733A" />
        <rect x="112" y="142" width="176" height="31" fill="url(#pa-crumb-dark)" opacity=".4" />
        {[...Array(10)].map((_, i) => (
          <circle key={'f' + i} cx={122 + ((i * 47) % 156)} cy={148 + ((i * 29) % 20)} r="4" fill="#F6F2E4" />
        ))}
        {[...Array(4)].map((_, i) => (
          <g key={'t' + i}>
            <rect x="112" y={135 - i * 7} width="176" height="4.5" fill="#D8AE68" />
            <rect x="112" y={139.5 - i * 7} width="176" height="2.5" fill="#F7E8C8" />
          </g>
        ))}
        <rect x="112" y="114" width="176" height="87" fill="url(#pa-sheen)" opacity=".45" />
        {/* שומשום על הדף העליון */}
        {[...Array(7)].map((_, i) => (
          <ellipse key={'s' + i} cx={126 + i * 25} cy={112 - (i % 2) * 1.5} rx="3" ry="2" fill="#FBF3DC" />
        ))}
      </g>
    </>
  ),

  potpie: () => (
    <>
      <Plate w={310} />
      <g>
        {/* התבנית */}
        <path d="M86 148 Q86 207 200 207 Q314 207 314 148 Z" fill="#DED1EC" />
        <path d="M94 151 Q94 200 200 200 Q306 200 306 151 Z" fill="#F4EEFA" />
        {/* כיפת הבצק */}
        <path d="M78 152 Q84 110 200 106 Q316 110 322 152 Q314 166 200 168 Q86 166 78 152 Z" fill="#B0742F" />
        <path d="M88 150 Q96 118 200 114 Q304 118 312 150 Q302 160 200 162 Q98 160 88 150 Z" fill="#E0A354" />
        <path d="M88 150 Q96 118 200 114 Q304 118 312 150 Q302 160 200 162 Q98 160 88 150 Z" fill="url(#pa-crumb)" opacity=".3" />
        <path d="M88 150 Q96 118 200 114 Q304 118 312 150 Q302 160 200 162 Q98 160 88 150 Z" fill="url(#pa-sheen)" opacity=".5" />
        {/* חריצי אדים */}
        <path d="M176 134 q24 -7 48 0 M172 146 q28 -7 56 0" stroke="#95601F" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        {/* קמטי השוליים */}
        {[...Array(11)].map((_, i) => (
          <path
            key={i}
            d={`M${92 + i * 22} 156 q5 -8 10 0`}
            stroke="#B0742F"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            opacity=".7"
          />
        ))}
        {/* אדים */}
        <g opacity=".45" stroke="#B9A6CC" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M186 100 q-8 -12 2 -22 q10 -10 2 -20" />
          <path d="M216 102 q-8 -11 2 -20 q9 -9 2 -17" />
        </g>
      </g>
    </>
  ),

  pumpkinpie: () => (
    <>
      <Plate w={320} />
      <g>
        <path d="M78 136 L94 200 Q96 207 108 207 L292 207 Q304 207 306 200 L322 136 Z" fill={C.crustDark} />
        <path d="M88 142 L103 198 Q105 203 112 203 L288 203 Q295 203 297 198 L312 142 Z" fill={C.crust} />
        <path d="M93 147 L105 196 L295 196 L307 147 Z" fill="#C06520" />
        <path d="M93 147 L307 147 L305 156 L95 156 Z" fill="#D87C2D" />
        <path d="M93 147 L307 147 L295 196 L105 196 Z" fill="url(#pa-sheen)" opacity=".35" />
        {/* קצפת */}
        <path d="M158 148 Q164 114 184 124 Q194 98 212 120 Q234 108 242 148 Z" fill="#FFFDF8" />
        <ellipse cx="200" cy="146" rx="43" ry="10" fill="#FFFDF8" />
        <path d="M158 148 Q164 114 184 124 Q194 98 212 120 Q234 108 242 148 Z" fill="url(#pa-glass)" opacity=".55" />
        {/* קינמון מעל */}
        {[...Array(9)].map((_, i) => (
          <circle key={i} cx={168 + ((i * 41) % 64)} cy={116 + ((i * 13) % 20)} r="1.6" fill="#8A5425" opacity=".75" />
        ))}
      </g>
    </>
  ),

  cherrypie: () => (
    <>
      <Plate w={330} />
      <defs>
        <clipPath id="pa-cp-cherry">
          <ellipse cx="200" cy="150" rx="116" ry="34" />
        </clipPath>
      </defs>
      <g>
        <path d="M66 148 L74 192 Q78 202 200 202 Q322 202 326 192 L334 148 Z" fill="#A86A30" />
        <path d="M76 150 L83 188 Q87 196 200 196 Q313 196 317 188 L324 150 Z" fill={C.crust} />
        <ellipse cx="200" cy="148" rx="132" ry="41" fill="#D9A054" />
        <ellipse cx="200" cy="148" rx="132" ry="41" fill="url(#pa-crumb)" opacity=".35" />
        <ellipse cx="200" cy="150" rx="116" ry="34" fill="#75101F" />
        <g clipPath="url(#pa-cp-cherry)">
          {[
            [148, 142], [194, 134], [242, 146], [170, 162], [222, 164], [264, 138], [128, 156],
          ].map(([x, y], i) => (
            <g key={'ch' + i}>
              <circle cx={x} cy={y} r="11" fill="#9E1529" />
              <circle cx={x - 3.5} cy={y - 3.5} r="3" fill="#C4324A" opacity=".8" />
            </g>
          ))}
          {[...Array(6)].map((_, i) => (
            <rect key={'a' + i} x={121 + i * 50} y="96" width="18" height="118" fill="#DFA75D" transform="skewX(-22)" />
          ))}
          {[...Array(6)].map((_, i) => (
            <rect key={'b' + i} x={18 + i * 50} y="96" width="18" height="118" fill="#EEBE77" transform="skewX(22)" />
          ))}
        </g>
        <ellipse cx="200" cy="148" rx="132" ry="41" fill="url(#pa-sheen)" opacity=".4" />
        {/* קמטי השוליים */}
        {[...Array(13)].map((_, i) => (
          <path
            key={i}
            d={`M${74 + i * 21} 155 q5 -9 10 0`}
            stroke="#A86A30"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
            opacity=".6"
          />
        ))}
      </g>
    </>
  ),

  creampie: () => (
    <>
      <Plate />
      <Slice
        layers={[
          { h: 18, c: '#3A2218', tex: 'pa-crumb-dark' },
          { h: 54, c: '#4F2E20' },
        ]}
        top={(ty, x, w) => (
          <>
            <rect x={x} y={ty - 3} width={w} height="3" fill="#5E3A28" />
            <Pipe x={x + 22} y={ty - 14} c="#FFFDF8" n={5} rx={17} ry={15} />
            {[...Array(7)].map((_, i) => (
              <rect
                key={i}
                x={x + 24 + i * 22}
                y={ty - 34 - ((i * 11) % 9)}
                width="4"
                height="13"
                rx="1.6"
                fill="#3A2218"
                transform={`rotate(${-24 + i * 9} ${x + 26 + i * 22} ${ty - 28})`}
              />
            ))}
          </>
        )}
      />
    </>
  ),

  bagel: () => (
    <>
      <Plate w={310} />
      <g>
        {/* בייגל אחורי */}
        <g opacity=".93">
          <ellipse cx="282" cy="128" rx="60" ry="43" fill="#8A5020" />
          <ellipse cx="282" cy="123" rx="60" ry="43" fill="#BC7A36" />
          <ellipse cx="282" cy="123" rx="60" ry="43" fill="url(#pa-crumb)" opacity=".4" />
          <ellipse cx="282" cy="125" rx="19" ry="13" fill="#7C4518" />
          <ellipse cx="282" cy="127" rx="15" ry="10" fill="#E0BE8F" />
        </g>
        {/* בייגל קדמי */}
        <ellipse cx="166" cy="159" rx="88" ry="58" fill="#8A5020" />
        <ellipse cx="166" cy="152" rx="88" ry="58" fill="#C6833A" />
        <ellipse cx="166" cy="152" rx="88" ry="58" fill="url(#pa-crumb)" opacity=".4" />
        <ellipse cx="166" cy="152" rx="88" ry="58" fill="url(#pa-sheen)" opacity=".5" />
        <ellipse cx="166" cy="154" rx="27" ry="18" fill="#7C4518" />
        <ellipse cx="166" cy="156" rx="23" ry="14" fill="#E7C79A" />
        {[...Array(26)].map((_, i) => {
          const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.14;
          const k = 0.5 + ((i * 7) % 5) * 0.085;
          return (
            <ellipse
              key={i}
              cx={166 + Math.cos(a) * 88 * k}
              cy={152 + Math.sin(a) * 58 * k}
              rx="3.6"
              ry="2.5"
              fill="#F9EFD8"
            />
          );
        })}
      </g>
    </>
  ),

  coil: () => (
    <>
      <Plate w={310} />
      <g>
        <ellipse cx="200" cy="158" rx="124" ry="60" fill="#8E5420" />
        <ellipse cx="200" cy="151" rx="124" ry="60" fill="#EBBD71" />
        <ellipse cx="200" cy="151" rx="124" ry="60" fill="url(#pa-crumb)" opacity=".3" />
        {/* חריץ הגלגול — הוא מה שמזהה את המאפה, ולכן בניגודיות גבוהה */}
        <polyline
          points={coilPoints(200, 152, 3.4, 118, 0.49)}
          fill="none"
          stroke="#7E4518"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <polyline
          points={coilPoints(200, 148.5, 3.4, 118, 0.49)}
          fill="none"
          stroke="#FCEAC0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="200" cy="151" rx="124" ry="60" fill="url(#pa-sheen)" opacity=".42" />
        {[...Array(18)].map((_, i) => {
          const a = (i / 18) * Math.PI * 2 + i * 0.31;
          const k = 0.2 + ((i * 11) % 7) * 0.11;
          return (
            <ellipse
              key={i}
              cx={200 + Math.cos(a) * 124 * k}
              cy={151 + Math.sin(a) * 60 * k}
              rx="3.2"
              ry="2.2"
              fill="#FBF3DC"
            />
          );
        })}
      </g>
    </>
  ),

  jachnun: () => (
    <>
      <Plate w={310} />
      <g>
        {[
          [128, -9],
          [200, 2],
          [272, 10],
        ].map(([cx, rot], i) => (
          <g key={i} transform={`rotate(${rot} ${cx} 160)`}>
            <rect x={cx - 32} y="112" width="64" height="104" rx="30" fill="#6B3A14" />
            <rect x={cx - 32} y="108" width="64" height="104" rx="30" fill="#9C5B22" />
            <rect x={cx - 32} y="108" width="64" height="104" rx="30" fill="url(#pa-crumb-dark)" opacity=".35" />
            <path
              d={`M${cx - 18} 124 q18 13 0 26 q-18 13 0 26 q18 13 0 24`}
              stroke="#5F330F"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity=".65"
            />
            <rect x={cx - 32} y="108" width="64" height="104" rx="30" fill="url(#pa-sheen)" opacity=".4" />
          </g>
        ))}
      </g>
    </>
  ),
};

export default function PastryArt({ name, className = '', tall = false }) {
  const Draw = ART[name] || ART.genoise;
  return (
    <svg
      viewBox={VB}
      className={className}
      role="img"
      aria-label="איור חתך של התוצאה הסופית"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: tall ? '100%' : 'auto' }}
    >
      <Defs />
      <rect x="0" y="0" width="400" height="250" fill="url(#pa-vign)" opacity=".5" />
      <Draw />
    </svg>
  );
}
