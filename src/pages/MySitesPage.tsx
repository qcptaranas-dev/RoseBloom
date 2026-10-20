import React, { useState } from 'react';
import { UserSiteProject } from '../types';
import { siteService, encodeSiteForReceiver } from '../services/siteService';
import { exportStandaloneHtml } from '../utils/exporter';
import {
  Plus,
  Heart,
  Edit3,
  Eye,
  Copy,
  Trash2,
  Download,
  ArrowLeft,
  Calendar,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Check,
  Share2,
} from 'lucide-react';

interface MySitesPageProps {
  sites: UserSiteProject[];
  activeSite: UserSiteProject;
  onSelectSite: (siteId: string) => void;
  onPreviewReceiver: (siteId: string) => void;
  onNavigateHome: () => void;
}

export const MySitesPage: React.FC<MySitesPageProps> = ({
  sites,
  activeSite,
  onSelectSite,
  onPreviewReceiver,
  onNavigateHome,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newGirlfriendName, setNewGirlfriendName] = useState<string>('');
  const [newSenderName, setNewSenderName] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    const created = siteService.createSite(
      newTitle,
      newGirlfriendName,
      newSenderName,
      newDate
    );
    setIsCreating(false);
    onSelectSite(created.id);
    onNavigateHome();
  };

  const handleDuplicate = (siteId: string) => {
    siteService.duplicateSite(siteId);
  };

  const handleDelete = (siteId: string) => {
    try {
      siteService.deleteSite(siteId);
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Cannot delete letter.');
    }
  };

  const handleCopyReceiverLink = async (site: UserSiteProject) => {
    const baseUrl = typeof window !== 'undefined'
      ? (window.location.origin.includes('localhost') || window.location.origin.includes('run.app')
          ? window.location.origin
          : 'https://ais-pre-2xtzb6kqen2wunuosglbve-740062476913.asia-northeast1.run.app')
      : 'https://ais-pre-2xtzb6kqen2wunuosglbve-740062476913.asia-northeast1.run.app';

    const shareCode = site.shareCode || 'ROSE-1024';
    const payload = encodeSiteForReceiver(site);
    const link = `${baseUrl}?view=receiver&code=${shareCode}&site=${site.id}&key=${site.receiverToken || 'rec_key'}${
      payload ? `&payload=${payload}` : ''
    }`;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(site.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 font-sans-custom">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-100">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-rose-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Current Letter Editor</span>
        </button>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Letter</span>
        </button>
      </div>

      {/* Account Privacy Notification Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900">
              Private Work Workspace
            </h4>
            <p className="text-xs text-stone-500">
              Your letters and songs are private to your account. Only you and your recipient (via her secret link or receiver code) can view them.
            </p>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personal Work Library</span>
        </div>
        <h1 className="font-cormorant text-3xl sm:text-4xl font-semibold text-rose-950">
          My Work
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          You have {sites.length} private {sites.length === 1 ? 'letter project' : 'letter projects'}. Select any letter to edit, preview in receiver mode, or copy her secret delivery link.
        </p>
      </div>

      {/* Sites / Letters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => {
          const isActive = site.id === activeSite.id;
          const isCopied = copiedId === site.id;

          return (
            <div
              key={site.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
                isActive ? 'border-rose-400 ring-2 ring-rose-200' : 'border-rose-100 hover:border-rose-200'
              }`}
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                    <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-500" />
                    <span>{site.girlfriendName} &amp; {site.senderName}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 tracking-wider">
                      Currently Active
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-cormorant text-xl font-bold text-rose-950 leading-snug line-clamp-1 mb-1">
                  {site.title}
                </h3>

                {/* Greeting quote */}
                <p className="text-xs text-stone-500 italic mb-3 line-clamp-1 font-cormorant">
                  "{site.data.monthsaryGreeting}"
                </p>

                {/* Thumbnail Teaser */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-rose-50 mb-3 border border-rose-100">
                  <img
                    src={site.data.photos[0]?.url}
                    alt={site.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[10px] text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{site.data.monthsaryDate}</span>
                    </span>
                  </div>
                </div>

                {/* Receiver Passkey Indicator */}
                <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <KeyRound className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px]">Passkey:</span>
                    <span className="font-mono font-semibold text-rose-800 text-[11px]">
                      {site.shareCode || 'ROSE-1024'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyReceiverLink(site)}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    title="Copy private link for recipient"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied Link' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Metadata */}
                <div className="text-[11px] text-stone-500 flex items-center justify-between border-t border-rose-50 pt-2 mb-3">
                  <span>Theme: {site.data.theme.palette}</span>
                  <span>{site.data.music?.playlist?.length || 1} Songs · 4 Photos</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-rose-50">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSelectSite(site.id);
                      onNavigateHome();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium cursor-pointer shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open &amp; Edit</span>
                  </button>

                  <button
                    onClick={() => onPreviewReceiver(site.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-900 text-xs font-medium cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-600" />
                    <span>Receiver View</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => exportStandaloneHtml(site.data)}
                    className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 text-[11px] cursor-pointer"
                    title="Download standalone HTML file"
                  >
                    <Download className="w-3 h-3 text-rose-500" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(site.id)}
                    className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 text-[11px] cursor-pointer"
                    title="Duplicate this letter"
                  >
                    <Copy className="w-3 h-3 text-stone-400" />
                    <span>Duplicate</span>
                  </button>

                  {sites.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirmId(site.id)}
                      className="inline-flex items-center gap-1 text-stone-400 hover:text-rose-600 text-[11px] cursor-pointer"
                      title="Delete this letter"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-rose-100 text-center">
            <h3 className="font-cormorant text-2xl font-bold text-rose-950 mb-2">Delete Letter?</h3>
            <p className="text-xs text-stone-600 mb-6">
              Are you sure you want to delete this monthsary letter? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Letter Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-100">
            <h3 className="font-cormorant text-2xl font-bold text-rose-950 mb-1">
              Create New Private Letter
            </h3>
            <p className="text-xs text-stone-600 mb-6">
              Set up a fresh romantic love letter. It will belong strictly to your account.
            </p>

            <form onSubmit={handleCreateSite} className="space-y-4 text-xs font-sans-custom">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Letter Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Year Anniversary for Maya"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Her Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya"
                    value={newGirlfriendName}
                    onChange={(e) => setNewGirlfriendName(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam"
                    value={newSenderName}
                    onChange={(e) => setNewSenderName(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Monthsary Date
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November 24, 2024"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs"
                >
                  Create Private Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
