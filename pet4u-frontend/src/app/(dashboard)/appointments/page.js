'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { appointmentsAPI } from '@/lib/api/appointments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Calendar, Clock, MapPin, Video, CheckCircle, XCircle,
  AlertCircle, PawPrint, Loader2, Plus, User
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_CONFIG = {
  pending:               { label: 'Pending',           variant: 'secondary',    icon: AlertCircle,   color: 'text-yellow-600' },
  confirmed:             { label: 'Confirmed',          variant: 'default',      icon: CheckCircle,   color: 'text-green-600' },
  completed:             { label: 'Completed',          variant: 'outline',      icon: CheckCircle,   color: 'text-blue-600' },
  cancelled_by_adopter:  { label: 'Cancelled by you',  variant: 'destructive',  icon: XCircle,       color: 'text-red-600' },
  cancelled_by_shelter:  { label: 'Cancelled',          variant: 'destructive',  icon: XCircle,       color: 'text-red-600' },
  no_show:               { label: 'No Show',            variant: 'secondary',    icon: XCircle,       color: 'text-gray-600' }
};

function AppointmentCard({ appt, role, onAction }) {
  const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const dateStr = format(new Date(appt.scheduledDate), 'EEE, MMM d yyyy');

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Pet info */}
        <div className="flex items-center gap-3">
          {appt.petImage ? (
            <img src={appt.petImage} alt={appt.petName} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold">{appt.petName || 'Pet'}</p>
            {role === 'shelter' && appt.adopterName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> {appt.adopterName}
              </p>
            )}
          </div>
          <div className="ml-auto">
            <Badge variant={cfg.variant} className={`text-xs ${cfg.color}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {cfg.label}
            </Badge>
          </div>
        </div>

        {/* Date & time */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 shrink-0" /> {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 shrink-0" /> {appt.startTime} – {appt.endTime}
          </span>
        </div>

        {/* Location */}
        {appt.isVirtual ? (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <Video className="h-4 w-4" />
            <span>Virtual appointment</span>
            {appt.meetingLink && (
              <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="underline ml-1 text-xs">Join link</a>
            )}
          </div>
        ) : appt.location ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" /> {appt.location}
          </div>
        ) : null}

        {/* Notes */}
        {appt.adopterNotes && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
            "{appt.adopterNotes}"
          </p>
        )}

        {/* Actions */}
        {appt.status === 'pending' && role === 'shelter' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onAction(appt.id, 'confirmed')}>
              <CheckCircle className="h-4 w-4 mr-1" /> Confirm
            </Button>
            <Button size="sm" variant="destructive" className="flex-1" onClick={() => onAction(appt.id, 'cancelled_by_shelter')}>
              <XCircle className="h-4 w-4 mr-1" /> Decline
            </Button>
          </div>
        )}

        {appt.status === 'confirmed' && role === 'shelter' && (
          <Button size="sm" variant="outline" className="w-full" onClick={() => onAction(appt.id, 'completed')}>
            <CheckCircle className="h-4 w-4 mr-1" /> Mark Completed
          </Button>
        )}

        {['pending', 'confirmed'].includes(appt.status) && role === 'adopter' && (
          <Button size="sm" variant="destructive" className="w-full" onClick={() => onAction(appt.id, 'cancel_adopter')}>
            <XCircle className="h-4 w-4 mr-1" /> Cancel Appointment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AddAvailabilityForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ dayOfWeek: '1', startTime: '10:00', endTime: '12:00', maxBookings: '3' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await appointmentsAPI.setAvailability(form);
      if (res.success) {
        toast.success('Availability slot added!');
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Failed to add slot.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Day of Week</label>
        <Select value={form.dayOfWeek} onValueChange={v => setForm(f => ({ ...f, dayOfWeek: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DAY_NAMES.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Start Time</label>
          <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">End Time</label>
          <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Max Bookings per Slot</label>
        <Input type="number" min="1" max="20" value={form.maxBookings} onChange={e => setForm(f => ({ ...f, maxBookings: e.target.value }))} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Add Slot
      </Button>
    </form>
  );
}

export default function AppointmentsPage() {
  const { user } = useSelector(state => state.auth);
  const role = user?.role;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAvailForm, setShowAvailForm] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await appointmentsAPI.getMyAppointments(params);
      if (res.success) {
        setAppointments(res.data.data.appointments || []);
      }
    } catch {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [statusFilter]);

  const handleAction = async (appointmentId, action) => {
    try {
      let res;
      if (action === 'cancel_adopter') {
        res = await appointmentsAPI.cancelAppointment(appointmentId);
      } else {
        res = await appointmentsAPI.updateStatus(appointmentId, { status: action });
      }
      if (res.success) {
        toast.success('Appointment updated.');
        loadAppointments();
      } else {
        toast.error(res.error || 'Failed to update.');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const grouped = {
    upcoming: appointments.filter(a => ['pending', 'confirmed'].includes(a.status)),
    past: appointments.filter(a => !['pending', 'confirmed'].includes(a.status))
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary" />
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {role === 'shelter'
              ? 'Manage meet-and-greet appointments with potential adopters.'
              : 'Your scheduled meet-and-greet sessions with shelters.'}
          </p>
        </div>

        {role === 'shelter' && (
          <Dialog open={showAvailForm} onOpenChange={setShowAvailForm}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Add Weekly Availability Slot</DialogTitle>
              </DialogHeader>
              <AddAvailabilityForm onSuccess={() => {}} onClose={() => setShowAvailForm(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled_by_adopter', label: 'Cancelled' }
        ].map(opt => (
          <Button
            key={opt.value}
            size="sm"
            variant={statusFilter === opt.value ? 'default' : 'outline'}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No appointments yet</h3>
          <p className="text-muted-foreground text-sm">
            {role === 'shelter'
              ? 'Once adopters request appointments, they will appear here.'
              : 'When you request a meet-and-greet from a pet page, it will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-foreground">Upcoming</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped.upcoming.map(a => (
                  <AppointmentCard key={a.id} appt={a} role={role} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}

          {grouped.past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Past</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {grouped.past.map(a => (
                  <AppointmentCard key={a.id} appt={a} role={role} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
