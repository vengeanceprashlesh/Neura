import type { FilePatch } from "@/lib/types/patch";

/**
 * Apply patches to current files to get new file state
 */
export function applyPatches(
    currentFiles: Record<string, string>,
    patches: FilePatch[]
): Record<string, string> {
    const files = { ...currentFiles };

    for (const patch of patches) {
        const { path, kind, nextContent } = patch;

        if (kind === "create" || kind === "update") {
            if (typeof nextContent !== "string") continue;
            files[path] = nextContent;
        } else if (kind === "delete") {
            delete files[path];
        }
    }

    return files;
}
