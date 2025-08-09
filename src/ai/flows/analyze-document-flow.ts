import { createFlow } 
import { analyzeDocumentStep,
  extractDocumentDataStep,
  getDocumentEmbeddingStep,
}
from { BiMoTypeProtocol } import 'BiMoTypeProtocol.cs';

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
