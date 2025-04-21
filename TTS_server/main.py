from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from io import BytesIO
from fastapi.responses import Response,StreamingResponse
from utils import generate_audio_file_edgeTTS,generate_content
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://virtual-travel-audiobook-frontend-shivang24012004s-projects.vercel.app"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AudioRequest(BaseModel):
    location:str = None
    content:str = None

@app.post("/generateAudio")
async def generate_audio(request:AudioRequest):
    location = request.location
    content = request.content
    
    if location is None and content is None:
        return {"success":False,"message":"Required input not found!"}
    
    if location:
        content=await generate_content(location=location)
        
    mp3_fp = await generate_audio_file_edgeTTS(content)
    filename = f"{location.replace(' ', '_')}_tour.mp3" if location else "audio_tour.mp3"
    return StreamingResponse(
        mp3_fp,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    ) 
        
        

@app.get("/")
def root():
    return {"message": f"FastAPI server is running and processId {os.getpid()}!"}
    
