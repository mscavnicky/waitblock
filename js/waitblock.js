// Globally accessible default options
var defaultOptions = {
  // Time to wait before unblocking the page. In seconds.
  waitTime: 30,
  // Time to wait till the page is blocked after unblocking. In minutes.
  blockTime: 5,
  // The list of domains to block. Covers subdomains as well.
  blocklist: 'facebook.com',
  // The list of subdomains to allow.
  whitelist: 'l.facebook.com'
};
