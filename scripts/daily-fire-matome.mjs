#!/usr/bin/env node
import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { selectArticleThumbnail } from "./article-thumbnails.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config", "sources.json");
const GENERATED_JS_PATH = path.join(ROOT, "data", "articles.generated.js");
const DRAFTS_DIR = path.join(ROOT, "data", "drafts");
const RAW_DIR = path.join(ROOT, "data", "raw");

const FIRE_KEYWORDS = [
  "fire",
  "FIRE",
  "早期リタイア",
  "セミリタイア",
  "半隠居",
  "ファイア",
  "ファイアー",
  "サイドFIRE",
  "経済的自立",
  "金融資産",
  "資産形成",
  "資産",
  "投資",
  "インデックス",
  "NISA",
  "新NISA",
  "iDeCo",
  "4%",
  "取り崩し",
  "配当",
  "節約",
  "固定費",
  "副業",
  "退職",
  "生活費",
  "国保",
  "住民税",
  "暴落",
  "現金比率",
];

const TITLE_PRIORITY_KEYWORDS = [
  "fire",
  "FIRE",
  "早期リタイア",
  "セミリタイア",
  "リタイア",
  "サイドFIRE",
  "ファイア",
  "ファイアー",
  "経済的自立",
  "金融資産",
  "資産形成",
];

const INTEREST_KEYWORDS = [
  "実際",
  "現実",
  "失敗",
  "後悔",
  "怖い",
  "安心",
  "強い",
  "大事",
  "違う",
  "結局",
  "試す",
  "見落とす",
  "続く",
  "メンタル",
  "幸福度",
];

const BLOCKED_WORDS = [
  "殺す",
  "死ね",
  "個人情報",
  "住所",
  "電話番号",
  "障害",
  "アホ",
  "阿保",
  "バカ",
  "馬鹿",
  "マヌケ",
  "糞",
  "ゴミ",
  "負け犬",
  "精子",
  "オナニー",
  "ションベン",
  "惨め",
  "捏造",
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const args = new Set(process.argv.slice(2));
  const config = await readJson(CONFIG_PATH);
  const sources = (config.sources || []).filter((source) => source.enabled !== false);

  await mkdir(DRAFTS_DIR, { recursive: true });
  await mkdir(RAW_DIR, { recursive: true });

  const collected = [];
  for (const source of sources) {
    const result = await collectSource(source, config);
    collected.push(...result);
  }

  const drafts = collected
    .map((thread) => buildDraft(thread, config))
    .filter(Boolean)
    .sort((a, b) => b.titlePriority - a.titlePriority || b.score - a.score)
    .slice(0, config.maxDraftsPerRun || 3);

  const existing = config.keepHistoricalDrafts === false ? [] : await readGeneratedArticles();
  const merged = config.keepHistoricalDrafts === false ? drafts : mergeArticles(drafts, existing);
  await writeGeneratedArticles(merged);

  const stamp = todayStamp();
  await writeFile(path.join(DRAFTS_DIR, `${stamp}.json`), JSON.stringify(drafts, null, 2));
  await writeFile(path.join(RAW_DIR, `${stamp}.json`), JSON.stringify(collected, null, 2));

  if (!args.has("--quiet")) {
    console.log(`Collected threads: ${collected.length}`);
    console.log(`Generated drafts: ${drafts.length}`);
    console.log(`Updated: ${path.relative(ROOT, GENERATED_JS_PATH)}`);
  }
}

async function collectSource(source, config) {
  if (source.type === "sample-thread") {
    const sourcePath = path.join(ROOT, source.path);
    const html = await readFile(sourcePath, "utf8");
    return [parseThreadHtml(html, `file://${source.path}`, source.name)];
  }

  if (source.type === "thread-html") {
    const html = await fetchText(source.url, config, source);
    return [parseThreadHtml(html, source.url, source.name)];
  }

  if (source.type === "thread-list") {
    const html = await fetchText(source.url, config, source);
    const links = extractThreadLinks(html, source.url)
      .map((link) => ({
        ...link,
        titlePriority: scoreTitlePriority(link.title),
        score: scoreText(`${link.title} ${link.context}`),
      }))
      .filter((link) => link.score > 0)
      .sort((a, b) => b.titlePriority - a.titlePriority || b.score - a.score)
      .slice(0, source.maxThreads || config.maxThreadsPerList || 5);

    const threads = [];
    for (const link of links) {
      try {
        const threadHtml = await fetchText(link.url, config, source);
        const thread = parseThreadHtml(threadHtml, link.url, source.name);
        thread.listTitle = link.title;
        threads.push(thread);
      } catch (error) {
        console.warn(`Skipped ${link.url}: ${error.message}`);
      }
    }
    return threads;
  }

  if (source.type === "5ch-subject") {
    const text = await fetchText(source.url, config, source);
    const threads = parseFiveChSubject(text, source.url)
      .map((thread) => ({
        ...thread,
        titlePriority: scoreTitlePriority(thread.title),
        score: scoreText(thread.title),
      }))
      .filter((thread) => thread.score > 0)
      .sort((a, b) => b.titlePriority - a.titlePriority || b.score - a.score || b.comments - a.comments)
      .slice(0, source.maxThreads || config.maxThreadsPerList || 5);

    const results = [];
    for (const thread of threads) {
      try {
        const html = await fetchText(thread.url, config, source);
        const parsed = parseThreadHtml(html, thread.url, source.name);
        parsed.listTitle = thread.title;
        parsed.subjectComments = thread.comments;
        results.push(parsed);
      } catch (error) {
        console.warn(`Skipped ${thread.url}: ${error.message}`);
      }
    }
    return results;
  }

  throw new Error(`Unsupported source type: ${source.type}`);
}

async function fetchText(url, config, source) {
  const target = new URL(url);
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error(`Only http/https URLs are supported for remote sources: ${url}`);
  }

  if (source.respectRobots !== false) {
    const robots = await fetchRobots(target, config.userAgent);
    const allowed = isAllowedByRobots(robots.text, target);
    if (!allowed) {
      throw new Error(`Blocked by robots.txt: ${url}`);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), source.timeoutMs || 15000);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": config.userAgent,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    const buffer = await response.arrayBuffer();
    return decodeResponse(buffer, response.headers.get("content-type"), source.encoding);
  } finally {
    clearTimeout(timeout);
  }
}

function decodeResponse(buffer, contentType = "", sourceEncoding = "") {
  const hint = `${sourceEncoding} ${contentType}`.toLowerCase();
  const encoding = /shift[_-]?jis|sjis|windows-31j/.test(hint) ? "shift_jis" : "utf-8";
  return new TextDecoder(encoding).decode(buffer);
}

async function fetchRobots(target, userAgent) {
  const robotsUrl = `${target.origin}/robots.txt`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(robotsUrl, {
      headers: { "user-agent": userAgent, accept: "text/plain,*/*;q=0.8" },
      signal: controller.signal,
    });
    if (response.status === 404) {
      return { url: robotsUrl, text: "" };
    }
    if (!response.ok) {
      throw new Error(`robots.txt HTTP ${response.status}`);
    }
    return { url: robotsUrl, text: await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

function isAllowedByRobots(robotsText, target) {
  if (!robotsText.trim()) return true;

  const pathWithQuery = `${target.pathname}${target.search}`;
  const groups = parseRobotsGroups(robotsText);
  const relevant = groups.filter((group) => group.agents.includes("*"));
  if (!relevant.length) return true;

  const rules = relevant.flatMap((group) => group.rules);
  let winner = null;
  for (const rule of rules) {
    if (!rule.path) continue;
    if (pathMatchesRobots(rule.path, pathWithQuery)) {
      if (!winner || rule.path.length > winner.path.length) {
        winner = rule;
      }
    }
  }
  return winner ? winner.type === "allow" : true;
}

function parseRobotsGroups(text) {
  const groups = [];
  let group = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "user-agent") {
      if (!group || group.rules.length) {
        group = { agents: [], rules: [] };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
      continue;
    }

    if ((key === "allow" || key === "disallow") && group) {
      group.rules.push({ type: key, path: value });
    }
  }

  return groups;
}

function pathMatchesRobots(pattern, targetPath) {
  if (!pattern) return false;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
  const regex = new RegExp(`^${escaped}`);
  return regex.test(targetPath);
}

function extractThreadLinks(html, baseUrl) {
  const links = [];
  const seen = new Set();
  const linkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkPattern.exec(html))) {
    const href = decodeEntities(match[1]);
    const title = normalizeText(htmlToText(match[2]));
    if (!href.includes("/test/read.cgi/")) continue;

    const url = new URL(href, baseUrl).href;
    if (seen.has(url)) continue;
    seen.add(url);

    const contextStart = Math.max(0, match.index - 260);
    const contextEnd = Math.min(html.length, match.index + match[0].length + 260);
    const context = normalizeText(htmlToText(html.slice(contextStart, contextEnd)));
    links.push({ url, title, context });
  }
  return links;
}

function parseFiveChSubject(text, subjectUrl) {
  const subject = new URL(subjectUrl);
  const [, board] = subject.pathname.match(/^\/([^/]+)\//) || [];
  if (!board) throw new Error(`Cannot infer 5ch board from ${subjectUrl}`);

  return text
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(\d+)\.dat<>(.*?)\s*\((\d+)\)\s*$/);
      if (!match) return null;
      const [, key, rawTitle, rawComments] = match;
      const title = normalizeText(decodeEntities(rawTitle));
      return {
        key,
        title,
        comments: Number(rawComments || 0),
        url: `${subject.origin}/test/read.cgi/${board}/${key}/`,
      };
    })
    .filter(Boolean);
}

function parseThreadHtml(html, sourceUrl, sourceName) {
  const title = normalizeText(
    firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
      "FIRE関連スレッド",
  );

  const replies = parseFiveChThreadPosts(html);
  const dlPattern = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let match;
  if (!replies.length) {
    while ((match = dlPattern.exec(html))) {
      const meta = normalizeText(htmlToText(match[1]));
      const body = normalizeText(htmlToText(match[2]));
      if (!body) continue;
      replies.push(parseReply(meta, body, replies.length + 1));
    }
  }

  if (!replies.length) {
    const articlePattern = /<(article|section|div)\b[^>]*(?:class=["'][^"']*(?:post|res|reply|message)[^"']*["'])[^>]*>([\s\S]*?)<\/\1>/gi;
    while ((match = articlePattern.exec(html))) {
      const text = normalizeText(htmlToText(match[2]));
      if (text.length < 12) continue;
      replies.push(parseReply("", text, replies.length + 1));
    }
  }

  return {
    sourceName,
    sourceUrl,
    title,
    replies,
    collectedAt: new Date().toISOString(),
  };
}

function parseFiveChThreadPosts(html) {
  const replies = [];
  const postPattern =
    /<div\b[^>]*id=["'](\d+)["'][^>]*data-userid=["']([^"']*)["'][^>]*data-id=["']([^"']*)["'][^>]*class=["'][^"']*\bpost\b[^"']*["'][\s\S]*?<span class=["']postusername["']>([\s\S]*?)<\/span>[\s\S]*?<span class=["']date["']>([\s\S]*?)<\/span>[\s\S]*?<span class=["']uid["']>([\s\S]*?)<\/span>[\s\S]*?<div class=["']post-content["']>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let match;
  while ((match = postPattern.exec(html))) {
    const [, no, dataUserId, , rawName, rawTime, rawUid, rawBody] = match;
    const text = normalizeText(htmlToText(rawBody));
    if (!text) continue;
    replies.push({
      no,
      name: normalizeText(htmlToText(rawName)) || "名無しさん",
      id: normalizeText(htmlToText(rawUid)) || dataUserId || "",
      time: normalizeText(htmlToText(rawTime)),
      text,
    });
  }
  return replies;
}

function parseReply(meta, body, index) {
  const no = firstMatch(meta, /^\s*(\d+)/) || String(index);
  const time = firstMatch(meta, /(\d{4}\/\d{2}\/\d{2}[^I]+?)(?:\s+ID:|$)/) || "";
  const id = firstMatch(meta, /(ID:[A-Za-z0-9+/.:-]+)/) || "";
  const name = normalizeText(meta.replace(no, "").replace(time, "").replace(id, "").replace(/[：:]+/g, " ")) || "名無しさん";
  return { no, name, id, time, text: body };
}

function buildDraft(thread, config) {
  const titlePriority = scoreTitlePriority(thread.title);
  const threadScore =
    titlePriority + scoreText(thread.title) + thread.replies.reduce((sum, reply) => sum + scoreReply(reply, thread.title, config), 0);
  if (threadScore <= 0) return null;

  const maxReplies = config.maxRepliesPerDraft || 7;
  const minScore = config.minReplyScore || 4;
  const picked = thread.replies
    .map((reply, index) => ({ ...reply, index, score: scoreReply(reply, thread.title, config) }))
    .filter((reply) => reply.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxReplies)
    .sort((a, b) => a.index - b.index);

  if (!picked.length) return null;

  const tags = buildTags(thread, picked);
  const category = chooseCategory(tags, thread.title);
  const id = `${todayStamp()}-${slugify(thread.title).slice(0, 38) || hash(thread.sourceUrl).slice(0, 10)}`;

  return {
    id,
    title: makeDraftTitle(thread),
    category,
    date: formatDate(new Date()),
    views: Math.max(1200, Math.round(threadScore * 145)),
    comments: thread.replies.length,
    summary: makeSummary(thread, picked),
    conclusion: makeConclusion(thread, picked, tags),
    thumbnail: selectArticleThumbnail({
      title: thread.title,
      category,
      tags,
      replies: picked.map((reply) => reply.text),
    }),
    tags,
    status: "draft",
    sourceName: thread.sourceName,
    sourceUrl: thread.sourceUrl,
    generatedAt: new Date().toISOString(),
    score: threadScore,
    titlePriority,
    replies: picked.map((reply) => [
      reply.no,
      "",
      reply.id || "",
      reply.time || "",
      trimReply(reply.text, config.maxReplyOutputLength || 220),
    ]),
  };
}

function scoreText(text) {
  const lower = String(text || "").toLowerCase();
  return FIRE_KEYWORDS.reduce((sum, keyword) => sum + (lower.includes(keyword.toLowerCase()) ? 3 : 0), 0);
}

function scoreTitlePriority(text) {
  const lower = String(text || "").toLowerCase();
  return TITLE_PRIORITY_KEYWORDS.reduce((sum, keyword) => {
    if (!lower.includes(keyword.toLowerCase())) return sum;
    return sum + (/fire|リタイア|ファイア/.test(keyword.toLowerCase()) ? 60 : 20);
  }, 0);
}

function scoreReply(reply, context = "", config = {}) {
  const text = reply.text || "";
  if (text.length < 14 || text.length > (config.maxReplyInputLength || 520)) return 0;
  if (BLOCKED_WORDS.some((word) => text.includes(word))) return 0;
  if (/https?:\/\//.test(text) || /(?:^|\s)[a-z0-9.-]+\.[a-z]{2,}\//i.test(text)) return 0;

  let score = scoreText(text);
  if (scoreText(context) > 0 && /[0-9０-９]|万円|退職|仕事|生活|節約|投資|NISA|資産|リタイア|ファイア/.test(text)) score += 2;
  score += INTEREST_KEYWORDS.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
  if (/[0-9０-９]+/.test(text)) score += 2;
  if (/[？?]/.test(text)) score += 1;
  if (/>>\d+/.test(text)) score += 1;
  if (/(ただ|でも|一方|より|結局)/.test(text)) score += 1;
  return score;
}

function buildTags(thread, picked) {
  const haystack = `${thread.title} ${picked.map((reply) => reply.text).join(" ")}`;
  const rules = [
    ["4%ルール", ["4%", "取り崩し"]],
    ["生活費", ["生活費", "家賃", "食費"]],
    ["固定費", ["固定費", "通信費", "保険", "サブスク", "車"]],
    ["サイドFIRE", ["サイドFIRE", "週2", "週3", "副収入", "副業"]],
    ["税金", ["住民税", "国保", "税金"]],
    ["暴落耐性", ["暴落", "現金", "現金比率"]],
    ["退職ライン", ["退職", "辞める", "FIRE"]],
    ["NISA", ["NISA", "新NISA", "インデックス"]],
  ];

  const tags = rules
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([tag]) => tag);

  return [...new Set(tags)].slice(0, 4);
}

function chooseCategory(tags, title) {
  const text = `${title} ${tags.join(" ")}`;
  if (/副業|副収入/.test(text)) return "副業";
  if (/固定費|節約|食費|通信費|保険|サブスク|車/.test(text)) return "節約";
  if (/失敗|後悔|暴落/.test(text)) return "失敗談";
  if (/4%ルール|NISA|新NISA|資産|投資|税金|退職ライン/.test(text)) return "資産形成";
  if (/退職|生活|暇|健康/.test(text)) return "退職後生活";
  return "資産形成";
}

function makeDraftTitle(thread) {
  return decodeEntities(decodeEntities(normalizeText(thread.title)));
}

function makeSummary(thread, picked) {
  const themes = buildTags(thread, picked).join("、") || "資産形成";
  return `${themes}を中心に、FIRE計画の現実ラインを話し合う流れ。`;
}

function makeConclusion(thread, picked, tags) {
  const themes = tags.join("、") || "資産形成";
  const hasRisk = picked.some((reply) => /暴落|現金|下落|怖|リスク|退場/.test(reply.text));
  const hasWork = picked.some((reply) => /仕事|退職|FIRE|リタイア|副業|生活費/.test(reply.text));
  const hasNisa = picked.some((reply) => /NISA|iDeCo|インデックス|オルカン|SP500/.test(reply.text));
  const points = [];

  if (hasNisa) points.push("投資先や積立の考え方");
  if (hasRisk) points.push("暴落時の耐性");
  if (hasWork) points.push("仕事を続けるか辞めるかの現実感");
  if (!points.length) points.push("資産額と生活設計のバランス");

  return `${thread.title}では、${themes}を軸に${points.join("、")}が話題になりました。全体としては、資産額だけで判断するより、生活費、現金余力、相場が悪い時の動き方、働き方の逃げ道まで含めてFIRE計画を見る流れです。`;
}

function trimReply(text, maxLength) {
  return shorten(cleanQuote(text), maxLength);
}

function cleanQuote(text) {
  return normalizeText(
    String(text || "")
      .replace(/\d+\s+名無しさん＠お金いっぱい。[^\n]*?\d{4}\/\d{2}\/\d{2}[^\n]*?(?:ID:[A-Za-z0-9+/.:-]+)?/g, "")
      .replace(/名無しさん＠お金いっぱい。(?:\s*\([^)]*\))?/g, "")
      .replace(/\bsage\b/g, "")
      .replace(/ID:[A-Za-z0-9+/.:-]+/g, "")
      .replace(/\s+/g, " "),
  );
}

function shorten(text, max) {
  const value = String(text || "");
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function slugify(value) {
  const ascii = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || hash(value).slice(0, 12);
}

function hash(value) {
  return crypto.createHash("sha1").update(String(value)).digest("hex");
}

function firstMatch(text, pattern) {
  return String(text || "").match(pattern)?.[1] || "";
}

function htmlToText(html) {
  return decodeEntities(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|dd|dt|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };
  return String(value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    if (entity[0] === "#") {
      const code = entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    return named[entity.toLowerCase()] ?? "";
  });
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function readGeneratedArticles() {
  try {
    const js = await readFile(GENERATED_JS_PATH, "utf8");
    const json = firstMatch(js, /window\.FIRE_GENERATED_ARTICLES\s*=\s*([\s\S]*?);\s*$/);
    return json ? JSON.parse(json).filter((article) => !String(article.sourceUrl || "").startsWith("file://samples/")) : [];
  } catch {
    return [];
  }
}

function mergeArticles(newDrafts, existing) {
  const seen = new Set();
  return [...newDrafts, ...existing]
    .filter((article) => {
      const key = article.sourceUrl || article.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);
}

async function writeGeneratedArticles(articles) {
  const payload = `window.FIRE_GENERATED_ARTICLES = ${JSON.stringify(articles, null, 2)};\n`;
  await writeFile(GENERATED_JS_PATH, payload);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function todayStamp() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function formatDate(date) {
  const stamp = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return stamp.replaceAll("/", ".");
}
