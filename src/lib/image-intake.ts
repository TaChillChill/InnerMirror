// Pure rules shared by the three ways an image can arrive (picker, drop, paste), kept free
// of DOM types so they can be unit-tested in Node.

/** Which of the incoming files fit in the free slots, and how many were left out. */
export function planIntake<T extends { type: string }>(files: T[], room: number): { accepted: T[]; ignored: number; notImages: number } {
  const images = files.filter((f) => f.type.startsWith("image/"));
  const accepted = images.slice(0, Math.max(0, room));
  return { accepted, ignored: images.length - accepted.length, notImages: files.length - images.length };
}

/** Text paste must keep working in fields: only intercept when the target isn't editable. */
export function isEditableTarget(el: { tagName?: string; isContentEditable?: boolean } | null): boolean {
  if (!el) return false;
  const tag = (el.tagName ?? "").toUpperCase();
  return tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT" || el.isContentEditable === true;
}

/** Only react to drags that carry files, not selected text or page elements. */
export function hasFiles(types: ArrayLike<string> | undefined): boolean {
  return !!types && Array.from(types).includes("Files");
}
