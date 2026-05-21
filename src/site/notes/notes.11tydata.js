require("dotenv").config();
const settings = require("../../helpers/constants");
const { slugify: transliterateSlug } = require("transliteration");
const allSettings = settings.ALL_NOTE_SETTINGS;

module.exports = {
  eleventyComputed: {
    layout: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }

      // Priority: dg-note-properties.slug > existing permalink
      const np = data["dg-note-properties"] || {};
      if (np.slug) {
        return "/" + np.slug + "/";
      }

      const existing = data.permalink;
      if (!existing) return undefined;

      // If already URL-safe (ASCII only, no spaces/special chars), keep as-is
      if (/^[a-zA-Z0-9\-_\/]+$/.test(existing)) {
        return existing;
      }

      // Fallback: pinyin transliteration
      const source = data.page.fileSlug || "";
      const fullSlug = transliterateSlug(source);
      const words = fullSlug.split("-").filter(Boolean);
      return "/" + words.slice(0, 6).join("-") + "/";
    },
    basesNotes: (data) => {
      if (!data.collections || !data.collections.note) return [];
      return data.collections.note.map((item) => ({
        path: item.filePathStem.replace("/notes/", ""),
        url: item.url,
        metadata: item.data,
        fileSlug: item.fileSlug,
      }));
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
  },
};
