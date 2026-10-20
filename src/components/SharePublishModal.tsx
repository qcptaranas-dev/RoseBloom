import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  Globe,
  Heart,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Lock,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { CoupleData, UserSiteProject } from '../types';
import { encodeSiteForReceiver } from '../services/siteService';

interface SharePublishModalProps {
  data: CoupleData;
  activeSite?: UserSiteProject;
  isOpen: boolean;
  onClose: () => void;
  onDownloadWebsite: () => void;
}

export const SharePublishModal: React.FC<SharePublishModalProps> = ({
  data,
  activeSite,
  isOpen,
  onClose,
  onDownloadWebsite,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'privacy'>('link');

  const shareCode = activeSite?.shareCode || 'ROSE-1024';
  const receiverToken = activeSite?.receiverToken || 'rec_maya_forever';

  // Compute the live public receiver link with portable payload & receiver identifiers
  const baseUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('localhost') || window.location.origin.includes('run.app')
        ? window.location.origin
        : 'https://ais-pre-2xtzb6kqen2wunuosglbve-740062476913.asia-northeast1.run.app')
    : 'https://ais-pre-2xtzb6kqen2wunuosglbve-740062476913.asia-northeast1.run.app';

  const encodedPayload = activeSite ? encodeSiteForReceiver(activeSite) : '';
  const shareUrl = `${baseUrl}?view=receiver&code=${shareCode}&site=${activeSite?.id || 'site_love'}&key=${receiverToken}${
    encodedPayload ? `&payload=${encodedPayload}` : ''
  }`;

  useEffect(() => {
    if (!isOpen || !qrCanvasRef.current) return;

    QRCode.toCanvas(
      qrCanvasRef.current,
      shareUrl,
      {
        width: 240,
        margin: 2,
        color: {
          dark: '#9F1239', // deep rose
          light: '#FFFDFC', // warm cream
        },
      },
      (error) => {
        if (error) console.error('QR code generation error:', error);
      }
    );
  }, [isOpen, shareUrl, activeTab]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.monthsaryGreeting} - For ${data.girlfriendName}`,
          text: `A special romantic surprise made with all my love for you.`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 600;
    exportCanvas.height = 700;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(0, 0, 600, 700);

    // Border
    ctx.strokeStyle = '#F4A9B8';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 660);

    // Outer thin border
    ctx.strokeStyle = '#9F1239';
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 548, 648);

    // Title
    ctx.fillStyle = '#4C0519';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`For ${data.girlfriendName}`, 300, 80);

    // Subtitle
    ctx.fillStyle = '#881337';
    ctx.font = 'italic 18px serif';
    ctx.fillText(`${data.monthsaryGreeting}`, 300, 115);

    // Passcode badge if enabled
    if (data.passcode?.enabled) {
      ctx.fillStyle = '#E11D48';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Passcode: ${data.passcode.code || '1024'}`, 300, 145);
    }

    // Draw QR image
    ctx.drawImage(qrCanvasRef.current, 180, 180, 240, 240);

    // Call to action
    ctx.fillStyle = '#881337';
    ctx.font = '16px serif';
    ctx.fillText('Scan to experience our romantic rose celebration', 300, 480);

    // Sender Signature
    ctx.fillStyle = '#9F1239';
    ctx.font = 'italic 20px serif';
    ctx.fillText(`Forever with you, ${data.senderName}`, 300, 530);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Receiver Code: ${shareCode}`, 300, 580);

    // Download image
    const link = document.createElement('a');
    link.download = `Our-Monthsary-QR-Code-${data.girlfriendName}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-bold text-rose-950">
                Share &amp; Deliver Letter
              </h3>
              <p className="text-[11px] text-stone-500 font-sans-custom">
                Only your account and your designated receiver ({data.girlfriendName}) will see this work.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy & Account Isolation Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-950">Private Work Guaranteed: </span>
            This letter is locked to your account. No other users can see your photos, letter, or music. Only you and your receiver have access.
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-rose-50 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-white text-rose-950 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Private Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-rose-950 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Phone QR Code
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white text-rose-950 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Security &amp; Passkey
          </button>
        </div>

        {/* Tab 1: Direct Link */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
                  Private Receiver Link
                </span>
                <span className="text-[10px] text-stone-500">
                  Hides all editing &amp; author tools
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-white px-3 py-2 border border-rose-200 rounded-xl text-xs font-mono text-stone-700 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Quick Receiver Code Badge */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-rose-500" />
                <span className="text-xs text-stone-700">Receiver Access Code:</span>
                <span className="font-mono font-bold text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded text-xs">
                  {shareCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-stone-600 hover:text-rose-600 font-medium cursor-pointer"
              >
                {copiedCode ? 'Copied Code!' : 'Copy Code'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-900 text-xs font-medium cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Share via Chat / WhatsApp</span>
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-stone-700 text-xs font-medium cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span>Test Receiver View</span>
              </a>
            </div>

            {/* Passcode Security Information */}
            {data.passcode?.enabled ? (
              <div className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-rose-950">Receiver Passcode:</span>
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                        {data.passcode.code || '1024'}
                      </span>
                    </div>
                    {data.passcode.hint && (
                      <p className="text-[11px] text-stone-500 italic mt-0.5">
                        Hint: "{data.passcode.hint}"
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const text = `Hey ${data.girlfriendName} 💕 Here is a special surprise made with all my love for you: ${shareUrl}\nPasscode to unlock: ${data.passcode?.code || '1024'} (Hint: ${data.passcode?.hint || 'Our special date'})\nHappy Monthsary, my sweetheart! 🌹`;
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-rose-50 border border-rose-200/60 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
                >
                  {copied ? 'Copied Message!' : 'Copy with Passcode Text'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center gap-2 text-xs text-stone-600">
                <Lock className="w-4 h-4 text-stone-400" />
                <span>Passcode is currently optional. You can add one in Edit Greeting for extra intimacy.</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Scannable QR Code */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-rose-200 shadow-inner flex flex-col items-center">
              <canvas ref={qrCanvasRef} className="rounded-lg shadow-xs" />
              <div className="mt-3 text-xs font-cormorant italic text-rose-900">
                Scan with {data.girlfriendName}'s smartphone camera
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Keepsake QR Card</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 border border-rose-200 bg-white hover:bg-rose-50 text-rose-900 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                {copied ? 'Copied Link' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Passkey Details */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2.5">
              <h4 className="font-semibold text-rose-950 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Strict Account &amp; Receiver Isolation</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Every user account has an isolated database sandbox. Any love letters, letters, photo memories, and MP3 music you upload are strictly bound to your account ID.
              </p>
              <ul className="space-y-1 text-stone-600 text-[11px] list-disc list-inside">
                <li>Other registered users cannot view, edit, or search your works.</li>
                <li>Your receiver sees only this specific letter via her private link or code.</li>
                <li>All administrative tools, customizers, and editor functions are completely stripped in receiver mode.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="font-semibold text-stone-800">
                Download Offline Standalone Archive
              </div>
              <p className="text-[11px] text-stone-500">
                You can also download a 100% self-contained single-file HTML version to keep on a USB stick or email directly.
              </p>
              <button
                onClick={onDownloadWebsite}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>Download Standalone .html</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
