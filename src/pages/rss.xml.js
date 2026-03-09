import { getCollection } from 'astro:content';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const site = context.site?.toString() || 'https://rahul713rk.github.io/';

  const items = posts
    .map((post) => {
      const link = new URL(`blog/${post.slug}/`, site).toString();
      const description = post.data.description || '';
      return `\n<item>\n  <title>${escapeXml(post.data.title)}</title>\n  <link>${escapeXml(link)}</link>\n  <guid>${escapeXml(link)}</guid>\n  <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>\n  <description>${escapeXml(description)}</description>\n</item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n  <title>Rahul Portfolio Blog</title>\n  <description>Technical writing and guides</description>\n  <link>${escapeXml(site)}</link>${items}\n</channel>\n</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
}
