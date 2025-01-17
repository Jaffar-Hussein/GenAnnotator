# Quick Setup: Next.js Frontend & Django Backend

## Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- npm/Yarn, pip
- (Optional) Python virtualenv

> **Nota Bene:** Ensure you have both `.env` (for Django) and `.env` (for Next.js) files set up with required environment variables. Request sample from us. <br>
To populate the database before starting the server, ensure a `data` directory containing the necessary FASTA files is created within the `backend` directory. <br>
The database will be populated by running the `load` command, which retrieves data from this directory.

---

## Django Backend

```bash
git clone https://github.com/Jaffar-Hussein/GenAnnotator/tree/master
cd GenAnnotator/backend
python -m venv venv
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py load
python manage.py runserver
```
Backend runs at http://localhost:8000

## Next.js Frontend

```bash
cd ../frontend
npm install        # or yarn install
npm run dev        # or yarn dev
```

Frontend runs at http://localhost:3000

