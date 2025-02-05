# Quick Setup:

## Prerequisites
- Docker(v27.4.0+)

> **Nota Bene:** Ensure you have both `.env` (for Django) and `.env` (for Next.js) files set up with required environment variables. Request sample from us. <br>
To populate the database before starting the server, ensure a `data` directory containing the necessary FASTA files is created within the `backend` directory. <br>
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
├── frontend
│   ├── .env
```
---

## Django Backend

```bash
git clone https://github.com/Jaffar-Hussein/GenAnnotator/tree/master
cd GenAnnotator
docker compose up
```
Backend runs at http://localhost:8000

Frontend runs at http://localhost:3000

