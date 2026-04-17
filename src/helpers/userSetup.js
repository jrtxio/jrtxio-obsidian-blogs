function userMarkdownSetup(md) {
  // The md parameter stands for the markdown-it instance used throughout the site generator.
  // Feel free to add any plugin you want here instead of /.eleventy.js
}
function userEleventySetup(eleventyConfig) {
  // The eleventyConfig parameter stands for the the config instantiated in /.eleventy.js.
  // Feel free to add any plugin you want here instead of /.eleventy.js
  eleventyConfig.addNunjucksFilter("sortByCreated", (notes) => {
    return notes.slice().sort((a, b) => {
      const dateA = a.data?.["dg-note-properties"]?.created || "";
      const dateB = b.data?.["dg-note-properties"]?.created || "";
      return dateB.localeCompare(dateA);
    });
  });
}
exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
