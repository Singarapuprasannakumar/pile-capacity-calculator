# Pile Capacity Calculator

A clean, responsive, engineering-grade web application to calculate pile shaft resistance, end bearing, ultimate capacity, and allowable capacity for multi-layer soil profiles.

Built using the **α-method** for clay layers and the **effective stress method** for sand layers.

---

## 🏗 Project Structure

The project is structured as a monorepo containing a React frontend and a FastAPI backend:

```text
pile-capacity-calculator/
├── backend/                 # FastAPI Python Backend
│   ├── main.py              # Application logic and endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── runtime.txt          # Python runtime version
│   ├── Procfile             # Render/Heroku start instructions
│   └── render.yaml          # Render blueprint configuration
├── frontend/                # React (Vite + Tailwind CSS) Frontend
│   ├── src/                 # Application source code
│   ├── vercel.json          # Vercel deployment configuration
│   └── package.json         # Node.js dependencies and scripts
├── .gitignore               # Unified git ignore configurations
├── README.md                # Project documentation
└── LICENSE                  # License agreement
```

---

## 🚀 Deployed Environments

* **Frontend**: Hosted on [Vercel](https://vercel.com)
* **Backend**: Hosted on [Render](https://render.com)

---

## 🛠️ Local Development

### 1. Backend Startup

Ensure Python 3.11 is installed, then run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

The API docs will be available at `http://localhost:8000/docs`.

### 2. Frontend Startup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser. All API requests in development are proxied to `http://localhost:8000` via Vite's local dev server proxy.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
