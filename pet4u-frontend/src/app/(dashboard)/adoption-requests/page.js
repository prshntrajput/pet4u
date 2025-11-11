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
import { Loader2, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
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
      
      // Refresh the list
      dispatch(fetchReceivedRequests({ status: activeTab }));
    } catch (error) {
      toast.error(error || 'Failed to respond to request');
    }
  };

  if (isLoading && receivedRequests.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Adoption Requests</h1>
        <p className="text-gray-600 mt-2">Manage adoption applications for your pets</p>
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
          ) : receivedRequests.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📨</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending' 
                  ? 'You haven\'t received any adoption requests yet'
                  : `You don't have any ${activeTab} requests`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
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
                        </div>

                        {/* Adopter Info */}
                        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.adopter.profileImage} />
                              <AvatarFallback className="bg-blue-600 text-white">
                                {request.adopter.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{request.adopter.name}</p>
                              <p className="text-sm text-gray-600">{request.adopter.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            {request.adopter.phone && (
                              <div className="flex items-center">
                                <Phone size={14} className="mr-2" />
                                {request.adopter.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-2" />
                              {request.adopter.city}, {request.adopter.state}
                            </div>
                          </div>
                        </div>

                        {/* Request Message */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-1">Adoption Request Message:</p>
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>

                        {/* Response (if any) */}
                        {request.responseMessage && (
                          <div className={`p-3 rounded-lg ${
                            request.status === 'approved' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <p className="font-medium text-sm mb-1">Your Response:</p>
                            <p className="text-sm text-gray-700">{request.responseMessage}</p>
                          </div>
                        )}

                        {/* Meeting Details (if approved) */}
                        {request.status === 'approved' && request.meetingScheduled && (
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="font-medium text-sm mb-2">📅 Meeting Details:</p>
                            <div className="space-y-1 text-sm text-gray-700">
                              {request.meetingDate && (
                                <p><strong>Date:</strong> {new Date(request.meetingDate).toLocaleString()}</p>
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
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            Received {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Link href={`/messages/${request.adopter.id}`}>
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                            </Link>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(request, 'approved')}
                                  className="text-green-600 hover:text-green-700 border-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDialog(request, 'rejected')}
                                  className="text-red-600 hover:text-red-700 border-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {responseType === 'approved' ? 'Approve' : 'Reject'} Adoption Request
            </DialogTitle>
            <DialogDescription>
              {responseType === 'approved' 
                ? 'Approve this adoption request and schedule a meeting with the adopter.'
                : 'Provide a reason for rejecting this adoption request.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Response Message */}
            <div className="space-y-2">
              <Label htmlFor="responseMessage">
                Response Message *
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
              />
            </div>

            {/* Meeting Details (only for approval) */}
            {responseType === 'approved' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="meetingDate">Meeting Date & Time</Label>
                  <Input
                    id="meetingDate"
                    type="datetime-local"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingLocation">Meeting Location</Label>
                  <Input
                    id="meetingLocation"
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g., Shelter Address or Meeting Point"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingNotes">Additional Notes</Label>
                  <Textarea
                    id="meetingNotes"
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Any additional instructions or requirements..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isResponding}
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
