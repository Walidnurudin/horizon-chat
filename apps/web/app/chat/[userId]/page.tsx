"use client"
import Chat from '@/components/Chat';

export default function PrivateChat({ params }: { params: { userId: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-gray-50 dark:bg-[#0b141a]">
      <Chat receiverId={params.userId} />
    </main>
  );
}
