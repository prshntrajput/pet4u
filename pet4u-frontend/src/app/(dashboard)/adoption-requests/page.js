'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceivedRequests, respondToRequest } from '@/lib/store/slices/adoptionSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Phone, MapPin, CheckCircle, XCircle, Calendar, Sparkles, Inbox } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ReceivedRequestsPage() {
  const dispatch = useDispatch();
  const { receivedRequests, isLoading, isResponding, error } = useSelector((state) => state.adoption);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  useEffect(() => {
    dispatch(fetchReceivedRequests({ status: activeTab }));
  }, [dispatch, activeTab]);

  const handleOpenDialog = (request, type) => {
    setSelectedRequest(request);
    setResponseType(type);
    setResponseMessage('');
    setMeetingDate('');
    setMeetingLocation('');
    setMeetingNotes('');
    setIsDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseMessage.trim()) {
      toast.error('Please provide a response message');
      return;
    }

    try {
      const responseData = {
        status: responseType,
        responseMessage: responseMessage.trim(),
      };

      if (responseType === 'approved' && meetingDate) {
        responseData.meetingDate = meetingDate;
        responseData.meetingLocation = meetingLocation.trim();
        responseData.meetingNotes = meetingNotes.trim();
      }

      await dispatch(respondToRequest({
        requestId: selectedRequest.id,
        responseData,
      })).unwrap();

      toast.success(`Request ${responseType} successfully`);
      setIsDialogOpen(false);
      
      dispatch(fetchReceivedRequests({ status: activeTab }));
    } catch (error) {
      toast.error(error || 'Failed to respond to request');
    }
  };

  if (isLoading && receivedRequests.length === 0) {
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
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Adoption Requests</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Manage adoption applications for your pets
          </p>
        </div>

        {/* Stats Badge */}
        {receivedRequests && receivedRequests.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {receivedRequests.length} {activeTab} request{receivedRequests.length !== 1 ? 's' : ''}
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
          ) : !receivedRequests || receivedRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping">
                    <Inbox className="h-24 w-24 text-primary/20" />
                  </div>
                  <Inbox className="h-24 w-24 text-muted-foreground relative" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {activeTab === 'pending' 
                  ? 'You haven\'t received any adoption requests yet'
                  : `You don't have any ${activeTab} requests`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <Card key={request.id} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Pet Image */}
                      <Link href={`/pets/${request.pet?.slug || request.pet?.id || '#'}`} className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted border-2 border-border hover:border-primary/50 transition-all">
                          {request.pet?.primaryImage ? (
                            <Image
                              src={request.pet.primaryImage}
                              alt={request.pet.name || 'Pet'}
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
                            <Link href={`/pets/${request.pet?.slug || request.pet?.id || '#'}`}>
                              <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                {request.pet?.name || 'Unknown Pet'}
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
                            {request.pet?.breed || request.pet?.species || 'Unknown'} • {request.pet?.age || 'N/A'} {request.pet?.ageUnit || ''} • {request.pet?.gender || 'N/A'}
                          </p>
                        </div>

                        {/* Adopter Info */}
                        <div className="p-4 bg-muted/50 rounded-lg border-2 border-border space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-border">
                              <AvatarImage src={request.adopter?.profileImage} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {request.adopter?.name?.charAt(0).toUpperCase() || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{request.adopter?.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground truncate">{request.adopter?.email || 'No email'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {request.adopter?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" />
                                {request.adopter.phone}
                              </div>
                            )}
                            {request.adopter?.city && request.adopter?.state && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                {request.adopter.city}, {request.adopter.state}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Message */}
                        <div className="p-3 bg-primary/5 rounded-lg border-2 border-primary/20">
                          <p className="text-sm font-medium mb-1.5 text-primary">Adoption Request Message:</p>
                          <p className="text-sm">{request.message || 'No message provided'}</p>
                        </div>

                        {/* Response (if any) */}
                        {request.responseMessage && (
                          <div className={`p-3 rounded-lg border-2 ${
                            request.status === 'approved' 
                              ? 'bg-primary/5 border-primary/30' 
                              : 'bg-destructive/5 border-destructive/30'
                          }`}>
                            <p className="font-semibold text-sm mb-1.5">Your Response:</p>
                            <p className="text-sm">{request.responseMessage}</p>
                            {request.respondedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Responded {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Meeting Details (if approved) */}
                        {request.status === 'approved' && request.meetingScheduled && (
                          <div className="p-3 bg-accent/50 rounded-lg border-2 border-accent">
                            <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Meeting Details:
                            </p>
                            <div className="space-y-1.5 text-sm">
                              {request.meetingDate && (
                                <p><strong>Date:</strong> {new Date(request.meetingDate).toLocaleString('en-US', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}</p>
                              )}
                              {request.meetingLocation && (
                                <p><strong>Location:</strong> {request.meetingLocation}</p>
                              )}
                              {request.meetingNotes && (
                                <p><strong>Notes:</strong> {request.meetingNotes}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Received {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/messages/${request.adopter?.id || '#'}`}>
                              <Button variant="outline" size="sm" className="h-8">
                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                Message
                              </Button>
                            </Link>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(request, 'approved')}
                                  className="h-8 text-primary hover:bg-primary/10 border-primary"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(request, 'rejected')}
                                  className="h-8 text-destructive hover:bg-destructive/10 border-destructive"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {responseType === 'approved' ? 'Approve' : 'Reject'} Adoption Request
            </DialogTitle>
            <DialogDescription className="text-sm">
              {responseType === 'approved' 
                ? `Approve ${selectedRequest?.adopter?.name}'s adoption request for ${selectedRequest?.pet?.name} and schedule a meeting.`
                : `Provide a reason for rejecting ${selectedRequest?.adopter?.name}'s adoption request for ${selectedRequest?.pet?.name}.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Response Message */}
            <div className="space-y-2">
              <Label htmlFor="responseMessage" className="text-sm font-semibold">
                Response Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="responseMessage"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={
                  responseType === 'approved'
                    ? 'Let them know you approved their request and what the next steps are...'
                    : 'Explain why you are rejecting this request...'
                }
                rows={4}
                className={`border-2 ${!responseMessage.trim() ? 'border-destructive/50' : ''}`}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {responseMessage.length}/1000 characters
              </p>
            </div>

            {/* Meeting Details (only for approval) */}
            {responseType === 'approved' && (
              <>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Schedule Meeting (Optional)
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingDate" className="text-sm">Meeting Date & Time</Label>
                      <Input
                        id="meetingDate"
                        type="datetime-local"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="h-10 border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meetingLocation" className="text-sm">Meeting Location</Label>
                      <Input
                        id="meetingLocation"
                        type="text"
                        value={meetingLocation}
                        onChange={(e) => setMeetingLocation(e.target.value)}
                        placeholder="e.g., Shelter Address or Meeting Point"
                        maxLength={200}
                        className="h-10 border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meetingNotes" className="text-sm">Additional Notes</Label>
                      <Textarea
                        id="meetingNotes"
                        value={meetingNotes}
                        onChange={(e) => setMeetingNotes(e.target.value)}
                        placeholder="Any additional instructions or requirements..."
                        rows={3}
                        maxLength={500}
                        className="border-2"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isResponding}
              className="border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={isResponding || !responseMessage.trim()}
              variant={responseType === 'approved' ? 'default' : 'destructive'}
            >
              {isResponding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {responseType === 'approved' ? 'Approve Request' : 'Reject Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
