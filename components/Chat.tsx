import React, { useState, useRef, useEffect } from 'react';
import { Student, ChatMessage } from '../types';
import { ask } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { SendIcon } from './icons/SendIcon';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import ChatMessageContent from './ChatMessageContent';

interface ChatProps {
  data: Student[];
}

const Chat: React.FC<ChatProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await ask(input, data);
      const botMessage: ChatMessage = { sender: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching from Gemini API:", error);
      const errorMessage: ChatMessage = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const exampleQueries = [
    "How many students have a GPAX above 3.5?",
    "List all students in room ITI-DE-RA",
    "What is the average GPAX for students in year 1?",
    "Who has the lowest GPAX?"
  ];
  
  const handleExampleQueryClick = (query: string) => {
    setInput(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat with your Data</CardTitle>
        <CardDescription>Ask questions about the student data you uploaded. The AI will answer based on the provided context.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] border dark:border-gray-700 rounded-md p-4 flex flex-col space-y-4 overflow-y-auto bg-secondary/30 dark:bg-gray-800/50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-300 m-auto">
                <p>No messages yet. Ask a question to start!</p>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {exampleQueries.map((q, i) => (
                        <button key={i} onClick={() => handleExampleQueryClick(q)} className="p-2 border dark:border-gray-600 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left">
                           {q}
                        </button>
                    ))}
                </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground"><BotIcon className="h-5 w-5" /></span>}
              <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-700'}`}>
                 {msg.sender === 'bot' ? (
                    <ChatMessageContent text={msg.text} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )}
              </div>
               {msg.sender === 'user' && <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200"><UserIcon className="h-5 w-5" /></span>}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
               <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground"><BotIcon className="h-5 w-5" /></span>
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg bg-white dark:bg-gray-700">
                    <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., How many students are in 'normal' status?"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Chat;