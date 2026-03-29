# was2weal (formerly RecycIQ) ♻️

**Access the App**: [https://ais-dev-vtm25e6eu7lyos4uexajvw-140176589310.asia-east1.run.app](https://ais-dev-vtm25e6eu7lyos4uexajvw-140176589310.asia-east1.run.app)

**was2weal** is a revolutionary scrap collection platform designed to bridge the gap between households and verified scrap collectors. Our mission is to promote sustainable waste management by making recycling easy, rewarding, and transparent.

## 🚀 Features

### For Users
- **AI-Powered Scrap Detection**: Take a photo of your scrap, and our Gemini AI will identify the material and estimate its weight.
- **Real-time Price Estimation**: Get instant value estimates based on current market rates.
- **Eco-Impact Dashboard**: Track your contribution to the environment (CO2 saved, trees saved, waste diverted).
- **Verified Pickups**: Schedule pickups with verified collectors and verify them via a secure OTP.

### For Collectors
- **Smart Request Management**: View and accept pending scrap collection requests in your area.
- **Optimized Routes**: (Planned) Integration with maps for efficient collection routes.
- **Secure Verification**: Verify pickups using user-provided OTPs to ensure trust and safety.
- **Earnings Tracker**: Monitor your earnings and collection history.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (formerly Framer Motion)
- **Backend**: Firebase (Authentication & Firestore)
- **AI**: Google Gemini 3 Flash (via `@google/genai`)
- **Icons**: Lucide React

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd was2weal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file (or use the Secrets panel in AI Studio) and add:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `APP_URL`: The URL where the app is hosted.

4. **Firebase Configuration**:
   The app expects a `firebase-applet-config.json` in the root directory with your Firebase project credentials.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🛡️ Security & Environment Variables

To prevent sensitive information from being leaked to GitHub:
1.  **`.gitignore`**: `firebase-applet-config.json` and `.env` files are now ignored.
2.  **Environment Variables**: Use the variables defined in `.env.example` to configure your app in production or on GitHub.
3.  **Fixing a Leak**: If you have already committed `firebase-applet-config.json` to GitHub:
    -   Remove it from your repository: `git rm --cached firebase-applet-config.json`
    -   Commit the change: `git commit -m "Remove sensitive config from tracking"`
    -   Push to GitHub: `git push origin main`
    -   **Rotate your API keys** in the Google Cloud Console if they were publicly exposed.

## 🛡️ Security Rules

The project uses Firestore Security Rules to ensure:
- Users can only access their own data.
- Collectors can only update requests they have accepted.
- Admins have full oversight.
- Strict data validation on all writes.

## 🌍 Environmental Impact

We use the following factors to calculate your impact:
- **Iron**: 1.5kg CO2 saved per kg
- **Plastic**: 2.5kg CO2 saved per kg
- **Paper**: 1.0kg CO2 saved per kg
- **Copper**: 4.0kg CO2 saved per kg

---

Built with ❤️ for a greener planet.
