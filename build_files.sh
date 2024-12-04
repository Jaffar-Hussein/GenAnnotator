#!/bin/bash
# Ensure pip is installed
python3.9 -m ensurepip --upgrade

# Upgrade pip and install dependencies
python3.9 -m pip install --upgrade pip
python3.9 -m pip install -r requirements.txt

# Collect static files
python3.9 manage.py collectstatic --noinput