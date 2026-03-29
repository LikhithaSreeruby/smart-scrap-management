import { motion } from "motion/react";
import { Recycle, LogIn, ShieldCheck, Truck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export function Login() {
  const navigate = useNavigate();

  const handleLogin = async (role: "user" | "collector") => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Update role in firestore
      await updateDoc(doc(db, "users", user.uid), {
        role: role
      });

      toast.success(`Logged in as ${role}`);
      navigate(role === "user" ? "/dashboard" : "/collector");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-200">
            <Recycle size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">RecycIQ</h1>
          <p className="text-zinc-500">Join the circular economy revolution.</p>
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <Button 
              onClick={() => handleLogin("user")} 
              className="w-full h-14 text-lg gap-3"
            >
              <LogIn size={20} /> Continue as User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleLogin("collector")} 
              className="w-full h-14 text-lg gap-3"
            >
              <Truck size={20} /> Continue as Collector
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400">Secure Authentication</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm">
            <ShieldCheck size={20} className="shrink-0" />
            <p>Your data is protected with enterprise-grade security and Aadhaar verification.</p>
          </div>
        </Card>

        <p className="text-center text-sm text-zinc-400">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
