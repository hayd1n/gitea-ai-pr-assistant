import ignore from "ignore";

export interface FilterDiffResult {
  filteredDiff: string;
  autoExcludedFiles: string[];
}

export function filterGitDiff(
  diff: string,
  excludeFiles?: string[],
  maxFileDiffLength?: number
): FilterDiffResult {
  const result: FilterDiffResult = {
    filteredDiff: "",
    autoExcludedFiles: [],
  };

  const ig = ignore();
  if (excludeFiles && excludeFiles.length > 0) {
    ig.add(excludeFiles);
  }

  const chunks = diff.split(/^diff --git /m);
  result.filteredDiff = chunks[0] ?? ""; // preamble

  for (let i = 1; i < chunks.length; i++) {
    const chunk = "diff --git " + chunks[i];
    const match = chunk.match(/^diff --git a\/(.*?)\s+b\//);
    const filename = match?.[1] ?? "";

    if (
      filename &&
      excludeFiles &&
      excludeFiles.length > 0 &&
      ig.ignores(filename)
    ) {
      continue;
    }

    if (filename && maxFileDiffLength && chunk.length > maxFileDiffLength) {
      result.autoExcludedFiles.push(filename);
      continue;
    }

    result.filteredDiff += chunk;
  }
  return result;
}
