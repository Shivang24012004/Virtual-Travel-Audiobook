from io import BytesIO
import edge_tts
from groq import Groq
import os
from langchain_community.retrievers import WikipediaRetriever
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


async def generate_audio_file_edgeTTS(text:str) -> BytesIO:
    mp3_fp = BytesIO()
    communicate = edge_tts.Communicate(text, "en-US-GuyNeural") 
    
    async for chunk in communicate.stream():
        if chunk["type"] == 'audio':
            mp3_fp.write(chunk['data'])
    
    mp3_fp.seek(0)
    return mp3_fp

async def generate_content(location:str) -> str:
    retriever = WikipediaRetriever()
    llm = init_chat_model("llama3-8b-8192", model_provider="groq")
    docs = retriever.invoke(location)
    context_text = "\n\n".join(d.page_content for d in docs)
    
    prompt = ChatPromptTemplate.from_template(
        """
        You are a tour guide expert. Using only the provided context, write a single, self-contained paragraph describing the location.
        Do not include any personal information, headings, labels, or extra commentary—output only the paragraph text.
        Context: {context}
        Question: {question}
        """
    )
    chain = prompt | llm | StrOutputParser()
    output = chain.invoke({
        "context": context_text,
        "question":  "Generate a compelling and informative piece of content, between 250 to 350 words, written in a single paragraph format. The content should be engaging, insightful, and based solely on the provided context without introducing any external information."
    })
    return output
    
    