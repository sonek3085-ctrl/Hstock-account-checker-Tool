import React, { useState } from 'react';
import { DigitalProduct, ProductOrder, StoreSettings } from '../types';

interface OrderModalProps {
  product: DigitalProduct;
  settings: StoreSettings;
  onClose: () => void;
  onSubmitOrder: (orderPayload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    productId: string;
    notes?: string;
  }) => Promise<ProductOrder>;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  settings,
  onClose,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<ProductOrder | null>(null);

  const targetWhatsApp = product.whatsappNumber || settings.adminWhatsApp || '03131664235';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await onSubmitOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        productId: product.id,
        notes: notes.trim() || undefined,
      });

      setCompletedOrder(order);

      // Open dynamic WhatsApp chat in a new tab
      if (order.whatsappUrl) {
        window.open(order.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0f16] border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#1a1c26] cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!completedOrder ? (
          <div>
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                  Dynamic WhatsApp Checkout
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-emerald-400 font-semibold">Direct Routing</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1.5">
                Complete Your Order
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide your details to generate your order and open WhatsApp with a pre-filled message.
              </p>
            </div>

            {/* Selected Product Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#08090f] border border-amber-500/20 mb-5 flex items-center gap-3">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-14 h-14 rounded-lg object-cover border border-amber-500/30 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase block truncate">
                  {product.category}
                </span>
                <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Rs. {product.pricePKR.toLocaleString()} PKR
                  </span>
                  {product.oldPricePKR && (
                    <span className="text-[10px] font-mono text-slate-500 line-through">
                      Rs. {product.oldPricePKR.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 03131664235"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="For digital download link or license receipt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Special Notes / Instructions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special inquiry or preferred payment method..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Total Price & Routing Info */}
              <div className="p-3.5 rounded-xl bg-[#14151f] border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Total Amount
                  </span>
                  <span className="text-xs text-emerald-400 font-medium font-mono">
                    WhatsApp: {targetWhatsApp}
                  </span>
                </div>
                <span className="text-lg font-black text-amber-300 font-mono">
                  Rs. {product.pricePKR.toLocaleString()}
                </span>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 transition-all rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771z" />
                    </svg>
                    <span>Send Order to WhatsApp ({targetWhatsApp})</span>
                  </>
                )}
              </button>

            </form>
          </div>
        ) : (
          /* ORDER CONFIRMATION STATE */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto text-emerald-400">
              ✓
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Order Registered in Database
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Order Generated Successfully!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Order Reference: <strong className="font-mono text-amber-300 text-sm">{completedOrder.id}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#08090f] border border-amber-500/25 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Product:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{completedOrder.productTitle}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="text-white font-semibold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>WhatsApp:</span>
                <span className="text-amber-300 font-mono">{completedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Amount:</span>
                <span className="text-amber-300 font-mono font-bold">Rs. {completedOrder.pricePKR.toLocaleString()} PKR</span>
              </div>
            </div>

            {completedOrder.whatsappUrl && (
              <a
                href={completedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771z" />
                </svg>
                <span>Re-open WhatsApp Chat</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#14151e] border border-slate-800 rounded-xl cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
