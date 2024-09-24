'use server'
import { VectorIndexRetriever, VectorStoreIndex } from "llamaindex/indices/vectorStore/index"
import { ContextChatEngine } from "llamaindex/engines/chat/ContextChatEngine"
import { OllamaEmbedding } from "llamaindex/embeddings/OllamaEmbedding"
import { serviceContextFromDefaults } from "llamaindex/ServiceContext"
import { Ollama } from "llamaindex/llm/ollama"
import { SimpleDirectoryReader } from "llamaindex/readers/index"
import { Metadata } from "next"
import { Settings } from "llamaindex/Settings"
import { BaseRetriever, Document } from "llamaindex"


process.env["OPENAI_API_KEY"] = "keyValue";
interface LCDoc {
  pageContent: string,
  metadata: any,
}

const embedModel = new OllamaEmbedding({
  model: 'nomic-embed-text'
})

const llm = new Ollama({
  model: "phi",
  // model: "gemma",
  options: {
    temperature: 0,
  }
})

let chatEngine: ContextChatEngine | null = null;
let retriever: BaseRetriever;

export async function createIndex() {
  const lcDocs = await new SimpleDirectoryReader().loadData({
    directoryPath: "./data"
  });

  const docs = lcDocs.map(lcDoc => new Document({
    text: lcDoc.text,
    metadata: lcDoc.metadata
  }))
  
  Settings.llm = llm

  // console.log(docs)
  //TODO: Store the index to a VectorStore and load from it
  const index = await VectorStoreIndex.fromDocuments(docs, {
    serviceContext: serviceContextFromDefaults({
      chunkSize: 300,
      chunkOverlap: 20,
      embedModel, llm
    })
  })

  retriever = index.asRetriever({
    similarityTopK: 1,
  })
}

export async function createChatEngineFromDocs() {
  if (chatEngine) {
    chatEngine.reset()
  } else {
    await createIndex();
  }
  chatEngine = new ContextChatEngine({
    retriever,
    chatModel: llm
  })
}


export async function chat(query: string) {
  if (chatEngine) {
    const queryResult = await chatEngine.chat({
      message: query
    })
    const response = queryResult.response
  
    const metadata = queryResult.sourceNodes?.map(node => node.node.metadata)
    // const nodesText = queryResult.sourceNodes?.map(node => node.getContent(MetadataMode.LLM))
    //console.log(metadata)
    return { response, metadata };
  }
  return  {response: '', undefined}
}

export async function resetChatEngine() {
  if (chatEngine) chatEngine.reset();
}
