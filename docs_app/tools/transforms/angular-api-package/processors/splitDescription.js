/**
 * Split the description (of selected docs) into:
 * * `shortDescription`: the first paragraph
 * * `description`: the rest of the paragraphs
 */
module.exports = function splitDescription() {
  return {
    $runAfter: ['tags-extracted', 'migrateLegacyJSDocTags'],
    $runBefore: ['processing-docs'],
    docTypes: [],
    $process(docs) {
      docs.forEach(doc => {
        if (this.docTypes.indexOf(doc.docType) !== -1 && doc.description !== undefined) {
          const match = doc.description.match(/^(.*)\n\s*\n(.*)\n\s*\n([\s\S]*)$/)
          const description = doc.description.trim();
          if (!match) {
            doc.shortDescription = description;
            doc.description = '';
          } else {
            doc.shortDescription = `${match[1]}\n\n${match[2]}`;
            doc.description = match[3];
          }
        }
      });
    }
  };
};

