// src/app/messages/[userId]/page.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversation, sendMessage, clearCurrentConversation } from '@/lib/store/slices/messagesSlice';
import { joinConversation, leaveConversation, emitTyping, emitStopTyping, getSocket } from '@/lib/socket';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          // Extract other user info from messages
          if (data.messages.length > 0) {
            const firstMessage = data.messages[0];
            const sender = firstMessage.sender;
            if (sender.id !== user.id) {
              setOtherUser(sender);
            } else {
              // If first message is from current user, get receiver info
              // You might need to fetch user info separately
            }
          }
        })
        .catch((error) => {
          toast.error('Failed to load conversation');
        });

      // ✅ Join Socket.IO room
      joinConversation(otherUserId);

      // ✅ Listen for typing indicators in this conversation
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
        
        // ✅ Clean up typing listener
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
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
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
      
      // ✅ Message will be added via Socket.IO 'message:new' event
    } catch (error) {
      toast.error('Failed to send message');
      setMessage(messageContent); // Restore message on error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {otherUser && (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser.profileImage} alt={otherUser.name} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {otherUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
                  {isTyping && (
                    <p className="text-xs text-gray-500 italic">typing...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="h-[calc(100vh-300px)]">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {currentMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                No messages yet. Start the conversation!
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
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
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

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSending || !message.trim()}
              size="icon"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
