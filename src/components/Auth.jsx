import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext';

export function Auth() {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const { signIn, signUp, resetPassword } = useAuth();

  const handleInputChange = (e) => {
    console.log('Input change:', e.target.name, e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError(t('auth.passwordsDoNotMatch'));
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError(t('auth.passwordTooShort'));
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          role: 'admin', // All registered users are admins/scorers
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess(t('auth.checkEmailConfirmation'));
        }
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError(t('auth.enterEmailFirst'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await resetPassword(formData.email);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(t('auth.passwordResetEmailSent'));
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Trophy className="auth-icon" />
          <h1>{t('auth.appTitle')}</h1>
          <p>{t('auth.signInAsAdmin', { action: isLogin ? t('auth.in') : t('auth.up') })}</p>
          <div className="auth-info">
            <p>• {t('auth.continueInterruptedMatches')}</p>
            <p>• {t('auth.adminControlsForCorrections')}</p>
            <p>• {t('auth.tournamentManagement')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">{t('auth.fullName')}</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={t('auth.enterFullName')}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('auth.enterEmail')}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('auth.enterPassword')}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('auth.confirmYourPassword')}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? t('common.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
          </button>

          {isLogin && (
            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              {t('auth.forgotPassword')}
            </button>
          )}
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
            <button
              type="button"
              className="toggle-auth"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  fullName: '',
                });
              }}
            >
              {isLogin ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
