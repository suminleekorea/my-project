import Image from "next/image";

const aiSkills = [
  "Generative AI workflow design",
  "Prompt engineering for business use cases",
  "AI-assisted market and account research",
  "CRM and lifecycle automation",
  "SQL, Python, R, Power BI, Tableau",
  "Experiment design and campaign analytics",
];

const highlights = [
  {
    value: "95%",
    label: "NRR across enterprise accounts",
    detail:
      "Managed renewals and expansion conversations with Samsung, SK Hynix, Hyundai Motor, KISET, KIST, KRICT, and KEPCO.",
  },
  {
    value: "470+",
    label: "creators onboarded at TikTok Korea",
    detail:
      "Built creator partnerships, improved category satisfaction, and supported branded campaigns with Daiso and Trip.com.",
  },
  {
    value: "12-28%",
    label: "CTR uplift through campaign optimization",
    detail:
      "Used audience, merchant, and channel insights to improve CRM and content campaign performance at Fave.",
  },
];

const focusAreas = [
  {
    title: "AI Marketing Systems",
    copy:
      "I connect customer data, campaign signals, and generative AI tools to create faster research, segmentation, messaging, and reporting workflows.",
  },
  {
    title: "Product and Customer Storytelling",
    copy:
      "I translate technical or data-heavy products into clear value propositions, sales narratives, enablement assets, and market-facing content.",
  },
  {
    title: "Commercial Analytics",
    copy:
      "I combine SQL, Python, R, dashboards, and CRM context to find patterns that improve acquisition, retention, and account strategy.",
  },
];

const projects = [
  {
    name: "AI Job Agent",
    type: "AI automation",
    copy:
      "Built a role-matching assistant that evaluates job fit, selects resume versions, and drafts tailored application materials from job descriptions.",
  },
  {
    name: "SwiftFix",
    type: "CODECHELLA 2025 Top 10",
    copy:
      "Created an AI-enabled service concept focused on faster issue diagnosis, customer workflows, and practical product adoption.",
  },
  {
    name: "HNW AI Sales Coach Research",
    type: "Vendor and use-case research",
    copy:
      "Benchmarked AI coaching and conversational platforms including AmplifAI, Pand.ai, and Chubb-related market examples.",
  },
];

const roles = [
  "Product Marketing",
  "Customer Success",
  "Pre-Sales / Solutions Consulting",
  "Marketing Analytics",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#1f2520]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-[#d8d0c0] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            className="flex items-center gap-3"
            href="https://github.com/suminleekorea"
            target="_blank"
            rel="noreferrer"
            aria-label="Open Sumin Lee GitHub profile"
          >
            <Image
              src="https://github.com/suminleekorea.png"
              alt="Sumin Lee profile photo"
              width={56}
              height={56}
              priority
              className="rounded-lg border border-[#d8d0c0]"
            />
            <div>
              <p className="text-sm font-medium uppercase text-[#5f6f52]">
                Sumin Lee
              </p>
              <p className="text-sm text-[#5f5b52]">
                Singapore-based AI marketing and customer growth talent
              </p>
            </div>
          </a>
          <nav className="flex flex-wrap gap-3 text-sm font-medium">
            <a className="hover:text-[#2f6f68]" href="mailto:SUMIN014@e.ntu.edu.sg">
              Email
            </a>
            <a
              className="hover:text-[#2f6f68]"
              href="https://www.linkedin.com/in/suminlee-apac"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              className="hover:text-[#2f6f68]"
              href="https://suminlee.org"
              target="_blank"
              rel="noreferrer"
            >
              Website
            </a>
          </nav>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="flex flex-col gap-6">
            <p className="w-fit border border-[#c8b68f] bg-[#fffaf0] px-3 py-2 text-sm font-medium text-[#6f4c1d]">
              MSc Business Analytics, NTU | Available from 13 July 2026
            </p>
            <div className="max-w-4xl">
              <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                AI-enabled strategist for products, customers, and growth.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4b5148]">
                I combine product marketing, customer success, sales consulting,
                and marketing analytics experience with hands-on AI automation.
                My work turns messy market, customer, and campaign data into
                sharper positioning, faster research, better enablement, and
                measurable growth.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {roles.map((role) => (
                <span
                  className="border border-[#d8d0c0] bg-white px-3 py-2 text-sm font-medium text-[#384038]"
                  key={role}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <aside className="grid gap-3 border-l-4 border-[#2f6f68] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-[#2f6f68]">
              Current AI edge
            </p>
            <ul className="grid gap-3 text-sm leading-6 text-[#4b5148]">
              {aiSkills.map((skill) => (
                <li className="flex gap-3" key={skill}>
                  <span className="mt-2 h-2 w-2 shrink-0 bg-[#d36d4c]" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </section>

      <section className="border-y border-[#d8d0c0] bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {highlights.map((item) => (
            <article className="rounded-lg border border-[#e1dbcf] p-5" key={item.label}>
              <p className="text-3xl font-semibold text-[#2f6f68]">{item.value}</p>
              <h2 className="mt-2 text-base font-semibold">{item.label}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5f5b52]">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-2xl font-semibold">What I build with AI</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {focusAreas.map((area) => (
              <article className="rounded-lg bg-[#1f2520] p-5 text-white" key={area.title}>
                <h3 className="text-lg font-semibold text-[#f2c879]">{area.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#e8e1d4]">{area.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
          <h2 className="text-2xl font-semibold">Recent proof points</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <article
                className="rounded-lg border border-[#d8d0c0] bg-[#fffdf8] p-5"
                key={project.name}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm font-medium text-[#b54f32]">{project.type}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#4b5148]">{project.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#2f6f68] px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Sumin Lee</p>
            <p className="text-sm text-[#d9efec]">
              Korean native, fluent English | Singapore, Korea, Dubai focus
            </p>
          </div>
          <a
            className="w-fit rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#2f6f68] transition hover:bg-[#f2c879]"
            href="mailto:SUMIN014@e.ntu.edu.sg"
          >
            Start a conversation
          </a>
        </div>
      </footer>
    </main>
  );
}
