import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/welcome-bg.png')] bg-cover bg-center bg-no-repeat">
      
      <section className="text-center space-y-6">
        
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide font-montserrat italic">
            READY TO PLAY?
          </h1>

          <p className="text-white/90 text-xs md:text-sm tracking-[0.15em] font-light uppercase">
            Compete across multiple sport
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          
          <Link
            href="/register" 
            className="w-72 md:w-80 flex items-center bg-white px-6 py-3.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <img src="/sign-up-icon.png" alt="Sign Up Icon" className="w-6 h-6 object-contain" />
            <span className="flex-1 text-center text-[#e60000] text-lg font-semibold pr-6">
              Register / Sign-up
            </span>
          </Link>

          <Link
            href="/login" 
            className="w-72 md:w-80 flex items-center bg-white px-6 py-3.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <img src="/login-icon.png" alt="Login Icon" className="w-6 h-6 object-contain opacity-80" />
            <span className="flex-1 text-center text-gray-800 text-lg font-semibold pr-6">
              Log in
            </span>
          </Link>

        </div>

      </section>
    </main>
  );
}