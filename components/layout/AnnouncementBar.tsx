/** One useful line. Renders nothing when there is no message. */
export function AnnouncementBar({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="bg-kiln/[0.14] px-4 py-2 text-center t-caption font-medium text-ink">
      <span className="mx-auto block max-w-[1200px] truncate">{text}</span>
    </p>
  );
}
