// functions/_shared/gone.ts
// 410 Gone for URLs left over from the previous owner's Shopify store on this domain
// (/collections, /products, /blogs, /account, /cart). Bots still crawl them; a 410 tells
// Google to drop them faster than a 404, and skipping the 404 page keeps them out of GA4.

const BODY = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Page Removed | WiseTech</title></head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:4rem 1rem;color:#0f172a">
<h1>This page no longer exists</h1>
<p><a href="https://wisetech.ca/">Go to WiseTech &mdash; Managed IT Services in Mississauga</a></p>
</body>
</html>`;

export function gone(): Response {
  return new Response(BODY, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
