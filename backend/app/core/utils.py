import logging

logger = logging.getLogger(__name__)

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