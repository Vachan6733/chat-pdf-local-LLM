'use client'

import { useState, useEffect } from "react"
import ChatWindow from '@/components/ChatWindow';

import { createChatEngineFromDocs, chat } from "@/app/actions";
import { ChatMessage } from "@/components/ChatWindow";


export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")

  const [messages, setMessages] = useState<ChatMessage[]>([])

  const startChat = async (input: string) => {
    let reference = "";
    setLoadingMessage("Please wait...")
    setIsLoading(true)
    try {
      setMessages([...messages, { role: 'human', statement: input },])
      const { response, metadata } = await chat(input);
      if (metadata != undefined && metadata.length > 0) {
        reference = metadata[0].file_name;
        //reference = metadata[0].file_path;
      }
      setMessages(
        [
          ...messages,
          { role: 'human', statement: input },
          { role: 'ai', statement: response },
          { role: 'ref', statement: "Reference: " + reference},
        ]
      )
      // console.log(metadata)
      
      setLoadingMessage("Response Recieved from LLM")
    } catch (e) {
      console.log(e)
      setLoadingMessage("Error generating response.")
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    setLoadingMessage("Loading Index from the PDFs")
    setIsLoading(true);
    const createChatEngineFromDocsAsync = async () => {
      try {
        await createChatEngineFromDocs()
        setLoadingMessage("Done creating Index from the PDF.")
      } catch (e) {
        console.log(e)
        setLoadingMessage("Error while creating index")
      } finally {
        setIsLoading(false);
      }
    }
    createChatEngineFromDocsAsync()
    // console.log(selectedFile)
  }, [])

  return (
    <div>
      <div className='flex justify-evenly gap-2 h-[90vh]'>
          <ChatWindow
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            startChat={startChat}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
    </div>
  )
}
