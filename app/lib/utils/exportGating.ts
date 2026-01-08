import { PromptVersion } from '@/types';

/**
 * Determines if export functionality should be enabled.
 * Export is only available after a derived version (V1+) exists.
 *
 * V0 alone = no export (initial prompt, no changes applied)
 * Analysis alone = no export (must apply changes first)
 * V1+ exists = export enabled
 */
export function canExportPrompt(versions: PromptVersion[]): boolean {
  // Must have at least one version with versionNumber > 0
  return versions.some(v => v.versionNumber > 0);
}

export const EXPORT_DISABLED_MESSAGE = 'Apply changes to create V1 and enable export.';
