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
  plate: '#EBDCE3',
  line: '#5E3B50',
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
      <ellipse cx="200" cy={y - 1.5} rx={w / 2 - 8} ry="7" fill="#F8EEF3" />
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
      <path d="M78 118 Q78 196 200 196 Q322 196 322 118 Z" fill="#EFE2E9" />
      <path d="M84 120 Q84 189 200 189 Q316 189 316 120 Z" fill="#FBF3F7" />
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
        <rect x="286" y="52" width="86" height="54" rx="8" fill="#FBF3F7" stroke="#E3CEDA" />
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
        <ellipse cx="200" cy="162" rx="58" ry="18" fill="#F8EEF3" />
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
