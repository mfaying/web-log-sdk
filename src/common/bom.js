const win = (typeof window !== 'undefined' ? window : this);

const doc = document;
const nav = navigator;
const ua = nav && nav.userAgent && nav.userAgent.toString();
const loc = location;
const ref = doc && doc.referrer;
const title = doc && doc.title;
const domain = doc && doc.domain;

const bom = {
  win,
  doc,
  nav,
  loc,
  ua,
  ref,
  title,
  domain,
};

export {
  win,
  doc,
  nav,
  loc,
  ua,
  ref,
  title,
  domain,
}

export default bom;