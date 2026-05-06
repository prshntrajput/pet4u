'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequests, withdrawRequest } from '@/lib/store/slices/adoptionSlice';
import { appointmentsAPI } from '@/lib/api/appointments';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2, Calendar, MapPin, Mail, FileText, CheckCircle,
  XCircle, PawPrint, Clock, CalendarCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, format, addDays } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getUpcomingDates(dayOfWeek, count = 5) {
  const dates = [];
  let current = addDays(new Date(), 1);
  while (dates.length < count) {
    if (current.getDay() === dayOfWeek) dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

export default function MyRequestsPage() {
  const dispatch = useDispatch();
  const { myRequests, isLoading } = useSelector((state) => state.adoption);
  const [activeTab, setActiveTab] = useState('pending');
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Book a visit dialog state
  const [showBookVisit, setShowBookVisit] = useState(false);
  const [bookingRequest, setBookingRequest] = useState(null);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [visitNotes, setVisitNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    dispatch(fetchMyRequests({ status: activeTab }));
  }, [dispatch, activeTab]);

  const handleWithdraw = async (requestId) => {
    if (!confirm('Are you sure you want to withdraw this adoption request?')) return;
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

  const handleOpenBookVisit = async (request) => {
    setBookingRequest(request);
    setSelectedSlot(null);
    setSelectedDate(null);
    setUpcomingDates([]);
    setVisitNotes('');
    setShowBookVisit(true);
    setSlotsLoading(true);
    try {
      const res = await appointmentsAPI.getShelterAvailability(request.shelterId);
      setAvailabilitySlots(res.success ? (res.data?.data?.slots || []) : []);
    } catch {
      setAvailabilitySlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate(null);
    setUpcomingDates(getUpcomingDates(slot.dayOfWeek));
  };

  const handleBookVisit = async () => {
    if (!selectedSlot || !selectedDate || !bookingRequest) return;
    setIsBooking(true);
    try {
      const res = await appointmentsAPI.bookAppointment({
        shelterId: bookingRequest.shelterId,
        petId: bookingRequest.pet.id,
        adoptionRequestId: bookingRequest.id,
        scheduledDate: selectedDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        adopterNotes: visitNotes.trim() || null,
      });
      if (res.success) {
        toast.success('Visit request sent! The shelter will confirm shortly.');
        setShowBookVisit(false);
      } else {
        toast.error(res.error || 'Failed to book visit');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading && myRequests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              My Adoption Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your pet adoption applications</p>
          </div>
          {myRequests.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {myRequests.length} {activeTab}
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {myRequests.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1">No {activeTab} requests</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {activeTab === 'pending'
                    ? "You haven't sent any adoption requests yet"
                    : `No ${activeTab} requests to show`}
                </p>
                <Link href="/pets">
                  <Button size="sm">Browse Pets</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Pet Image */}
                        <Link href={`/pets/${request.pet?.slug || request.pet?.id || '#'}`} className="flex-shrink-0">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border">
                            {request.pet?.primaryImage ? (
                              <Image src={request.pet.primaryImage} alt={request.pet?.name || 'Pet'} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <PawPrint className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Pet name + status */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link href={`/pets/${request.pet?.slug || request.pet?.id || '#'}`}>
                                <h3 className="font-semibold hover:text-primary transition-colors">
                                  {request.pet?.name || 'Unknown Pet'}
                                </h3>
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {[request.pet?.breed || request.pet?.species, request.pet?.age && `${request.pet.age} ${request.pet.ageUnit}`, request.pet?.gender]
                                  .filter(Boolean).join(' · ')}
                              </p>
                              {(request.pet?.city || request.pet?.state) && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {[request.pet?.city, request.pet?.state].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>
                            <Badge variant={
                              request.status === 'pending' ? 'secondary' :
                              request.status === 'approved' ? 'default' : 'destructive'
                            } className="flex-shrink-0 capitalize flex items-center gap-1">
                              {request.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                              {request.status === 'rejected' && <XCircle className="h-3 w-3" />}
                              {request.status}
                            </Badge>
                          </div>

                          {/* Shelter row */}
                          <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarImage src={request.shelter?.profileImage} />
                              <AvatarFallback className="text-xs">{request.shelter?.name?.charAt(0) || 'S'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{request.shelter?.name || 'Shelter'}</p>
                              <p className="text-xs text-muted-foreground">
                                {[request.shelter?.city, request.shelter?.state].filter(Boolean).join(', ')}
                              </p>
                            </div>
                            <Link href={`/messages/${request.shelter?.id || '#'}`}>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                <Mail className="h-3 w-3 mr-1" /> Message
                              </Button>
                            </Link>
                          </div>

                          {/* Your message */}
                          <div className="p-2.5 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Your message</p>
                            <p className="text-sm">{request.message}</p>
                          </div>

                          {/* Response */}
                          {request.responseMessage && (
                            <div className={`p-2.5 rounded-lg border ${
                              request.status === 'approved'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                : 'bg-destructive/5 border-destructive/20'
                            }`}>
                              <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                                {request.status === 'approved'
                                  ? <><CheckCircle className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700 dark:text-emerald-400">Shelter's response</span></>
                                  : <><XCircle className="h-3.5 w-3.5 text-destructive" /><span className="text-destructive">Shelter's response</span></>}
                              </p>
                              <p className="text-sm">{request.responseMessage}</p>
                            </div>
                          )}

                          {/* Meeting info (if shelter pre-scheduled) */}
                          {request.status === 'approved' && request.meetingScheduled && (
                            <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/20">
                              <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-1.5">
                                <Calendar className="h-3.5 w-3.5" /> Meeting Scheduled
                              </p>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {request.meetingDate && (
                                  <p className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(request.meetingDate), 'PPP p')}
                                  </p>
                                )}
                                {request.meetingLocation && (
                                  <p className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {request.meetingLocation}
                                  </p>
                                )}
                                {request.meetingNotes && (
                                  <p className="text-xs mt-1">{request.meetingNotes}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Book a Visit (approved, no pre-scheduled meeting) */}
                          {request.status === 'approved' && !request.meetingScheduled && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-primary/40 text-primary hover:bg-primary/5"
                              onClick={() => handleOpenBookVisit(request)}
                            >
                              <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
                              Book a Visit with {request.shelter?.name || 'Shelter'}
                            </Button>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              Submitted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </p>
                            {request.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdraw(request.id)}
                                disabled={withdrawingId === request.id}
                                className="h-7 text-xs text-destructive hover:text-destructive"
                              >
                                {withdrawingId === request.id
                                  ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Withdrawing…</>
                                  : 'Withdraw'}
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

      {/* Book a Visit Dialog */}
      <Dialog open={showBookVisit} onOpenChange={setShowBookVisit}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Book a Visit
            </DialogTitle>
            <DialogDescription>
              Schedule a meet-and-greet with {bookingRequest?.pet?.name} at {bookingRequest?.shelter?.name || 'the shelter'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Step 1: Choose slot */}
            <div>
              <p className="text-sm font-semibold mb-2">1. Choose a time slot</p>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading availability…
                </div>
              ) : availabilitySlots.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  This shelter hasn't set visit times yet.<br />
                  Try messaging them directly.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availabilitySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSelectSlot(slot)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                        selectedSlot?.id === slot.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        selectedSlot?.id === slot.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{DAY_NAMES[slot.dayOfWeek]}</p>
                        <p className="text-xs text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Choose date */}
            {selectedSlot && (
              <div>
                <p className="text-sm font-semibold mb-2">
                  2. Pick a date <span className="font-normal text-muted-foreground">(upcoming {DAY_NAMES[selectedSlot.dayOfWeek]}s)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {upcomingDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm transition-all ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-primary bg-primary text-primary-foreground font-semibold'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      {format(date, 'EEE, MMM d')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking summary */}
            {selectedSlot && selectedDate && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm space-y-0.5">
                <p className="font-semibold text-primary flex items-center gap-1.5 mb-1">
                  <CheckCircle className="h-4 w-4" /> Booking summary
                </p>
                <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d yyyy')}</p>
                <p className="text-muted-foreground">{selectedSlot.startTime} – {selectedSlot.endTime}</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm font-semibold mb-2">3. Notes <span className="font-normal text-muted-foreground">(optional)</span></p>
              <Textarea
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Any questions, who will attend, accessibility needs…"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookVisit(false)} disabled={isBooking}>
              Cancel
            </Button>
            <Button onClick={handleBookVisit} disabled={isBooking || !selectedSlot || !selectedDate}>
              {isBooking
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking…</>
                : <><CalendarCheck className="mr-2 h-4 w-4" />Request Visit</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
