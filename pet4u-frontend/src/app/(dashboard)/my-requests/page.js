'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests, withdrawRequest } from '@/lib/store/slices/adoptionSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar, MapPin, Mail, FileText, Sparkles, CheckCircle, XCircle } from 'lucide-react';
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">My Adoption Requests</h1>
          </div>
          <p className="text-muted-foreground ml-14">Track your pet adoption applications</p>
        </div>

        {/* Stats Badge */}
        {myRequests.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {myRequests.length} {activeTab} request{myRequests.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="pending" className="text-sm">Pending</TabsTrigger>
          <TabsTrigger value="approved" className="text-sm">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="text-sm">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {error ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-destructive">{error}</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping">
                    <FileText className="h-24 w-24 text-primary/20" />
                  </div>
                  <FileText className="h-24 w-24 text-muted-foreground relative" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {activeTab === 'pending' 
                  ? 'You haven\'t sent any adoption requests yet'
                  : `You don't have any ${activeTab} requests`
                }
              </p>
              <Link href="/pets">
                <Button size="lg" className="shadow-lg hover:shadow-xl">
                  Browse Pets
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Pet Image */}
                      <Link href={`/pets/${request.pet.slug || request.pet.id}`} className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted border-2 border-border hover:border-primary/50 transition-all">
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
                      </Link>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {/* Pet Info */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link href={`/pets/${request.pet.slug || request.pet.id}`}>
                              <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                {request.pet.name}
                              </h3>
                            </Link>
                            <Badge
                              variant={
                                request.status === 'pending' ? 'secondary' :
                                request.status === 'approved' ? 'default' :
                                'destructive'
                              }
                              className="flex items-center gap-1"
                            >
                              {request.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                              {request.status === 'rejected' && <XCircle className="h-3 w-3" />}
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.pet.breed || request.pet.species} • {request.pet.age} {request.pet.ageUnit} • {request.pet.gender}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {request.pet.city}, {request.pet.state}
                          </div>
                        </div>

                        {/* Shelter Info */}
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border-2 border-border">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage src={request.shelter.profileImage} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {request.shelter.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{request.shelter.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {request.shelter.city}, {request.shelter.state}
                            </p>
                          </div>
                          <Link href={`/messages/${request.shelter.id}`}>
                            <Button variant="outline" size="sm" className="h-8">
                              <Mail className="h-3.5 w-3.5 mr-1.5" />
                              Message
                            </Button>
                          </Link>
                        </div>

                        {/* Request Message */}
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <p className="text-sm font-medium mb-1 text-muted-foreground">Your Message:</p>
                          <p className="text-sm">{request.message}</p>
                        </div>

                        {/* Response (if any) */}
                        {request.responseMessage && (
                          <div className={`p-3 rounded-lg border-2 ${
                            request.status === 'approved' 
                              ? 'bg-primary/5 border-primary/30' 
                              : 'bg-destructive/5 border-destructive/30'
                          }`}>
                            <p className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                              {request.status === 'approved' ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                  <span className="text-primary">Request Approved</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-destructive" />
                                  <span className="text-destructive">Request Rejected</span>
                                </>
                              )}
                            </p>
                            <p className="text-sm">{request.responseMessage}</p>
                          </div>
                        )}

                        {/* Meeting Details (if approved) */}
                        {request.status === 'approved' && request.meetingScheduled && (
                          <div className="p-3 bg-primary/5 rounded-lg border-2 border-primary/30">
                            <p className="font-semibold text-sm mb-2 flex items-center gap-2 text-primary">
                              <Calendar className="h-4 w-4" />
                              Meeting Scheduled
                            </p>
                            <div className="space-y-1.5 text-sm">
                              {request.meetingDate && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(request.meetingDate), 'PPP p')}
                                </div>
                              )}
                              {request.meetingLocation && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {request.meetingLocation}
                                </div>
                              )}
                              {request.meetingNotes && (
                                <p className="mt-2 text-muted-foreground text-xs">{request.meetingNotes}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdraw(request.id)}
                              disabled={withdrawingId === request.id}
                              className="text-destructive hover:text-destructive h-8"
                            >
                              {withdrawingId === request.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
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
