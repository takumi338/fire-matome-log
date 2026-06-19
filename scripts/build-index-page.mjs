#!/usr/bin/env node
import vm from "node:vm";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { selectArticleThumbnail } from "./article-thumbnails.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "index.html");
const SCRIPT_PATH = path.join(ROOT, "script.js");
const GENERATED_PATH = path.join(ROOT, "data", "articles.generated.js");
const SITE_URL = "https://fire.development-test.com";
const SITE_NAME = "FIREまとめログ";
const PAGE_SIZE = 10;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const [indexHtml, articles] = await Promise.all([readFile(INDEX_PATH, "utf8"), loadArticles()]);
  const latestArticles = [...articles].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const firstPageArticles = latestArticles.slice(0, PAGE_SIZE);
  const rankingArticles = [...articles].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 5);

  let html = replaceBetween(indexHtml, "STATIC_ARTICLE_LIST", renderArticleCards(firstPageArticles));
  html = replaceBetween(html, "STATIC_RANKING_LIST", renderRankingItems(rankingArticles));
  html = replaceBetween(html, "INDEX_ITEM_LIST_JSON_LD", renderItemListJsonLd(latestArticles.slice(0, 30)));

  await writeFile(INDEX_PATH, html);
  console.log(`Built static index links: ${firstPageArticles.length}`);
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

function renderArticleCards(articles) {
  return articles
    .map(
      (article) => `            <article class="article-card">
              <a class="article-thumb" href="${escapeHtml(articlePath(article))}" aria-label="${escapeHtml(article.title)}を読む">
                <img src="${escapeHtml(articleThumbnail(article))}" alt="" loading="lazy" decoding="async" />
              </a>
              <div>
                <div class="article-meta">
                  <span class="pill">${escapeHtml(article.category)}</span>
                  <span>${escapeHtml(article.date)}</span>
                  <span>${formatNumber(article.views)} views</span>
                  <span>${formatNumber(article.comments)} レス</span>
                </div>
                <h3><a href="${escapeHtml(articlePath(article))}">${escapeHtml(article.title)}</a></h3>
                <div class="article-actions">
                  ${(article.tags || []).map((tag) => `<span class="mini-tag">#${escapeHtml(tag)}</span>`).join("")}
                </div>
              </div>
            </article>`,
    )
    .join("\n");
}

function renderRankingItems(articles) {
  return articles
    .map(
      (article, index) => `              <li>
                <a href="${escapeHtml(articlePath(article))}">
                  <span class="rank-no">${index + 1}</span>
                  <span>
                    <strong>${escapeHtml(article.title)}</strong>
                    <span>${formatNumber(article.views)} views / ${formatNumber(article.comments)} レス</span>
                  </span>
                </a>
              </li>`,
    )
    .join("\n");
}

function renderItemListJsonLd(articles) {
  if (!articles.length) return "";

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} 新着まとめ`,
    url: `${SITE_URL}/`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteArticleUrl(article),
        name: article.title,
      })),
    },
  };

  return `    <script type="application/ld+json">${JSON.stringify(data, null, 2).replaceAll("<", "\\u003c")}</script>`;
}

function replaceBetween(html, marker, content) {
  const pattern = new RegExp(`(\\s*<!-- ${marker}_START -->)[\\s\\S]*?(\\s*<!-- ${marker}_END -->)`);
  return html.replace(pattern, `$1\n${content}\n$2`);
}

function articlePath(article) {
  return `articles/${encodeURIComponent(article.id)}.html`;
}

function absoluteArticleUrl(article) {
  return `${SITE_URL}/${articlePath(article)}`;
}

function articleThumbnail(article) {
  return article.thumbnail || selectArticleThumbnail(article);
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
