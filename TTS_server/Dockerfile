FROM python:3.9-slim-bullseye

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

RUN apt-get update && \
    apt-get install -y libgl1-mesa-glx libglib2.0-0 && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 7860

# CMD ["uvicorn","main:app","--host","0.0.0.0","--port","7860"]
CMD ["python","startup.py"]