'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../../lib/store/slices/messagesSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Search } from 'lucide-react';
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
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
          Messages
        </h1>
        <p className="text-gray-600 mt-2">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-24 w-24 text-gray-300" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try a different search term'
              : 'Start a conversation by contacting a shelter about a pet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.otherUser.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={conversation.otherUser.profileImage}
                        alt={conversation.otherUser.name}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {conversation.otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {conversation.otherUser.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {conversation.otherUser.role}
                          </Badge>
                        </div>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessageContent || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
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
