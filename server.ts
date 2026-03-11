import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("gems.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS universities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL, -- 'essay' or 'short'
    reflection TEXT NOT NULL,
    csat_min TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert university data
const count = db.prepare("SELECT COUNT(*) as count FROM universities").get() as { count: number };
if (count.count !== 44) {
  db.prepare("DELETE FROM universities").run();
  const insert = db.prepare("INSERT INTO universities (name, category, type, reflection, csat_min) VALUES (?, ?, ?, ?, ?)");
  const unis = [
    // Essay (29)
    ["연세대학교 (서울)", "최상위권", "essay", "100%", "없음"],
    ["고려대학교 (서울)", "최상위권", "essay", "100%", "4합 8"],
    ["한양대학교 (서울)", "상위권", "essay", "100%", "3합 7"],
    ["성균관대학교", "상위권", "essay", "100%", "3합 6"],
    ["서강대학교", "상위권", "essay", "100%", "3합 7"],
    ["중앙대학교 (일반)", "상위권", "essay", "70%", "3합 6"],
    ["중앙대학교 (창의형)", "고3 전용", "essay", "70%", "없음"],
    ["경희대학교", "상위권", "essay", "100%", "2합 5"],
    ["이화여자대학교", "상위권", "essay", "100%", "2합 5"],
    ["건국대학교", "상위권", "essay", "100%", "2합 5"],
    ["동국대학교", "상위권", "essay", "70%", "2합 5"],
    ["서울시립대학교", "상위권", "essay", "80%", "없음"],
    ["부산대학교", "지거국", "essay", "80%", "2합 5"],
    ["경북대학교", "지거국", "essay", "70%", "3합 4"],
    ["광운대학교", "수도권", "essay", "80%", "없음"],
    ["아주대학교", "수도권", "essay", "80%", "없음"],
    ["인하대학교", "수도권", "essay", "80%", "2합 5"],
    ["숭실대학교", "서울", "essay", "90%", "2합 6"],
    ["세종대학교", "서울", "essay", "80%", "2합 5"],
    ["단국대학교 (죽전)", "수도권", "essay", "90%", "없음"],
    ["숙명여자대학교", "서울", "essay", "90%", "2합 5"],
    ["성신여자대학교", "서울", "essay", "100%", "2합 7"],
    ["서울여자대학교", "서울", "essay", "80%", "없음"],
    ["덕성여자대학교", "서울", "essay", "100%", "2합 7"],
    ["동덕여자대학교", "서울", "essay", "100%", "2합 6"],
    ["항공대학교", "수도권", "essay", "100%", "2합 6"],
    ["경기대학교", "수도권", "essay", "90%", "없음"],
    ["인천대학교", "수도권 거점", "essay", "100%", "없음"],
    ["항공대학교 (이학)", "이학계열", "essay", "100%", "2합 6"],
    
    // Short (15)
    ["가천대학교", "약술형 리더", "short", "100%", "1개 3"],
    ["국민대학교", "2027 신설", "short", "100%", "2합 6"],
    ["강남대학교", "2027 신설", "short", "80%", "없음"],
    ["상명대학교", "인서울 약술형", "short", "90%", "없음"],
    ["서경대학교", "인서울 약술형", "short", "100%", "없음"],
    ["수원대학교", "수도권 약술형", "short", "80%", "없음"],
    ["신한대학교", "수도권 약술형", "short", "90%", "없음"],
    ["을지대학교", "보건 의료 특성화", "short", "80%", "없음"],
    ["한신대학교", "경기권 약술형", "short", "80%", "없음"],
    ["삼육대학교", "약학 신설", "short", "100%", "1개 3"],
    ["고려대 (세종)", "수도권 거점", "short", "100%", "2합 6"],
    ["홍익대 (세종)", "세종권 거점", "short", "90%", "1개 4"],
    ["한국공학대학교", "공학 특성화", "short", "80%", "없음"],
    ["한국기술교육대", "취업 명문", "short", "100%", "없음"],
    ["한국외대 (글로벌)", "수도권 거점", "short", "100%", "2합 6"],
  ];
  unis.forEach(u => insert.run(...u));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/universities", (req, res) => {
    const unis = db.prepare("SELECT * FROM universities").all();
    res.json(unis);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
