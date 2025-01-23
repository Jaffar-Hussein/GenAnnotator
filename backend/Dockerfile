FROM python:3.12-slim

RUN mkdir /backend

WORKDIR /backend

COPY . /backend/

RUN apt-get update \
&& apt-get install -y supervisor

RUN pip install --upgrade pip  \
&& pip install --no-cache-dir -r /backend/requirements.txt \
&& cd /backend/ \
&& python3 manage.py migrate \
&& python3 manage.py simulateuser \
&& python3 manage.py load

CMD ["supervisord", "-c", "/backend/supervisord.conf"]
