import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="page-container privacy-policy">
      <div className="page-header">
        <h1>Privacy Policy</h1>
        <p className="muted">Last updated: January 5, 2025</p>
      </div>

      <section>
        <h2>1. Who we are</h2>
        <p>
          DartLead is a darts tournament management app. This privacy policy
          explains what data we collect, why we collect it, and how we protect it.
        </p>
      </section>

      <section>
        <h2>2. What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email address and name provided via sign-up or third-party authentication.</li>
          <li><strong>Tournament data:</strong> tournaments, groups, players, matches, scores, and statistics you create or manage.</li>
          <li><strong>Device data:</strong> basic device identifier (used to manage live match sessions) and IP address as provided by hosting and database providers.</li>
          <li><strong>Usage data:</strong> app interaction events, error logs, and performance metrics to keep the service reliable.</li>
          <li><strong>Cookies/local storage:</strong> used for authentication sessions, language/theme preferences, and in-progress match state.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use the data</h2>
        <ul>
          <li>To authenticate users and secure access to tournaments and matches.</li>
          <li>To store and display tournament schedules, results, and live scoring.</li>
          <li>To sync live matches across devices and prevent conflicts.</li>
          <li>To improve reliability, debug issues, and prevent abuse.</li>
          <li>To comply with legal obligations and protect the service and its users.</li>
        </ul>
      </section>

      <section>
        <h2>4. How we share data</h2>
        <ul>
          <li><strong>Service providers:</strong> We use Supabase for authentication, database, and realtime updates; hosting/CDN providers may process IP addresses and basic request data.</li>
          <li><strong>Tournament visibility:</strong> Tournament information (players, scores, standings) may be visible to other users when a tournament is public or when you share links.</li>
          <li><strong>Legal:</strong> We may disclose information if required by law or to protect the safety, rights, or property of users or the service.</li>
          <li>We do not sell personal data.</li>
        </ul>
      </section>

      <section>
        <h2>5. Data retention</h2>
        <p>
          We retain account and tournament data while your account remains active or as needed
          to operate the service. Live match state cached on devices is cleared automatically or
          can be removed by clearing browser storage. We may keep minimal logs for security and
          compliance purposes.
        </p>
      </section>

      <section>
        <h2>6. Your choices</h2>
        <ul>
          <li>You can request deletion of your account and associated personal data.</li>
          <li>You can clear browser storage (localStorage/cookies) to remove locally cached state.</li>
          <li>You can choose not to share tournament links; private tournaments limit visibility.</li>
        </ul>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use HTTPS, authenticated access, and role-based controls. Supabase secures
          authentication and database storage. No system is 100% secure; please use a strong,
          unique password and protect your device.
        </p>
      </section>

      <section>
        <h2>8. Children&apos;s data</h2>
        <p>
          The service is not directed to children under 16. Do not create accounts for minors
          without appropriate consent where required.
        </p>
      </section>

      <section>
        <h2>9. International transfers</h2>
        <p>
          Data may be processed or stored in regions where our providers operate. We rely on
          their safeguards (such as standard contractual clauses) where applicable.
        </p>
      </section>

    </div>
  );
}



