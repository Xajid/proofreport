/** Demo checks stay in the workspace. Client PDFs and share pages only show live citations. */
export function liveMentions<T extends { source?: string | null }>(rows: T[]): T[] {
  return rows.filter((row) => row.source === "live");
}
