import Link from "next/link";

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/welcome-bg.png')] bg-cover bg-center bg-no-repeat">
      
      <section className="text-center space-y-6">
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide font-monteserrat italic">
          READY TO PLAY?
        </h1>

        <p className="text-white/80 text-sm md:text-base tracking-[0.2em] font-inter">
          COMPETE ACROSS MULTIPLE SPORT
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          
          <Link
            href="/register"
            className="w-72 flex items-center justify-left gap-3 bg-white text-red-600 px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <img src="/sign-up-icon.png" alt="Sign Up Icon" className="w-6 h-6 scale-200" />
            Register / Sign-up
          </Link>

          <Link
            href="/login"
            className="w-72 flex items-center justify-left gap-3 bg-gray-200 text-gray-700 px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <img src="/login-icon.png" alt="Log In Icon" className="w-6 h-6 scale-200" />
            Log in
          </Link>

        </div>

      </section>
    </main>
  );
}