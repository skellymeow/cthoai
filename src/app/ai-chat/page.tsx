'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Send, Bot, User, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';
import { PageLayout } from "@/components/layout/page-layout";
import { ContentArea } from "@/components/layout/content-area";
import { BottomBar } from "@/components/layout/bottom-bar";
import { usePersistedState, persistenceUtils, Message } from "@/lib/persistence";
import { animations, hoverAnimations, variants, loadingStates } from "@/lib/animations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RequireAuth } from "@/components/auth/RequireAuth";

interface Model {
  id: string;
  name: string;
  image: string;
  description: string;
}

const models: Model[] = [
  {
    id: 'grok-4',
    name: 'Grok 4',
    image: '/grok.png',
    description: 'xAI Grok 4, inspired by the Hitchhiker\'s Guide'
  }
];

export default function AiChatPage() {
  const [chatState, updateChatState] = usePersistedState('aiChat');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { messages, selectedModel, systemPrompt, input } = chatState;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    updateChatState({ messages: [...messages, userMessage], input: '' });
    setIsLoading(true);
    setCurrentMessage('');

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    let assistantMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: new Date()
    };
    updateChatState({ messages: [...messages, userMessage, assistantMessage] });

    try {
      console.log('Sending request with model:', selectedModel);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          systemPrompt,
          model: selectedModel,
        }),
        signal: abortControllerRef.current.signal,
      });
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          setCurrentMessage(fullText);
        }
      }
      // Final update with complete message
      updateChatState({
        messages: [...messages, userMessage, { ...assistantMessage, content: fullText }]
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateChatState({
          messages: [...messages, userMessage, { ...assistantMessage, content: 'Message cancelled.' }]
        });
        return;
      }
      updateChatState({
        messages: [...messages, userMessage, { ...assistantMessage, content: 'Sorry, I encountered an error. Please try again.' }]
      });
    } finally {
      setIsLoading(false);
      setCurrentMessage('');
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      updateChatState({ selectedModel: modelId });
    }
  };

  const handleSystemPromptChange = (newPrompt: string) => {
    updateChatState({ systemPrompt: newPrompt });
  };

  const clearChat = () => {
    updateChatState({ messages: [] });
  };

  return (
    <PageLayout>
      <ContentArea>
        <motion.div 
          className="flex flex-col h-full"
          {...variants.pageWrapper}
        >
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-border"
            {...animations.fade}
          >
            <div className="flex items-center gap-3">
              <motion.div className="flex items-center gap-2">
                <motion.div {...hoverAnimations.icon}>
                  <Image
                    src={models.find(m => m.id === selectedModel)?.image || '/chatgpt.png'}
                    alt="Model"
                    width={24}
                    height={24}
                    className="rounded-sm invert"
                  />
                </motion.div>
                <span className="font-semibold">
                  {models.find(m => m.id === selectedModel)?.name || 'AI Chat'}
                </span>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div {...hoverAnimations.button}>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chat Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">System Prompt</label>
                      <Textarea
                        value={systemPrompt}
                        onChange={(e) => handleSystemPromptChange(e.target.value)}
                        placeholder="Enter system prompt..."
                        className="mt-1"
                      />
                    </div>
                    <motion.div {...hoverAnimations.button}>
                      <Button onClick={clearChat} variant="destructive" size="sm">
                        Clear Chat
                      </Button>
                    </motion.div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 overflow-y-auto p-2 space-y-2"
            {...animations.fade}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  {...variants.chatMessage}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                    <CardContent className="p-1.5">
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                className="flex justify-start"
                {...animations.loading}
              >
                <Card className="max-w-[80%] bg-card">
                  <CardContent className="p-1.5">
                    <div className="flex items-start gap-2">
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="whitespace-pre-wrap">
                        {currentMessage || (
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <motion.div 
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                                {...loadingStates.dots}
                              />
                              <motion.div 
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                                {...loadingStates.dots}
                                style={{ animationDelay: '0.1s' }}
                              />
                              <motion.div 
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                                {...loadingStates.dots}
                                style={{ animationDelay: '0.2s' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </motion.div>
      </ContentArea>

      <BottomBar>
        <motion.div 
          className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 max-w-3xl mx-auto"
          {...animations.fade}
        >
          <RequireAuth>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-24 sm:w-20 h-10 sm:h-8 border-0 bg-transparent p-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={model.image}
                        alt={model.name}
                        width={16}
                        height={16}
                        className="rounded-sm invert"
                      />
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => updateChatState({ input: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                disabled={isLoading}
              />
            </div>

            <motion.div {...hoverAnimations.button}>
              {isLoading ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleCancel}
                        size="sm"
                        variant="destructive"
                        className="h-10 sm:h-8 px-3"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancel Request</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="h-10 sm:h-8 w-10 sm:w-8 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          </RequireAuth>
        </motion.div>
      </BottomBar>
    </PageLayout>
  );
} 