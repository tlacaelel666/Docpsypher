import { createFlow } 
from '@react-flow/core';
import { analyzeDocumentStep,
  extractDocumentDataStep,
  getDocumentEmbeddingStep,
}
from './';

export const analyzeDocumentFlow = createFlow({
  id: 'analyzeDocumentFlow',
  name: 'Document analysis',
  description: 'Analyzes a document and extracts data',
  steps: [
    getDocumentEmbeddingStep,
    analyzeDocumentStep,
    extractDocumentDataStep,
  ],
});
