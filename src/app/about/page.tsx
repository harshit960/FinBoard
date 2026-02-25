import Link from "next/link";
import { RiStockLine } from "react-icons/ri";
import { HiArrowLeft } from "react-icons/hi";

export const metadata = {
  title: "About Us - FinBoard",
  description: "Learn about FinBoard and the team behind it",
};

const team = [
  {
    name: "Harshit",
    role: "Founder & Lead Developer",
    description: "Full-stack engineer passionate about fintech and real-time data visualization.",
  },
];

const features = [
  {
    title: "Real-Time Data",
    description: "Live market data feeds keep your dashboard always up to date.",
  },
  {
    title: "Customizable Widgets",
    description: "Add, remove, and resize widgets to build the layout that suits your workflow.",
  },
  {
    title: "Drag & Drop",
    description: "Rearrange your dashboard effortlessly with intuitive drag-and-drop.",
  },
  {
    title: "Dark Mode",
    description: "Full light, dark, and system theme support for comfortable viewing at any time.",
  },
  {
    title: "Export & Import",
    description: "Back up your dashboard configuration and restore it with a single click.",
  },
  {
    title: "Open Source",
    description: "Built in the open — contributions and feedback are always welcome.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Hero */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-sm">
            <RiStockLine className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">FinBoard</h1>
            <p className="text-muted-foreground">Customizable real-time finance dashboard</p>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          FinBoard is an open-source finance monitoring dashboard that puts real-time market data,
          crypto prices, and portfolio tracking in one place — designed to be fast, flexible, and
          beautiful.
        </p>

        {/* Mission */}
        <section className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe everyone deserves a professional-grade financial dashboard without the
            enterprise price tag. FinBoard gives individuals and developers the tools to monitor
            the markets they care about, personalized to their exact needs.
          </p>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-colors"
              >
                <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">The Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                  <span className="text-accent font-semibold text-lg">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-foreground">{member.name}</h3>
                <p className="text-xs text-accent mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="bg-card border border-border rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Built With</h2>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Tailwind CSS", "Zustand", "dnd-kit", "React Icons"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-lg font-medium"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-medium text-sm shadow-sm hover:bg-accent/90 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
