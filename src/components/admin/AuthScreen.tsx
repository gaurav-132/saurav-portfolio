'use client';

import Link from 'next/link';
import type { FormEvent } from 'react';

export default function AuthScreen({
  setup,
  error,
  onSubmit,
  onToggleSetup,
  onPreview,
}: {
  setup: boolean;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleSetup: () => void;
  onPreview: () => void;
}) {
  return (
    <div className="admin-page admin-auth-page">
      <form className="admin-card admin-auth-card glass" onSubmit={onSubmit}>
        <Link className="brand auth-brand" href="/">SAURAV <i>GUSAIN</i></Link>
        <div className="auth-heading">
          <span className="auth-kicker">PORTFOLIO WORKSPACE</span>
          <h1>{setup ? 'Create your admin' : 'Welcome back'}</h1>
          <p>{setup ? 'Set up secure access to manage your portfolio.' : 'Sign in to manage works, leads, and site content.'}</p>
        </div>
        {error && <div className="error auth-error" role="alert">{error}</div>}
        {setup && (
          <>
            <label>One-time setup token<input name="token" required type="password" autoComplete="off" placeholder="Enter setup token" /></label>
            <p className="form-hint">Use the token configured in the server environment.</p>
          </>
        )}
        <label>Email address<input name="email" required type="email" autoComplete="username" placeholder="you@example.com" /></label>
        <label>
          Password
          <input
            name="password"
            required
            type="password"
            minLength={setup ? 8 : 1}
            autoComplete={setup ? 'new-password' : 'current-password'}
            placeholder={setup ? 'At least 8 characters' : 'Enter your password'}
          />
        </label>
        <button className="pill primary auth-submit" type="submit">{setup ? 'Create administrator' : 'Sign in'} <span>↗</span></button>
        <div className="auth-links">
          <button className="quiet" type="button" onClick={onToggleSetup}>{setup ? 'Back to sign in' : 'First time? Configure the initial admin'}</button>
          <button className="quiet" type="button" onClick={onPreview}>Preview the dashboard (read-only)</button>
        </div>
      </form>
    </div>
  );
}
