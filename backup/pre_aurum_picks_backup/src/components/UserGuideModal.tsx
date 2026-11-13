import React from 'react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c0d15] border border-amber-500/35 rounded-2xl p-5 sm:p-7 shadow-2xl my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#181a24] cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>📖</span> User Guide & Instructions
          </div>
          <h3 className="text-xl font-black text-white">
            ویب سائٹ استعمال کرنے کا طریقہ اور مکمل رہنمائی
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            یہاں جانیں کہ پروڈکٹس کیسے سنبھالیں اور آرڈرز کیسے وصول کریں۔
          </p>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          
          <div className="p-4 rounded-xl bg-[#12131d] border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <span>🔐</span>
              <span>1. ایڈمن لاگ ان (Admin Login)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              اپنا محفوظ ایڈمن یوزر نیم اور پاس ورڈ درج کر کے لاگ ان کریں۔ لاگ ان ہوتے ہی ہیڈر میں &quot;Admin Panel&quot; کا سنہری بٹن ظاہر ہو جائے گا جہاں سے آپ تمام پروڈکٹس اور آرڈرز سنبھال سکتے ہیں۔
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#12131d] border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <span>📦</span>
              <span>2. پروڈکٹ شامل کرنا، بدلنا اور ڈیلیٹ کرنا (Add, Edit, Delete)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>نئی پروڈکٹ:</strong> ایڈمن پینل میں &quot;+ Add Product&quot; دبائیں اور تصویر، نام، قیمت اور کیٹیگری درج کریں۔</li>
              <li><strong>تبدیلی (Edit):</strong> کسی بھی پروڈکٹ کے سامنے &quot;Edit&quot; دبائیں اور کوئی بھی فیلڈ تبدیل کر کے سیو کریں۔</li>
              <li><strong>حذف (Delete):</strong> &quot;Delete&quot; کے بٹن سے پروڈکٹ فوری ڈیٹا بیس سے ختم ہو جائے گی۔</li>
              <li><strong>ڈیٹا بیس آٹومیشن:</strong> تمام پروڈکٹس <code>data/db.json</code> میں محفوظ ہوتی ہیں اور ویب سائٹ کے ہوم پیج پر فوری ظاہر ہوتی ہیں۔</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#12131d] border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <span>📱</span>
              <span>3. واٹس ایپ آرڈرنگ (WhatsApp Direct Routing)</span>
            </h4>
            <p>
              جب کوئی گاہک کسی بھی پروڈکٹ پر <strong>&quot;Buy Now&quot;</strong> پر کلک کرتا ہے:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>ایک سادہ اور خوبصورت آرڈر فارم کھلتا ہے (نام، واٹس ایپ نمبر، ای میل)۔</li>
              <li>فارم جمع ہوتے ہی ڈیٹا بیس میں آرڈر آئی ڈی (e.g. <code>DG-7890</code>) بن جاتی ہے۔</li>
              <li>سسٹم خودکار طریقے سے واٹس ایپ نمبر <strong>03131664235</strong> پر پری فلڈ میسج کے ساتھ کھل جاتا ہے۔</li>
              <li>ایڈمن کو کسٹمر کا نام، نمبر اور پروڈکٹ کی تفصیل براہ راست واٹس ایپ پر مل جاتی ہے۔</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#12131d] border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <span>🎨</span>
              <span>4. پریمیم بلیک اور گولڈ ڈیزائن</span>
            </h4>
            <p>
              ویب سائٹ کا ڈیزائن لگژری ڈیپ بلیک اور گولڈ ٹونز پر تیار کیا گیا ہے جو موبائل اور کمپیوٹر دونوں پر انتہائی تیز رفتار اور دلکش دکھتا ہے۔
            </p>
          </div>

        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer"
          >
            Open Admin Panel / ایڈمن پینل کھولیں
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#181a24] rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
