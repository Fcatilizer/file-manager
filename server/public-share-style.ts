/** Public pages remain script-free; shared font/accent tokens are injected by the renderer. */
export const publicShareStyle = `
* {
  box-sizing:border-box}
body {
  margin:0;
  background:#f7f8fa;
  color:#172033;
  font-family:var(--font);
  font-size:14px}
a {
  color:inherit;
  text-decoration:none}
svg {
  flex-shrink:0;
  vertical-align:middle}
.topbar {
  height:80px;
  border-bottom:1px solid #e2e6ed;
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 max(24px,calc((100vw - 1120px)/2));
  gap:20px}
.brand {
  font-size:26px;
  font-weight:650;
  letter-spacing:-1px;
  display:flex;
  gap:12px;
  align-items:center}
.brand span {
  font-size:17px;
  color:var(--accent)}
.pill {
  display:inline-flex;
  align-items:center;
  gap:7px;
  border:1px solid #e0e4eb;
  border-radius:99px;
  padding:8px 12px;
  font-size:12px;
  color:#657086;
  white-space:nowrap}
main {
  max-width:1120px;
  margin:48px auto;
  padding:0 24px}
.intro {
  display:flex;
  gap:18px;
  align-items:center;
  margin-bottom:28px}
.hero-icon {
  padding:18px;
  border:1px solid #e0e4eb;
  background:#fff;
  border-radius:16px;
  color:var(--accent)}
h1 {
  font-size:28px;
  letter-spacing:-.6px;
  margin:0 0 8px;
  overflow-wrap:anywhere}
.muted {
  color:#768197;
  line-height:1.6;
  margin:0}
.details {
  display:grid;
  grid-template-columns:1.1fr 1fr 1.2fr;
  gap:20px;
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:14px;
  padding:22px;
  margin-bottom:32px}
.label {
  display:block;
  text-transform:uppercase;
  font-size:10px;
  letter-spacing:1px;
  color:#7a8598;
  margin-bottom:10px}
.person {
  display:flex;
  align-items:center;
  gap:10px}
.avatar {
  width:34px;
  height:34px;
  display:grid;
  place-items:center;
  background:color-mix(in srgb,var(--accent) 10%,white);
  color:var(--accent);
  border-radius:50%;
  font-weight:600}
.value {
  font-weight:550;
  overflow-wrap:anywhere}
.details small {
  display:block;
  margin-top:5px;
  color:#768197;
  font-size:11px;
  line-height:1.5}
nav {
  display:flex;
  gap:9px;
  align-items:center;
  flex-wrap:wrap;
  margin:0 0 16px;
  color:#738097;
  font-size:13px}
nav a {
  color:var(--accent)}
.list {
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:12px;
  overflow:hidden}
.row {
  display:grid;
  grid-template-columns:minmax(0,1fr) 90px 165px 40px;
  gap:16px;
  align-items:center;
  padding:17px 20px;
  border-bottom:1px solid #edf0f4}
.row:last-child {
  border-bottom:0}
a.row:hover {
  background:color-mix(in srgb,var(--accent) 4%,white)}
.row:focus-visible,nav a:focus-visible,.next:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:-3px}
.row.heading {
  background:#fbfcfd;
  color:#8490a2;
  font-size:10px;
  letter-spacing:1px;
  text-transform:uppercase;
  padding-top:12px;
  padding-bottom:12px}
.filename {
  display:flex;
  gap:12px;
  align-items:center;
  min-width:0}
.filename span {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap}
.size,.modified {
  font-size:12px;
  color:#8490a2;
  text-align:right}
.action {
  color:var(--accent);
  text-align:right}
.empty {
  padding:48px;
  text-align:center;
  color:#768197}
.footer {
  display:flex;
  justify-content:space-between;
  gap:16px;
  margin-top:18px;
  color:#8490a2;
  font-size:12px}
.next {
  color:var(--accent)}
.notice {
  margin-top:28px;
  color:#8490a2;
  font-size:12px;
  line-height:1.6}
time {
  white-space:normal}
@media(max-width:640px) {
  .topbar {
  height:68px;
  padding:0 20px}
.brand {
  font-size:23px}
main {
  margin:28px auto;
  padding:0 18px}
.intro {
  gap:12px}
h1 {
  font-size:23px}
.hero-icon {
  padding:13px}
.details {
  grid-template-columns:1fr;
  padding:18px;
  gap:18px}
.row {
  grid-template-columns:minmax(0,1fr) 65px 24px;
  gap:8px;
  padding:16px 14px}
.modified {
  display:none}
.row.heading .modified {
  display:none}
.footer {
  flex-wrap:wrap}
.pill {
  font-size:11px}
.notice {
  margin-top:20px}
}

`
