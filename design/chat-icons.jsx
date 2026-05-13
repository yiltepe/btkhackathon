// OBEN — Icon set. Stroke-based, single weight, 1.5px.
// All icons are 16px viewBox; size with CSS.

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const I = {
  plus:      <svg {...ICON_PROPS}><path d="M12 5v14M5 12h14"/></svg>,
  minus:     <svg {...ICON_PROPS}><path d="M5 12h14"/></svg>,
  arrowRight:<svg {...ICON_PROPS}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  arrowUp:   <svg {...ICON_PROPS}><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  send:      <svg {...ICON_PROPS}><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  paperclip: <svg {...ICON_PROPS}><path d="M21 11.5l-9.2 9.2a5 5 0 1 1-7.07-7.07l9.19-9.2a3.5 3.5 0 0 1 4.95 4.95l-9.19 9.2a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  cart:      <svg {...ICON_PROPS}><path d="M3 5h2.4L7 16.5a2 2 0 0 0 2 1.7h8.6a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>,
  pen:       <svg {...ICON_PROPS}><path d="M16 3l5 5L8 21H3v-5L16 3z"/></svg>,
  close:     <svg {...ICON_PROPS}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  download:  <svg {...ICON_PROPS}><path d="M12 4v12M6 10l6 6 6-6M5 20h14"/></svg>,
  external:  <svg {...ICON_PROPS}><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>,
  search:    <svg {...ICON_PROPS}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  sparkle:   <svg {...ICON_PROPS}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/></svg>,
  link:      <svg {...ICON_PROPS}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>,
  image:     <svg {...ICON_PROPS}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M3 17l5-4 4 3 3-2 6 5"/></svg>,
  check:     <svg {...ICON_PROPS}><path d="M5 12l4 4L19 6"/></svg>,
  dots:      <svg {...ICON_PROPS}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  truck:     <svg {...ICON_PROPS}><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 4v4h-7"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>,
  star:      <svg {...ICON_PROPS}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.1l-5.4 2.8 1-6.1L3.2 9.5l6.1-.9z"/></svg>,
  filter:    <svg {...ICON_PROPS}><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  history:   <svg {...ICON_PROPS}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/></svg>,
  archive:   <svg {...ICON_PROPS}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>,
};

Object.assign(window, { I });
