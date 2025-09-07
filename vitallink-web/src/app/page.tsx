import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="relative z-20 text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Give the Gift of Life
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl">
            VitalLink is a modern, transparent platform dedicated to making organ donation simpler and more trustworthy for everyone involved.
          </p>
          <div className="mt-10 ">
            <Link href="/register"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-black shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"

            >
              Become a Donor Today
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose VitalLink?</h2>
            <p className="mt-4 text-lg text-gray-600">Rebuilding trust through technology and transparency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="feature-item">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-theme-100">
                <svg className="h-6 w-6 text-black text-theme-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Verified & Secure</h3>
              <p className="mt-2 text-base text-gray-600">Every registration is handled with the utmost security, ensuring your data is safe and your decisions are respected.</p>
            </div>
            <div className="feature-item">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-theme-100">
                <svg className="h-6 w-6 text-black text-theme-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">AI-Powered Efficiency</h3>
              <p className="mt-2 text-base text-gray-600">Our intelligent systems help streamline the matching process, reducing wait times and improving outcomes.</p>
            </div>
            <div className="feature-item">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-theme-100">
                <svg className="h-6 w-6 text-black text-theme-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">Transparent Process</h3>
              <p className="mt-2 text-base text-gray-600">Leveraging blockchain for auditable records, we bring unparalleled transparency to the donation process.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}