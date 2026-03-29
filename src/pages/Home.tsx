import { motion } from "motion/react";
import { ArrowRight, Recycle, ShieldCheck, Zap, Leaf } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { cn } from "../lib/utils";

export function Home() {
  return (
    <div className="pb-24">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-emerald-50/50 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium"
          >
            <Leaf size={16} />
            <span>Revolutionizing Scrap Collection</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1]"
          >
            Turn Your Waste into <span className="text-emerald-600 italic">Wealth</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-600 max-w-2xl mx-auto"
          >
            Connect with verified scrap collectors, get live market rates, and track your environmental impact. All in one place.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/request">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Schedule Pickup <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/collector">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Collector Portal
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Verified Collectors",
              desc: "Every collector is background-checked and verified for your safety.",
              icon: ShieldCheck,
              color: "bg-blue-50 text-blue-600",
            },
            {
              title: "Live Market Rates",
              desc: "Get the best prices based on real-time market data from local mandis.",
              icon: Zap,
              color: "bg-amber-50 text-amber-600",
            },
            {
              title: "Eco Tracking",
              desc: "See exactly how much CO2 you've saved and trees you've protected.",
              icon: Recycle,
              color: "bg-emerald-50 text-emerald-600",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", feature.color)}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-zinc-900 text-white rounded-[3rem] mx-4 sm:mx-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Waste Diverted", value: "1.2k Tons" },
            { label: "CO2 Saved", value: "3.4k kg" },
            { label: "Active Users", value: "5k+" },
            { label: "Collectors", value: "200+" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2">{stat.value}</div>
              <div className="text-zinc-400 text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
