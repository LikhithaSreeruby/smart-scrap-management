import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Truck, MapPin, Package, CheckCircle2, Navigation, Phone, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Navbar } from "../components/Navbar";
import { toast } from "react-hot-toast";
import { db, auth, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { ScrapRequest } from "../types";

export function CollectorView() {
  const [activeRequest, setActiveRequest] = useState<ScrapRequest | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ScrapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScrapRequest));
      setPendingRequests(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "requests");
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async (req: ScrapRequest) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "requests", req.id), {
        status: "accepted",
        collector_id: auth.currentUser.uid
      });
      setActiveRequest({ ...req, status: "accepted", collector_id: auth.currentUser.uid });
      toast.success("Request accepted! Navigate to user location.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${req.id}`);
    }
  };

  const handleVerify = async () => {
    if (!activeRequest) return;
    if (otp === activeRequest.otp) {
      try {
        await updateDoc(doc(db, "requests", activeRequest.id), {
          status: "picked"
        });
        toast.success("OTP Verified! Pickup completed.");
        setActiveRequest(null);
        setOtp("");
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `requests/${activeRequest.id}`);
      }
    } else {
      toast.error("Invalid OTP. Please check with user.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="pb-32 pt-8 px-6 max-w-2xl mx-auto">
      <Navbar />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Collector Portal</h1>
          <p className="text-zinc-500">Manage your pickups and earnings.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Truck size={24} />
        </div>
      </div>

      {activeRequest ? (
        <div className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Navigation size={20} /> Active Pickup
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                {activeRequest.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-zinc-400 mt-1" size={20} />
                <div>
                  <p className="font-bold">User: {activeRequest.user_id.slice(0, 8)}...</p>
                  <p className="text-sm text-zinc-600">{activeRequest.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="text-zinc-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium">{activeRequest.items.map(i => i.type).join(", ")}</p>
                  <p className="text-xs text-zinc-500">Estimated weight: {activeRequest.items.reduce((s, i) => s + i.weight_kg, 0)}kg</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <Phone size={18} /> Call User
                </Button>
                <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                  <Navigation size={18} /> Maps
                </Button>
              </div>
              
              <div className="pt-4 border-t border-emerald-100">
                <p className="text-sm font-medium mb-2">Enter User OTP to Start</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 px-4 py-2 rounded-xl border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button onClick={handleVerify}>Verify</Button>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                  <ShieldCheck size={12} /> Secure doorstep verification enabled
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-zinc-400" /> Nearby Requests
          </h2>
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-zinc-500">No pending requests nearby.</p>
            </Card>
          ) : (
            pendingRequests.map((req) => (
              <Card key={req.id} className="p-5 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">User: {req.user_id.slice(0, 8)}...</p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1">
                      <MapPin size={14} /> {req.address.slice(0, 30)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 uppercase font-bold">Est. Weight</p>
                    <p className="font-bold text-blue-600">{req.items.reduce((s, i) => s + i.weight_kg, 0)}kg</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  {req.items.map(i => i.type).join(", ")}
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleAccept(req)}>
                  Accept Request
                </Button>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
