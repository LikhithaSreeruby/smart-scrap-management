import { motion } from "motion/react";
import { Recycle, TrendingUp, Leaf, Zap, Clock, CheckCircle2, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Navbar } from "../components/Navbar";
import { SCRAP_RATES, ECO_FACTORS } from "../constants";
import { useEffect, useState } from "react";
import { db, auth, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { ScrapRequest } from "../types";

export function Dashboard() {
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("user_id", "==", auth.currentUser.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScrapRequest));
      setRequests(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "requests");
    });

    return () => unsubscribe();
  }, []);

  const stats = requests.reduce((acc, req) => {
    if (req.status === "paid" || req.status === "picked") {
      acc.total_earned += req.total_estimated_price;
      req.items.forEach(item => {
        acc.waste_diverted += item.weight_kg;
        const rate = SCRAP_RATES.find(r => r.type === item.type);
        if (rate) {
          acc.co2_saved += item.weight_kg * rate.co2_saving_per_kg;
        }
      });
    }
    return acc;
  }, { total_earned: 0, waste_diverted: 0, co2_saved: 0 });

  const trees_saved = (stats.co2_saved * ECO_FACTORS.tree_per_co2_kg).toFixed(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="pb-32 pt-8 px-6 max-w-4xl mx-auto">
      <Navbar />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Eco Dashboard</h1>
          <p className="text-zinc-500">Your contribution to a greener planet.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Leaf size={24} />
        </div>
      </div>

      {/* Impact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Earned", value: `₹${stats.total_earned}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Waste Diverted", value: `${stats.waste_diverted}kg`, icon: Recycle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "CO2 Saved", value: `${stats.co2_saved}kg`, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Trees Saved", value: stats.trees_saved, icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <Card key={i} className="flex flex-col items-center text-center p-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-zinc-400" /> Recent Activity
          </h2>
          {requests.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-zinc-500">No requests yet. Start by scheduling a pickup!</p>
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="flex items-center justify-between p-4 hover:border-emerald-200 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    req.status === "picked" || req.status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {req.status === "picked" || req.status === "paid" ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-bold">{req.items.map(i => i.type).join(", ")}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(req.created_at).toLocaleDateString()} • {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">₹{req.total_estimated_price}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Estimated</p>
                  </div>
                  <ChevronRight size={20} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Market Rates */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-zinc-400" /> Market Rates
          </h2>
          <Card className="p-0 overflow-hidden">
            {SCRAP_RATES.slice(0, 5).map((rate, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                    <Zap size={16} />
                  </div>
                  <span className="font-medium text-sm">{rate.type}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm">₹{rate.rate}</span>
                  <span className="text-[10px] text-zinc-400 ml-1">/{rate.unit}</span>
                </div>
              </div>
            ))}
            <div className="p-3 bg-zinc-50 text-center">
              <button className="text-xs font-bold text-emerald-600 hover:underline">View All Rates</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
