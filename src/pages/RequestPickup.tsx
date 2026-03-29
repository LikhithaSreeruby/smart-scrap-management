import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, Trash2, Sparkles, Loader2, CheckCircle2, MapPin, Calendar, Newspaper, Hammer, Zap, Box, Droplets, Cpu, Package, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Navbar } from "../components/Navbar";
import { detectScrap } from "../services/gemini";
import { SCRAP_RATES } from "../constants";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

export function RequestPickup() {
  const [image, setImage] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        handleDetect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async (base64: string) => {
    setDetecting(true);
    try {
      const result = await detectScrap(base64);
      const detectedItems = result.items.map((item: any) => {
        const rate = SCRAP_RATES.find(r => r.type.toLowerCase() === item.type.toLowerCase()) || SCRAP_RATES[0];
        return {
          ...item,
          type: rate.type, // Use canonical type
          estimated_price: Math.round(item.estimated_weight_kg * rate.rate),
          icon: rate.icon
        };
      });
      setItems(detectedItems);
      toast.success("AI detected scrap materials!");
    } catch (error: any) {
      console.error(error);
      let message = error.message || "Failed to detect scrap. Please add manually.";
      if (message.includes("Invalid Gemini API Key")) {
        message = "The Gemini API Key is invalid. Please check your Secrets or .env file.";
      }
      toast.error(message);
      // Fallback: Add a default item so user can edit it
      if (items.length === 0) {
        const unidentifiedRate = SCRAP_RATES[0]; // Now "Unidentified"
        setItems([{
          type: unidentifiedRate.type,
          estimated_weight_kg: 1,
          estimated_price: unidentifiedRate.rate,
          icon: unidentifiedRate.icon
        }]);
      }
    } finally {
      setDetecting(false);
    }
  };

  const addItem = () => {
    const defaultRate = SCRAP_RATES[0]; // Now "Unidentified"
    setItems([...items, {
      type: defaultRate.type,
      estimated_weight_kg: 1,
      estimated_price: defaultRate.rate,
      icon: defaultRate.icon
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'type' || field === 'estimated_weight_kg') {
      const rate = SCRAP_RATES.find(r => r.type === (field === 'type' ? value : item.type)) || SCRAP_RATES[0];
      item.estimated_price = Math.round(item.estimated_weight_kg * rate.rate);
      item.icon = rate.icon;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalEstimated = items.reduce((sum, item) => sum + item.estimated_price, 0);

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setSubmitting(true);
    try {
      const requestData = {
        user_id: auth.currentUser.uid,
        items: items.map(i => ({ type: i.type, weight_kg: i.estimated_weight_kg, estimated_price: i.estimated_price })),
        total_estimated_price: totalEstimated,
        status: "pending",
        collector_id: null,
        created_at: Date.now(),
        address,
        otp: Math.floor(1000 + Math.random() * 9000).toString(), // Generate 4-digit OTP
      };
      
      await addDoc(collection(db, "requests"), requestData);
      toast.success("Pickup scheduled successfully!");
      navigate("/dashboard");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "requests");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-32 pt-8 px-6 max-w-2xl mx-auto">
      <Navbar />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule Pickup</h1>
        <p className="text-zinc-500">Snap a photo of your scrap and we'll do the rest.</p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Photo & Detection */}
        <Card className={cn(step !== 1 && "opacity-50 pointer-events-none")}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-bold">Identify Scrap</h2>
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-zinc-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Camera size={24} />
              </div>
              <div className="text-center">
                <p className="font-medium">Take a photo or upload</p>
                <p className="text-sm text-zinc-400">AI will detect material & weight</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-100">
                <img src={image} alt="Scrap" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-red-500 hover:bg-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {detecting ? (
                <div className="flex items-center justify-center gap-3 py-8 text-emerald-600">
                  <Loader2 className="animate-spin" />
                  <span className="font-medium">AI Analyzing materials...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            {(() => {
                              const IconMap: any = {
                                Newspaper, Hammer, Zap, Box, Droplets, Cpu, Package, HelpCircle, Sparkles
                              };
                              const Icon = IconMap[item.icon] || Sparkles;
                              return <Icon size={18} />;
                            })()}
                          </div>
                          <select 
                            value={item.type}
                            onChange={(e) => updateItem(i, 'type', e.target.value)}
                            className="font-bold bg-transparent outline-none cursor-pointer"
                          >
                            {SCRAP_RATES.map(r => (
                              <option key={r.type} value={r.type}>{r.type}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={() => removeItem(i)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            type="number" 
                            value={item.estimated_weight_kg}
                            onChange={(e) => updateItem(i, 'estimated_weight_kg', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded-lg border border-zinc-200 text-sm"
                            step="0.1"
                            min="0.1"
                          />
                          <span className="text-sm text-zinc-500">kg</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">₹{item.estimated_price}</p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Est. Value</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed" 
                    onClick={addItem}
                  >
                    + Add Item Manually
                  </Button>
                  
                  {items.length > 0 && (
                    <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
                      <div>
                        <p className="text-sm text-zinc-500">Total Estimated Value</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{totalEstimated}</p>
                      </div>
                      <Button onClick={() => setStep(2)}>Confirm & Next</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Step 2: Details */}
        <Card className={cn(step !== 2 && "opacity-50 pointer-events-none")}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">2</div>
            <h2 className="text-xl font-bold">Pickup Details</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <MapPin size={16} /> Pickup Address
              </label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <Calendar size={16} /> Preferred Date
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} className="flex-[2]" disabled={!address || !date}>
                Schedule Pickup
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
