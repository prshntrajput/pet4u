'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { checkInsAPI } from '@/lib/api/checkIns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardCheck, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const TYPE_LABELS = { '30_day': '30-Day', '90_day': '90-Day', '6_month': '6-Month' };
const WELLBEING_COLORS = {
  excellent: 'bg-green-100 text-green-700 border-green-200',
  good: 'bg-blue-100 text-blue-700 border-blue-200',
  fair: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  poor: 'bg-red-100 text-red-700 border-red-200',
};

function CheckInCard({ checkIn, onSubmit }) {
  const isPending = checkIn.status === 'pending';
  const isOverdue = isPending && new Date(checkIn.dueDate) < new Date();

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 ${
      isOverdue ? 'border-destructive/40 bg-destructive/5' :
      isPending ? 'border-primary/20 bg-primary/5' :
      'border-border bg-muted/30'
    }`}>
      <div className="flex items-center gap-3">
        {checkIn.petPrimaryImage ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image src={checkIn.petPrimaryImage} alt={checkIn.petName} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{checkIn.petName}</span>
            <Badge variant="outline" className="text-xs">
              {TYPE_LABELS[checkIn.checkInType] || checkIn.checkInType} Check-in
            </Badge>
            {isPending && isOverdue && (
              <Badge variant="destructive" className="text-xs">Overdue</Badge>
            )}
            {!isPending && (
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">Submitted</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPending ? `Due: ${new Date(checkIn.dueDate).toLocaleDateString()}` :
              `Submitted: ${new Date(checkIn.submittedAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {!isPending && checkIn.overallWellbeing && (
        <div className={`inline-flex text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${WELLBEING_COLORS[checkIn.overallWellbeing] || ''}`}>
          {checkIn.overallWellbeing}
        </div>
      )}

      {isPending && (
        <Button size="sm" className="w-full" onClick={() => onSubmit(checkIn)}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Submit Check-in
        </Button>
      )}
    </div>
  );
}

export default function CheckInsPage() {
  const { user } = useAuth({ requireAuth: true });
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    overallWellbeing: '', weight: '', isEatingWell: '', isActive: '',
    vetVisited: false, concerns: '', happyMoments: '',
  });

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const res = await checkInsAPI.getMyCheckIns();
      if (res.success) setCheckIns(res.data.data || []);
    } catch {
      toast.error('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };

  const openSubmit = (checkIn) => {
    setSelected(checkIn);
    setForm({ overallWellbeing: '', weight: '', isEatingWell: '', isActive: '', vetVisited: false, concerns: '', happyMoments: '' });
  };

  const handleSubmit = async () => {
    if (!form.overallWellbeing) {
      toast.error('Please select overall wellbeing');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        overallWellbeing: form.overallWellbeing,
        weight: form.weight || undefined,
        isEatingWell: form.isEatingWell === 'yes' ? true : form.isEatingWell === 'no' ? false : undefined,
        isActive: form.isActive === 'yes' ? true : form.isActive === 'no' ? false : undefined,
        vetVisited: form.vetVisited,
        concerns: form.concerns || undefined,
        happyMoments: form.happyMoments || undefined,
      };
      const res = await checkInsAPI.submitCheckIn(selected.id, payload);
      if (res.success) {
        toast.success('Check-in submitted!');
        setSelected(null);
        fetchCheckIns();
      }
    } catch {
      toast.error('Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = checkIns.filter(c => c.status === 'pending');
  const submitted = checkIns.filter(c => c.status === 'submitted');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="inline-flex p-2 rounded-xl bg-primary/10 border-2 border-primary/20">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Post-Adoption Check-ins</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[52px]">
          Share how your adopted pet is settling in
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />)}
        </div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No check-ins yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Check-ins will appear here once your adoption is marked complete by the shelter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pending ({pending.length})
              </h2>
              {pending.map(c => <CheckInCard key={c.id} checkIn={c} onSubmit={openSubmit} />)}
            </div>
          )}
          {submitted.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Submitted ({submitted.length})
              </h2>
              {submitted.map(c => <CheckInCard key={c.id} checkIn={c} onSubmit={openSubmit} />)}
            </div>
          )}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              {selected && TYPE_LABELS[selected.checkInType]} Check-in — {selected?.petName}
            </DialogTitle>
            <DialogDescription>
              Tell the shelter how {selected?.petName} is doing in their new home.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Overall wellbeing *</Label>
              <Select value={form.overallWellbeing} onValueChange={(v) => setForm(f => ({ ...f, overallWellbeing: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Eating well?</Label>
                <Select value={form.isEatingWell} onValueChange={(v) => setForm(f => ({ ...f, isEatingWell: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Physically active?</Label>
                <Select value={form.isActive} onValueChange={(v) => setForm(f => ({ ...f, isActive: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Current weight (optional)</Label>
                <Input
                  placeholder="e.g. 5 kg"
                  value={form.weight}
                  onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Vet visit since adoption?</Label>
                <Select
                  value={form.vetVisited ? 'yes' : 'no'}
                  onValueChange={(v) => setForm(f => ({ ...f, vetVisited: v === 'yes' }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Happy moments / milestones</Label>
              <Textarea
                placeholder="Share a happy story or milestone..."
                value={form.happyMoments}
                onChange={(e) => setForm(f => ({ ...f, happyMoments: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Any concerns?</Label>
              <Textarea
                placeholder="Any health or behaviour concerns..."
                value={form.concerns}
                onChange={(e) => setForm(f => ({ ...f, concerns: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Check-in'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
