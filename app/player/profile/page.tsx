import Link from "next/link";

// Placeholder data (replace this with real data fetching later)
const playerStats = [
  { label: "Matches Played", value: "24" },
  { label: "Win Rate", value: "72%" },
  { label: "Total Points", value: "1,150" },
  { label: "Team Ranking", value: "#12" },
];

const upcomingMatches = [
  { event: "City Sports Open - Round 1", date: "Oct 15, 2026", time: "6:00 PM" },
  { event: "Weekly Local Scrimmage", date: "Oct 18, 2026", time: "5:30 PM" },
];

export default function PlayerProfilePage() {
  // Use "player" name from your auth or profiles table later
  const playerName = "Alex Johnson";

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* 1. Header Section */}
      <header className="border-b border-gray-100 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
            Player <span className="text-red-600">Profile</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Welcome,</span>
            <span className="font-semibold text-gray-800">{playerName}</span>
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl">
              {playerName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* 3. Key Stats Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Key Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {playerStats.map((stat) => (
              <div key={stat.label} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-4xl font-extrabold text-gray-950 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Upcoming Matches Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Upcoming Events</h2>
            <Link href="/player/events" className="text-red-600 text-sm font-medium hover:text-red-700 hover:underline">
              View All Events
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div key={match.event} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 hover:border-gray-200 transition shadow-sm">
                <div>
                  <p className="font-semibold text-gray-950 text-lg">{match.event}</p>
                  <p className="text-sm text-gray-500 mt-1">{match.date} • {match.time}</p>
                </div>
                <button className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition active:scale-95 text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Account/Settings Area */}
        <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Account & Personalization</h2>
          <p className="text-gray-600 text-sm mb-6">Manage your profile details and app preferences.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/player/profile/edit" className="bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow-sm">
              Edit Public Profile
            </Link>
            <Link href="/player/settings" className="bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow-sm">
              Notification Settings
            </Link>
            <Link href="/login" className="mtext-red-600 text-sm font-medium hover:text-red-700 hover:underline ml-auto">
                Log out
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}