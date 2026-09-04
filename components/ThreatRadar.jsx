'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function ThreatRadar({ threatScores = {}, lightMode = true }) {
  const scores = threatScores || {};

  const getScore = (key1, key2) => {
    const val = scores[key1] ?? scores[key2] ?? 0;
    return val <= 10 ? val * 10 : val;
  };

  const data = [
    { subject: 'OTP Theft', value: getScore('otpCredentialTheft', 'urgency'), fullMark: 100 },
    { subject: 'Payment', value: getScore('urgentPaymentDemand', 'dataRequest'), fullMark: 100 },
    { subject: 'Authority', value: getScore('authorityImpersonation', 'impersonation'), fullMark: 100 },
    { subject: 'Fear / Urgency', value: getScore('fearUrgencyTactics', 'urgency'), fullMark: 100 },
    { subject: 'Info Harvest', value: getScore('personalInfoHarvesting', 'dataRequest'), fullMark: 100 },
  ];

  const colors = lightMode
    ? {
        grid: '#cbd5e1',
        angle: '#334155',
        radar: '#4f46e5',
        fill: 'rgba(79, 70, 229, 0.25)',
      }
    : {
        grid: 'rgba(255, 255, 255, 0.15)',
        angle: '#ffffff',
        radar: '#38bdf8',
        fill: 'rgba(56, 189, 248, 0.35)',
      };

  return (
    <div className="w-full h-[260px] relative z-10">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="62%">
          <PolarGrid stroke={colors.grid} strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: colors.angle, fontSize: 11, fontWeight: 700 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Threat Level"
            dataKey="value"
            stroke={colors.radar}
            fill={colors.fill}
            animationBegin={0}
            animationDuration={800}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors.radar, stroke: '#ffffff', strokeWidth: 1.5 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
