async function check() {
  const r = await fetch('https://www.google.com/recaptcha/api.js?render=explicit');
  const t = await r.text();
  // Find script src
  const match = t.match(/src="([^"]+recaptcha__[^"]+)"/);
  if (match) {
    const fullUrl = match[1];
    const r2 = await fetch(fullUrl);
    const t2 = await r2.text();
    console.log(JSON.stringify({
      loaderBytes: Buffer.byteLength(t, 'utf8'),
      engineUrl: fullUrl,
      engineBytes: Buffer.byteLength(t2, 'utf8'),
      totalRecaptchaBytes: Buffer.byteLength(t, 'utf8') + Buffer.byteLength(t2, 'utf8')
    }, null, 2));
  } else {
    console.log('No direct match, total loader bytes:', Buffer.byteLength(t, 'utf8'));
  }
}
check();
