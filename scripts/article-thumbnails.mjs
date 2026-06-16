export const DEFAULT_THUMBNAIL = "assets/thumb-fire-plan.png";

export const ARTICLE_THUMBNAIL_RULES = [
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
  .map((src) => ARTICLE_THUMBNAIL_RULES.find((rule) => rule.src === src))
  .filter(Boolean);

export function selectArticleThumbnail(article = {}) {
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
  const rules = options.rules || ARTICLE_THUMBNAIL_RULES;
  return rules.find((item) => {
    if (options.skipBroad && BROAD_THUMBNAIL_SOURCES.has(item.src)) return false;
    return item.keywords.some((keyword) => target.includes(keyword.toLowerCase()));
  });
}
