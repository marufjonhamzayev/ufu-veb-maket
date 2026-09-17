/* =========================================================
   Icon set — 24x24, stroke 1.7, round caps. Hand-built.
   Usage: ico('shield', 'w-5')  ->  <svg ...>
   ========================================================= */
window.ICONS = {
  /* --- core ui --- */
  arrowRight:'<path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"/>',
  arrowUpRight:'<path d="M7 17 17 7m0 0H8.5M17 7v8.5"/>',
  arrowLeft:'<path d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5"/>',
  chevronDown:'<path d="m6 9 6 6 6-6"/>',
  chevronRight:'<path d="m9 6 6 6-6 6"/>',
  check:'<path d="m4.5 12.5 5 5 10-11"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.8 2.8L16 9.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  external:'<path d="M14 4h6v6M20 4l-8.5 8.5"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
  dots:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',

  /* --- union / legal --- */
  shield:'<path d="M12 3 5 6v6c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  shieldAlert:'<path d="M12 3 5 6v6c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6l-7-3Z"/><path d="M12 8.5v4"/><circle cx="12" cy="15.6" r=".9" fill="currentColor" stroke="none"/>',
  scale:'<path d="M12 4v16M7 20h10M5.5 6.5 12 5l6.5 1.5"/><path d="M5.5 6.5 3 13h5l-2.5-6.5ZM18.5 6.5 16 13h5l-2.5-6.5Z"/>',
  gavel:'<path d="m14.5 3.5 6 6M17.5 6.5 9 15l-3-3 8.5-8.5"/><path d="m8 14 2 2M4 20h8M6.5 17.5 9 20"/>',
  contract:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="M8.5 13h5M8.5 16.5h3"/>',
  fileText:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M8.5 12.5h7M8.5 16h4.5"/>',
  filePlus:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M12 11.5v5M9.5 14h5"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
  paperclip:'<path d="M20 11.5 12.2 19.3a4.6 4.6 0 0 1-6.5-6.5l8-8a3.1 3.1 0 0 1 4.4 4.4l-7.9 7.9a1.6 1.6 0 0 1-2.2-2.2l7.3-7.3"/>',
  download:'<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M4.5 18.5h15"/>',
  upload:'<path d="M12 19V8m0 0 4 4M12 8 8 12"/><path d="M4.5 5h15"/>',
  lock:'<rect x="4.5" y="10" width="15" height="10.5" rx="2.2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/><circle cx="12" cy="15.2" r="1.2" fill="currentColor" stroke="none"/>',
  eyeOff:'<path d="M10.6 6.3A8.6 8.6 0 0 1 12 6.2c5 0 8.5 5.8 8.5 5.8a16 16 0 0 1-2.6 3.3M6.4 8A15.7 15.7 0 0 0 3.5 12S7 17.8 12 17.8c1.3 0 2.5-.4 3.6-1"/><path d="m4 4 16 16"/><path d="M10.4 10.5a2.2 2.2 0 0 0 3.1 3.1"/>',
  mask:'<path d="M3.5 8.5c0-1.6 1.2-2.6 2.8-2.3 2 .4 3.8.6 5.7.6s3.7-.2 5.7-.6c1.6-.3 2.8.7 2.8 2.3 0 4.6-2.9 9.3-6.4 9.3-1 0-1.6-.6-2.1-.6s-1.1.6-2.1.6c-3.5 0-6.4-4.7-6.4-9.3Z"/><path d="M8 11.2c.7-.6 1.6-.6 2.3 0M13.7 11.2c.7-.6 1.6-.6 2.3 0"/>',

  /* --- football --- */
  ball:'<circle cx="12" cy="12" r="9"/><path d="m12 7.2 3.6 2.6-1.4 4.3H9.8L8.4 9.8 12 7.2Z"/><path d="M12 3v4.2M4.6 9.4l3.8.4M19.4 9.4l-3.8.4M7.6 19.6l2.2-5.5M16.4 19.6l-2.2-5.5"/>',
  whistle:'<path d="M14 9h6.5a1.5 1.5 0 0 1 0 3H14"/><circle cx="8.5" cy="13.5" r="5"/><path d="M8.5 8.5V5.5M6 5.5h5"/>',
  trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 5.5H4.5v1A3.5 3.5 0 0 0 8 10M17 5.5h2.5v1A3.5 3.5 0 0 1 16 10"/><path d="M12 14v3.5M8.5 20.5h7M10 17.5h4"/>',
  medal:'<circle cx="12" cy="14.5" r="5"/><path d="m8.5 10-3-7M15.5 10l3-7M9.5 3h5"/><path d="m12 12.4.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3.9-1.8Z" fill="currentColor" stroke="none"/>',
  jersey:'<path d="M8.5 3.5 5 5.5 3.5 10l3 1.2V20a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-8.8l3-1.2L19 5.5l-3.5-2"/><path d="M8.5 3.5a3.5 3.5 0 0 0 7 0"/>',
  pitch:'<rect x="3" y="4.5" width="18" height="15" rx="1.6"/><path d="M12 4.5v15M3 9.5h3.5v5H3M21 9.5h-3.5v5H21"/><circle cx="12" cy="12" r="2.4"/>',
  stadium:'<ellipse cx="12" cy="8" rx="9" ry="3.6"/><path d="M3 8v6c0 2 4 3.6 9 3.6s9-1.6 9-3.6V8"/><path d="M7 11.4V20M17 11.4V20M3 20h18"/>',

  /* --- people --- */
  user:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  users:'<circle cx="9.5" cy="8.5" r="3.4"/><path d="M3 19.5a6.5 6.5 0 0 1 13 0"/><path d="M16.5 5.5a3.4 3.4 0 0 1 0 6.2M17.5 13.6a6.3 6.3 0 0 1 3.5 5.9"/>',
  userPlus:'<circle cx="10" cy="8.5" r="3.8"/><path d="M3 20a7 7 0 0 1 12.2-4.7"/><path d="M18 14.5v6M15 17.5h6"/>',
  userCheck:'<circle cx="10" cy="8.5" r="3.8"/><path d="M3 20a7 7 0 0 1 11.6-5.2"/><path d="m15.5 17.8 1.8 1.8 3.5-4"/>',
  handshake:'<path d="m11 7.5-2.3 2.3a1.8 1.8 0 0 0 2.6 2.6l1.2-1.2 3 3a1.7 1.7 0 0 1-2.4 2.4"/><path d="m13.5 16.6 1.2 1.2a1.7 1.7 0 0 0 2.4-2.4"/><path d="m3 9 3.5-3.5 3 1.5h5L18 5l3 3-2.5 2.5"/><path d="M5.5 11.5 3 9"/>',

  /* --- comms --- */
  telegram:'<path d="M20.7 4.5 2.9 11.2c-1 .4-1 1.1-.2 1.4l4.5 1.4 1.7 5.2c.2.6.4.8 1 .8.5 0 .8-.3 1.1-.6l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.8l2.9-13.6c.3-1.2-.4-1.8-1.5-1.7Z"/><path d="m7.2 14 9.8-6.1-7.6 7.1"/>',
  bell:'<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/>',
  message:'<path d="M20.5 12.2c0 4.1-3.8 7.4-8.5 7.4a10 10 0 0 1-2.8-.4L4 21l1.4-3.8A7 7 0 0 1 3.5 12.2c0-4.1 3.8-7.4 8.5-7.4s8.5 3.3 8.5 7.4Z"/>',
  mail:'<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m3.8 7 7.1 5.3a2 2 0 0 0 2.4 0L20.3 7"/>',
  phone:'<path d="M7.5 3.5h-2A2.5 2.5 0 0 0 3 6.2C3.4 13.6 10.4 20.6 17.8 21a2.5 2.5 0 0 0 2.7-2.5v-2l-4-1.5-1.8 2a13 13 0 0 1-5.7-5.7l2-1.8-1.5-4Z"/>',
  mapPin:'<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3.2 10h17.6M3.2 14.5h17.6"/><path d="M12 3c-4 4.5-4 13.5 0 18 4-4.5 4-13.5 0-18Z"/>',

  /* --- data --- */
  chart:'<path d="M4 20V4M4 20h16"/><rect x="7.5" y="12" width="3" height="5" rx="1"/><rect x="13" y="8" width="3" height="9" rx="1"/><rect x="18" y="14" width="2.5" height="3" rx="1"/>',
  trendUp:'<path d="M3.5 17 9 11l3.5 3.5L20 7"/><path d="M15 7h5v5"/>',
  calendar:'<rect x="3.5" y="5.5" width="17" height="15" rx="2.2"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>',
  wallet:'<rect x="3" y="6" width="18" height="13" rx="2.4"/><path d="M3 10h18M16.5 14.5h1.5"/><path d="M17.5 6V4.6a1.2 1.2 0 0 0-1.6-1.1L5 6.5"/>',
  transfer:'<path d="M4 8.5h14m0 0-3.5-3.5M18 8.5 14.5 12"/><path d="M20 15.5H6m0 0 3.5-3.5M6 15.5 9.5 19"/>',
  heartPulse:'<path d="M20.2 6.6a4.6 4.6 0 0 0-7-.6l-1.2 1.2-1.2-1.2a4.6 4.6 0 0 0-6.6 6.5l7.8 7.9 7.8-7.9c1.4-1.5 1.6-3.9.4-5.9Z"/><path d="M3.5 12.5h3l1.5-2.5 2 5 2-3.5 1.2 1h4.3"/>',
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/><path d="M8.5 7.5h7M8.5 11h4.5"/>',
  video:'<rect x="3" y="6" width="12.5" height="12" rx="2.4"/><path d="m15.5 10.5 4.2-2.6a.8.8 0 0 1 1.3.7v6.8a.8.8 0 0 1-1.3.7l-4.2-2.6"/>',
  play:'<path d="M7.5 5.2 19 12 7.5 18.8V5.2Z" fill="currentColor" stroke="none"/>',
  camera:'<rect x="3" y="7" width="18" height="13" rx="2.4"/><path d="m8.5 7 1.4-2.5h4.2L15.5 7"/><circle cx="12" cy="13.5" r="3.4"/>',
  briefcase:'<rect x="3" y="7.5" width="18" height="12.5" rx="2.2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18"/>',
  star:'<path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9L12 3.8Z"/>',
  sparkle:'<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z"/><path d="M18.5 15.5 19.2 18l2.3.8-2.3.8-.7 2.4-.7-2.4-2.3-.8 2.3-.8.7-2.5Z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  alert:'<path d="M10.3 4.2 2.6 17.4A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3.1L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4"/><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none"/>',
  helpCircle:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.2-2.4 3.7"/><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8 13.4 5a7.6 7.6 0 0 1 2 .8l2.5-.6 1.7 3-1.7 1.9c.1.5.1 1 0 1.6l1.7 1.9-1.7 3-2.5-.6a7.6 7.6 0 0 1-2 .8L12 21.2 10.6 19a7.6 7.6 0 0 1-2-.8l-2.5.6-1.7-3 1.7-1.9a6.8 6.8 0 0 1 0-1.6L4.4 8.2l1.7-3 2.5.6a7.6 7.6 0 0 1 2-.8L12 2.8Z"/>',
  logout:'<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10"/><path d="M15 8.5 19 12l-4 3.5M19 12H9.5"/>',
  grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
  edit:'<path d="M15.5 4.5 19.5 8.5 8 20H4v-4L15.5 4.5Z"/><path d="m13.8 6.2 4 4"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 4.5V10H15"/>',

  /* --- social --- */
  instagram:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/>',
  facebook:'<path d="M14.5 21v-8h2.7l.5-3.3h-3.2V7.6c0-1 .3-1.6 1.7-1.6h1.6V3.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.5H8.6V13h2.8v8h3.1Z"/>',
  youtube:'<path d="M21.2 8.2a2.6 2.6 0 0 0-1.8-1.9C17.8 5.9 12 5.9 12 5.9s-5.8 0-7.4.4a2.6 2.6 0 0 0-1.8 1.9A27 27 0 0 0 2.4 12c0 1.3.1 2.5.4 3.8a2.6 2.6 0 0 0 1.8 1.9c1.6.4 7.4.4 7.4.4s5.8 0 7.4-.4a2.6 2.6 0 0 0 1.8-1.9c.3-1.3.4-2.5.4-3.8s-.1-2.5-.4-3.8Z"/><path d="M10.2 14.8 15 12l-4.8-2.8v5.6Z" fill="currentColor" stroke="none"/>',
  twitter:'<path d="m3.5 3.5 7.1 9.4L4 20.5h2.2l5.4-5.8 4.4 5.8h4.5l-7.5-9.9 6.2-6.6h-2.2l-5 5.4-4.1-5.4H3.5Z"/>',
  linkedin:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V17M8 7.4v.1"/><path d="M12 17v-3.6a2.4 2.4 0 0 1 4.8 0V17M12 10.5V17"/>'
};

window.ico = function (name, cls) {
  var p = window.ICONS[name];
  if (!p) return '';
  return '<svg class="' + (cls || '') + '" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
         'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
};

/* Brand mark — UFU emblem (shield + ball + wings) */
window.BRAND_MARK = '<svg class="brand__mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
  '<path d="M24 3 6 9.6v13.1C6 33.6 13.5 42.8 24 45.5c10.5-2.7 18-11.9 18-22.8V9.6L24 3Z" fill="#0B2A1F"/>' +
  '<path d="M24 6.6 9.4 11.9v10.8c0 9 6.1 16.7 14.6 19.2 8.5-2.5 14.6-10.2 14.6-19.2V11.9L24 6.6Z" fill="#1F7A4D" fill-opacity=".16"/>' +
  '<circle cx="24" cy="21" r="7.6" stroke="#fff" stroke-width="1.6"/>' +
  '<path d="m24 16.4 4.4 3.2-1.7 5.2h-5.4l-1.7-5.2 4.4-3.2Z" fill="#fff"/>' +
  '<path d="M24 13.4v3M17.1 18.6l2.9.5M30.9 18.6l-2.9.5M20.1 27.9l1.8-3.1M27.9 27.9l-1.8-3.1" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>' +
  '<path d="M15 32.5h18M18 36h12" stroke="#1F7A4D" stroke-width="2" stroke-linecap="round"/>' +
  '</svg>';
