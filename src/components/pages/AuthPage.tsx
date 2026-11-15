import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { Button, FormLabel, inputBaseClasses } from '../ui/DesignSystem';
import { portalApi } from '../../lib/api';
import type { User, UserRole } from '../../types';

interface AuthPageProps {
  onAuthSuccess: (token: string, user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [portalRole, setPortalRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('clara.vance@aldenbrook.edu');
  const [loginPassword, setLoginPassword] = useState('Student2026!');

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regResidence, setRegResidence] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotVerified, setForgotVerified] = useState(false);
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setInfoMessage('');
    setShowPassword(false);
    setForgotVerified(false);
    setForgotNewPassword('');
  };

  const applyRolePreset = (role: UserRole) => {
    setPortalRole(role);
    setError('');
    if (role === 'admin') {
      setLoginEmail('admin@aldenbrook.edu');
      setLoginPassword('Admin2026!');
    } else {
      setLoginEmail('clara.vance@aldenbrook.edu');
      setLoginPassword('Student2026!');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPassword) {
      setError('Please enter both your institutional email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await portalApi.login({
        email: loginEmail.trim(),
        password: loginPassword,
        portalRole,
      });
      onAuthSuccess(res.token, res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName.trim() || !regEmail.trim() || !regStudentId.trim() || !regPassword) {
      setError('Please complete all required registration fields.');
      return;
    }
    if (!regEmail.includes('@')) {
      setError('Please enter a valid university email address.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await portalApi.register({
        name: regName.trim(),
        email: regEmail.trim(),
        studentId: regStudentId.trim(),
        department: regDepartment.trim() || 'Undergraduate Studies',
        phone: regPhone.trim() || 'Not provided',
        residence: regResidence.trim() || 'Campus Residence',
        password: regPassword,
      });
      onAuthSuccess(res.token, res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!forgotEmail.trim()) {
      setError('Enter your registered university email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await portalApi.forgotPassword({
        email: forgotEmail.trim(),
        newPassword: forgotVerified ? forgotNewPassword : undefined,
      });
      if (res.verified) {
        setForgotVerified(true);
        setInfoMessage(res.message);
      } else if (res.resetComplete) {
        setInfoMessage(res.message);
        setLoginEmail(forgotEmail.trim());
        setLoginPassword(forgotNewPassword);
        setTimeout(() => {
          setMode('login');
          setInfoMessage('Password updated. Sign in with your new credentials.');
        }, 900);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col lg:flex-row">
      {/* Left Institutional Panel */}
      <div className="lg:w-[44%] bg-[#172B45] text-white px-8 py-12 lg:px-14 lg:py-16 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-[#B99A55]/30">
        <div>
          <BrandLogo variant="light" size="lg" />
          <div className="w-12 h-0.5 bg-[#B99A55] mt-8 mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight max-w-md">
            Every Lost Item Deserves to Find Its Way Home.
          </h1>
          <p className="text-sm sm:text-base text-[#E8E4DA]/80 mt-5 max-w-md leading-relaxed">
            The official campus registry of Aldenbrook University for reporting misplaced belongings,
            cataloging found property, and verifying ownership claims with institutional care.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#E8E4DA]/80">
          <div>
            <div className="text-[#B99A55] font-semibold uppercase tracking-wider mb-1">
              Central Custody Office
            </div>
            <p className="leading-relaxed">
              Founders Hall, Room 102
              <br />
              Mon – Fri · 8:30 AM – 5:30 PM
            </p>
          </div>
          <div>
            <div className="text-[#B99A55] font-semibold uppercase tracking-wider mb-1">
              Privacy &amp; Verification
            </div>
            <p className="leading-relaxed">
              Reporter contact information remains confidential until ownership proof is verified.
            </p>
          </div>
        </div>
      </div>

      {/* Right Auth Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md bg-white border border-[#E8E4DA] rounded-lg shadow-xs p-6 sm:p-8">
          {mode !== 'forgot' && (
            <div className="flex border-b border-[#E8E4DA] mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'border-[#172B45] text-[#172B45]'
                    : 'border-transparent text-[#777777] hover:text-[#252A32]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'border-[#172B45] text-[#172B45]'
                    : 'border-transparent text-[#777777] hover:text-[#252A32]'
                }`}
              >
                Student Registration
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 rounded-md bg-[#F7ECEC] border border-[#E5C8CA] text-xs text-[#813D42] leading-relaxed"
            >
              {error}
            </div>
          )}

          {infoMessage && (
            <div
              role="status"
              className="mb-5 px-4 py-3 rounded-md bg-[#F9F4E8] border border-[#E4D4AA] text-xs text-[#172B45] leading-relaxed"
            >
              {infoMessage}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#172B45]">
                  Portal Access
                </h2>
                <p className="text-xs text-[#777777] mt-1">
                  Select your institutional access role and sign in.
                </p>
              </div>

              {/* Role-Based Portal Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F6F0] border border-[#E8E4DA] rounded-md">
                <button
                  type="button"
                  onClick={() => applyRolePreset('student')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
                    portalRole === 'student'
                      ? 'bg-white text-[#172B45] shadow-xs border border-[#E8E4DA]'
                      : 'text-[#777777] hover:text-[#252A32]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#B99A55]" />
                  <span>Student Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyRolePreset('admin')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
                    portalRole === 'admin'
                      ? 'bg-white text-[#172B45] shadow-xs border border-[#E8E4DA]'
                      : 'text-[#777777] hover:text-[#252A32]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B99A55]" />
                  <span>Administrator</span>
                </button>
              </div>

              <div>
                <FormLabel htmlFor="login-email" required>
                  University Email
                </FormLabel>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@aldenbrook.edu"
                    className={`${inputBaseClasses} pl-10`}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="text-sm font-medium text-[#252A32]">
                    Password <span className="text-[#813D42]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-medium text-[#172B45] hover:text-[#B99A55] cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputBaseClasses} pl-10 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#252A32] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                {portalRole === 'admin' ? 'Sign In to Admin Console' : 'Sign In to Student Portal'}
              </Button>

              <div className="pt-4 border-t border-[#E8E4DA] text-xs text-[#777777] space-y-1.5">
                <div className="font-medium text-[#252A32]">Campus Evaluation Accounts</div>
                <div className="flex items-center justify-between gap-2">
                  <span>Student: clara.vance@aldenbrook.edu</span>
                  <button
                    type="button"
                    onClick={() => applyRolePreset('student')}
                    className="text-[#172B45] font-medium underline underline-offset-2 hover:text-[#B99A55] cursor-pointer"
                  >
                    Use Student
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Admin: admin@aldenbrook.edu</span>
                  <button
                    type="button"
                    onClick={() => applyRolePreset('admin')}
                    className="text-[#172B45] font-medium underline underline-offset-2 hover:text-[#B99A55] cursor-pointer"
                  >
                    Use Admin
                  </button>
                </div>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#172B45]">
                  Student Registration
                </h2>
                <p className="text-xs text-[#777777] mt-1">
                  Activate your campus Lost &amp; Found profile with your university credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FormLabel htmlFor="reg-name" required>
                    Full Name
                  </FormLabel>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jordan Mercer"
                    className={inputBaseClasses}
                    required
                  />
                </div>
                <div>
                  <FormLabel htmlFor="reg-id" required>
                    Student ID
                  </FormLabel>
                  <input
                    id="reg-id"
                    type="text"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    placeholder="AU-2026-5012"
                    className={`${inputBaseClasses} font-mono`}
                    required
                  />
                </div>
              </div>

              <div>
                <FormLabel htmlFor="reg-email" required>
                  University Email
                </FormLabel>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jordan.mercer@aldenbrook.edu"
                  className={inputBaseClasses}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FormLabel htmlFor="reg-dept">Department</FormLabel>
                  <input
                    id="reg-dept"
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className={inputBaseClasses}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="reg-phone">Phone Number</FormLabel>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(555) 310-4400"
                    className={inputBaseClasses}
                  />
                </div>
              </div>

              <div>
                <FormLabel htmlFor="reg-residence">Campus Residence / Hall</FormLabel>
                <input
                  id="reg-residence"
                  type="text"
                  value={regResidence}
                  onChange={(e) => setRegResidence(e.target.value)}
                  placeholder="Barton Hall, Room 210"
                  className={inputBaseClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FormLabel htmlFor="reg-pass" required>
                    Password
                  </FormLabel>
                  <div className="relative">
                    <input
                      id="reg-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 chars"
                      className={`${inputBaseClasses} pr-9`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#252A32] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <FormLabel htmlFor="reg-confirm" required>
                    Confirm Password
                  </FormLabel>
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputBaseClasses}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Create Student Account
              </Button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777] hover:text-[#172B45] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>

              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#172B45]">
                  Reset Institutional Password
                </h2>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  Verify your registered university email address to establish a new password.
                </p>
              </div>

              <div>
                <FormLabel htmlFor="forgot-email" required>
                  University Email
                </FormLabel>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotVerified}
                  placeholder="name@aldenbrook.edu"
                  className={inputBaseClasses}
                  required
                />
              </div>

              {forgotVerified && (
                <div>
                  <FormLabel htmlFor="forgot-new-pass" required>
                    New Password
                  </FormLabel>
                  <div className="relative">
                    <input
                      id="forgot-new-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className={`${inputBaseClasses} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#252A32] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                {forgotVerified ? 'Save New Password' : 'Verify Institutional Email'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
