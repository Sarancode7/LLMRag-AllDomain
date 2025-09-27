from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging
import os
from dotenv import load_dotenv
load_dotenv()

# RAG imports - EXACT MATCH TO COLAB
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain.embeddings import SentenceTransformerEmbeddings  # CORRECTED IMPORT

app = FastAPI(title="RAG Chatbot API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"

class Source(BaseModel):
    document: str
    content: str
    score: Optional[float] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Source] = []
    conversation_id: str

# Global variables
vectordb = None
llm = None
qa = None
retriever = None

# Configuration - EXACT MATCH TO COLAB
DB_PATH = "./chroma_db"  # Update this to your downloaded DB path
import os
GROQ_API_KEY= os.getenv("GROQ_API_KEY")


# EXACT PROMPT FROM COLAB
PROMPT_TEMPLATE = """You are an expert researcher. Your task is to provide a thorough answer using ONLY the provided documents.

RETRIEVED DOCUMENTS: {context}

USER QUESTION: {question}

REQUIREMENTS:
- Use EVERY relevant piece of information from the documents
- Create a comprehensive answer by combining all relevant details
- Include specific facts, numbers, examples, and context from the documents
- Structure your answer logically with multiple points if applicable
- If documents contain partial information, use what's available
- Do NOT add external knowledge - only use the provided text
- Respond in the user's language

COMPREHENSIVE ANSWER:"""

def clean_repetitive_text(text):
    """Remove repetitive sentences from the response - EXACT MATCH TO COLAB"""
    if not text:
        return text

    sentences = text.split('.')
    seen_sentences = set()
    cleaned_sentences = []

    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and sentence not in seen_sentences:
            seen_sentences.add(sentence)
            cleaned_sentences.append(sentence)
        elif len(cleaned_sentences) > 5:
            break

    return '. '.join(cleaned_sentences) + ('.' if cleaned_sentences else '')

def ask_comprehensive_question(question, max_tokens=300):
    """Get comprehensive answer with token control"""
    try:
        # Get documents
        docs = vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(question)
        
        # Build truncated context
        context = truncate_documents(docs, max_context_tokens=2500)
        
        # Use your existing prompt template but with truncated context
        formatted_prompt = PROMPT_TEMPLATE.format(context=context, question=question)
        
        # Check total token count
        total_tokens = count_tokens(formatted_prompt)
        logger.info(f"Total prompt tokens: {total_tokens}")
        
        if total_tokens > 5500:  # Leave buffer for response
            # Further truncate context if still too large
            context = truncate_documents(docs, max_context_tokens=1500)
            formatted_prompt = PROMPT_TEMPLATE.format(context=context, question=question)
        
        # Send to LLM
        response = llm.invoke(formatted_prompt)
        answer = response.content if hasattr(response, 'content') else str(response)
        answer = clean_repetitive_text(answer)
        
        # Get sources
        sources = []
        for i, doc in enumerate(docs):
            sources.append({
                "document": doc.metadata.get("source", f"Document {i+1}"),
                "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                "score": doc.metadata.get("score")
            })
        
        return answer, sources
        
    except Exception as e:
        logger.error(f"RAG processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"RAG processing failed: {str(e)}")

def ask_concise_question(question):
    """Get concise, non-repetitive answer - EXACT MATCH TO COLAB"""
    docs = vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(question)
    
    context = ""
    for i, doc in enumerate(docs):
        if doc.page_content.strip():
            context += f"Document {i+1}: {doc.page_content[:200]}\n\n"
    
    concise_prompt = f"""Answer this question using only the provided context. Be clear and concise. Do not repeat information.

Context: {context}

Question: {question}

Concise Answer:"""
    
    try:
        response = llm.invoke(concise_prompt)
        return response.content if hasattr(response, 'content') else str(response)
    except:
        return llm(concise_prompt)

def debug_rag_response(question):
    """Debug function to see what context is being retrieved - EXACT MATCH TO COLAB"""
    logger.info(f"🔍 Question: {question}")
    
    docs = vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(question)
    logger.info(f"\n📚 Retrieved {len(docs)} documents")
    
    context_preview = ""
    for i, doc in enumerate(docs):
        if doc.page_content.strip():
            context_preview += f"Doc {i+1}: {doc.page_content[:100]}...\n"
    
    logger.info(f"\n📖 Context preview:\n{context_preview}")
    
    try:
        result = qa.invoke({"query": question})
        answer = result['result']
        logger.info(f"\n🤖 Comprehensive Answer:\n{answer}")
        return answer
    except:
        result = qa.invoke({"query": question})
        answer = result['result']
        logger.info(f"\n🤖 Comprehensive Answer:\n{answer}")
        return answer

def initialize_rag():
    """Initialize RAG components - EXACT MATCH TO COLAB"""
    global vectordb, llm, qa, retriever
    
    try:
        logger.info("Initializing RAG components...")
        
        # EXACT EMBEDDING MODEL FROM COLAB
        embedding = SentenceTransformerEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )
        
        # Set up Groq API key - EXACT MATCH
        os.environ["GROQ_API_KEY"] = GROQ_API_KEY
        
        # Initialize Groq LLM - EXACT MATCH
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0,
            api_key=os.environ["GROQ_API_KEY"]
        )
        logger.info("✅ Groq LLM ready")
        
        # Load vector database - EXACT MATCH
        vectordb = Chroma(
            persist_directory=DB_PATH,
            embedding_function=embedding
        )
        
        # EXACT RETRIEVER FROM COLAB
        retriever = vectordb.as_retriever(search_kwargs={"k": 4})
        logger.info("✅ Vector DB reloaded")
        
        # Create prompt - EXACT MATCH
        prompt = PromptTemplate(
            template=PROMPT_TEMPLATE,
            input_variables=["context", "question"]
        )
        
        # Create QA chain - EXACT MATCH (note k=6 here, just like Colab)
        qa = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=vectordb.as_retriever(search_kwargs={"k": 4}),
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True
        )
        
        logger.info("✅ Comprehensive RAG pipeline ready")
        
        # Print usage info like Colab
        print("\nUsage:")
        print("ask_comprehensive_question('What is solar energy?')")
        print("debug_rag_response('What is solar energy?')  # For debugging")
        
    except Exception as e:
        logger.error(f"Error initializing RAG: {str(e)}")
        raise

def count_tokens(text):
    """Estimate token count (rough approximation: ~4 chars per token)"""
    return len(text) // 4

def truncate_documents(docs, max_context_tokens=2500):
    """Truncate document content to fit within token limits"""
    context = ""
    current_tokens = 0
    
    for i, doc in enumerate(docs):
        if doc.page_content.strip():
            # Start with 200 chars per doc, adjust if needed
            doc_content = doc.page_content[:200]
            doc_tokens = count_tokens(doc_content)
            
            if current_tokens + doc_tokens > max_context_tokens:
                break
                
            context += f"Document {i+1}: {doc_content}\n\n"
            current_tokens += doc_tokens
    
    return context.strip()

# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize RAG on startup"""
    initialize_rag()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        if vectordb is None or qa is None:
            return {"status": "unhealthy", "message": "RAG system not initialized"}
        
        # Test database connection
        test_docs = vectordb.similarity_search("test", k=1)
        
        return {"status": "healthy", "message": "RAG Chatbot API is running"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Error: {str(e)}"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint"""
    try:
        logger.info(f"Processing question: {request.message}")
        
        # Get comprehensive answer using EXACT Colab function
        answer, sources = ask_comprehensive_question(request.message)
        
        # Format sources for response
        formatted_sources = [
            Source(
                document=src["document"],
                content=src["content"],
                score=src["score"]
            ) for src in sources
        ]
        
        return ChatResponse(
            response=answer,
            sources=formatted_sources,
            conversation_id=request.conversation_id
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/debug")
async def debug_question(request: ChatRequest):
    """Debug endpoint using EXACT Colab debug function"""
    try:
        # Use the exact debug function from Colab
        answer = debug_rag_response(request.message)
        
        # Also get retrieval info
        docs = vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(request.message)
        
        context_info = []
        for i, doc in enumerate(docs):
            if doc.page_content.strip():
                context_info.append({
                    "doc_id": i+1,
                    "preview": doc.page_content[:100] + "...",
                    "metadata": doc.metadata
                })
        
        return {
            "question": request.message,
            "retrieved_docs_count": len(docs),
            "context_preview": context_info,
            "answer": answer
        }
        
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")

@app.post("/concise")
async def concise_chat(request: ChatRequest):
    """Concise answer endpoint using EXACT Colab function"""
    try:
        answer = ask_concise_question(request.message)
        
        return {
            "response": answer,
            "conversation_id": request.conversation_id,
            "mode": "concise"
        }
        
    except Exception as e:
        logger.error(f"Error in concise endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Concise processing error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)