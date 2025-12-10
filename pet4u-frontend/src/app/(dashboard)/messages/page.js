'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../../lib/store/slices/messagesSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { conversations, isLoading, error } = useSelector((state) => state.messages);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">
              Messages
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Active Badge */}
        {conversations.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {conversations.filter(c => c.unreadCount > 0).length} unread
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 border-2"
        />
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-20">
          {/* Empty State Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <MessageSquare className="h-24 w-24 text-primary/20" />
              </div>
              <MessageSquare className="h-24 w-24 text-muted-foreground relative" />
            </div>
          </div>
          
          {/* Empty State Text */}
          <h3 className="text-2xl font-bold mb-2">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery 
              ? 'Try a different search term'
              : 'Start a conversation by contacting a shelter about a pet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.otherUser.id}`}
            >
              <Card className={`hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer border-2 ${
                conversation.unreadCount > 0 ? 'bg-primary/5 border-primary/30' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage
                        src={conversation.otherUser.profileImage}
                        alt={conversation.otherUser.name}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                        {conversation.otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${
                            conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground'
                          }`}>
                            {conversation.otherUser.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {conversation.otherUser.role}
                          </Badge>
                        </div>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0 
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {conversation.lastMessageContent || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 h-6 min-w-[24px] flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
