declare module 'virtual:mysd' {
  /** data = null: normale Version (event.js). Sonst MYSD-Version mit eingebettetem Stand. */
  const mysd: { data: unknown; ort: unknown; dataUrl: string; ortUrl: string };
  export default mysd;
}
