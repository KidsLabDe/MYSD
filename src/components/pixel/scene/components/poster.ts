// Quelle: design/Poster.dc.html – KidsLab-Poster (Ebene 1, left 972 / top 30)
// Absichtlich feiner als die Szene: papier = PNG 125×95 bei 3×, Logos 52×35 bei 6×.
import posterPng from '../assets/kidslab-poster.png';
import logoPng from '../assets/kidslab-logo-52.png';
import logoDarkPng from '../assets/kidslab-logo-52-dunkel.png';
import logoDuotonePng from '../assets/kidslab-logo-52-duoton.png';

export const POSTERS = ['papier', 'gerahmt', 'banner', 'duoton'] as const;
export type PosterVariant = (typeof POSTERS)[number];

const LOGO: Record<PosterVariant, string> = {
  papier: logoPng,
  gerahmt: logoDarkPng,
  banner: logoPng,
  duoton: logoDuotonePng,
};

export function posterHtml(variant: string): string {
  const v: PosterVariant = (POSTERS as readonly string[]).includes(variant) ? (variant as PosterVariant) : 'papier';
  if (v === 'papier') {
    return `<div style="width: 378px; height: 288px; position: relative; font-family: monospace; color: #2A1A18">
<img src="${posterPng}" alt="KidsLab-Poster, schräg aufgeklebt" width="375" height="285" style="position: absolute; left: 0px; top: 0px; width: 375px; height: 285px; image-rendering: pixelated; display: block">
</div>`;
  }
  const frame =
    v === 'gerahmt' ? `<g>
<rect x="1" y="2" width="59" height="44" fill="#1A0F0D" opacity="0.35"></rect>
<rect x="0" y="0" width="60" height="45" fill="#5E3320"></rect>
<rect x="1" y="1" width="58" height="43" fill="#8A4E30"></rect>
<rect x="1" y="1" width="58" height="1" fill="#A8683E"></rect>
<rect x="3" y="3" width="54" height="39" fill="#1E2436"></rect>
</g>` : v === 'banner' ? `<g>
<rect x="4" y="5" width="54" height="39" fill="#1A0F0D" opacity="0.35"></rect>
<rect x="3" y="3" width="54" height="40" fill="#2F5530"></rect>
<rect x="0" y="1" width="60" height="3" fill="#6E3A22"></rect>
<rect x="0" y="1" width="60" height="1" fill="#8A4E30"></rect>
<rect x="0" y="42" width="60" height="3" fill="#6E3A22"></rect>
<rect x="0" y="42" width="60" height="1" fill="#8A4E30"></rect>
</g>` : `<g>
<rect x="3" y="3" width="56" height="42" fill="#1A0F0D" opacity="0.35"></rect>
<rect x="2" y="2" width="56" height="42" fill="#B8583A"></rect>
<rect x="2" y="2" width="56" height="1" fill="#CC6A48"></rect>
<rect x="29" y="1" width="2" height="2" fill="#EDE0C8"></rect>
<rect x="29" y="3" width="2" height="1" fill="#8E3F2A"></rect>
</g>`;
  return `<div style="width: 378px; height: 288px; position: relative; font-family: monospace; color: #2A1A18">
<div style="position: absolute; left: 9px; top: 6px; width: 360px; height: 276px">
<svg width="360" height="276" viewBox="0 0 60 46" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; display: block">
${frame}
</svg>
<img src="${LOGO[v]}" alt="KidsLab Logo" width="312" height="210" style="position: absolute; left: 24px; top: 36px; width: 312px; height: 210px; image-rendering: pixelated; display: block">
</div>
</div>`;
}
