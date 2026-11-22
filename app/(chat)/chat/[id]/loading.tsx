import { ProgressBar } from '@/components/fifthseason/states';

/**
 * Shown while the next chat loads. Switching chats used to give no feedback
 * at all; now a thin brand-gradient bar runs across the top of the page.
 */
export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <ProgressBar label="Loading chat" className="h-0.5 rounded-none" />
    </div>
  );
}
