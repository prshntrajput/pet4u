'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests, withdrawRequest } from '@/lib/store/slices/adoptionSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

export default function MyRequestsPage() {
  const dispatch = useDispatch();
  const { myRequests, isLoading, error } = useSelector((state) => state.adoption);
  const [activeTab, setActiveTab] = useState('pending');
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyRequests({ status: activeTab }));
  }, [dispatch, activeTab]);

  const handleWithdraw = async (requestId) => {
    if (!confirm('Are you sure you want to withdraw this adoption request?')) {
      return;
    }

    setWithdrawingId(requestId);
    try {
      await dispatch(withdrawRequest(requestId)).unwrap();
      toast.success('Request withdrawn successfully');
    } catch (error) {
      toast.error(error || 'Failed to withdraw request');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (isLoading && myRequests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Adoption Requests</h1>
        <p className="text-gray-600 mt-2">Track your pet adoption applications</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {error ? (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'pending' 
                  ? 'You haven\'t sent any adoption requests yet'
                  : `You don't have any ${activeTab} requests`
                }
              </p>
              <Link href="/pets">
                <Button>Browse Pets</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      {/* Pet Image */}
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {request.pet.primaryImage ? (
                          <Image
                            src={request.pet.primaryImage}
                            alt={request.pet.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-4xl">
                            🐾
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {/* Pet Info */}
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <Link href={`/pets/${request.pet.slug || request.pet.id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                {request.pet.name}
                              </h3>
                            </Link>
                            <Badge
                              variant={
                                request.status === 'pending' ? 'secondary' :
                                request.status === 'approved' ? 'success' :
                                'destructive'
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {request.pet.breed || request.pet.species} • {request.pet.age} {request.pet.ageUnit} • {request.pet.gender}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin size={14} className="mr-1" />
                            {request.pet.city}, {request.pet.state}
                          </div>
                        </div>

                        {/* Shelter Info */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.shelter.profileImage} />
                            <AvatarFallback>
                              {request.shelter.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{request.shelter.name}</p>
                            <p className="text-xs text-gray-600">
                              {request.shelter.city}, {request.shelter.state}
                            </p>
                          </div>
                          <Link href={`/messages/${request.shelter.id}`}>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                        </div>

                        {/* Request Message */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>

                        {/* Response (if any) */}
                        {request.responseMessage && (
                          <div className={`p-3 rounded-lg ${
                            request.status === 'approved' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <p className="font-medium text-sm mb-1">
                              {request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                            </p>
                            <p className="text-sm text-gray-700">{request.responseMessage}</p>
                          </div>
                        )}

                        {/* Meeting Details (if approved) */}
                        {request.status === 'approved' && request.meetingScheduled && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-sm mb-2">📅 Meeting Scheduled</p>
                            <div className="space-y-1 text-sm text-gray-700">
                              {request.meetingDate && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {format(new Date(request.meetingDate), 'PPP p')}
                                </div>
                              )}
                              {request.meetingLocation && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {request.meetingLocation}
                                </div>
                              )}
                              {request.meetingNotes && (
                                <p className="mt-2 text-gray-600">{request.meetingNotes}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdraw(request.id)}
                              disabled={withdrawingId === request.id}
                              className="text-red-600 hover:text-red-700"
                            >
                              {withdrawingId === request.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Withdrawing...
                                </>
                              ) : (
                                'Withdraw Request'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
