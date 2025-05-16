from io import BytesIO
import edge_tts
from groq import Groq
import os
from langchain_community.retrievers import WikipediaRetriever
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import asyncio
from langchain_groq import ChatGroq


async def generate_audio_file_edgeTTS(text:str) -> BytesIO:
    mp3_fp = BytesIO()
    communicate = edge_tts.Communicate(text, "en-US-GuyNeural") 
    
    async for chunk in communicate.stream():
        if chunk["type"] == 'audio':
            mp3_fp.write(chunk['data'])
    
    mp3_fp.seek(0)
    return mp3_fp

async def generate_content(location: str) -> str:
    try:
        retriever = WikipediaRetriever(top_k_results=1, doc_content_chars_max=2000)
        
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            return "Error: GROQ_API_KEY not found in environment variables"
        
        llm = ChatGroq(
            api_key=api_key,
            model_name="llama-3.3-70b-versatile"
        )        
        docs = await asyncio.to_thread(retriever.invoke, location)

        if not docs or len(docs) == 0:
            return f"No Wikipedia information found for location: {location}"
        
        context_text = "\n\n".join(d.page_content for d in docs)
        print(context_text)
        prompt = ChatPromptTemplate.from_template(
            """
            You are a tour guide expert. Using only the provided context, write a single, self-contained paragraph describing the location.
            Do not include any personal information, headings, labels, or extra commentary—output only the paragraph text.
            Context: {context}
            Question: {question}
            """
        )
        print("1")
        chain = prompt | llm | StrOutputParser()
        output = await asyncio.to_thread(chain.invoke, {
            "context": context_text,
            "question": "Generate a compelling and informative piece of content, between 250 to 350 words, written in a single paragraph format. The content should be engaging, insightful, and based solely on the provided context without introducing any external information."
        })
        print("2")        
        return output
    
    except Exception as e:
        import traceback
        error_message = f"Error generating content: {str(e)}\n{traceback.format_exc()}"
        print(error_message)
        return f"Error generating content for {location}: {str(e)}"