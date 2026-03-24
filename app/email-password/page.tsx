import EmailPasswordDemo from "./EmailPasswordDemo";

export default function EmailPasswordPage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/login-bg.png')" }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <section className="flex w-full max-w-7xl items-center justify-between gap-10">
          
          {/* LEFT TEXT */}
          <div className="max-w-[560px] text-white">
            <h1
              className="
                text-[64px]
                md:text-[78px]
                font-extrabold
                italic
                uppercase
                leading-[0.9]
                tracking-[-0.03em]
                text-white
              "
              style={{
                textShadow: "0px 3px 8px rgba(0,0,0,0.35)",
              }}
            >
              ENTER THE ARENA
            </h1>

            <p
              className="
                mt-3
                pl-1
                text-[22px]
                md:text-[24px]
                font-semibold
                italic
                tracking-[-0.01em]
                text-white/75
              "
              style={{
                textShadow: "0px 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              Compete. Rise. Dominate.
            </p>
          </div>

          {/* LOGIN CARD */}
          <div className="w-full max-w-[420px]">
            <EmailPasswordDemo />
          </div>
        </section>
      </div>
    </main>
  );
}