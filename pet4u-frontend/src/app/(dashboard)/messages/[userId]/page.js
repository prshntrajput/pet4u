'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversation, sendMessage, clearCurrentConversation } from '@/lib/store/slices/messagesSlice';
import { joinConversation, leaveConversation, emitTyping, emitStopTyping, getSocket } from '@/lib/socket';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentMessages, isLoading, isSending } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  
  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUserId = params.userId;

  useEffect(() => {
    if (otherUserId) {
      dispatch(fetchConversation({ otherUserId }))
        .unwrap()
        .then((data) => {
          if (data.messages.length > 0) {
            const firstMessage = data.messages[0];
            const sender = firstMessage.sender;
            if (sender.id !== user.id) {
              setOtherUser(sender);
            }
          }
        })
        .catch((error) => {
          toast.error('Failed to load conversation');
        });

      joinConversation(otherUserId);

      const socket = getSocket();
      if (socket) {
        socket.on('message:typing', (data) => {
          if (data.userId === otherUserId) {
            setIsTyping(data.isTyping);
          }
        });
      }

      return () => {
        leaveConversation(otherUserId);
        dispatch(clearCurrentConversation());
        
        if (socket) {
          socket.off('message:typing');
        }
      };
    }
  }, [otherUserId, dispatch, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    emitTyping(otherUserId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(otherUserId);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const messageContent = message.trim();
    setMessage('');
    emitStopTyping(otherUserId);

    try {
      await dispatch(sendMessage({
        receiverId: otherUserId,
        content: messageContent,
        messageType: 'text',
      })).unwrap();
    } catch (error) {
      toast.error('Failed to send message');
      setMessage(messageContent);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px]">
      {/* Super Compact Header - Single Line */}
      <div className="flex items-center gap-2 p-3 border-2 border-border rounded-lg bg-card flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {otherUser && (
          <>
            <Avatar className="h-8 w-8 border-2 border-border">
              <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {otherUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 className="font-semibold text-sm truncate">
                {otherUser.name}
              </h2>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                {otherUser.role}
              </Badge>
              
              {isTyping && (
                <span className="text-xs text-muted-foreground italic flex items-center gap-1 ml-auto">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
                    <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  typing
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages Container */}
      <Card className="flex-1 overflow-hidden border-2 mt-3">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Messages List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isOwnMessage = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Fixed at Bottom */}
          <div className="border-t p-3 bg-card">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                disabled={isSending}
                className="flex-1 h-10 border-2"
              />
              <Button
                type="submit"
                disabled={isSending || !message.trim()}
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
