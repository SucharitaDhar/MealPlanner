"use client";

import React, { useState } from "react";
import { AppStateProvider, useAppState } from "../store/AppStateContext";
import LandingPage from "../components/LandingPage";
import OnboardingWizard from "../components/OnboardingWizard";
import DashboardScreen from "../components/DashboardScreen";
import AuthModal from "../components/AuthModal";

function AppContent() {
  const { user, profile, updateProfile, loaded, logout } = useAppState();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Loading spinner during database check
  if (!loaded) {
    return (
      <div className="onboarding" style={{ background: "var(--bg-cream)" }}>
        <div className="spinner" />
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <>
        <LandingPage onStartAuth={() => setShowAuthModal(true)} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  // User is logged in, but onboarding is not completed
  if (!profile) {
    return (
      <OnboardingWizard
        onComplete={async (p) => {
          await updateProfile(p);
        }}
        onBackToLanding={() => logout()}
      />
    );
  }

  // User is logged in and onboarding is completed
  return <DashboardScreen profile={profile} onLogout={logout} />;
}

export default function Home() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
