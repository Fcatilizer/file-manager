/** Shared browser and server error-page styles, scoped away from preview modals. */
export const publicShareStyle = `
.public-share-preview .modal-overlay,
.public-share-details .modal-overlay {
  --drop-bg: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
:where(.public-share) * {
  box-sizing:border-box}.public-share {
  margin:0;
  background:#f7f8fa;
  color:#172033;
  font-family:var(--font, var(--font-ui));
  font-size:14px}:where(.public-share) a {
  color:inherit;
  text-decoration:none}:where(.public-share) svg {
  flex-shrink:0;
  vertical-align:middle}:where(.public-share) .topbar {
  height:80px;
  border-bottom:1px solid #e2e6ed;
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 max(24px,calc((100vw - 1120px)/2));
  gap:20px}:where(.public-share) .brand, :where(.public-share) .vault-brand-btn--public {
  font-size:26px;
  font-weight:650;
  letter-spacing:-1px;
  display:inline-flex;
  gap:12px;
  align-items:center;
  color:#172033;
  font-family:inherit;
  background:transparent;
  border:0;
  padding:6px 10px;
  margin-left:-10px;
  border-radius:8px;
  cursor:pointer;
  transition:background-color 0.15s ease}:where(.public-share) .vault-brand-btn--public:hover {
  background:#f1f3f7}:where(.public-share) .vault-brand-btn--public:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:2px}:where(.public-share) .brand span {
  font-size:17px;
  color:var(--accent)}:where(.public-share) .pill {
  display:inline-flex;
  align-items:center;
  gap:7px;
  border:1px solid #e0e4eb;
  border-radius:99px;
  padding:8px 12px;
  font-size:12px;
  color:#657086;
  white-space:nowrap}:where(.public-share) main {
  max-width:1120px;
  margin:48px auto;
  padding:0 24px}:where(.public-share) .intro {
  display:flex;
  gap:18px;
  align-items:center;
  margin-bottom:28px}:where(.public-share) .hero-icon {
  padding:18px;
  border:1px solid #e0e4eb;
  background:#fff;
  border-radius:16px;
  color:var(--accent)}:where(.public-share) h1 {
  font-size:28px;
  letter-spacing:-.6px;
  margin:0 0 8px;
  overflow-wrap:anywhere}:where(.public-share) .muted {
  color:#768197;
  line-height:1.6;
  margin:0}:where(.public-share) .details {
  display:grid;
  grid-template-columns:1.1fr 1fr 1.2fr;
  gap:20px;
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:14px;
  padding:22px;
  margin-bottom:32px}:where(.public-share) .label {
  display:block;
  text-transform:uppercase;
  font-size:10px;
  letter-spacing:1px;
  color:#7a8598;
  margin-bottom:10px}:where(.public-share) .person {
  display:flex;
  align-items:center;
  gap:10px}:where(.public-share) .avatar {
  width:34px;
  height:34px;
  display:grid;
  place-items:center;
  background:color-mix(in srgb,var(--accent) 10%,white);
  color:var(--accent);
  border-radius:50%;
  font-weight:600}:where(.public-share) .value {
  font-weight:550;
  overflow-wrap:anywhere}:where(.public-share) .details small {
  display:block;
  margin-top:5px;
  color:#768197;
  font-size:11px;
  line-height:1.5}:where(.public-share) nav {
  display:flex;
  gap:9px;
  align-items:center;
  flex-wrap:wrap;
  margin:0 0 16px;
  color:#738097;
  font-size:13px}:where(.public-share) nav a {
  color:var(--accent)}:where(.public-share) .list {
  background:#fff;
  border:1px solid #e0e4eb;
  border-radius:12px;
  overflow:hidden}:where(.public-share) .row {
  display:grid;
  grid-template-columns:minmax(0,1fr) 90px 165px 108px;
  gap:16px;
  align-items:center;
  padding:17px 20px;
  border-bottom:1px solid #edf0f4}:where(.public-share) .row:last-child {
  border-bottom:0}:where(.public-share) a.row:hover {
  background:color-mix(in srgb,var(--accent) 4%,white)}:where(.public-share) .row:focus-visible,:where(.public-share) nav a:focus-visible,:where(.public-share) .next:focus-visible {
  outline:2px solid var(--accent);
  outline-offset:-3px}:where(.public-share) .row.heading {
  background:#fbfcfd;
  color:#8490a2;
  font-size:10px;
  letter-spacing:1px;
  text-transform:uppercase;
  padding-top:12px;
  padding-bottom:12px}:where(.public-share) .filename {
  display:flex;
  gap:12px;
  align-items:center;
  min-width:0}:where(.public-share) .filename span {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap}:where(.public-share) .size,:where(.public-share) .modified {
  font-size:12px;
  color:#8490a2;
  text-align:right}:where(.public-share) .action {
  color:var(--accent);
  text-align:right}:where(.public-share) .empty {
  padding:48px;
  text-align:center;
  color:#768197}:where(.public-share) .footer {
  display:flex;
  justify-content:space-between;
  gap:16px;
  margin-top:18px;
  color:#8490a2;
  font-size:12px}:where(.public-share) .next {
  color:var(--accent)}:where(.public-share) .notice {
  margin-top:28px;
  color:#8490a2;
  font-size:12px;
  line-height:1.6}:where(.public-share) time {
  white-space:normal}@media(max-width:640px) {:where(.public-share) .topbar {
  height:68px;
  padding:0 20px}:where(.public-share) .brand, :where(.public-share) .vault-brand-btn--public {
  font-size:23px;
  padding:4px 8px;
  margin-left:-8px;
  gap:10px}:where(.public-share) main {
  margin:28px auto;
  padding:0 18px}:where(.public-share) .intro {
  gap:12px}:where(.public-share) h1 {
  font-size:23px}:where(.public-share) .hero-icon {
  padding:13px}:where(.public-share) .details {
  grid-template-columns:1fr;
  padding:18px;
  gap:18px}:where(.public-share) .row {
  grid-template-columns:minmax(0,1fr) 65px 104px;
  gap:8px;
  padding:16px 14px}:where(.public-share) .modified {
  display:none}:where(.public-share) .row.heading .modified {
  display:none}:where(.public-share) .footer {
  flex-wrap:wrap}:where(.public-share) .pill {
  font-size:11px}:where(.public-share) .notice {
  margin-top:20px}
}:where(.public-share) .row:hover {background:color-mix(in srgb,var(--accent) 4%,white)}:where(.public-share) .action {display:flex;justify-content:flex-end;gap:6px}:where(.public-share) .icon-button {display:inline-flex;align-items:center;justify-content:center;width:30px;height:32px;border-radius:6px;color:var(--accent)}:where(.public-share) .icon-button:hover {background:color-mix(in srgb,var(--accent) 10%,white)}:where(.public-share) a:focus-visible {outline:2px solid var(--accent);outline-offset:2px}:where(.public-share) .public-error {max-width:520px;margin:90px auto;background:white;border:1px solid #e0e4eb;border-radius:16px;text-align:center;padding:44px 28px}:where(.public-share) .public-error>svg {color:var(--accent);margin-bottom:24px}:where(.public-share) .public-error p {color:#768197;line-height:1.7;margin:18px 0 28px}:where(.public-share) .public-button {display:inline-flex;padding:11px 18px;background:var(--accent);color:white;border-radius:8px;margin-top:12px}:where(.public-share) .empty p {line-height:1.6;margin-top:12px}@media(max-width:640px) {:where(.public-share) .public-error {margin:40px auto;padding:32px 20px}:where(.public-share) .row {gap:6px}}:where(.public-share) .public-text-button {border:0;background:none;padding:0;color:inherit;font:inherit;cursor:pointer;text-align:left}:where(.public-share) .icon-button {border:0;background:none;cursor:pointer}:where(.public-share) nav .public-text-button,:where(.public-share) .footer .public-text-button {color:var(--accent)}:where(.public-share) .public-text-button:focus-visible,:where(.public-share) .icon-button:focus-visible {outline:2px solid var(--accent);outline-offset:2px}

`
