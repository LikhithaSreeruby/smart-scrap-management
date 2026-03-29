import { ScrapRate } from "./types";

export const SCRAP_RATES: ScrapRate[] = [
  { type: "Unidentified", unit: "kg", rate: 0, icon: "HelpCircle", co2_saving_per_kg: 0 },
  { type: "Newspaper", unit: "kg", rate: 14, icon: "Newspaper", co2_saving_per_kg: 1.5 },
  { type: "Iron", unit: "kg", rate: 28, icon: "Hammer", co2_saving_per_kg: 2.0 },
  { type: "Copper", unit: "kg", rate: 600, icon: "Zap", co2_saving_per_kg: 3.5 },
  { type: "Aluminum", unit: "kg", rate: 105, icon: "Box", co2_saving_per_kg: 4.0 },
  { type: "PET Bottles", unit: "kg", rate: 8, icon: "Droplets", co2_saving_per_kg: 2.5 },
  { type: "E-Waste", unit: "kg", rate: 45, icon: "Cpu", co2_saving_per_kg: 5.0 },
  { type: "Cardboard", unit: "kg", rate: 6, icon: "Package", co2_saving_per_kg: 1.2 },
];

export const ECO_FACTORS = {
  tree_per_co2_kg: 0.05, // 1kg CO2 saved = 0.05 trees saved (approx)
  phones_charged_per_co2_kg: 121, // 1kg CO2 saved = 121 phones charged (approx)
};
