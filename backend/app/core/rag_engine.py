import os
import logging
from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain.embeddings import SentenceTransformerEmbeddings

from app.config.settings import settings
from app.core.utils import clean_repetitive_text, count_tokens, truncate_documents

logger = logging.getLogger(__name__)

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

class RAGEngine:
    def __init__(self):
        self.vectordb = None
        self.llm = None
        self.qa = None
        self.retriever = None
    
    def initialize(self):
        """Initialize RAG components - EXACT MATCH TO COLAB"""
        try:
            logger.info("Initializing RAG components...")
            
            # EXACT EMBEDDING MODEL FROM COLAB
            embedding = SentenceTransformerEmbeddings(
                model_name=settings.EMBEDDING_MODEL
            )
            
            # Set up Groq API key - EXACT MATCH
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
            
            # Initialize Groq LLM - EXACT MATCH
            self.llm = ChatGroq(
                model=settings.LLM_MODEL,
                temperature=settings.LLM_TEMPERATURE,
                api_key=os.environ["GROQ_API_KEY"]
            )
            logger.info("✅ Groq LLM ready")
            
            # Load vector database - EXACT MATCH
            self.vectordb = Chroma(
                persist_directory=settings.DB_PATH,
                embedding_function=embedding
            )
            
            # EXACT RETRIEVER FROM COLAB
            self.retriever = self.vectordb.as_retriever(search_kwargs={"k": settings.RETRIEVAL_K})
            logger.info("✅ Vector DB reloaded")
            
            # Create prompt - EXACT MATCH
            prompt = PromptTemplate(
                template=PROMPT_TEMPLATE,
                input_variables=["context", "question"]
            )
            
            # Create QA chain - EXACT MATCH
            self.qa = RetrievalQA.from_chain_type(
                llm=self.llm,
                retriever=self.vectordb.as_retriever(search_kwargs={"k": settings.RETRIEVAL_K}),
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
    
    def ask_comprehensive_question(self, question, max_tokens=300):
        """Get comprehensive answer with token control"""
        try:
            # Get documents
            docs = self.vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(question)
            
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
            response = self.llm.invoke(formatted_prompt)
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
    
    def ask_concise_question(self, question):
        """Get concise, non-repetitive answer - EXACT MATCH TO COLAB"""
        docs = self.vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(question)
        
        context = ""
        for i, doc in enumerate(docs):
            if doc.page_content.strip():
                context += f"Document {i+1}: {doc.page_content[:200]}\n\n"
        
        concise_prompt = f"""Answer this question using only the provided context. Be clear and concise. Do not repeat information.

Context: {context}

Question: {question}

Concise Answer:"""
        
        try:
            response = self.llm.invoke(concise_prompt)
            return response.content if hasattr(response, 'content') else str(response)
        except:
            return self.llm(concise_prompt)
    
    def debug_rag_response(self, question):
        """Debug function to see what context is being retrieved - EXACT MATCH TO COLAB"""
        logger.info(f"🔍 Question: {question}")
        
        docs = self.vectordb.as_retriever(search_kwargs={"k": 4}).get_relevant_documents(question)
        logger.info(f"\n📚 Retrieved {len(docs)} documents")
        
        context_preview = ""
        for i, doc in enumerate(docs):
            if doc.page_content.strip():
                context_preview += f"Doc {i+1}: {doc.page_content[:100]}...\n"
        
        logger.info(f"\n📖 Context preview:\n{context_preview}")
        
        try:
            result = self.qa.invoke({"query": question})
            answer = result['result']
            logger.info(f"\n🤖 Comprehensive Answer:\n{answer}")
            return answer
        except:
            result = self.qa.invoke({"query": question})
            answer = result['result']
            logger.info(f"\n🤖 Comprehensive Answer:\n{answer}")
            return answer

# Global RAG engine instance
rag_engine = RAGEngine()