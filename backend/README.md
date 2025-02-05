# Quick Setup: Django Backend

## Prerequisites
- Python (v3.12+)
- pip
- redis (v7.2.7)
- (Optional) Python virtualenv

> **Nota Bene:** Ensure you have`.env` file set up with required environment variables. Request sample from us. <br>
To populate the database before starting the server, ensure a `data` directory containing the necessary FASTA files is created within the `backend` directory. <br>
The database will be populated by running the `load` command, which retrieves data from this directory.<br>
```html
.
├── backend
│   ├── .env
│   ├── AccessControl
│   ├── GenAnnot
│   ├── GeneAtlas
│   ├── data
│   │   ├── Escherichia_coli_cft073.fa
│   │   ├── Escherichia_coli_cft073_cds.fa
│   │   ├── Escherichia_coli_cft073_pep.fa
│   │   ├── Escherichia_coli_o157_h7_str_edl933.fa
│   │   ├── Escherichia_coli_o157_h7_str_edl933_cds.fa
│   │   ├── Escherichia_coli_o157_h7_str_edl933_pep.fa
│   │   ├── Escherichia_coli_str_k_12_substr_mg1655.fa
│   │   ├── Escherichia_coli_str_k_12_substr_mg1655_cds.fa
│   │   ├── Escherichia_coli_str_k_12_substr_mg1655_pep.fa
│   │   ├── new_coli.fa
│   │   ├── new_coli_cds.fa
│   │   └── new_coli_pep.fa
│   ├── ...
│   ├── manage.py
```
---

## Django Backend

```bash
git clone https://github.com/Jaffar-Hussein/GenAnnotator/tree/master
cd GenAnnotator/backend
python -m venv venv
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
# If you want to populate the database with sample users
python manage.py simulateuser
# If you want to create a superuser account
python manage.py createsuperuser
python manage.py load
redis-server
python manage.py runserver
```
Backend runs at http://localhost:8000

