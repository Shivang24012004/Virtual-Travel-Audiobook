from io import BytesIO
import edge_tts
from groq import Groq
import os

async def generate_audio_file_edgeTTS(text:str) -> BytesIO:
    mp3_fp = BytesIO()
    communicate = edge_tts.Communicate(text, "en-US-GuyNeural") 
    
    async for chunk in communicate.stream():
        if chunk["type"] == 'audio':
            mp3_fp.write(chunk['data'])
    
    mp3_fp.seek(0)
    return mp3_fp

async def generate_content(location:str) -> str:
    
    API_KEY = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=API_KEY)
    system_prompt = "You are a professional tour guide. Provide interesting and informative details about the location in a conversational tone suitable for an audio guide."
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Create a brief audio tour guide script for {location}. Include historical facts, points of interest, and cultural significance. Note : Do not give in markdown format use regular text."}
    ]
    
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )
    tour_guide_script = completion.choices[0].message.content
    return tour_guide_script    
    