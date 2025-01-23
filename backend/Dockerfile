FROM python:3.12-slim

RUN mkdir /backend

WORKDIR /backend

COPY . /backend/

RUN pip install --upgrade pip  \
&& pip install --no-cache-dir -r /backend/requirements.txt \
&& cd /backend/ \
&& python3 manage.py migrate \
&& python3 manage.py simulateuser \
&& python3 manage.py load

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
