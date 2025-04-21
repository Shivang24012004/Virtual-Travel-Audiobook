import os
import platform
import subprocess

if __name__=="__main__":
    if platform.system()=="Windows":
        print("Running on Windows - using single worker mode")
        subprocess.run(["uvicorn","main:app","--host","0.0.0.0","--port","7860"])
    else:
        cpu_count = os.cpu_count()
        print(f"Running on {platform.system()} - using {cpu_count} workers")
        subprocess.run(["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", str(cpu_count)])