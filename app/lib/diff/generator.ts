import * as Diff from "diff";

export interface DiffInfo {
  patch: string;
  additions: number;
  deletions: number;
  hunks: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: string[];
  }>;
}

export function generateDiff(
  originalText: string,
  modifiedText: string
): DiffInfo {
  const patch = Diff.createPatch(
    "prompt",
    originalText,
    modifiedText,
    "original",
    "modified"
  );

  const changes = Diff.diffLines(originalText, modifiedText);

  let additions = 0;
  let deletions = 0;

  changes.forEach((change) => {
    if (change.added) additions += change.count || 0;
    if (change.removed) deletions += change.count || 0;
  });

  const hunks = parsePatchHunks(patch);

  return {
    patch,
    additions,
    deletions,
    hunks,
  };
}

function parsePatchHunks(patch: string) {
  const lines = patch.split("\n");
  const hunks: DiffInfo["hunks"] = [];
  let currentHunk: DiffInfo["hunks"][0] | null = null;

  for (const line of lines) {
    const hunkMatch = line.match(/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
    if (hunkMatch) {
      if (currentHunk) hunks.push(currentHunk);
      currentHunk = {
        oldStart: parseInt(hunkMatch[1]),
        oldLines: parseInt(hunkMatch[2]),
        newStart: parseInt(hunkMatch[3]),
        newLines: parseInt(hunkMatch[4]),
        lines: [],
      };
    } else if (
      currentHunk &&
      (line.startsWith("+") || line.startsWith("-") || line.startsWith(" "))
    ) {
      currentHunk.lines.push(line);
    }
  }

  if (currentHunk) hunks.push(currentHunk);

  return hunks;
}

export function applyChange(
  originalPrompt: string,
  type: "add" | "remove" | "replace",
  originalText: string | undefined,
  proposedText: string,
  targetSection?: string
): string {
  switch (type) {
    case "replace":
      if (!originalText) {
        throw new Error("originalText required for replace operation");
      }
      return originalPrompt.replace(originalText, proposedText);

    case "remove":
      if (!originalText) {
        throw new Error("originalText required for remove operation");
      }
      return originalPrompt.replace(originalText, "");

    case "add":
      if (!targetSection) {
        return originalPrompt + "\n\n" + proposedText;
      }
      return originalPrompt + "\n\n" + proposedText;

    default:
      throw new Error(`Unknown change type: ${type}`);
  }
}
