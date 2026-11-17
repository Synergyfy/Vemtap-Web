import { useState } from 'react';
import { setAdminSession, SUPER_ADMIN_USER } from './adminAuth';

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  onBackToApp?: () => void;
}

export function AdminLoginScreen({ onLoginSuccess, onBackToApp }: AdminLoginScreenProps) {
  const [email, setEmail] = useState('michael.o@vemtap.com');
  const [password, setPassword] = useState('••••••••••••');
  const [twoFactorCode, setTwoFactorCode] = useState('482910');
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your admin email or identity token.');
      return;
    }
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      setAdminSession({
        ...SUPER_ADMIN_USER,
        email: email.trim(),
      });
      onLoginSuccess();
    }, 600);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAdminSession(SUPER_ADMIN_USER);
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0b1329] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#132247] via-[#0b1329] to-[#060a17] text-white flex flex-col justify-between p-4 sm:p-6 antialiased font-sans">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0055c4] to-[#066cf4] flex items-center justify-center text-white font-bold text-lg shadow-lg">
            V
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] tracking-tight text-white leading-tight">VEMTAP</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 uppercase tracking-wider border border-blue-400/30">
                Enterprise
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Platform Command Grid</span>
          </div>
        </div>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="text-[12px] text-slate-300 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Return to App</span>
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"></div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>Restricted Administrative Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Admin Authentication</h1>
            <p className="text-slate-400 text-[12px] mt-1.5 leading-relaxed">
              Authorized personnel command terminal for VEMTAP commercial nodes, telemetry, and payments.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[12px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Identity / Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400">
                  alternate_email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="admin@vemtap.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a href="#reset" className="text-[11px] text-blue-400 hover:underline">
                  Terminal Reset
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                2FA Hardware Authenticator Token
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400">
                  pin
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono tracking-widest"
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[12px]">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/40"
                />
                <span>Remember this terminal (30 days)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-[13px] rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Action for Pairing */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-200 text-[12px] font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified_user</span>
              <span>1-Click Demo Login as Super Admin (Michael O.)</span>
            </button>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-emerald-400">lock</span>
            256-bit TLS Gateway
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-emerald-400">verified</span>
            PCI-DSS Level 1
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-emerald-400">fingerprint</span>
            Hardware 2FA Enforced
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-slate-400 text-[11px] py-2">
        VEMTAP Technologies Limited • Commercial Grid Engine v4.2 • Regulatory compliance log #NG-00912
      </div>
    </div>
  );
}

