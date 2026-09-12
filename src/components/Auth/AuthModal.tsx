import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  KeyRound,
  LogOut,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SUBSCRIPTION_TIERS } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register' | 'forgot' | 'reset' | 'switch_org';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentOrganization,
    organizations,
    switchOrganization,
    refreshTenantData,
    language,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState(currentUser?.email || 'aatf@zain-tech.sa');
  const [loginPassword, setLoginPassword] = useState('admin123');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerOrgName, setRegisterOrgName] = useState('');
  const [registerPlan, setRegisterPlan] = useState('pro');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMsg(t('تم تسجيل الدخول بنجاح! جاري تحميل مساحة العمل...', 'Logged in successfully! Loading workspace...'));
        await refreshTenantData();
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('فشل تسجيل الدخول. تحقق من البيانات.', 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.register(registerName, registerEmail, registerPassword, registerOrgName, registerPlan);
      if (res.success) {
        setSuccessMsg(t('تم إنشاء الحساب والمؤسسة بنجاح! مرحباً بك في زين للأتمتة والذكاء الاصطناعي.', 'Account & Organization created successfully! Welcome to Zain Automation AI.'));
        await refreshTenantData();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('حدث خطأ أثناء إنشاء الحساب.', 'Error creating account.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(forgotEmail);
      setSuccessMsg(res.message);
      setResetEmail(forgotEmail);
      setTimeout(() => {
        setActiveTab('reset');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || t('حدث خطأ أثناء إرسال الرابط.', 'Error sending reset link.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.resetPassword(resetEmail, newPassword);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setActiveTab('login');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || t('فشل تعيين كلمة المرور.', 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setSuccessMsg(t('تم تسجيل الخروج بنجاح.', 'Logged out successfully.'));
      await refreshTenantData();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="auth_modal_container"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header with gradient strip */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white relative">
          <button
            id="close_auth_modal_btn"
            onClick={onClose}
            className="absolute top-5 right-5 rtl:left-5 rtl:right-auto p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {activeTab === 'login' && t('تسجيل الدخول إلى حسابك', 'Sign In to Your Account')}
                {activeTab === 'register' && t('إنشاء حساب ومؤسسة جديدة', 'Create Account & Company')}
                {activeTab === 'forgot' && t('استعادة كلمة المرور', 'Forgot Password')}
                {activeTab === 'reset' && t('تعيين كلمة المرور الجديدة', 'Set New Password')}
                {activeTab === 'switch_org' && t('تبديل المؤسسة ومساحة العمل', 'Switch Organization')}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {t('بوابة المصادقة الآمنة لمنصة زين للأتمتة والذكاء الاصطناعي – Zain Automation AI', 'Secure Multi-Tenant SaaS Authentication – Zain Automation AI')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('تسجيل الدخول', 'Sign In')}
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('حساب ومؤسسة جديدة', 'Sign Up')}
          </button>
          <button
            onClick={() => { setActiveTab('switch_org'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'switch_org'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('المؤسسات', 'Organizations')}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('البريد الإلكتروني', 'Work Email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth_login_email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('كلمة المرور', 'Password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {t('نسيت كلمة المرور؟', 'Forgot password?')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth_login_password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Demo Credentials */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('حسابات تجريبية جاهزة للاختبار:', 'Pre-seeded demo accounts:')}
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => { setLoginEmail('aatf@zain-tech.sa'); setLoginPassword('admin123'); }}
                    className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono hover:bg-emerald-500/20"
                  >
                    aatf@zain-tech.sa (Owner/SuperAdmin)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginEmail('sara@growth.sa'); setLoginPassword('user123'); }}
                    className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono hover:bg-indigo-500/20"
                  >
                    sara@growth.sa (Admin)
                  </button>
                </div>
              </div>

              <button
                id="submit_login_btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{t('دخول إلى مساحة العمل', 'Sign In to Workspace')}</span>
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('الاسم الكامل', 'Full Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth_register_name"
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="عبدالعزيز الفهد"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('البريد الإلكتروني للعمل', 'Work Email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth_register_email"
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="azeez@alfahad-group.com"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('اسم المؤسسة أو الشركة (Multi-Tenant Org)', 'Organization / Company Name')}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth_register_org"
                    type="text"
                    required
                    value={registerOrgName}
                    onChange={(e) => setRegisterOrgName(e.target.value)}
                    placeholder="مجموعة الفهد القابضة"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('كلمة المرور', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth_register_password"
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('اختيار الباقة المبدئية', 'Select Initial Plan')}
                </label>
                <select
                  id="auth_register_plan"
                  value={registerPlan}
                  onChange={(e) => setRegisterPlan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {SUBSCRIPTION_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {language === 'ar' && (tier as any).nameAr ? (tier as any).nameAr : tier.name} (${tier.priceMonthly}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="submit_register_btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{t('إنشاء الحساب وبدء التجربة', 'Create Account & Launch')}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t(
                  'أدخل بريدك الإلكتروني المسجل في النظام وسنرسل لك رمز تحقق ورابط تعيين كلمة المرور فورًا.',
                  'Enter your registered email address and we will issue a secure reset link immediately.'
                )}
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('البريد الإلكتروني', 'Email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{t('إرسال رابط الاستعادة', 'Send Reset Link')}</span>
              </button>
            </form>
          )}

          {/* TAB 4: RESET PASSWORD */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('البريد الإلكتروني', 'Email')}
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('كلمة المرور الجديدة', 'New Password')}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{t('تحديث كلمة المرور والدخول', 'Update Password & Sign In')}</span>
              </button>
            </form>
          )}

          {/* TAB 5: SWITCH ORG / TENANT */}
          {activeTab === 'switch_org' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'المؤسسات المعزولة المتاحة لحسابك (بيانات وWorkflows وCRM منفصلة تمامًا لكل مؤسسة):',
                  'Isolated organizations available to your user account:'
                )}
              </p>
              <div className="space-y-2">
                {organizations.map((org) => {
                  const isCurrent = currentOrganization?.id === org.id;
                  return (
                    <div
                      key={org.id}
                      onClick={() => {
                        if (!isCurrent) {
                          switchOrganization(org.id);
                          onClose();
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {org.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {language === 'ar' ? org.nameAr || org.name : org.name}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                                {t('النشطة', 'Active')}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Plan: {org.planName || org.planId} • ID: {org.id}
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-400">
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentUser && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {currentUser.name}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('تسجيل الخروج', 'Log Out')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
