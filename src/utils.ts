import ignore from "ignore";

export function filterGitDiff(diff: string, excludeFiles?: string[]): string {
  if (!excludeFiles || excludeFiles.length === 0) return diff;

  const ig = ignore().add(excludeFiles);

  const chunks = diff.split(/^diff --git /m);
  let filteredDiff = chunks[0] ?? ""; // preamble

  for (let i = 1; i < chunks.length; i++) {
    const chunk = "diff --git " + chunks[i];
    const match = chunk.match(/^diff --git a\/(.*?)\s+b\//);
    const filename = match?.[1] ?? "";

    if (filename && ig.ignores(filename)) {
      continue;
    }

    filteredDiff += chunk;
  }
  return filteredDiff;
}
