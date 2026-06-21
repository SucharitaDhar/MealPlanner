"use client";

import React, { useState } from "react";
import { createClient } from "../lib/supabase/client";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (tab === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (signInError) throw signInError;
        onClose();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;

        // If email confirmation is enabled, user needs to verify their email
        if (data.session) {
          setMessage("Account created and signed in successfully!");
          setTimeout(() => onClose(), 1500);
        } else {
          setMessage(
            "Account created! Please check your email to verify and confirm your account."
          );
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-sm"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: "visible" }}
      >
        <div className="modal-header">
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)" }}>
            {tab === "signin" ? "Sign In to Forka" : "Create Forka Account"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              color: "var(--espresso)",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body stack stack-md" style={{ padding: "var(--sp-6)" }}>
          {/* Tab Selector */}
          <div className="tab-bar" style={{ marginBottom: "var(--sp-2)" }}>
            <button
              className={`tab-btn ${tab === "signin" ? "tab-btn--active" : ""}`}
              onClick={() => {
                setTab("signin");
                setError("");
                setMessage("");
              }}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${tab === "signup" ? "tab-btn--active" : ""}`}
              onClick={() => {
                setTab("signup");
                setError("");
                setMessage("");
              }}
              style={{ flex: 1 }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="stack stack-md">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <div className="alert-error" style={{ margin: "var(--sp-1) 0" }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  background: "var(--green-light)",
                  color: "var(--green)",
                  border: "2px solid var(--green)",
                  padding: "var(--sp-3)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sp-2)",
                }}
              >
                <span>✓</span> {message}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: "var(--sp-2)" }}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : tab === "signin"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
