// Real user meetings are dynamically loaded and stored via MeetingContext & localStorage.
// All fabricated/demo meetings have been removed as per requirements.
export const mockScheduledMeetings = [];

export const mockRecentMeetings = [];

export const mockAnalyticsData = {
  kpis: {
    totalMeetings: '1,428',
    activeUsers: '894',
    totalMeetingHours: '3,842 hrs',
    avgMeetingDuration: '34.2 mins',
    packetLossAvg: '0.04%',
    videoUptime: '99.98%'
  },
  monthlyVolume: [
    { month: 'Apr', meetings: 210, hours: 490 },
    { month: 'May', meetings: 280, hours: 620 },
    { month: 'Jun', meetings: 340, hours: 810 },
    { month: 'Jul', meetings: 420, hours: 940 },
    { month: 'Aug', meetings: 510, hours: 1120 },
    { month: 'Sep', meetings: 630, hours: 1380 }
  ],
  deviceDistribution: [
    { device: 'Desktop App (Win/Mac)', percentage: 68 },
    { device: 'Chrome / Edge Web', percentage: 22 },
    { device: 'Mobile / Tablet', percentage: 10 }
  ]
};
