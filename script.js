const sampleArticles = [
  {
    id: "asset-4000",
    title: "【FIRE】資産4000万円で会社辞めるのって早い？生活費18万円ならいけそう説",
    category: "資産形成",
    date: "2026.06.10",
    views: 18420,
    comments: 126,
    summary: "生活費、税金、暴落耐性、再就職カードを前提に、退職ラインをかなり現実的に詰めるスレ。",
    tags: ["4%ルール", "生活費", "退職ライン"],
    replies: [
      ["1", "名無しのFIRE民", "ID:KoA3p7", "2026/06/10 07:12", "資産4000万、年間生活費216万。会社辞めるには早いかな？"],
      ["5", "名無しの投資家", "ID:Wq90dd", "2026/06/10 07:19", "家賃込み18万ならかなり強いけど、住民税と国保を初年度だけ別枠で見た方がいい。"],
      ["12", "名無しの節約民", "ID:Mc18la", "2026/06/10 07:31", "辞めるかどうかより、週3勤務に落とせる会社を探すのが一番リスク低そう。"],
      ["18", "名無しのFIRE民", "ID:KoA3p7", "2026/06/10 07:42", ">>12\nそれはある。完全リタイアよりサイドFIREの方が精神的には楽かも。"],
      ["26", "名無しのNISA民", "ID:Bp22xz", "2026/06/10 08:02", "暴落時に売らなくていい現金2年分があれば、数字以上に安心感が違う。"],
      ["41", "名無しの家計簿勢", "ID:Yn55qw", "2026/06/10 08:24", "退職前に半年だけ生活費18万縛りで暮らして、再現できたら次の判断でいいんじゃない？"]
    ],
  },
  {
    id: "fixed-cost",
    title: "【節約】FIRE目指すなら投資より先に固定費を切れ、という結論になる",
    category: "節約",
    date: "2026.06.09",
    views: 15110,
    comments: 98,
    summary: "通信費、保険、車、サブスク。毎月の固定費を減らすほど必要資産が小さくなる話。",
    tags: ["固定費", "家計管理", "必要資産"],
    replies: [
      ["2", "名無しの倹約家", "ID:Su41ea", "2026/06/09 21:03", "月3万削れたら年間36万。4%ルールなら必要資産900万減る計算なの強すぎる。"],
      ["7", "名無しの会社員", "ID:Rt83xx", "2026/06/09 21:11", "投資リターンを上げるより固定費を下げる方が再現性高いんよ。"],
      ["15", "名無しの保険見直し民", "ID:Nm12pp", "2026/06/09 21:28", "保険とスマホで月1.7万減った。何年も放置してたの悔しい。"],
      ["24", "名無しのFIRE民", "ID:Js88tk", "2026/06/09 21:46", "節約は我慢じゃなくて、生活の設計を軽くする作業だと思う。"],
      ["32", "名無しの投資家", "ID:Ha64vb", "2026/06/09 22:04", "ただし食費削りすぎは幸福度に直撃するから、削るなら固定費から。"]
    ],
  },
  {
    id: "side-business",
    title: "【副業】月5万円の副収入があるだけでFIRE計画が急に現実味を帯びる件",
    category: "副業",
    date: "2026.06.08",
    views: 12780,
    comments: 74,
    summary: "少額でも継続収入があると取り崩し率が下がり、早期リタイア後の不安も減るという議論。",
    tags: ["副業", "サイドFIRE", "取り崩し"],
    replies: [
      ["3", "名無しの副業民", "ID:Qa51nm", "2026/06/08 19:02", "月5万は資産1500万分くらいの安心感ある。"],
      ["9", "名無しのブロガー", "ID:De40rx", "2026/06/08 19:15", "退職してから副業を始めるより、会社員のうちに小さく作っておくのが大事。"],
      ["17", "名無しのFIRE民", "ID:Ch73yu", "2026/06/08 19:33", "自分で稼げる感覚があると、相場が悪い年でも焦りにくい。"],
      ["21", "名無しの現実派", "ID:Ap09kk", "2026/06/08 19:49", "副業が本業化して忙しくなると本末転倒だから、上限を決めたい。"],
      ["36", "名無しのゆる勤務", "ID:Va61qd", "2026/06/08 20:18", "週2だけ仕事、残りは自由。この形が一番長続きしそう。"]
    ],
  },
  {
    id: "after-retire",
    title: "【退職後生活】FIRE後に暇すぎる問題、結局コミュニティと運動が大事らしい",
    category: "退職後生活",
    date: "2026.06.07",
    views: 10240,
    comments: 83,
    summary: "お金の問題を越えたあとの生活設計。人間関係、運動、予定の作り方について。",
    tags: ["生活設計", "健康", "コミュニティ"],
    replies: [
      ["1", "名無しの早期退職民", "ID:Yu77hs", "2026/06/07 12:22", "辞めて3カ月は最高。その後、曜日感覚がなくなって少し焦った。"],
      ["6", "名無しの散歩勢", "ID:Gg30te", "2026/06/07 12:31", "朝に外へ出る予定を入れるだけで生活リズムがかなり整う。"],
      ["14", "名無しの趣味探し民", "ID:Sk28vz", "2026/06/07 12:48", "趣味は退職後に探すより、働いてる間に育てた方がいい。"],
      ["22", "名無しのFIRE民", "ID:Pp53fa", "2026/06/07 13:04", "資産額より、平日の昼に会える友達の数が効く。"],
      ["39", "名無しの健康第一", "ID:Df98zc", "2026/06/07 13:33", "筋トレと散歩は低コスト高リターン。投資商品より固い。"]
    ],
  },
  {
    id: "failure-story",
    title: "【失敗談】相場が良い年のシミュレーションだけでFIREを決めた結果",
    category: "失敗談",
    date: "2026.06.06",
    views: 13990,
    comments: 112,
    summary: "強気相場の前提で退職を急ぐ危うさ。税金、家族イベント、収入再開の準備を見直す流れ。",
    tags: ["暴落耐性", "再就職", "現金比率"],
    replies: [
      ["4", "名無しの反省民", "ID:Za10lk", "2026/06/06 22:06", "上昇相場の資産額を自分の実力だと勘違いした。"],
      ["11", "名無しのNISA民", "ID:Lp36aa", "2026/06/06 22:18", "悪い年を3つ並べても耐えられるか、で見た方がいいよな。"],
      ["19", "名無しの会社員", "ID:Tb67rn", "2026/06/06 22:36", "辞める前に職務経歴書を更新しておくの地味に大事。戻れる感覚が安心材料になる。"],
      ["27", "名無しの家族持ち", "ID:Rm51gy", "2026/06/06 22:57", "家族イベントの出費は平均値じゃなく最大値で置いた方が揉めない。"],
      ["43", "名無しのFIRE民", "ID:Kk89pi", "2026/06/06 23:21", "失敗というより、計画を現実に合わせて修正しただけとも言える。"]
    ],
  },
  {
    id: "global-fire",
    title: "【海外FIRE】東南アジア移住で生活費を下げる案、為替と医療で意見が割れる",
    category: "資産形成",
    date: "2026.06.05",
    views: 8850,
    comments: 61,
    summary: "海外生活費の魅力と、為替、保険、医療アクセス、孤独リスクを天秤にかけるスレ。",
    tags: ["海外移住", "為替", "医療"],
    replies: [
      ["8", "名無しの旅好き", "ID:Xe42ji", "2026/06/05 18:15", "生活費は下がるけど、為替で計画がブレるのは怖い。"],
      ["13", "名無しの現実派", "ID:No20km", "2026/06/05 18:28", "短期滞在なら楽しい。永住前提なら医療とビザをちゃんと調べたい。"],
      ["25", "名無しのFIRE民", "ID:Ui73dc", "2026/06/05 18:52", "国内地方移住でもかなり固定費は下がるから、まず比較したい。"],
      ["34", "名無しの語学勢", "ID:Fs60qp", "2026/06/05 19:17", "言語ストレスを過小評価するとしんどい。旅行と生活は違う。"],
      ["48", "名無しのセミリタイア民", "ID:Jd19uv", "2026/06/05 19:43", "一年の半分だけ海外、半分は日本くらいが一番よさそう。"]
    ],
  },
];

const generatedArticles = Array.isArray(window.FIRE_GENERATED_ARTICLES) ? window.FIRE_GENERATED_ARTICLES : [];
const articles = generatedArticles.length ? generatedArticles : sampleArticles;
const PAGE_SIZE = 10;
const DEFAULT_THUMBNAIL = "assets/thumb-fire-plan.png";
const THUMBNAIL_RULES = [
  {
    src: "assets/thumb-nisa-index.png",
    keywords: ["NISA", "新NISA", "iDeCo", "イデコ", "インデックス", "オルカン", "SP500", "投信", "少額投資非課税制度"],
  },
  {
    src: "assets/thumb-sidefire-income.png",
    keywords: ["サイドFIRE", "副業", "副収入", "週2", "週3", "YouTuber", "ブログ", "収入"],
  },
  {
    src: "assets/thumb-saving-cost.png",
    keywords: ["節約", "固定費", "生活費", "家計", "食費", "通信費", "保険", "サブスク", "倹約"],
  },
  {
    src: "assets/thumb-market-risk.png",
    keywords: ["暴落", "下落", "リスク", "失敗", "後悔", "退場", "ブル", "レバレッジ", "岐阜暴威"],
  },
  {
    src: "assets/thumb-tax-paperwork.png",
    keywords: ["税金", "住民税", "国保", "年金", "確定申告"],
  },
  {
    src: "assets/thumb-dividend-cashflow.png",
    keywords: ["配当", "分配金", "不労所得", "キャッシュフロー", "優待"],
  },
  {
    src: "assets/thumb-overseas-fire.png",
    keywords: ["海外", "移住", "地方", "為替", "医療", "ビザ"],
  },
  {
    src: "assets/thumb-withdrawal-plan.png",
    keywords: ["4%", "4％", "取り崩し", "出口", "withdrawal"],
  },
  {
    src: "assets/thumb-work-exit.png",
    keywords: ["会社", "仕事", "退職", "辞める", "転職", "再就職"],
  },
  {
    src: "assets/thumb-retire-life.png",
    keywords: ["退職後", "半隠居", "セミリタイア", "リタイア", "暇", "健康", "余暇"],
  },
  {
    src: "assets/thumb-asset-growth.png",
    keywords: ["資産形成", "金融資産", "資産", "投資", "ポートフォリオ", "億", "万円", "株"],
  },
  {
    src: "assets/thumb-fire-plan.png",
    keywords: ["FIRE", "ファイア", "ファイアー", "早期リタイア", "経済的自立"],
  },
];
const BROAD_THUMBNAIL_SOURCES = new Set(["assets/thumb-asset-growth.png"]);
const SPECIFIC_THUMBNAIL_RULES = [
  "assets/thumb-withdrawal-plan.png",
  "assets/thumb-sidefire-income.png",
  "assets/thumb-saving-cost.png",
  "assets/thumb-tax-paperwork.png",
  "assets/thumb-market-risk.png",
  "assets/thumb-dividend-cashflow.png",
  "assets/thumb-overseas-fire.png",
  "assets/thumb-work-exit.png",
  "assets/thumb-retire-life.png",
  "assets/thumb-nisa-index.png",
  "assets/thumb-fire-plan.png",
]
  .map((src) => THUMBNAIL_RULES.find((rule) => rule.src === src))
  .filter(Boolean);
const initialPage = Number.parseInt(new URLSearchParams(window.location.search).get("page") || "1", 10);

const state = {
  category: "all",
  query: "",
  sort: "latest",
  page: Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1,
  activeId: articles[0]?.id || null,
};

const featureArticle = document.querySelector("#feature-article");
const articleList = document.querySelector("#article-list");
const pagination = document.querySelector("#pagination");
const rankingList = document.querySelector("#ranking-list");
const tagList = document.querySelector("#tag-list");
const listTitle = document.querySelector("#list-title");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const categoryButtons = [...document.querySelectorAll(".category-button")];

function articlePath(article) {
  return `articles/${encodeURIComponent(article.id)}.html`;
}

function articleThumbnail(article) {
  if (article.thumbnail) return article.thumbnail;

  const titleRule = matchThumbnailRule([article.title], { skipBroad: true });
  if (titleRule) return titleRule.src;

  const specificRule = matchThumbnailRule([article.category, ...(article.tags || []), article.summary], {
    rules: SPECIFIC_THUMBNAIL_RULES,
    skipBroad: true,
  });
  if (specificRule) return specificRule.src;

  const rule = matchThumbnailRule([article.title, article.category, ...(article.tags || []), article.summary, article.conclusion]);

  return rule?.src || DEFAULT_THUMBNAIL;
}

function matchThumbnailRule(parts, options = {}) {
  const target = parts.filter(Boolean).join(" ").toLowerCase();
  if (!target) return null;
  const rules = options.rules || THUMBNAIL_RULES;
  return rules.find((item) => {
    if (options.skipBroad && BROAD_THUMBNAIL_SOURCES.has(item.src)) return false;
    return item.keywords.some((keyword) => target.includes(keyword.toLowerCase()));
  });
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

function articleMatches(article) {
  const categoryOk = state.category === "all" || article.category === state.category;
  const query = state.query.trim().toLowerCase();
  if (!query) return categoryOk;

  const target = [article.title, article.summary, article.category, ...(article.tags || [])].join(" ").toLowerCase();
  return categoryOk && target.includes(query);
}

function getFilteredArticles() {
  const filtered = articles.filter(articleMatches);
  return [...filtered].sort((a, b) => {
    if (state.sort === "popular") return b.views - a.views;
    if (state.sort === "comments") return b.comments - a.comments;
    return b.date.localeCompare(a.date);
  });
}

function articleDateKey(article) {
  return String(article.date || "").replaceAll(".", "-").replaceAll("/", "-");
}

function comparePickupPriority(a, b) {
  const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
  if (scoreDiff) return scoreDiff;

  const viewsDiff = Number(b.views || 0) - Number(a.views || 0);
  if (viewsDiff) return viewsDiff;

  return Number(b.comments || 0) - Number(a.comments || 0);
}

function selectPickupArticle() {
  if (!articles.length) return null;

  const byDate = [...articles].sort((a, b) => articleDateKey(b).localeCompare(articleDateKey(a)));
  const latestDate = articleDateKey(byDate[0]);
  const candidates = byDate.filter((article) => articleDateKey(article) === latestDate);
  return candidates.sort(comparePickupPriority)[0] || byDate[0];
}

function renderFeature() {
  if (!featureArticle) return;

  const article = selectPickupArticle();
  if (!article) {
    featureArticle.hidden = true;
    return;
  }

  const summary = article.summary || `${article.category || "FIRE"}の話題を中心にしたまとめ記事です。`;
  const meta = [article.category, article.date, `${formatNumber(article.views)} views`, `${formatNumber(article.comments)} レス`].filter(Boolean);

  featureArticle.innerHTML = `
    <a class="feature-link" href="${escapeHtml(articlePath(article))}" aria-label="${escapeHtml(article.title)}を読む">
      <img src="${escapeHtml(articleThumbnail(article))}" alt="" loading="eager" decoding="async" />
      <div class="feature-copy">
        <span class="eyebrow">本日のピックアップ</span>
        <h1>${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(summary)}</p>
        <div class="feature-meta" aria-label="記事情報">
          ${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    </a>
  `;
}

function updatePageUrl() {
  const url = new URL(window.location.href);
  if (state.page > 1) {
    url.searchParams.set("page", String(state.page));
  } else {
    url.searchParams.delete("page");
  }
  window.history.replaceState({}, "", url);
}

function renderArticleList() {
  const items = getFilteredArticles();
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  state.page = Math.min(Math.max(state.page, 1), totalPages);
  const pageStart = (state.page - 1) * PAGE_SIZE;
  const pageItems = items.slice(pageStart, pageStart + PAGE_SIZE);
  const categoryLabel = state.category === "all" ? "総合スレッド" : `${state.category}スレッド`;
  const countLabel = items.length ? `（${formatNumber(items.length)}件）` : "";
  listTitle.textContent = state.query ? `${categoryLabel} / "${state.query}"${countLabel}` : `${categoryLabel}${countLabel}`;

  if (!items.length) {
    articleList.innerHTML = `<div class="empty-state">条件に合う記事がありません。カテゴリや検索語を変えてください。</div>`;
    pagination.innerHTML = "";
    updatePageUrl();
    return;
  }

  articleList.innerHTML = pageItems
    .map(
      (article) => `
        <article class="article-card">
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
              ${(article.tags || []).map((tag) => `<button class="mini-tag" type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")}
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  renderPagination(items.length, totalPages);
  updatePageUrl();
}

function renderPagination(totalItems, totalPages) {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `
      <button class="page-button ${page === state.page ? "is-active" : ""}" type="button" data-page="${page}" aria-current="${page === state.page ? "page" : "false"}">
        ${page}
      </button>
    `;
  }).join("");

  const start = (state.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(state.page * PAGE_SIZE, totalItems);
  pagination.innerHTML = `
    <p>${formatNumber(start)}-${formatNumber(end)} / ${formatNumber(totalItems)}件</p>
    <div class="page-buttons">
      <button class="page-button page-arrow" type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="前のページ">‹</button>
      ${pageButtons}
      <button class="page-button page-arrow" type="button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="次のページ">›</button>
    </div>
  `;
}

function renderRanking() {
  rankingList.innerHTML = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(
      (article, index) => `
        <li>
          <a href="${escapeHtml(articlePath(article))}">
            <span class="rank-no">${index + 1}</span>
            <span>
              <strong>${escapeHtml(article.title)}</strong>
              <span>${formatNumber(article.views)} views / ${formatNumber(article.comments)} レス</span>
            </span>
          </a>
        </li>
      `,
    )
    .join("");
}

function renderTags() {
  const tagCounts = articles.reduce((map, article) => {
    (article.tags || []).forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1));
    return map;
  }, new Map());

  tagList.innerHTML = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))
    .map(([tag]) => `<button class="tag-button" type="button" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`)
    .join("");
}

function setCategory(category) {
  state.category = category;
  state.page = 1;
  categoryButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === category);
  });
  renderArticleList();
}

function setQuery(query) {
  state.query = query;
  state.page = 1;
  searchInput.value = query;
  renderArticleList();
}

document.addEventListener("click", (event) => {
  const pageTarget = event.target.closest("[data-page]");
  if (pageTarget) {
    const page = Number.parseInt(pageTarget.dataset.page, 10);
    if (Number.isFinite(page)) {
      state.page = page;
      renderArticleList();
      articleList.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const tagTarget = event.target.closest("[data-tag]");
  if (tagTarget) {
    setQuery(tagTarget.dataset.tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setQuery(searchInput.value);
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  state.page = 1;
  renderArticleList();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  state.page = 1;
  renderArticleList();
});

renderFeature();
renderArticleList();
renderRanking();
renderTags();
