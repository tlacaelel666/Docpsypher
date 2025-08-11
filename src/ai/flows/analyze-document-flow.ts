import { createFlow,
  analyzeDocumentStep,
  extractDocumentDataStep,
  getDocumentEmbeddingStep,
}from './app/flows/document-analysis.js';
import analyzeDocumentFlow = createFlow({
  id: 'analyzeDocumentFlow',
  name: 'Document analysis',
  description: 'Analyzes a document and extracts data',
  steps: [
    getDocumentEmbeddingStep,
    analyzeDocumentStep,
    extractDocumentDataStep,
  ],
});

