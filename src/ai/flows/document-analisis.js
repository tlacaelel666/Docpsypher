// document-analisis.js
import { Document } from '@langchain/core/documents';
import { CharacterTextSplitter } from 'langchain/text_splitter';

export async function analizarDocumentos(documentos) {
  // Instancia del splitter
  const splitter = new CharacterTextSplitter({
    separator: '\n\n',
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = documentos.map((doc) => new Document({ pageContent: doc }));

  // Dividir los documentos
  const docsDivididos = await splitter.splitDocuments(docs);

  // Aquí puedes añadir la lógica para analizar los documentos divididos,
  // por ejemplo, usando un modelo de lenguaje o realizando análisis de contenido.
  console.log('Documentos divididos:', docsDivididos);

  // Retorna algún resultado del análisis
  return docsDivididos;
}

// Puedes añadir ejemplos de uso aquí si lo necesitas
// const documentosEjemplo = ["Este es el contenido del primer documento.\n\nY este es el segundo párrafo.", "Contenido del segundo documento."];
// analizarDocumentos(documentosEjemplo);

