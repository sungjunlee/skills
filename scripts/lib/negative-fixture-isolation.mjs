import path from "node:path";

function fixtureStem(document) {
  const basename = path.basename(document.filename);
  const prefix = `${document.kind}.`;
  return basename.startsWith(prefix) ? basename.slice(prefix.length) : basename;
}

function documentIdentity(document) {
  return `${document.kind}\0${document.value.case_id}`;
}

export function negativeFixtureMembers(invalidDocuments, subject) {
  const mateKind = subject.kind === "case" ? "result" : "case";
  const stem = fixtureStem(subject);
  return [
    subject,
    ...invalidDocuments.filter(
      (candidate) => candidate.kind === mateKind && fixtureStem(candidate) === stem,
    ),
  ];
}

export function isolateNegativeFixture(validDocuments, invalidDocuments, subject) {
  const replacements = negativeFixtureMembers(invalidDocuments, subject);
  const replaced = new Set(replacements.map(documentIdentity));
  return [
    ...validDocuments.filter((document) => !replaced.has(documentIdentity(document))),
    ...replacements,
  ];
}
