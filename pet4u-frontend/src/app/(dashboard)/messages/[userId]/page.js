'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConversation,
  sendMessage,
  clearCurrentConversation,
} from '@/lib/store/slices/messagesSlice';
import { joinConversation, leaveConversation, emitTyping, emitStopTyping, getSocket } from '@/lib/socket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { messageAPI } from '@/lib/api/messages';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentMessages, isLoading, isSending, conversations } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [canMessage, setCanMessage] = useState(null);
  const [lockReason, setLockReason] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUserId = params.userId;

  useEffect(() => {
    if (!otherUserId) return;

    // Resolve other user info from conversations cache first (instant, no extra fetch)
    const cached = conversations.find((c) => c.otherUser?.id === otherUserId);
    if (cached?.otherUser) setOtherUser(cached.otherUser);

    messageAPI.canMessage(otherUserId)
      .then((res) => {
        const allowed = res.success && res.data?.data?.canMessage;
        setCanMessage(allowed);
        if (!allowed) setLockReason(res.data?.data?.reason || 'Messaging not available');
      })
      .catch(() => setCanMessage(false));

    dispatch(fetchConversation({ otherUserId }))
      .unwrap()
      .then((data) => {
        // Find the other user from any message they sent — handles all cases
        const otherMsg = data.messages.find((m) => m.sender?.id === otherUserId);
        if (otherMsg?.sender) setOtherUser(otherMsg.sender);
      })
      .catch(() => toast.error('Failed to load conversation'));

    joinConversation(otherUserId);

    const socket = getSocket();
    if (socket) {
      socket.on('message:typing', (data) => {
        if (data.userId === otherUserId) setIsTyping(data.isTyping);
      });
    }

    return () => {
      leaveConversation(otherUserId);
      dispatch(clearCurrentConversation());
      if (socket) socket.off('message:typing');
    };
  }, [otherUserId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleTyping = () => {
    emitTyping(otherUserId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitStopTyping(otherUserId), 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const content = message.trim();
    setMessage('');
    emitStopTyping(otherUserId);
    try {
      await dispatch(sendMessage({ receiverId: otherUserId, content, messageType: 'text' })).unwrap();
    } catch {
      toast.error('Failed to send message');
      setMessage(content);
    }
  };

  const initials = otherUser?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[860px]">

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-xl bg-card flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={otherUser?.profileImage} alt={otherUser?.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {isLoading && !otherUser ? (
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">
                {otherUser?.name || 'Loading...'}
              </span>
              {otherUser?.role && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize flex-shrink-0">
                  {otherUser.role}
                </Badge>
              )}
            </div>
          )}
          {isTyping && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="flex gap-0.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </span>
              <span className="text-[11px] text-muted-foreground">typing</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-1 space-y-2 mt-2">
        {isLoading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          currentMessages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2`}>
                <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-3.5 py-2 ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-0.5 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border pt-3 mt-auto flex-shrink-0">
        {canMessage === false ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/60 text-muted-foreground">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{lockReason || 'Messaging is locked until the adoption request is approved.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
              disabled={isSending || canMessage === null}
              className="flex-1 h-9 text-sm"
            />
            <Button
              type="submit"
              disabled={isSending || !message.trim() || canMessage === null}
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
