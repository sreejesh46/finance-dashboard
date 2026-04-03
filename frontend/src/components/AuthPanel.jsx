import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const VaultIllustration = () => {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#eef6ff] via-[#d8eeff] to-[#a9dbff] lg:block">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 left-[22%] w-px bg-white/35" />
        <div className="absolute inset-y-0 left-[56%] w-px bg-white/35" />
        <div className="absolute right-[14%] top-10 h-28 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[18%] top-24 h-40 w-1 rounded-full bg-white/25" />
        <div className="absolute right-[28%] bottom-20 h-32 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[46%] bottom-10 h-24 w-1 rounded-full bg-white/25" />
      </div>

      <div className="relative flex h-full items-center justify-center px-10">
        <div className="relative h-[340px] w-[340px]">
          <div className="absolute inset-0 rounded-[42px] bg-gradient-to-br from-[#1f7ed6] via-[#226dbc] to-[#184a8d] shadow-[0_36px_80px_rgba(24,74,141,0.28)]" />
          <div className="absolute inset-[18px] rounded-[32px] border border-white/10 bg-gradient-to-br from-[#245c9f] via-[#1d4f88] to-[#163c6a]" />
          <div className="absolute left-[58px] top-[84px] h-[132px] w-[132px] rounded-full bg-gradient-to-br from-[#76deef] to-[#3eb2d4] shadow-[inset_0_0_0_10px_rgba(15,59,102,0.12)]">
            <div className="absolute inset-[18px] rounded-full border-[8px] border-[#1d4f88] bg-gradient-to-br from-[#5fcce2] to-[#3b95c5]" />
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#214a7f] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.12)]" />
            <div className="absolute left-1/2 top-[20px] h-5 w-5 -translate-x-1/2 rounded-full bg-[#214a7f]" />
            <div className="absolute bottom-[20px] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#214a7f]" />
            <div className="absolute left-[20px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#214a7f]" />
            <div className="absolute right-[20px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#214a7f]" />
          </div>

          <div className="absolute right-[64px] top-[120px] h-5 w-[74px] rounded-full bg-gradient-to-r from-[#d8d5d1] to-[#f7f7f6] shadow-[0_8px_18px_rgba(15,23,42,0.2)]" />
          <div className="absolute right-[86px] top-[92px] h-[88px] w-3 rounded-full bg-gradient-to-b from-[#c8c4be] to-[#f3f2ef]" />
          <div className="absolute right-[88px] top-[120px] h-3 w-14 rotate-45 rounded-full bg-gradient-to-r from-[#d8d5d1] to-[#f7f7f6]" />
          <div className="absolute right-[88px] top-[120px] h-3 w-14 -rotate-45 rounded-full bg-gradient-to-r from-[#d8d5d1] to-[#f7f7f6]" />

          <div className="absolute inset-x-10 bottom-7 h-10 rounded-full bg-[#6cc8ff]/20 blur-2xl" />
        </div>
      </div>
    </div>
  );
};

const AuthPanel = ({
  mode,
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
  bottomCopy,
}) => {
  const isLogin = mode === 'login';

  return (
    <div className="h-screen overflow-hidden bg-[#dfe4ea]">
      <div className="flex h-full items-center justify-center p-3 sm:p-4 lg:p-5">
        <div className="grid h-full max-h-full w-full max-w-[1320px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:h-[calc(100vh-40px)] lg:grid-cols-[1fr_0.95fr]">
          <section className="flex h-full min-h-0 items-center justify-center overflow-hidden bg-white px-6 py-5 sm:px-10 lg:px-14">
            <div className="flex h-full w-full max-w-[430px] min-h-0 flex-col">
              <div className="pt-1">
                <div className="inline-flex items-center gap-3 text-slate-950">
                  <div className="rounded-xl bg-slate-950 p-2 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-[34px] font-semibold tracking-[-0.03em] leading-none">FinDash</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center py-2">
                <div className="min-h-[96px]">
                  <h1 className="text-[38px] font-semibold tracking-[-0.04em] leading-[1.05] text-slate-950">{title}</h1>
                  <p className="mt-1.5 text-[15px] text-slate-400">{subtitle}</p>
                </div>

                <div className="relative mt-4 rounded-2xl bg-slate-100 p-1.5">
                  <div
                    className={`absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-sm transition-transform duration-300 ease-out ${
                      isLogin ? 'translate-x-0' : 'translate-x-full'
                    }`}
                  />
                  <div className="relative z-10 grid grid-cols-2">
                    <Link
                      to="/login"
                      className={`rounded-xl px-4 py-2.5 text-center text-base font-medium transition-colors ${
                        isLogin ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className={`rounded-xl px-4 py-2.5 text-center text-base font-medium transition-colors ${
                        !isLogin ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      Signup
                    </Link>
                  </div>
                </div>

                <div className="mt-4 space-y-3.5">{children}</div>

                <p className="mt-4 min-h-[24px] text-center text-[15px] text-slate-500">
                  {footerText}{' '}
                  <Link to={footerLinkTo} className="font-semibold text-slate-950">
                    {footerLinkText}
                  </Link>
                </p>
              </div>

              <div className="min-h-[40px] pb-0 text-center text-[13px] leading-5 text-slate-400">
                {bottomCopy}
              </div>
            </div>
          </section>

          <VaultIllustration />
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
