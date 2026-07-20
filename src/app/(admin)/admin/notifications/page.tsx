"use client";

import React, { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export default function AdminNotificationsPage() {
  const username = "admin"; // System administrative keyword

  const { notifications, totalPages, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications(username, currentPage);
  }, [currentPage, fetchNotifications]);

  useEffect(() => {
    if (!isLoading && notifications.length > 0) {
      const hasUnread = notifications.some((n) => !n.isAdminRead);
      if (hasUnread) {
        markAllAsRead(username);
      }
    }
  }, [isLoading, notifications, markAllAsRead, username]);

  const handleMarkAll = async () => {
    await markAllAsRead(username);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id, username);
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="p-[10px] md:p-8 flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e4c126]"></div>
      </div>
    );
  }

  return (
    <div className="p-[10px] md:p-8 max-w-5xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">System Logs & Alerts</h1>
          <p className="text-sm font-bold text-neutral-400 mt-1">Review live platform activity and automated transaction notifications</p>
        </div>
        
        <button
          onClick={handleMarkAll}
          className="px-4 py-2 bg-[#e4c126]/10 hover:bg-[#e4c126]/20 text-[#e4c126] hover:text-white border border-[#e4c126]/30 rounded text-sm font-black transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Mark all as read
        </button>
      </div>

      <div className="bg-[#13151a] border border-neutral-800 rounded-lg overflow-hidden shadow-2xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-600 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">System is quiet</h3>
            <p className="text-neutral-500 font-medium text-sm max-w-sm">No new system events or alerts at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-6 transition-colors flex flex-col sm:flex-row gap-4 sm:items-start group ${notif.isAdminRead ? 'bg-transparent' : 'bg-[#e4c126]/5'}`}
              >
                {/* Status Indicator */}
                <div className="flex-shrink-0 pt-1">
                  {notif.isAdminRead ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e4c126] shadow-[0_0_8px_rgba(228,193,38,0.5)]"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                    <h4 className={`text-[15px] font-bold ${notif.isAdminRead ? 'text-neutral-400' : 'text-white'}`}>
                      {notif.notificationTitle}
                    </h4>
                    <span className="text-xs font-medium text-neutral-500 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notif.isAdminRead ? 'text-neutral-500' : 'text-neutral-300 font-medium'}`}>
                    {notif.content}
                  </p>
                </div>

                {/* Action */}
                {!notif.isAdminRead && (
                  <div className="flex-shrink-0 mt-2 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      title="Mark as read"
                      className="p-2 rounded bg-neutral-900 hover:bg-[#e4c126]/20 border border-neutral-800 hover:border-[#e4c126]/30 text-neutral-500 hover:text-[#e4c126] transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-[#0a0b0d]/40 border border-neutral-800/60 p-4 rounded-lg">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentPage === 1
                ? "border-neutral-950 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                : "border-neutral-800 text-neutral-300 hover:text-white bg-[#13151a] hover:bg-neutral-800"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          <span className="text-xs text-neutral-400 font-extrabold tracking-wider">
            Page <span className="text-[#e4c126]">{currentPage}</span> of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentPage === totalPages
                ? "border-neutral-950 text-neutral-600 bg-neutral-900/30 cursor-not-allowed"
                : "border-neutral-800 text-neutral-300 hover:text-white bg-[#13151a] hover:bg-neutral-800"
            }`}
          >
            Next
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
