#!/usr/bin/env node
import vm from "node:vm";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { selectArticleThumbnail } from "./article-thumbnails.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(ROOT, "script.js");
const GENERATED_PATH = path.join(ROOT, "data", "articles.generated.js");
const ARTICLES_DIR = path.join(ROOT, "articles");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const SITE_URL = "https://fire.development-test.com";
const SITE_NAME = "FIREまとめログ";
const SITE_DESCRIPTION = "FIRE、早期リタイア、資産形成、NISA、節約、副業などの5chスレッドを読みやすくまとめるサイトです。";
const SITE_KEYWORDS = "FIRE,早期リタイア,資産形成,5chまとめ,NISA,節約,副業,セミリタイア";
const ASSET_VERSION = "20260616-seo";
const OGP_IMAGE_URL = `${SITE_URL}/assets/ogp.png`;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  await mkdir(ARTICLES_DIR, { recursive: true });
  await clearArticlePages();
  const articles = await loadArticles();
  const ranking = [...articles].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 5);

  for (const article of articles) {
    const html = renderPage(article, ranking);
    await writeFile(path.join(ARTICLES_DIR, `${encodeURIComponent(article.id)}.html`), html);
  }

  await writeSitemap(articles);

  console.log(`Built article pages: ${articles.length}`);
}

async function clearArticlePages() {
  const entries = await readdir(ARTICLES_DIR, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
      .map((entry) => unlink(path.join(ARTICLES_DIR, entry.name))),
  );
}

async function loadArticles() {
  const [generated, sample] = await Promise.all([readGeneratedArticles(), readSampleArticles()]);
  return generated.length ? generated : sample;
}

async function readGeneratedArticles() {
  try {
    const js = await readFile(GENERATED_PATH, "utf8");
    const json = js.match(/window\.FIRE_GENERATED_ARTICLES\s*=\s*([\s\S]*?);\s*$/)?.[1];
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function readSampleArticles() {
  const script = await readFile(SCRIPT_PATH, "utf8");
  const start = script.indexOf("const sampleArticles = ");
  const end = script.indexOf("\n\nconst generatedArticles");
  if (start === -1 || end === -1) return [];

  const code = `${script.slice(start, end)}\nsampleArticles;`;
  return vm.runInNewContext(code, {}, { timeout: 1000 });
}

function renderPage(article, ranking) {
  const sourceUrl = safeUrl(article.sourceUrl);
  const coverImage = pageAssetPath(selectArticleThumbnail(article));
  const pageUrl = articleUrl(article);
  const description = metaDescription(article);
  const publishedDate = toIsoDate(article.date);
  const publishedTime = publishedDate ? `${publishedDate}T00:00:00+09:00` : undefined;
  const jsonLd = renderJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: pageUrl,
    headline: article.title,
    description,
    image: OGP_IMAGE_URL,
    datePublished: publishedTime,
    dateModified: publishedTime,
    articleSection: article.category,
    keywords: (article.tags || []).join(", "),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    inLanguage: "ja",
  });

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.title)} | FIREまとめログ</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml([SITE_KEYWORDS, ...(article.tags || [])].filter(Boolean).join(","))}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="theme-color" content="#08756d" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg?v=20260616-logo" />
    <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(article.title)} | ${SITE_NAME}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:image" content="${OGP_IMAGE_URL}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${SITE_NAME}" />
    ${publishedTime ? `<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(article.title)} | ${SITE_NAME}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${OGP_IMAGE_URL}" />
    ${jsonLd}
    <link rel="stylesheet" href="../styles.css?v=${ASSET_VERSION}" />
  </head>
  <body>
    <header class="site-header">
      <div class="topline">
        <a class="brand" href="../index.html" aria-label="FIREまとめログ トップ">
          <span class="brand-mark">F</span>
          <span>
            <strong>FIREまとめログ</strong>
            <small>経済的自立と早期リタイアの反応集</small>
          </span>
        </a>
        <form class="search" action="../index.html" role="search">
          <label class="visually-hidden" for="search-input">記事検索</label>
          <input id="search-input" type="search" name="q" placeholder="FIRE、投資、節約で検索" />
          <button type="submit" aria-label="検索">⌕</button>
        </form>
      </div>
      <nav class="category-nav" aria-label="カテゴリ">
        <a class="category-button is-active" href="../index.html">総合</a>
        <a class="category-button" href="../index.html">資産形成</a>
        <a class="category-button" href="../index.html">節約</a>
        <a class="category-button" href="../index.html">副業</a>
        <a class="category-button" href="../index.html">退職後生活</a>
        <a class="category-button" href="../index.html">失敗談</a>
      </nav>
    </header>

    <main class="page-shell">
      <div class="layout">
        <section class="content-area" aria-label="記事本文">
          <p class="back-link"><a href="../index.html">← トップへ戻る</a></p>
          <article class="thread-detail">
            <div class="thread-head">
              <div class="article-meta">
                <span class="pill warn">まとめ</span>
                <span class="pill">${escapeHtml(article.category)}</span>
                <span>${escapeHtml(article.date)}</span>
              </div>
              <h1>${escapeHtml(article.title)}</h1>
              <img class="thread-cover" src="${escapeHtml(coverImage)}" alt="" loading="eager" decoding="async" />
              <p class="thread-summary">${escapeHtml(article.summary)}</p>
              <div class="thread-stats">
                <span class="stat">${formatNumber(article.views)} views</span>
                <span class="stat">${formatNumber(article.comments)} レス</span>
                ${renderTagStat(article)}
                ${sourceUrl ? `<a class="stat source-stat" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">引用元</a>` : ""}
              </div>
            </div>
            <ol class="res-list">
              ${(article.replies || []).map((reply, index) => renderReply(reply, index)).join("")}
            </ol>
            ${renderThreadConclusion(article)}
          </article>
        </section>

        <aside class="sidebar" aria-label="サイドバー">
          <section class="side-block">
            <h2>人気記事</h2>
            <ol class="ranking-list">
              ${ranking.map((item, index) => renderRankingItem(item, index)).join("")}
            </ol>
          </section>
        </aside>
      </div>
    </main>

    <footer class="site-footer">
      <p>FIREまとめログ</p>
    </footer>
  </body>
</html>
`;
}

async function writeSitemap(articles) {
  const dates = articles.map((article) => toIsoDate(article.date)).filter(Boolean).sort();
  const latestDate = dates[dates.length - 1];
  const urls = [
    {
      loc: `${SITE_URL}/`,
      lastmod: latestDate,
      changefreq: "daily",
      priority: "1.0",
    },
    ...articles.map((article) => ({
      loc: articleUrl(article),
      lastmod: toIsoDate(article.date),
      changefreq: "weekly",
      priority: "0.8",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(renderSitemapUrl).join("\n")}
</urlset>
`;
  await writeFile(SITEMAP_PATH, xml);
}

function renderSitemapUrl(item) {
  return `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    ${item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : ""}
    <changefreq>${escapeXml(item.changefreq)}</changefreq>
    <priority>${escapeXml(item.priority)}</priority>
  </url>`;
}

function articleUrl(article) {
  return `${SITE_URL}/articles/${encodeURIComponent(article.id)}.html`;
}

function metaDescription(article) {
  const text = String(article.summary || SITE_DESCRIPTION).replace(/\s+/g, " ").trim();
  return text.length > 150 ? `${text.slice(0, 149)}…` : text;
}

function toIsoDate(value) {
  const match = String(value || "").match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function renderJsonLd(data) {
  const json = JSON.stringify(data, null, 2)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
  return `<script type="application/ld+json">${json}</script>`;
}

function pageAssetPath(value) {
  const src = String(value || "");
  return src.startsWith("assets/") ? `../${src}` : src;
}

function renderReply(reply, index) {
  const [no, name, idText, time, text] = reply;
  const markedText = escapeHtml(text).replace(/(&gt;&gt;\d+)/g, '<span class="quote">$1</span>');
  return `<li class="res ${index === 1 ? "is-pick" : ""}">
  <div class="res-meta">
    <span class="res-no">${escapeHtml(no)}</span>
    <span class="id">${escapeHtml(idText)}</span>
    <time>${escapeHtml(time)}</time>
  </div>
  <p>${markedText}</p>
</li>`;
}

function renderTagStat(article) {
  const tags = (article.tags || []).map((tag) => `#${escapeHtml(tag)}`).join(" ");
  return tags ? `<span class="stat">${tags}</span>` : "";
}

function renderThreadConclusion(article) {
  const conclusion = article.conclusion || article.summary;
  return `<section class="thread-conclusion" aria-label="スレまとめ">
  <h2>スレまとめ</h2>
  <p>${escapeHtml(conclusion)}</p>
</section>`;
}

function renderRankingItem(article, index) {
  return `<li>
  <a href="./${encodeURIComponent(article.id)}.html">
    <span class="rank-no">${index + 1}</span>
      <span>
        <strong>${escapeHtml(article.title)}</strong>
      <span>${formatNumber(article.views)} views / ${formatNumber(article.comments)} レス</span>
      </span>
  </a>
</li>`;
}

function safeUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("ja-JP");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
