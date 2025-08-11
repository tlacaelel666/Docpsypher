import { createFlow,
  analyzeDocumentStep,
  extractDocumentDataStep,
  getDocumentEmbeddingStep,
} 
from {"analyze-document-flow.ts"}
import {analyzeDocumentFlow}
const analyzeDocumentFlow = createFlow({
  id: 'analyzeDocumentFlow',
  name: 'Document analysis',
  description: 'Analyzes a document and extracts data',
  steps: [
    getDocumentEmbeddingStep,
    analyzeDocumentStep,
    extractDocumentDataStep,
  ],
});

