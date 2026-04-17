function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
  // Feel free to add any plugin you want here instead of /.eleventy.js
}
function userEleventySetup(eleventyConfig) {
  // The eleventyConfig parameter stands for the the config instantiated in /.eleventy.js.
  // Feel free to add any plugin you want here instead of /.eleventy.js

  // Sort articles by dg-note-properties.created (newest first)
  eleventyConfig.addNunjucksFilter("sortByCreated", (notes) => {
    return notes.slice().sort((a, b) => {
      const dateA = a.data?.["dg-note-properties"]?.created || "";
      const dateB = b.data?.["dg-note-properties"]?.created || "";
      return dateB.localeCompare(dateA);
    });
  });

  // Rewrite CDN URLs for better China access (jsdelivr has mainland nodes)
  eleventyConfig.addTransform("china-cdn-rewrite", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      return content
        .replace(/cdnjs\.cloudflare\.com\/ajax\/libs\/prism\/1\.25\.0/g, "cdn.jsdelivr.net/npm/prismjs@1.25.0")
        .replace(/fastly\.jsdelivr\.net/g, "cdn.jsdelivr.net")
        .replace(/raw\.githubusercontent\.com\/krios2146\/obsidian-theme-github\/HEAD\/theme\.css/g, "cdn.jsdelivr.net/gh/krios2146/obsidian-theme-github/theme.css")
        .replace(/unpkg\.com\/lucide@latest/g, "cdn.jsdelivr.net/npm/lucide@latest");
    }
    return content;
  });
}
exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
