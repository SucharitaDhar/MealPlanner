"use client";

import React from "react";
import Image from "next/image";

interface LandingPageProps {
  onStartAuth: () => void;
}

export default function LandingPage({ onStartAuth }: LandingPageProps) {
  return (
    <div className="landing-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-cream)" }}>
      {/* Navbar */}
      <header className="navbar" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "var(--sp-6) var(--sp-8)", maxWidth: "1200px", margin: "0 auto", width: "100%"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", cursor: "pointer" }}>
          <div style={{
            background: "var(--coral)", color: "#ffffff", width: "32px", height: "32px",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: "1.1rem", border: "2px solid var(--espresso)"
          }}>
            F
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: "bold", color: "var(--espresso)" }}>
            Forka
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-6)" }}>
          <span className="text-sm text-bold" style={{ cursor: "pointer", color: "var(--espresso)" }} onClick={onStartAuth}>
            Sign in
          </span>
          <button className="btn btn-primary" onClick={onStartAuth} style={{ padding: "8px 20px" }}>
            Get cooking
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", padding: "var(--sp-8) 0" }}>
        <div className="grid-2 mx-auto" style={{ maxWidth: "1200px", width: "100%", padding: "0 var(--sp-8)", alignItems: "center" }}>
          {/* Left Column: Headline, subhead, CTAs */}
          <div className="stack stack-lg" style={{ textAlign: "left" }}>
            <div>
              <span className="badge" style={{ background: "var(--mustard-light)", color: "var(--espresso)", marginBottom: "var(--sp-3)" }}>
                ✨ AI recipe transcription
              </span>
              <h1 style={{ color: "var(--espresso)", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
                Meal planning made <br />
                <span style={{ color: "var(--coral)", fontStyle: "italic" }}>easy</span> and <span style={{ color: "var(--coral)" }}>delicious</span>.
              </h1>
            </div>

            <div className="stack stack-md" style={{ color: "var(--espresso-muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
              <p>
                We all do it: we save hundreds of mouth-watering recipes on Instagram every day, promising ourselves we&apos;ll start eating healthy next week... only to end up back on plain chicken and rice.
              </p>
              <p>
                Forka breaks that cycle. Save your favorite video or text recipes here, and we&apos;ll immediately scale them to fit your exact daily calorie and macro goals. Plan meals for yourself, two people, or the whole family, split portions dynamically by cooked weight, and walk away with a done-for-you weekly grocery checklist.
              </p>
              <p>
                Eat the meals you actually want to eat, without ever messing up your numbers.
              </p>
            </div>

            <div className="row row-md" style={{ marginTop: "var(--sp-2)" }}>
              <button className="btn btn-primary btn-lg" onClick={onStartAuth}>
                Start saving recipes
              </button>
              <button className="btn btn-secondary btn-lg" onClick={onStartAuth}>
                See how it works
              </button>
            </div>

            {/* Badges footer */}
            <div className="row row-lg" style={{ marginTop: "var(--sp-4)", borderTop: "1.5px dashed var(--espresso-thin)", paddingTop: "var(--sp-4)" }}>
              <div className="row row-sm text-xs text-bold" style={{ color: "var(--espresso-muted)" }}>
                <span>📖</span> Clean recipe cards
              </div>
              <div className="row row-sm text-xs text-bold" style={{ color: "var(--espresso-muted)" }}>
                <span>🤖</span> Powered by AI
              </div>
            </div>
          </div>

          {/* Right Column: Illustration Card */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="card" style={{
              background: "#FFF", padding: "var(--sp-3)", borderRadius: "var(--radius-lg)",
              maxWidth: "500px", width: "100%", transform: "rotate(1deg)", transition: "all 0.3s ease"
            }}>
              <div style={{ overflow: "hidden", borderRadius: "var(--radius-md)", border: "2px solid var(--espresso)" }}>
                <Image
                  src="/images/chef_illustration.png"
                  alt="Smiling chef character"
                  width={600}
                  height={600}
                  style={{ width: "100%", height: "auto" }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
