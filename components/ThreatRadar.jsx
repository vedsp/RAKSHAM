'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function ThreatRadar({ threatScores, lightMode = true }) {
  const data = [
    { subject: 'OTP Theft', value: threatScores.otpCredentialTheft, fullMark: 100 },
    { subject: 'Payment', value: threatScores.urgentPaymentDemand, fullMark: 100 },
    { subject: 'Authority', value: threatScores.authorityImpersonation, fullMark: 100 },
    { subject: 'Fear/Urgency', value: threatScores.fearUrgencyTactics, fullMark: 100 },
    { subject: 'Info Harvest', value: threatScores.personalInfoHarvesting, fullMark: 100 },
  ];

  const colors = lightMode ? {
    grid: "#e2e8f0",
    angle: "#64748b",
    radius: "#94a3b8",
    radar: "var(--brand-primary)",
  } : {
    grid: "#334155",
    angle: "#94a3b8",
    radius: "#64748b",
    radar: "#ef4444",
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke={colors.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: colors.angle, fontSize: 10, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: colors.radius, fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Threat"
            dataKey="value"
            stroke={colors.radar}
            fill={colors.radar}
            fillOpacity={0.25}
            animationBegin={0}
            animationDuration={1000}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
