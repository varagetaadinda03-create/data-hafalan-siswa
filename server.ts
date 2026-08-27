import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch Google Spreadsheet CSV data with proxy support
  app.get("/api/sheet-data", async (req, res) => {
    try {
      const sheetUrl = (req.query.url as string) || 
        "https://docs.google.com/spreadsheets/d/1mLT5PTyuIIz_vYdHCi5HaLZHJfIftLvOSyVUjQfGqlQ/export?format=csv&gid=1885896530";
      
      const response = await fetch(sheetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/csv,text/plain,*/*"
        }
      });

      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }

      const csvData = await response.text();
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.status(200).send(csvData);
    } catch (err: any) {
      console.error("Error fetching Google Sheet CSV:", err);
      return res.status(500).json({
        error: "Failed to fetch spreadsheet data",
        message: err.message || "Unknown error"
      });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
