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
      const existing = data.permalink;
      if (!existing) return undefined;

      // If already URL-safe (ASCII only, no spaces/special chars), keep as-is
      if (/^[a-zA-Z0-9\-_\/]+$/.test(existing)) {
        return existing;
      }

      // Contains non-ASCII or unsafe chars — generate slug from filename
      const slug = transliterateSlug(data.page.fileSlug || "");
      return "/" + slug + "/";
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
