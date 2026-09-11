// Default owner reference and empty admin user initial state.
// Real users are retrieved dynamically from the MongoDB backend.
export const currentUser = {
  id: 'user-001',
  name: 'Virat',
  fullName: 'Virat Singh',
  email: 'viratchauhan1010@gmail.com',
  role: 'Product Lead & Host',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  title: 'Principal Engineer',
  organization: 'ConnectX Technologies',
  timezone: 'GMT+5:30 (India Standard Time)',
  joinedDate: 'Jan 2024',
  plan: 'Enterprise Pro',
  settings: {
    soundEffects: true,
    audioInput: 'Default Microphone (Built-in)',
    videoInput: 'FaceTime HD Camera / Integrated Webcam',
    audioOutput: 'System Speakers',
    videoQuality: '1080p',
    noiseSuppression: true,
    autoMuteOnJoin: false,
    virtualBackground: 'blur',
  }
};

export const mockAdminUsers = [];
