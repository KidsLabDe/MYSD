export const WEATHERS = ['sonnig', 'bewoelkt', 'regen', 'schnee', 'gewitter', 'nacht'] as const;
export type Weather = (typeof WEATHERS)[number];
export const POSES = ['stand', 'walkA', 'walkB', 'reach', 'strike', 'grab', 'pullA', 'pullB', 'stepA', 'stepB', 'waveA', 'waveB', 'cupLow', 'cupDrink'] as const;
export type Pose = (typeof POSES)[number];
export const PC_STATES = ['laeuft', 'endspurt', 'pause', 'ende', 'arcade'] as const;
export type PcState = (typeof PC_STATES)[number];

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
