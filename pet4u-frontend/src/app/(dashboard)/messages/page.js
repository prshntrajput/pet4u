'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../../lib/store/slices/messagesSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { conversations, isLoading } = useSelector((state) => state.messages);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const filtered = conversations.filter((conv) =>
    conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            {unreadCount > 0 && <span className="text-primary font-medium"> · {unreadCount} unread</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {searchQuery
              ? 'Try a different search term'
              : 'Start a conversation by contacting a shelter about a pet'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {filtered.map((conv) => {
            const other = conv.otherUser;
            const initials = other?.name?.charAt(0)?.toUpperCase() || '?';
            return (
              <Link key={conv.id} href={`/messages/${other?.id}`} className="block">
                <div className={`flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
                  conv.unreadCount > 0 ? 'bg-primary/5' : ''
                }`}>
                  {/* Avatar with unread dot */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={other?.profileImage} alt={other?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                          {other?.name || 'Unknown User'}
                        </span>
                        {other?.role && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 capitalize flex-shrink-0">
                            {other.role}
                          </Badge>
                        )}
                      </div>
                      {conv.lastMessageAt && (
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${
                      conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}>
                      {conv.lastMessageContent || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
