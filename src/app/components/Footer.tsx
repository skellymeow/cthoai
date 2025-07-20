"use client";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/ai-chat') return null;
  return (
    <footer className="bg-black text-white border-t border-zinc-800 w-full">
      {/* Top Row: Minimal Card Buttons */}
      <div className="w-full flex flex-col items-center pt-2 pb-0 m-0">
        <div className="w-full flex flex-row flex-wrap justify-center items-center gap-x-1 gap-y-1 px-0 m-0">
          <a href="/ai-image" className="group flex items-center gap-1 px-[2.04rem] py-[1.02rem] bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center justify-center">
            <svg className="w-[1.02rem] h-[1.02rem] text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span className="text-xs font-medium">AI Image</span>
          </a>
          <a href="/ai-video" className="group flex items-center gap-1 px-[2.04rem] py-[1.02rem] bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center justify-center">
            <svg className="w-[1.02rem] h-[1.02rem] text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M17 9l4 2v2l-4 2V9z"/></svg>
            <span className="text-xs font-medium">AI Video</span>
          </a>
          <a href="/ai-audio" className="group flex items-center gap-1 px-[2.04rem] py-[1.02rem] bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center justify-center">
            <svg className="w-[1.02rem] h-[1.02rem] text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="6" height="6" rx="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14"/></svg>
            <span className="text-xs font-medium">AI Audio</span>
          </a>
          <a href="/ai-chat" className="group flex items-center gap-1 px-[2.04rem] py-[1.02rem] bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center justify-center">
            <svg className="w-[1.02rem] h-[1.02rem] text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="text-xs font-medium">AI Chat</span>
          </a>
          <a href="/ai-vision" className="group flex items-center gap-1 px-[2.04rem] py-[1.02rem] bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors w-full sm:w-auto text-center justify-center">
            <svg className="w-[1.02rem] h-[1.02rem] text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
            <span className="text-xs font-medium">AI Vision</span>
          </a>
        </div>
      </div>
      {/* Huge Logo - Cropped visually */}
      <div className="flex flex-col items-center justify-center py-2 m-0 w-full">
        <div className="w-full max-w-[650px] h-[96%] relative overflow-hidden flex items-center justify-center" style={{height:'140px', maxHeight:'140px'}}>
          <img src="/cthoworkwhitetext.png" alt="CTHO.WORK" className="w-full h-auto mx-auto relative" style={{objectFit:'cover', objectPosition:'center', height:'140px', top:'-15%'}} />
        </div>
      </div>
      {/* Bottom Row */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center text-xs font-semibold tracking-widest uppercase px-0 pb-2 gap-1 m-0">
        <span className="text-gray-400 text-xs">© {new Date().getFullYear()} CTHO.WORK</span>
        <div className="flex flex-row items-center gap-2 ml-2">
          <a href="/terms" className="hover:text-purple-400">Terms</a>
          <a href="/privacy" className="hover:text-purple-400">Privacy</a>
        </div>
      </div>
    </footer>
  );
} 