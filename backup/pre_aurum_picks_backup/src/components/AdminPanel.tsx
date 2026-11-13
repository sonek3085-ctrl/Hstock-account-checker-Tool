import React, { useState, useRef } from 'react';
import { DigitalProduct, ProductOrder, StoreSettings } from '../types';
import { uploadProductImage } from '../services/api';

interface AdminPanelProps {
  products: DigitalProduct[]; // all products (Active & Draft)
  orders: ProductOrder[];
  settings: StoreSettings;
  onAddProduct: (productData: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEditProduct: (id: string, updates: Partial<DigitalProduct>) => Promise<void>;
  onTogglePublish: (id: string, status?: 'Active' | 'Draft') => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: ProductOrder['status']) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  onUpdateSettings: (settings: Partial<StoreSettings & { adminPassword?: string }>) => Promise<void>;
  onClose: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  settings,
  onAddProduct,
  onEditProduct,
  onTogglePublish,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onUpdateSettings,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'orders' | 'settings'>('add');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form State (13 Fields)
  const [formName, setFormName] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formPricePKR, setFormPricePKR] = useState<string>('');
  const [formOldPricePKR, setFormOldPricePKR] = useState<string>('');
  const [formBadge, setFormBadge] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [formDeliveryMethod, setFormDeliveryMethod] = useState('');
  const [formWhatsAppNumber, setFormWhatsAppNumber] = useState(settings.adminWhatsApp || '03131664235');
  const [formStatus, setFormStatus] = useState<'Active' | 'Draft'>('Active');
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [editPriceQuick, setEditPriceQuick] = useState<{ id: string; price: number } | null>(null);
  const [isQuickUploading, setIsQuickUploading] = useState<string | null>(null);

  // Settings Form State
  const [adminPhone, setAdminPhone] = useState(settings.adminWhatsApp || '03131664235');
  const [adminUsername, setAdminUsername] = useState(settings.adminUsername || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [storeName, setStoreName] = useState(settings.storeName || 'AURUM DIGITAL');
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Clear Form handler
  const handleClearForm = () => {
    setFormName('');
    setFormImageUrl('');
    setFormCategory('');
    setFormShortDescription('');
    setFormFullDescription('');
    setFormPricePKR('');
    setFormOldPricePKR('');
    setFormBadge('');
    setFormFeatures([]);
    setFeatureInput('');
    setFormDeliveryMethod('');
    setFormWhatsAppNumber(settings.adminWhatsApp || '03131664235');
    setFormStatus('Active');
    setFormIsFeatured(false);
    setFormError('');
    setFormSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add bullet point to features
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormFeatures([...formFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setFormError('');
    try {
      const uploadedUrl = await uploadProductImage(file);
      setFormImageUrl(uploadedUrl);
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed. Please try again or provide an image URL.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Product (Add Product or Save as Draft)
  const handleSaveProduct = async (intendedStatus: 'Active' | 'Draft') => {
    setFormError('');
    setFormSuccess('');

    if (!formName.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError('Product Image is required (upload an image file or provide an image URL).');
      return;
    }
    if (!formCategory.trim()) {
      setFormError('Product Category is required.');
      return;
    }
    if (!formShortDescription.trim()) {
      setFormError('Short Description is required.');
      return;
    }
    if (!formPricePKR || isNaN(Number(formPricePKR)) || Number(formPricePKR) < 0) {
      setFormError('A valid Product Price (PKR) is required.');
      return;
    }

    setFormSaving(true);
    try {
      await onAddProduct({
        title: formName.trim(),
        imageUrl: formImageUrl.trim(),
        category: formCategory.trim(),
        shortDescription: formShortDescription.trim(),
        description: formFullDescription.trim() || formShortDescription.trim(),
        pricePKR: Number(formPricePKR),
        oldPricePKR: formOldPricePKR && Number(formOldPricePKR) > 0 ? Number(formOldPricePKR) : undefined,
        badge: formBadge.trim() || undefined,
        features: formFeatures,
        deliveryMethod: formDeliveryMethod.trim() || 'Instant WhatsApp Delivery',
        whatsappNumber: formWhatsAppNumber.trim() || settings.adminWhatsApp || '03131664235',
        status: intendedStatus,
        isFeatured: formIsFeatured,
      });

      setFormSuccess(
        intendedStatus === 'Active'
          ? 'Product published successfully and is now live in the store!'
          : 'Product saved as Draft. You can publish it anytime from Manage Products.'
      );
      handleClearForm();
      // Switch to Manage tab to view the newly created product
      setTimeout(() => {
        setActiveTab('manage');
        setFormSuccess('');
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product to database.');
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Confirmation
  const handleDeleteConfirm = async (product: DigitalProduct) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.title}"? This cannot be undone.`
    );
    if (confirmed) {
      try {
        await onDeleteProduct(product.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  // Quick Image Update on existing product
  const handleQuickImageUpdate = async (product: DigitalProduct, file: File) => {
    setIsQuickUploading(product.id);
    try {
      const newUrl = await uploadProductImage(file);
      await onEditProduct(product.id, { imageUrl: newUrl });
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setIsQuickUploading(null);
    }
  };

  // Quick Price Save
  const handleQuickPriceSave = async (id: string, price: number) => {
    if (price < 0) return;
    try {
      await onEditProduct(id, { pricePKR: price });
      setEditPriceQuick(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMessage('');
    try {
      const payload: any = {
        adminWhatsApp: adminPhone.trim(),
        adminUsername: adminUsername.trim(),
        storeName: storeName.trim(),
        announcement: announcement.trim(),
      };
      if (newPassword.trim()) {
        payload.adminPassword = newPassword.trim();
      }
      await onUpdateSettings(payload);
      setSettingsMessage('Settings saved successfully!');
      setNewPassword('');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const activeProducts = products.filter((p) => p.status === 'Active');
  const draftProducts = products.filter((p) => p.status === 'Draft');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchFilter.trim() ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.badge && p.badge.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0c0d14] border border-amber-500/35 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 bg-[#10121a] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/20 shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  AURUM DIGITAL — Admin Control Center
                </h2>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                  Authenticated Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full control to add, edit, publish, unpublish, and delete digital products in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`py-2 px-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#181a26] text-amber-300 border border-amber-500/30 hover:bg-[#202334]'
              }`}
            >
              <span>+ Add New Product</span>
            </button>

            <button
              onClick={onLogout}
              className="py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-[#181a26] hover:bg-[#202334] border border-slate-800 rounded-xl cursor-pointer"
            >
              Logout
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#181a26] cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-4 divide-x divide-amber-500/15 border-b border-amber-500/20 bg-[#08090f] text-center py-2.5 px-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Published (Store)</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{activeProducts.length}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Drafts (Unpublished)</span>
            <span className="text-sm font-black text-slate-400 font-mono">{draftProducts.length}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total In Database</span>
            <span className="text-sm font-black text-amber-300 font-mono">{products.length}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Orders Received</span>
            <span className="text-sm font-black text-white font-mono">{orders.length}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-amber-500/20 bg-[#0e1017] flex items-center gap-6 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Add New Product (فارم)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Settings & WhatsApp</span>
          </button>
        </div>

        {/* Tab 1: ADD NEW PRODUCT FORM (13 Fields strictly manually filled) */}
        {activeTab === 'add' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            <div className="max-w-4xl mx-auto">
              
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                  Dynamic Publishing Engine
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  Add New Product to Store
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fill in the 13 required and optional details below. No sample data is pre-inserted.
                </p>
              </div>

              {formSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-medium mb-4 flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-medium mb-4 flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct('Active'); }} className="space-y-4 text-xs">
                
                {/* 1. Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    1. Product Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter complete product title..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 2. Product Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    2. Product Image Upload *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8 flex gap-2">
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="Image URL or upload file from your device..."
                        required
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 hover:text-white cursor-pointer font-bold whitespace-nowrap flex items-center gap-1.5 transition-all">
                        <span>{isUploadingImage ? 'Uploading...' : '📁 Upload File'}</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image Preview Box */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                      {formImageUrl ? (
                        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#08090f] border border-amber-500/30">
                          <img
                            src={formImageUrl}
                            alt="Preview"
                            className="w-12 h-12 rounded-lg object-cover border border-amber-500/20"
                          />
                          <div className="text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-bold block">✓ Image Ready</span>
                            <button
                              type="button"
                              onClick={() => setFormImageUrl('')}
                              className="text-red-400 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No image selected yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Product Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      3. Product Category *
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Canva Templates, Accounts, Software..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 8. Product Badge (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      8. Product Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="e.g. Bestseller, Featured, New, Hot, etc."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 4. Short Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    4. Short Description (Displays on Product Card) *
                  </label>
                  <input
                    type="text"
                    value={formShortDescription}
                    onChange={(e) => setFormShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence overview of what the buyer receives..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 5. Full Product Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    5. Full Product Description (Detailed View)
                  </label>
                  <textarea
                    value={formFullDescription}
                    onChange={(e) => setFormFullDescription(e.target.value)}
                    placeholder="Comprehensive details, instructions, deliverables, requirements..."
                    rows={3}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 6. Product Price (PKR) & 7. Old Price (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      6. Product Price (PKR) *
                    </label>
                    <input
                      type="number"
                      value={formPricePKR}
                      onChange={(e) => setFormPricePKR(e.target.value)}
                      placeholder="e.g. 2500"
                      required
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      7. Old Price (PKR) (Optional for strikethrough discount)
                    </label>
                    <input
                      type="number"
                      value={formOldPricePKR}
                      onChange={(e) => setFormOldPricePKR(e.target.value)}
                      placeholder="e.g. 4000 (leaves blank if none)"
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 9. Product Features (Multiple Bullet Points) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    9. Product Features (Multiple Bullet Points)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Type a feature point and press Add Point..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 rounded-xl bg-[#1a1c28] hover:bg-[#25283a] border border-amber-500/30 text-amber-300 font-bold cursor-pointer text-xs"
                    >
                      + Add Point
                    </button>
                  </div>

                  {formFeatures.length > 0 && (
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-[#08090f] border border-amber-500/15">
                      {formFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-xs bg-[#12141f] px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-200">
                            <strong className="text-amber-400 mr-2">✓</strong> {feat}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="text-red-400 hover:text-red-300 font-bold px-1.5 cursor-pointer"
                            title="Remove Point"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 10. Delivery Method & 11. WhatsApp Order Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      10. Product Delivery Method
                    </label>
                    <input
                      type="text"
                      value={formDeliveryMethod}
                      onChange={(e) => setFormDeliveryMethod(e.target.value)}
                      placeholder="e.g. Instant WhatsApp Transfer, Drive Link..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      11. WhatsApp Order Number
                    </label>
                    <input
                      type="text"
                      value={formWhatsAppNumber}
                      onChange={(e) => setFormWhatsAppNumber(e.target.value)}
                      placeholder="03131664235"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 12. Product Status & 13. Featured Product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#08090f] border border-amber-500/20">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      12. Product Status (Active / Draft)
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Draft')}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12141f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Active">Active (Publish to Storefront)</option>
                      <option value="Draft">Draft (Save in Admin Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      13. Featured Product (Yes / No)
                    </label>
                    <select
                      value={formIsFeatured ? 'yes' : 'no'}
                      onChange={(e) => setFormIsFeatured(e.target.value === 'yes')}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#12141f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="no">No (Regular Listing)</option>
                      <option value="yes">Yes (Showcase in Featured Section)</option>
                    </select>
                  </div>
                </div>

                {/* Three Action Buttons required by user */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-[#181a24] hover:bg-[#222534] rounded-xl cursor-pointer transition-colors"
                  >
                    Clear Form
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveProduct('Draft')}
                    disabled={formSaving}
                    className="px-5 py-2.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl cursor-pointer transition-all"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveProduct('Active')}
                    disabled={formSaving}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 rounded-xl shadow-lg shadow-amber-500/25 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {formSaving ? 'Publishing...' : 'Add Product'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* Tab 2: MANAGE PRODUCTS (Edit, Update Image, Change Price, Publish/Unpublish, Delete) */}
        {activeTab === 'manage' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by name, category, or badge..."
                  className="w-full px-4 py-2 text-xs rounded-xl bg-[#08090f] border border-amber-500/25 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {uniqueCategories.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px]">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {uniqueCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setActiveTab('add')}
                className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer"
              >
                + Add Product
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-xl border border-amber-500/20 bg-[#08090f]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12131d] text-slate-400 uppercase tracking-wider text-[10px] border-b border-amber-500/20">
                  <tr>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price (PKR)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                        <p className="font-bold text-white text-sm">No products in catalog yet.</p>
                        <p className="text-xs text-slate-500">
                          Click &quot;Add Product&quot; to create your first dynamic digital listing.
                        </p>
                        <button
                          onClick={() => setActiveTab('add')}
                          className="mt-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer"
                        >
                          + Add Product Now
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isQuickPriceEditing = editPriceQuick?.id === prod.id;
                      return (
                        <tr key={prod.id} className="hover:bg-[#10121b] transition-colors">
                          {/* Image & Title */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative group shrink-0">
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-amber-500/30"
                                />
                                <label
                                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-amber-300 font-bold rounded-lg cursor-pointer transition-opacity text-center p-0.5"
                                  title="Update Image"
                                >
                                  {isQuickUploading === prod.id ? '...' : 'Update'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleQuickImageUpdate(prod, f);
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <div className="font-bold text-white text-xs truncate">
                                  {prod.title}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {prod.shortDescription || 'No description'}
                                </div>
                                {prod.badge && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {prod.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#181a26] text-amber-300 border border-amber-500/25">
                              {prod.category}
                            </span>
                          </td>

                          {/* Price with inline quick edit */}
                          <td className="py-3 px-3 whitespace-nowrap font-mono">
                            {isQuickPriceEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editPriceQuick.price}
                                  onChange={(e) =>
                                    setEditPriceQuick({ id: prod.id, price: Number(e.target.value) })
                                  }
                                  className="w-20 px-1.5 py-0.5 rounded bg-[#161824] border border-amber-400 text-white text-xs font-mono"
                                />
                                <button
                                  onClick={() => handleQuickPriceSave(prod.id, editPriceQuick.price)}
                                  className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded cursor-pointer"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditPriceQuick(null)}
                                  className="px-1 text-[10px] text-slate-400 hover:text-white cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">
                                  Rs. {prod.pricePKR.toLocaleString()}
                                </span>
                                {prod.oldPricePKR && (
                                  <span className="text-[10px] text-slate-500 line-through">
                                    Rs. {prod.oldPricePKR.toLocaleString()}
                                  </span>
                                )}
                                <button
                                  onClick={() => setEditPriceQuick({ id: prod.id, price: prod.pricePKR })}
                                  className="text-[10px] text-slate-500 hover:text-amber-300 ml-1 cursor-pointer"
                                  title="Change Price"
                                >
                                  ✏️
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Status / Publish Toggle */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              onClick={() => onTogglePublish(prod.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                prod.status === 'Active'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50'
                              }`}
                              title={prod.status === 'Active' ? 'Click to Unpublish / Draft' : 'Click to Publish'}
                            >
                              {prod.status === 'Active' ? '✓ Published' : 'Draft'}
                            </button>
                          </td>

                          {/* Featured Product */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              onClick={() => onEditProduct(prod.id, { isFeatured: !prod.isFeatured })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                prod.isFeatured
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              {prod.isFeatured ? '★ Featured' : '☆ Regular'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/10 rounded-lg border border-amber-500/30 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onTogglePublish(prod.id)}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#181a26] rounded-lg border border-slate-700 cursor-pointer"
                              >
                                {prod.status === 'Active' ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => handleDeleteConfirm(prod)}
                                className="px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/30 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 3: CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Customer Orders
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Orders placed by buyers through the WhatsApp buy button.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#08090f] border border-amber-500/20 text-slate-400 text-xs space-y-2">
                <span className="text-3xl block">📦</span>
                <p className="font-bold text-white">No customer orders recorded yet.</p>
                <p>When buyers click &quot;Buy Now&quot; on your published products, their order logs will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-amber-500/20 bg-[#08090f]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12131d] text-slate-400 uppercase tracking-wider text-[10px] border-b border-amber-500/20">
                    <tr>
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {orders.map((ord) => {
                      const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                      const waLink = `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0+/, '')}`;

                      return (
                        <tr key={ord.id} className="hover:bg-[#10121b] transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-amber-300">
                            {ord.id}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{ord.customerName}</div>
                            {ord.customerEmail && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {ord.customerEmail}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-white">
                            {ord.customerPhone}
                          </td>
                          <td className="py-3 px-3 font-medium text-white max-w-[200px] truncate">
                            {ord.productTitle}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-300">
                            Rs. {ord.pricePKR.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(ord.id, e.target.value as ProductOrder['status'])
                              }
                              className="px-2 py-1 text-[11px] rounded bg-[#181a26] border border-amber-500/20 text-white focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted on WhatsApp">Contacted on WhatsApp</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>WhatsApp</span>
                              </a>
                              <button
                                onClick={() => onDeleteOrder(ord.id)}
                                className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                title="Delete Order"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* Tab 4: SETTINGS & WHATSAPP */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-w-xl mx-auto w-full space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Admin Configuration & WhatsApp
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update store branding, admin credentials, and default WhatsApp order number.
              </p>
            </div>

            {settingsMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 font-medium">
                ✓ {settingsMessage}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Default WhatsApp Order Number *
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="03131664235"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Admin Username
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Change Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new admin password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Top Announcement Banner
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 rounded-xl cursor-pointer shadow-md"
              >
                {settingsSaving ? 'Saving...' : 'Save Settings to Database'}
              </button>
            </form>
          </div>
        )}

        {/* FULL EDIT PRODUCT MODAL */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#0e0f17] border border-amber-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl my-6">
              
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#181a24] cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                  Editing Product
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  Edit &quot;{editingProduct.title}&quot;
                </h3>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await onEditProduct(editingProduct.id, {
                      title: editingProduct.title,
                      imageUrl: editingProduct.imageUrl,
                      category: editingProduct.category,
                      shortDescription: editingProduct.shortDescription,
                      description: editingProduct.description,
                      pricePKR: Number(editingProduct.pricePKR),
                      oldPricePKR: editingProduct.oldPricePKR && Number(editingProduct.oldPricePKR) > 0 ? Number(editingProduct.oldPricePKR) : undefined,
                      badge: editingProduct.badge || undefined,
                      features: editingProduct.features,
                      deliveryMethod: editingProduct.deliveryMethod,
                      whatsappNumber: editingProduct.whatsappNumber,
                      status: editingProduct.status,
                      isFeatured: editingProduct.isFeatured,
                    });
                    setEditingProduct(null);
                  } catch (err: any) {
                    alert(err.message || 'Failed to update product');
                  }
                }}
                className="space-y-4 text-xs"
              >
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    1. Product Name *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    2. Product Image *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingProduct.imageUrl}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      required
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                    />
                    <label className="px-3 py-2 rounded-xl bg-[#181a26] border border-amber-500/30 text-amber-300 hover:text-white cursor-pointer font-bold whitespace-nowrap">
                      Update Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            try {
                              const newUrl = await uploadProductImage(f);
                              setEditingProduct({ ...editingProduct, imageUrl: newUrl });
                            } catch (err: any) {
                              alert(err.message || 'Upload failed');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      3. Category *
                    </label>
                    <input
                      type="text"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      8. Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                      placeholder="e.g. Bestseller, New, etc."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    4. Short Description *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.shortDescription}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    5. Full Product Description
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Price & Old Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      6. Price (PKR) *
                    </label>
                    <input
                      type="number"
                      value={editingProduct.pricePKR}
                      onChange={(e) => setEditingProduct({ ...editingProduct, pricePKR: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      7. Old Price (PKR) (Optional)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.oldPricePKR || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, oldPricePKR: e.target.value ? Number(e.target.value) : undefined })}
                      min={0}
                      placeholder="Leave blank if none"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      12. Status (Active / Draft)
                    </label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as 'Active' | 'Draft' })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Active">Active (Live in Store)</option>
                      <option value="Draft">Draft (Admin Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      13. Featured Product
                    </label>
                    <select
                      value={editingProduct.isFeatured ? 'yes' : 'no'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.value === 'yes' })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#08090f] border border-amber-500/25 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes (Showcase in Featured Section)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#181a24] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 rounded-xl cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
